document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const totalSheets = 8;
    // currentSheet represents the number of sheets currently flipped to the LEFT side.
    // 0 = All sheets on right (Cover/Page 1 visible).
    // 1 = Sheet 1 flipped (Page 2, 3 visible).
    // ...
    // 8 = All sheets flipped (Page 16 visible on left).
    let currentSheet = 0;

    // DOM Elements
    const sheets = [];
    for (let i = 1; i <= totalSheets; i++) {
        sheets.push(document.getElementById(`sheet-${i}`));
    }
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const page3Link = document.getElementById('page3-link');
    const page11PlayBtn = document.getElementById('page11-play-btn');
    const page11Video = document.getElementById('page11-video');

    // --- Z-Index Management ---
    // Correct Z-Index is crucial for the 3D stack effect.
    // Right stack (Unflipped): Sheet 1 (Top) > Sheet 2 > ...
    // Left stack (Flipped): Sheet 1 (Bottom) < Sheet 2 < ... (Wait, logic check)
    //
    // Scenario: 
    // Start (0 flipped): 
    //   Right: S1(z8), S2(z7), S3(z6)... 
    //   Left: Empty.
    // Flip S1 (1 flipped):
    //   Right: S2(z7) is now top of right.
    //   Left: S1.
    // Flip S2 (2 flipped):
    //   Right: S3(z6).
    //   Left: S2 is on top of S1. So S2 > S1.
    //
    // So:
    // Unflipped sheets (Right): z-index = totalSheets - index
    // Flipped sheets (Left): z-index = index
    
    function updateZIndexes() {
        sheets.forEach((sheet, index) => {
            const sheetNum = index + 1;
            if (sheetNum <= currentSheet) {
                // Sheet is flipped (Left side)
                // Logic: Sheet 1 (index 0) z=1. Sheet 2 (index 1) z=2.
                sheet.style.zIndex = sheetNum;
            } else {
                // Sheet is unflipped (Right side)
                // Logic: Sheet 1 (index 0) z=8. Sheet 2 (index 1) z=7.
                sheet.style.zIndex = totalSheets - index + 1; // +1 to ensure overlap
            }
        });
    }
    
    // Initial call
    updateZIndexes();

    // --- Navigation Functions ---

    function goNext() {
        if (currentSheet < totalSheets) {
            currentSheet++;
            const sheet = sheets[currentSheet - 1]; // Array index is 0-based
            sheet.classList.add('flipped');
            updateZIndexes();
            console.log(`Flipped Sheet ${currentSheet} to Left`);
        }
    }

    function goPrev() {
        if (currentSheet > 0) {
            const sheet = sheets[currentSheet - 1];
            sheet.classList.remove('flipped');
            currentSheet--;
            updateZIndexes();
            console.log(`Flipped Sheet ${currentSheet + 1} back to Right`);
        }
    }

    // --- Event Listeners ---

    // Arrows
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goNext();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goPrev();
    });

    // Global Click (Left/Right side of screen)
    document.addEventListener('click', (e) => {
        // Ignore clicks on buttons/interactive elements to avoid double triggers
        // (Handled by stopPropagation on those elements, but good to be safe)
        
        const windowWidth = window.innerWidth;
        const clickX = e.clientX;

        if (clickX > windowWidth / 2) {
            goNext();
        } else {
            goPrev();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            goNext();
        } else if (e.key === 'ArrowLeft') {
            goPrev();
        }
    });

    // --- Specific Interaction Logic ---

    // Page 3 Link
    if (page3Link) {
        page3Link.addEventListener('click', (e) => {
            e.stopPropagation(); 
            // Allow default link behavior
        });
    }

    // Page 11 Video
    if (page11PlayBtn && page11Video) {
        page11PlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            page11Video.classList.add('active');
            page11Video.play();
            page11PlayBtn.style.display = 'none';
        });

        page11Video.addEventListener('ended', () => {
            page11Video.classList.remove('active');
            page11PlayBtn.style.display = 'block';
        });

        // Ensure video controls or clicks don't flip page
        page11Video.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});
