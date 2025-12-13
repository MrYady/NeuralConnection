class TextSphere {
    // Modificación 1: El constructor ahora recibe ambos datasets por separado
    constructor(canvasId, techData, designData) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Unificamos los textos para la geometría
        this.texts = [...techData, ...designData];
        
        // OPTIMIZACIÓN: Estructura de Datos O(1) para búsqueda rápida
        this.designSet = new Set(designData);

        this.points = [];
        
        // Parámetros Visuales
        this.radius = 220;          
        this.baseSize = 14;         
        this.perspective = 600;     
        
        // Paleta de Colores (RGB Strings)
        this.textColor = '248, 250, 252';    // Blanco (Tech Base)
        this.activeColor = '146, 242, 240';    // Cyan (Tech Highlight)
        this.designColor = '160, 175, 228';   // Naranja Coral (Diseño Gráfico)
        
        // Estado Físico
        this.rotation = { x: 0, y: 0 };
        this.velocity = { x: -0.001, y: 0.002 }; 
        this.lastMouse = { x: 0, y: 0 };
        this.isDragging = false;
        
        this.parent = this.canvas.parentElement;

        this.init();
        this.animate();
        

        

        window.addEventListener('resize', () => this.resize());
        this.setupInteraction();
    }

    init() {
        this.resize();
        this.createPoints();
    }

    resize() {
        this.canvas.width = this.parent.clientWidth;
        this.canvas.height = this.parent.clientHeight;
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        this.radius = minDim * 0.4; 
    }

    createPoints() {
        // Distribución Espiral de Fibonacci
        // Fórmula: theta = 2 * PI * i / phi^2
        const phi = Math.PI * (3 - Math.sqrt(5)); 
        const n = this.texts.length;

        this.points = this.texts.map((text, i) => {
            const y = 1 - (i / (n - 1)) * 2; 
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            // OPTIMIZACIÓN: Pre-cálculo de categoría
            // Determinamos AHORA si es diseño, para no calcularlo en cada frame de animación
            const isDesignItem = this.designSet.has(text);

            return {
                x: x * this.radius,
                y: y * this.radius,
                z: z * this.radius,
                text: text,
                scale: 1,
                alpha: 1,
                // Guardamos la bandera directamente en el objeto punto
                isDesign: isDesignItem
            };
        });
    }

    setupInteraction() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const onDown = (e) => {
            if(e.type === 'touchstart') e.preventDefault();
            this.isDragging = true;
            this.lastMouse = getPos(e);
            this.velocity = { x: 0, y: 0 };
        };

        const onMove = (e) => {
            if (!this.isDragging) return;
            const curr = getPos(e);
            const deltaX = curr.x - this.lastMouse.x;
            const deltaY = curr.y - this.lastMouse.y;

            this.velocity.y = deltaX * 0.0005; 
            this.velocity.x = -deltaY * 0.0005;

            this.lastMouse = curr;
        };

        const onUp = () => this.isDragging = false;

        this.canvas.addEventListener('mousedown', onDown);
        this.canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        this.canvas.addEventListener('touchstart', onDown, { passive: false });
        this.canvas.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    rotatePoints() {
        if (!this.isDragging) {
            this.velocity.x *= 0.96;
            this.velocity.y *= 0.96;
        }

        // Matrices de rotación
        const sinX = Math.sin(this.velocity.x * 10);
        const cosX = Math.cos(this.velocity.x * 10);
        const sinY = Math.sin(this.velocity.y * 10);
        const cosY = Math.cos(this.velocity.y * 10);

        this.points.forEach(point => {
            const x1 = point.x * cosY - point.z * sinY;
            const z1 = point.z * cosY + point.x * sinY;
            const y1 = point.y * cosX - z1 * sinX;
            const z2 = z1 * cosX + point.y * sinX;

            point.x = x1;
            point.y = y1;
            point.z = z2;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // 1. Fase de proyección y cálculo de Alpha
        this.points.forEach(point => {
            const scale = this.perspective / (this.perspective - point.z);
            point.scale = scale;
            point.px = cx - point.x * scale;
            point.py = cy + point.y * scale;
            
            // Normalización de profundidad para Alpha
            point.alpha = (point.z + this.radius) / (2 * this.radius); 
            point.alpha = Math.max(0.1, Math.min(1, point.alpha));
        });

        // 2. Ordenamiento Z-Sort (Painter's Algorithm)
        // Fundamental para que la opacidad funcione correctamente
        this.points.sort((a, b) => a.z - b.z);

        // 3. Fase de Renderizado
        this.points.forEach(point => {
            this.ctx.save();
            this.ctx.translate(point.px, point.py);
            this.ctx.scale(point.scale, point.scale);

            this.ctx.font = `600 ${this.baseSize}px "Noto Sans Devanagari", sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // --- LÓGICA DE COLOR OPTIMIZADA ---
            let colorRGB;

            if (point.isDesign) {
                // Si es diseño, usamos su color específico (Naranja)
                // Nota: Podrías hacer que brille diferente si está activo, 
                // pero aquí mantenemos la identidad de color.
                colorRGB = point.alpha > 0.85 ? this.designColor : this.textColor;
            } else {
                // Si es Tech, usamos la lógica original: Blanco -> Cyan si está cerca
                colorRGB = point.alpha > 0.85 ? this.activeColor : this.textColor;
            }

            this.ctx.fillStyle = `rgba(${colorRGB}, ${point.alpha})`;
            
            this.ctx.fillText(point.text, 0, 0);
            this.ctx.restore();
        });
    }

    animate() {
        this.rotatePoints();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// --- Inicialización ---
const dataSet = [
    "Python", "AI", "C++", "Big Data", "Rust", "Go", "TypeScript", 
    "Machine Learning", "Kotlin", "Cloud", "Security", "C#", "Scala", 
    "Analytics", "DevOps", "Neural Nets", "Algorithm", "Haskell", "Julia", 
    "Elixir", "C", "Performance", "SQL", "NoSQL", "Optimization", 
    "Physics", "WebGL", "React", "Vue", "Angular", "Node.js", 
    "Django", "Microservices", "Spring", "Docker", "K8s", "Git",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Linux", "Bash", "Redis"
];

const datasetDG = [
    "Adobe Photoshop", "Adobe Illustrator", "CorelDRAW", "Affinity Designer",
    "Inkscape", "Canva", "Figma", "Procreate", "Clip Studio Paint", "Krita",
    "GIMP", "Adobe Premiere Pro", "Final Cut Pro", "DaVinci Resolve",
    "Adobe After Effects", "CapCut", "Blender", "Autodesk Maya",
    "Autodesk 3ds Max", "Cinema 4D", "ZBrush", "SketchUp", "Houdini"
];

document.addEventListener('DOMContentLoaded', () => {
    // Pasamos los arrays por separado al constructor
    new TextSphere('canvas', dataSet, datasetDG);
});