/**
 * LÓGICA DE FONDO: RED NEURONAL
 */
const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const particleCount = Math.min(window.innerWidth / 15, 80); // Ajuste densidad
    for(let i=0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI*2);
        ctx.fill();

        for(let j=i+1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if(dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}

/**
 * LÓGICA DE INTERACCIÓN Y SCROLL
 */
function initScrollEffects() {
    const scrollProgress = document.getElementById('scrollProgress');
    
    // Actualizar barra de progreso
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight);
        scrollProgress.style.transform = `scaleY(${progress})`;
    });

    // Observer para revelar proyectos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.project-row').forEach(row => observer.observe(row));
}

// Inicialización general
window.addEventListener('resize', initCanvas);
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    animateParticles();
    initScrollEffects();
});