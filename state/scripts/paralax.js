/**
 * SCROLL REVEAL ENGINE
 * Implementación: IntersectionObserver API
 * Comportamiento: Bidireccional (Entrada y Salida)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Configuración del Observador
    const observerOptions = {
        root: null, // Viewport del navegador
        rootMargin: '0px', // Sin márgenes externos
        threshold: 0.15 // El elemento debe ser visible un 15% para activarse
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Lógica Booleana para determinar estado
            if (entry.isIntersecting) {
                // ENTRADA: Agrega la clase para animar
                entry.target.classList.add('visible');
            } else {
                // SALIDA: Remueve la clase para reiniciar la animación
                // (Comenta esta línea si solo quieres que se anime una vez)
                entry.target.classList.remove('visible');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Selección de elementos a animar
    // Estrategia: Buscar todos los elementos con la clase .reveal-text
    const hiddenElements = document.querySelectorAll('.reveal-text, .reveal-group, .slide-left, .slide-right');
    
    // Inyección de dependencias en el observador
    hiddenElements.forEach((el) => observer.observe(el));
});


/* state/scripts/scrollEffects.js - Agregar al final */

/**
 * TYPEWRITER ENGINE
 * Complejidad: O(N) donde N es la longitud del string.
 * Uso: IntersectionObserver para trigger + Recursión para animación.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const typeWriterElements = document.querySelectorAll('.typing-effect');
    
    // 1. Pre-procesamiento: Guardar texto y limpiar
    typeWriterElements.forEach(el => {
        const rawText = el.getAttribute('data-text') || el.textContent;
        // Guardamos el texto en el dataset para acceso rápido
        el.dataset.fullText = rawText; 
        // Vaciamos el contenido para empezar la animación
        el.textContent = ''; 
    });

    // 2. Configuración del Observador
    const typeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Evitar re-ejecutar si ya está animando o terminó
                if (target.dataset.typingStatus === 'done') return;
                
                startTyping(target);
                
                // Dejar de observar para que solo pase una vez
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 }); // Empezar cuando el 50% sea visible

    typeWriterElements.forEach(el => typeObserver.observe(el));

    // 3. Función Core de Escritura
    function startTyping(element) {
        const text = element.dataset.fullText;
        const speed = 50; // Velocidad en ms (ajustar según preferencia)
        let i = 0;

        element.dataset.typingStatus = 'active';

        function typeChar() {
            if (i < text.length) {
                // Optimización: textContent es más rápido que innerHTML para texto plano
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                // Finalización
                element.dataset.typingStatus = 'done';
                element.classList.add('done'); // Para ocultar cursor vía CSS si se quiere
            }
        }

        typeChar();
    }
});