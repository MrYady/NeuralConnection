document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Base de Datos Local (Hash Map para acceso O(1))
    // La clave coincide con el atributo 'data-id' del HTML
    const entitiesData = {
        'neural': {
            title: 'Neural Core',
            objective: 'Implementar soluciones de Deep Learning para optimizar procesos industriales.',
            mission: 'Democratizar el acceso a la inteligencia artificial avanzada.',
            values: ['Innovación', 'Precisión Matemática', 'Ética de Datos']
        },
        'code': {
            title: 'Dev Studio',
            objective: 'Desarrollar arquitecturas de software escalables y mantenibles.',
            mission: 'Crear código limpio que perdure en el tiempo.',
            values: ['Clean Code', 'Eficiencia', 'Modularidad']
        },
        'render': {
            title: 'Visual Fix',
            objective: 'Transformar ideas abstractas en experiencias visuales tangibles.',
            mission: 'Elevar el estándar estético de la web moderna.',
            values: ['Creatividad', 'Impacto Visual', 'Usabilidad']
        }
    };

    // Referencias al DOM
    const galleryContainer = document.getElementById('gallery-container');
    const modal = document.getElementById('entity-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Referencias a los elementos internos del modal para inyección de contenido
    const mTitle = document.getElementById('modal-title');
    const mObjective = document.getElementById('modal-objective');
    const mMission = document.getElementById('modal-mission');
    const mValues = document.getElementById('modal-values');

    // 2. Función para abrir el Modal y poblar datos
    const openModal = (entityKey) => {
        const data = entitiesData[entityKey];
        
        if (!data) return; // Manejo de errores si la clave no existe

        // Inyección de texto (DOM Manipulation)
        mTitle.textContent = data.title;
        mObjective.textContent = data.objective;
        mMission.textContent = data.mission;
        
        // Limpiar y poblar lista de valores
        mValues.innerHTML = ''; 
        data.values.forEach(val => {
            const li = document.createElement('li');
            li.textContent = val;
            mValues.appendChild(li);
        });

        // Activar CSS class
        modal.classList.add('active');
    };

    // 3. Función para cerrar modal
    const closeModal = () => {
        modal.classList.remove('active');
    };

    // 4. Delegación de Eventos (Event Delegation)
    // Escuchamos en el contenedor padre en lugar de cada tarjeta
    galleryContainer.addEventListener('click', (e) => {
        // Buscamos el elemento padre más cercano que sea una tarjeta
        const card = e.target.closest('.entidad-card');
        
        if (card) {
            const id = card.getAttribute('data-id');
            openModal(id);
        }
    });

    // Event listeners para cerrar
    closeBtn.addEventListener('click', closeModal);
    
    // Cerrar al hacer click fuera del contenido del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Cerrar con tecla ESC (Accesibilidad)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});