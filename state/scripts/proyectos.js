  // 1. Estructura de Datos (Separación de lógica y vista)
        const projectsData = [
            {
                id: 1,
                title: "Cinefilo AI",
                category: "Web Dev & API Web",
                description: "Plataforma web integral para entusiastas del cine, combinando una base de datos exhaustiva, un motor de recomendación de IA y una robusta plataforma social comunitaria.",
                techStack: ["Python", "SQL", "Js", "Json"],
                metrics: "99.8%",
                icon: "globe",
                githubUrl: "https://github.com/Neural-Connection/api-cinefilo-ai"
            },
            {
                id: 2,
                title: "BioScam",
                category: "App Móvil",
                description: "Aplicación transforma tu información médica crítica en un código QR seguro y accesible. Diseñada para situaciones de emergencia, permite almacenar datos vitales.",
                techStack: ["Flutter", "FireBase",],
                metrics: "40ms Latencia",
                icon: "smartphone",
                githubUrl: "https://github.com/Neural-Connection/BioScam"
            },
            {
                id: 3,
                title: "DeUna",
                category: "APP Móvil",
                description: "Plataforma que conecta tus urgencias de mecánica, electricidad y plomería con expertos certificados cerca de ti. Tan fácil como pedir un viaje, tan confiable como tu técnico de siempre.",
                techStack: ["flutter", "fireBase"],
                metrics: "10k TPS",
                icon: "smartphone",
                githubUrl: "https://github.com/Neural-Connection/DeUna"
            }
        ];

        // 2. Función para generar el HTML de una tarjeta
        function createCardHTML(project) {
            // Generamos las etiquetas de tecnología dinámicamente
            const techTags = project.techStack.map(tech => `
                <span class="tech-tag">
                    <i data-lucide="code-2" width="12" height="12"></i>
                    ${tech}
                </span>
            `).join('');

            return `
                <article class="project-card">
                    <div class="card-header">
                        <div class="icon-box">
                            <i data-lucide="${project.icon}"></i>
                        </div>
                        <span class="category-tag">${project.category}</span>
                    </div>

                    <h3 class="card-title">${project.title}</h3>
                    <p style="font-size: 12px;" class="card-description">${project.description}</p>

                    <div class="tech-stack">
                        ${techTags}
                    </div>

                    <footer class="card-footer">
                        <div class="metrics">
                            <span class="metric-label">Rendimiento</span>
                            <span class="metric-value">${project.metrics}</span>
                        </div>
                        <div class="card-actions">
                            <a class="action-btn" aria-label="Ver Código" href="${project.githubUrl}">
                                <i data-lucide="github" width="18" height="18"></i>
                            </a>
                            <a class="action-btn" aria-label="Ver Demo" href="${project.demoUrl}">
                                <i data-lucide="external-link" width="18" height="18"></i>
                            </a>
                        </div>
                    </footer>
                </article>
            `;
        }

        // 3. Renderizado en el DOM (Manipulación eficiente)
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('grid-container');
            
            // Creamos un string gigante y lo insertamos de una vez (Minimiza Reflows)
            container.innerHTML = projectsData.map(createCardHTML).join('');

            // 4. Inicializar iconos de Lucide
            lucide.createIcons();
        });