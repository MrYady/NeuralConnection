document.addEventListener('DOMContentLoaded', () => {

    /* --- PARTE 1: SCROLL SPY (Detección de Sección Activa) --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Configuración: El observador se activa cuando el 50% de la sección es visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Obtenemos el ID de la sección visible (ej: "inicio")
                const id = entry.target.getAttribute('id');
                
                // Removemos la clase activa de todos los links
                navLinks.forEach(link => link.classList.remove('active-link'));
                
                // Buscamos el link que apunta a este ID y lo activamos
                // (Manejamos el caso especial de href="#")
                if (id) {
                    const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active-link');
                    }
                }
            }
        });
    }, observerOptions);

    // Iniciamos observación en todas las secciones
    sections.forEach(section => observer.observe(section));


    /* --- PARTE 2: CLICK ANIMATION (Feedback) --- */
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Removemos la clase si ya existe para reiniciar la animación
            this.classList.remove('click-animate');
            
            // Forzamos un 'reflow' rápido para permitir reiniciar la animación CSS
            void this.offsetWidth; 
            
            // Agregamos la clase de animación
            this.classList.add('click-animate');

            // Opcional: Si el link es interno (#), hacemos scroll suave manual si no usas Lenis
            // const targetId = this.getAttribute('href');
            // if(targetId.startsWith('#')) { ... lógica scroll suave ... }
        });
        
        // Limpieza: Quitar la clase al terminar la animación
        link.addEventListener('animationend', () => {
            link.classList.remove('click-animate');
        });
    });
});