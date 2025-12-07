document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');
    const resultElement = document.getElementById('result-message');
    const totalObjects = 15;
    let isGameOver = false;

    // Arrays for "right" and "wrong" objects based on index (1-based)
    // object1 - object5: Right
    // object6 - object15: Wrong
    
    const objects = [];
    for (let i = 1; i <= totalObjects; i++) {
        objects.push({
            id: i,
            src: `images/object${i}.png`,
            type: i <= 5 ? 'right' : 'wrong'
        });
    }

    const imgElements = [];

    // Initialize images
    objects.forEach(obj => {
        const img = document.createElement('img');
        img.src = obj.src;
        img.classList.add('doljabi-object');
        
        // Prevent default drag behavior to avoid issues with clicking
        img.ondragstart = () => false;

        img.addEventListener('click', (e) => {
            // Prevent the click from bubbling up to the window immediately
            e.stopPropagation();

            if (isGameOver) {
                // If game is already over, clicking an object counts as "clicking anywhere" to reset
                resetGame();
                return;
            }

            // Set game state
            isGameOver = true;

            // Update text
            if (obj.type === 'right') {
                resultElement.innerHTML = "You chose<br>the right one";
            } else {
                resultElement.innerHTML = "You chose<br>the wrong one";
            }
            
            // Show result with blinking effect
            resultElement.style.display = 'block';
            resultElement.classList.add('blink');
        });

        container.appendChild(img);
        imgElements.push(img);
    });

    function randomizePositions() {
        // Grid Layout: 5 columns x 3 rows = 15 slots
        const cols = 5;
        const rows = 3;
        const slots = [];
        for (let i = 0; i < cols * rows; i++) {
            slots.push(i);
        }

        // Shuffle slots
        slots.sort(() => Math.random() - 0.5);

        // Reserve top space for title (e.g. 25%)
        const topOffset = 25;
        const availableHeight = 75;

        imgElements.forEach((img, index) => {
            if (index >= slots.length) return; // Should not happen with 15 objects

            const slot = slots[index];
            const col = slot % cols;
            const row = Math.floor(slot / cols);

            // Calculate base position (percentages)
            
            const cellWidth = 100 / cols;
            const cellHeight = availableHeight / rows;

            // Center in cell with some random jitter
            // Max jitter +/- 5% to keep separated
            const jitterX = (Math.random() - 0.5) * 5; 
            const jitterY = (Math.random() - 0.5) * 5;

            // To be roughly even:
            // We use transform translate(-50%, -50%) to center on the coordinate
            // So coordinate should be center of cell + jitter
            
            img.style.left = `${(col * cellWidth) + (cellWidth / 2) + jitterX}%`;
            img.style.top = `${topOffset + (row * cellHeight) + (cellHeight / 2) + jitterY}%`;
            
            // Random rotation
            img.style.transform = `translate(-50%, -50%) rotate(${(Math.random() - 0.5) * 30}deg)`;
        });
    }

    function resetGame() {
        isGameOver = false;
        resultElement.style.display = 'none';
        resultElement.classList.remove('blink');
        randomizePositions();
    }

    // Initial positioning
    randomizePositions();

    // Global click listener for reset
    window.addEventListener('click', () => {
        if (isGameOver) {
            resetGame();
        }
    });
});
