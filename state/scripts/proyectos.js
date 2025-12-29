  // 1. Estructura de Datos (Separación de lógica y vista)
        const projectsData = [
            {
                id: 1,
                title: "Cinefilo AI",
                category: "Web Dev & Ciencia de Datos",
                description: "Plataforma de procesamiento de lenguaje natural utilizando redes neuronales transformadoras para análisis de sentimientos en tiempo real.",
                techStack: ["Python", "SQL", "Js", "Json"],
                metrics: "99.8%",
                icon: "globe"
            },
            {
                id: 2,
                title: "Nebula Stream",
                category: "Infraestructura Cloud",
                description: "Sistema de orquestación de contenedores de baja latencia para aplicaciones de IoT distribuido, optimizando el uso de recursos en bordes.",
                techStack: ["Go", "Kubernetes", "Rust"],
                metrics: "40ms Latencia",
                icon: "cpu"
            },
            {
                id: 3,
                title: "FinOptima Ledger",
                category: "FinTech & Blockchain",
                description: "Solución de contabilidad distribuida inmutable para auditoría algorítmica automatizada, reduciendo el tiempo de conciliación bancaria.",
                techStack: ["Solidity", "Node.js", "PostgreSQL"],
                metrics: "10k TPS",
                icon: "bar-chart-3"
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
                    <p class="card-description">${project.description}</p>

                    <div class="tech-stack">
                        ${techTags}
                    </div>

                    <footer class="card-footer">
                        <div class="metrics">
                            <span class="metric-label">Rendimiento</span>
                            <span class="metric-value">${project.metrics}</span>
                        </div>
                        <div class="card-actions">
                            <button class="action-btn" aria-label="Ver Código">
                                <i data-lucide="github" width="18" height="18"></i>
                            </button>
                            <button class="action-btn" aria-label="Ver Demo">
                                <i data-lucide="external-link" width="18" height="18"></i>
                            </button>
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