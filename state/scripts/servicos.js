   /**
         * LÓGICA DEL SLIDER INFINITO
         * Enfoque: Ingeniería de Software
         * Patrón: Módulo Dinámico con Clonación de Elementos
         */

        // Datos de los servicios (Modelo de Datos)
        const servicesData = [
            {
                title: "Análisis de Datos",
                icon: "ph-graph",
                desc: "Modelos predictivos y análisis estadístico avanzado para toma de decisiones.",
                color: "text-blue-600"
            },
            {
                title: "Desarrollo Cloud",
                icon: "ph-cloud",
                desc: "Arquitecturas escalables serverless y microservicios en AWS/Azure.",
                color: "text-purple-600"
            },
            {
                title: "Ciberseguridad",
                icon: "ph-shield-check",
                desc: "Auditoría de vulnerabilidades y encriptación de extremo a extremo.",
                color: "text-green-600"
            },
            {
                title: "Inteligencia Artificial",
                icon: "ph-brain",
                desc: "Implementación de redes neuronales y procesamiento de lenguaje natural.",
                color: "text-rose-600"
            },
            {
                title: "Optimización SEO",
                icon: "ph-trend-up",
                desc: "Estrategias orgánicas para maximizar la visibilidad en motores de búsqueda.",
                color: "text-amber-600"
            },
            {
                title: "UX / UI Design",
                icon: "ph-paint-brush",
                desc: "Diseño de interfaces centradas en el usuario y sistemas de diseño.",
                color: "text-indigo-600"
            }
        ];

        class InfiniteSlider {
            constructor(containerId, trackId, data) {
                this.container = document.getElementById(containerId);
                this.track = document.getElementById(trackId);
                this.data = data;
                
                // Configuración de física y renderizado
                this.scrollSpeed = 1; // Pixeles por frame (velocidad base)
                this.isHovered = false; // Estado para pausar
                this.animationId = null;
                this.currentScroll = 0;
                
                // Inicialización
                this.init();
            }

            createCard(service) {
                const card = document.createElement('div');
                // w-[300px] define el ancho fijo para cálculo predecible, shrink-0 evita que se encojan
                card.className = "service-card w-[300px] flex-shrink-0 p-8 rounded-2xl flex flex-col justify-between h-[320px] bg-white cursor-pointer select-none";
                
                card.innerHTML = `
                    <div>
                        <div class="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                            <i class="ph ${service.icon} ${service.color} text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">${service.title}</h3>
                        <p class="text-slate-500 text-sm leading-relaxed">${service.desc}</p>
                    </div>
                    <div class="flex items-center text-sm font-semibold ${service.color} mt-4 group">
                        <span>Ver detalles</span>
                        <i class="ph ph-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                    </div>
                `;
                return card;
            }

            init() {
                // 1. Renderizar items originales
                this.data.forEach(item => {
                    this.track.appendChild(this.createCard(item));
                });

                // 2. Clonar items para el efecto infinito
                // Necesitamos suficientes clones para llenar el viewport visible + un buffer
                // Una estrategia segura es duplicar todo el set una vez al final.
                this.data.forEach(item => {
                    const clone = this.createCard(item);
                    clone.setAttribute('aria-hidden', 'true'); // Accesibilidad: ignorar duplicados
                    this.track.appendChild(clone);
                });

                // 3. Event Listeners
                this.track.addEventListener('mouseenter', () => this.isHovered = true);
                this.track.addEventListener('mouseleave', () => this.isHovered = false);
                
                // Soporte táctil básico (arrastrar)
                this.setupTouch();

                // 4. Iniciar Loop de Animación
                this.animate();
            }

            setupTouch() {
                let startX;
                let scrollLeft;
                let isDown = false;

                this.track.addEventListener('mousedown', (e) => {
                    isDown = true;
                    this.track.classList.add('cursor-grabbing');
                    this.track.classList.remove('cursor-grab');
                    startX = e.pageX - this.track.offsetLeft;
                    scrollLeft = this.currentScroll;
                    this.isHovered = true; // Pausar auto-scroll al agarrar
                });

                this.track.addEventListener('mouseleave', () => {
                    isDown = false;
                    this.track.classList.remove('cursor-grabbing');
                    this.isHovered = false;
                });

                this.track.addEventListener('mouseup', () => {
                    isDown = false;
                    this.track.classList.remove('cursor-grabbing');
                    this.track.classList.add('cursor-grab');
                    this.isHovered = false;
                });

                this.track.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - this.track.offsetLeft;
                    const walk = (x - startX) * 2; // Multiplicador de velocidad
                    this.currentScroll = scrollLeft - walk;
                    // No normalizamos aquí, dejamos que el loop de animación maneje los límites
                });
            }

            animate() {
                // Calcular el ancho de un set original de elementos
                // Ancho total del track / 2 (porque duplicamos exactamente una vez)
                // Nota: Esto asume que el gap está incluido correctamente.
                const trackWidth = this.track.scrollWidth;
                const halfWidth = trackWidth / 2;

                if (!this.isHovered) {
                    this.currentScroll += this.scrollSpeed;
                }

                // Lógica de "Teletransportación" (Reset Infinito)
                if (this.currentScroll >= halfWidth) {
                    // Si pasamos la mitad, volvemos al inicio (0)
                    // Restamos halfWidth para mantener la suavidad si currentScroll se pasó un poco
                    this.currentScroll -= halfWidth;
                } else if (this.currentScroll <= 0) {
                    // Si retrocedemos más allá del 0 (scroll manual hacia atrás)
                    this.currentScroll += halfWidth;
                }

                // Aplicar transformación optimizada
                this.track.style.transform = `translate3d(-${this.currentScroll}px, 0, 0)`;

                // Solicitar siguiente frame
                this.animationId = requestAnimationFrame(() => this.animate());
            }
            
            // // Métodos para botones externos
            // scrollNext() {
            //     this.currentScroll += 300; // Ancho aproximado de tarjeta
            // }
            
            // scrollPrev() {
            //     this.currentScroll -= 300;
            // }
        }

        // Instanciar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            const slider = new InfiniteSlider('infiniteSliderContainer', 'sliderTrack', servicesData);
            
            // // Conectar botones
            // document.getElementById('nextBtn').addEventListener('click', () => slider.scrollNext());
            // document.getElementById('prevBtn').addEventListener('click', () => slider.scrollPrev());
        });