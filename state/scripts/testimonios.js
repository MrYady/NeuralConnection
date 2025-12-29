 /**
         * LÓGICA OPTIMIZADA (Big O: O(1))
         */

        const testimonials = [
            {
                text: "La arquitectura de este sistema es impresionante. Logramos reducir los tiempos de carga en un 40% simplemente integrando sus módulos optimizados.",
                name: "Carlos Rivera",
                role: "Lead Architect, TechFlow",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                socials: {
                    linkedin: "https://linkedin.com",
                    web: "https://techflow.example.com"
                }
            },
                        {
                text: "La arquitectura de este sistema es impresionante. Logramos reducir los tiempos de carga en un 40% simplemente integrando sus módulos optimizados.",
                name: "Lilaila Boock",
                role: "Lead Architect, TechFlow",
                avatar: "state/imgs/lilaila.png",
                socials: {
                    linkedin: "https://linkedin.com",
                    web: "https://techflow.example.com"
                }
            },
            {
                text: "Nunca había visto una implementación tan limpia de algoritmos complejos en una interfaz tan sencilla. Es ingeniería de software de alto nivel.",
                name: "Elena Gómez",
                role: "Data Scientist, DataCorp",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                socials: {
                    linkedin: "https://linkedin.com",
                    web: null // Ejemplo: Sin sitio web personal
                }
            },
            {
                text: "La atención al detalle en la experiencia de usuario y la robustez del backend hacen de esta herramienta una pieza fundamental en nuestro stack.",
                name: "Javier Méndez",
                role: "CTO, StartupX",
                avatar: "https://randomuser.me/api/portraits/men/85.jpg",
                socials: {
                    linkedin: null, // Ejemplo: Sin LinkedIn
                    web: "https://startupx.example.com"
                }
            }
        ];

        let currentIndex = 0;
        let isAnimating = false;

        // Cache de elementos del DOM
        const dom = {
            wrapper: document.getElementById('slider-wrapper'),
            text: document.getElementById('testimonial-text'),
            name: document.getElementById('user-name'),
            role: document.getElementById('user-role'),
            avatar: document.getElementById('user-avatar'),
            linkLinkedin: document.getElementById('link-linkedin'),
            linkWeb: document.getElementById('link-web'),
            btnNext: document.getElementById('next-btn'),
            btnPrev: document.getElementById('prev-btn')
        };

        function render(index) {
            const data = testimonials[index];
            dom.text.textContent = `"${data.text}"`;
            dom.name.textContent = data.name;
            dom.role.textContent = data.role;
            dom.avatar.src = data.avatar;

            // Manejo optimizado de visibilidad de enlaces
            // LinkedIn
            if (data.socials.linkedin) {
                dom.linkLinkedin.style.display = 'inline-flex';
                dom.linkLinkedin.href = data.socials.linkedin;
            } else {
                dom.linkLinkedin.style.display = 'none';
            }

            // Web
            if (data.socials.web) {
                dom.linkWeb.style.display = 'inline-flex';
                dom.linkWeb.href = data.socials.web;
            } else {
                dom.linkWeb.style.display = 'none';
            }
        }

        function changeSlide(direction) {
            if (isAnimating) return;
            isAnimating = true;

            // Animación direccional
            const fadeClass = direction === 1 ? 'fade-out-left' : 'fade-out-right';
            dom.wrapper.classList.add(fadeClass);

            setTimeout(() => {
                // Aritmética Modular para el loop infinito
                currentIndex = (currentIndex + direction + testimonials.length) % testimonials.length;
                render(currentIndex);
                
                dom.wrapper.classList.remove(fadeClass);
                
                // Pequeño delay para limpiar la clase antes de permitir otro click
                setTimeout(() => isAnimating = false, 500);
            }, 500); // Coincide con CSS transition
        }

        // Eventos
        dom.btnNext.addEventListener('click', () => changeSlide(1));
        dom.btnPrev.addEventListener('click', () => changeSlide(-1));
        
        // Inicializar
        render(currentIndex);