document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos
    const squares = document.querySelectorAll('.pagination-squares .sq');
    const prevBtn = document.querySelector('.arrow-btn:first-child');
    const nextBtn = document.querySelector('.arrow-btn:last-child');
    
    let currentIndex = 0;

    // Función de actualización visual (O(1) complexity en update)
    const updateUI = (newIndex) => {
        // Remove active class
        squares[currentIndex].classList.remove('active');
        
        // Update index (con lógica cíclica)
        if (newIndex >= squares.length) newIndex = 0;
        if (newIndex < 0) newIndex = squares.length - 1;
        
        currentIndex = newIndex;
        
        // Add active class
        squares[currentIndex].classList.add('active');
    };

    // Event Listeners
    nextBtn.addEventListener('click', () => updateUI(currentIndex + 1));
    prevBtn.addEventListener('click', () => updateUI(currentIndex - 1));
    
    // Permitir click directo en los cuadrados
    squares.forEach((sq, index) => {
        sq.addEventListener('click', () => {
            squares[currentIndex].classList.remove('active');
            currentIndex = index;
            sq.classList.add('active');
        });
    });
});