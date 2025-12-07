/**
 * Implementación de Esfera de Texto usando Distribución de Fibonacci
 * Optimización: O(N) para renderizado y actualización.
 * Renderizado: HTML5 Canvas API (acelerado por GPU).
 */

class TextSphere {
    constructor(canvasId, texts) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.texts = texts;
        this.points = [];
        
        // Configuración de Física y Proyección
        this.radius = 300;          // Radio base de la esfera
        this.baseSize = 15;         // Tamaño base de fuente
        this.perspective = 800;     // Distancia de la cámara (FOV)
        this.rotationSpeed = 0.05;  // Inercia base
        
        // Estado de rotación
        this.rotation = { x: 0, y: 0 };      // Rotación actual
        this.velocity = { x: 0.001, y: 0.001 }; // Velocidad angular inicial
        this.lastMouse = { x: 0, y: 0 };
        this.isDragging = false;

        // Inicialización
        this.init();
        this.animate();
        
        // Event Listeners
        window.addEventListener('resize', () => this.resize());
        this.setupInteraction();
    }

    init() {
        this.resize();
        this.createPoints();
    }

    resize() {
        // Ajuste responsive: la esfera ocupa un % del menor lado de la pantalla
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        this.radius = minDim * 0.15; // 35% del viewport
    }

    /**
     * Algoritmo de la Espiral de Fibonacci para distribución esférica uniforme.
     * Complejidad: O(N)
     */
    createPoints() {
        const phi = Math.PI * (3 - Math.sqrt(5)); // Ángulo Áureo (aprox 2.3999 rad)
        const n = this.texts.length;

        this.points = this.texts.map((text, i) => {
            const y = 1 - (i / (n - 1)) * 2; // y va de 1 a -1
            const radiusAtY = Math.sqrt(1 - y * y); // Radio del círculo en altura y
            const theta = phi * i; // Ángulo azimutal

            // Conversión de Esféricas a Cartesianas
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            return {
                x: x * this.radius,
                y: y * this.radius,
                z: z * this.radius,
                text: text,
                scale: 1,
                alpha: 1
            };
        });
    }

    setupInteraction() {
        const onDown = (e) => {
            this.isDragging = true;
            this.lastMouse.x = e.clientX || e.touches[0].clientX;
            this.lastMouse.y = e.clientY || e.touches[0].clientY;
            // Detener inercia al agarrar
            this.velocity.x = 0;
            this.velocity.y = 0;
        };

        const onMove = (e) => {
            if (!this.isDragging) return;
            
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;

            const deltaX = x - this.lastMouse.x;
            const deltaY = y - this.lastMouse.y;

            // Actualizar rotación basada en el movimiento del mouse
            // Invertimos direcciones para sensación natural de "trackball"
            this.velocity.y = deltaX * 0.0001; 
            this.velocity.x = -(deltaY * 0.0001);

            this.lastMouse.x = x;
            this.lastMouse.y = y;
        };

        const onUp = () => {
            this.isDragging = false;
        };

        // Mouse events
        this.canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        // Touch events (Responsive mobile)
        this.canvas.addEventListener('touchstart', onDown, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    /**
     * Aplica matrices de rotación sobre los ejes X e Y
     * Matriz de Rotación Básica (Euler)
     */
    rotatePoints() {
        // Aplicar inercia (fricción simulada)
        if (!this.isDragging) {
            this.velocity.x *= 0.95; // Decaimiento (Friction)
            this.velocity.y *= 0.95;
        }

        const sinX = Math.sin(this.velocity.x * 20); // Multiplicador para sensibilidad
        const cosX = Math.cos(this.velocity.x * 20);
        const sinY = Math.sin(this.velocity.y * 20);
        const cosY = Math.cos(this.velocity.y * 20);

        this.points.forEach(point => {
            // Rotación eje Y
            const x1 = point.x * cosY - point.z * sinY;
            const z1 = point.z * cosY + point.x * sinY;

            // Rotación eje X
            const y1 = point.y * cosX - z1 * sinX;
            const z2 = z1 * cosX + point.y * sinX;

            point.x = x1;
            point.y = y1;
            point.z = z2;
        });
    }

    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // Calcular proyección y escala para cada punto
        this.points.forEach(point => {
            // Proyección de Perspectiva: scale = d / (d - z)
            // Asumimos z negativo hacia la pantalla para la fórmula estándar, 
            // pero aquí ajustamos: cuanto mayor Z, más cerca del espectador.
            const scale = this.perspective / (this.perspective - point.z);
            point.scale = scale;
            
            // Coordenadas 2D proyectadas
            point.px = cx + point.x * scale;
            point.py = cy + point.y * scale;
            
            // Opacidad basada en profundidad (Fogging)
            // Mapeamos Z de [-radius, radius] a Alpha [0.1, 1]
            point.alpha = Math.max(0.1, Math.min(1, (point.z + this.radius) / (2 * this.radius) + 0.2));
        });

        // Algoritmo del Pintor (Painter's Algorithm): Ordenar por Z (profundidad)
        // Dibujamos primero lo que está más lejos para que lo cercano se superponga correctamente.
        this.points.sort((a, b) => a.z - b.z);

        // Renderizado
        this.points.forEach(point => {
            this.ctx.save();
            this.ctx.translate(point.px, point.py);
            
            // Escalado del contexto en lugar de cambiar font-size string (más eficiente)
            this.ctx.scale(point.scale, point.scale);

            this.ctx.font = `bold ${this.baseSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Color negro con transparencia
            this.ctx.fillStyle = `rgba(0, 0, 0, ${point.alpha})`;
            
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

// Datos de entrada: Lenguajes de programación y tecnologías
const dataSet = [
    "Python", "JavaScript", "C++", "Java", "Rust", "Go", "TypeScript", 
    "Swift", "Kotlin", "PHP", "Ruby", "C#", "Scala", "R", "Dart", 
    "Lua", "Perl", "Haskell", "Julia", "Elixir", "C", "Assembly", 
    "SQL", "NoSQL", "HTML5", "CSS3", "WebGL", "React", "Vue", "Angular",
    "Node.js", "Django", "Flask", "Spring", "Docker", "K8s", "Git",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Linux", "Bash", "Redis"
];

// Iniciar la aplicación
new TextSphere('canvas', dataSet);
