document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const totalSheets = 8;
    let currentSheet = 0;

    // DOM Elements
    const sheets = [];
    for (let i = 1; i <= totalSheets; i++) {
        sheets.push(document.getElementById(`sheet-${i}`));
    }
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const doljabiOverlay = document.getElementById('doljabi-overlay');
    const page5Audio = document.getElementById('page5-audio');

    // --- Z-Index Management ---
    function updateZIndexes() {
        sheets.forEach((sheet, index) => {
            const sheetNum = index + 1;
            if (sheetNum <= currentSheet) {
                // Flipped (Left)
                sheet.style.zIndex = sheetNum;
            } else {
                // Unflipped (Right)
                sheet.style.zIndex = totalSheets - index + 1;
            }
        });
    }
    
    // Initial call
    updateZIndexes();

    // --- Overlay & Media Management ---
    function checkMediaAndOverlays() {
        // 1. Doljabi Overlay (Pages 14-15)
        // Visible when Sheet 7 is Flipped (Left), Sheet 8 Unflipped (Right) -> currentSheet === 7
        if (currentSheet === 7) {
            setTimeout(() => {
                if (currentSheet === 7) doljabiOverlay.classList.add('active');
            }, 600);
        } else {
            doljabiOverlay.classList.remove('active');
        }

        // 2. Page 5 Audio (Interview.mp4)
        // Page 5 is on Sheet 3 Front. Visible when currentSheet === 2.
        if (currentSheet !== 2) {
            if (page5Audio && !page5Audio.paused) {
                page5Audio.pause();
            }
        }

        // 3. Page 7 GIF Auto-Animation
        // Page 7 is on Sheet 4 Front.
        // It is visible when Sheet 3 is Flipped (Left) and Sheet 4 is Unflipped (Right).
        // This corresponds to currentSheet === 3.
        if (currentSheet === 3) {
            const page7GifContainer = document.getElementById('page7-gif-container');
            const gif = page7GifContainer ? page7GifContainer.querySelector('img') : null;
            if (gif) {
                // Force restart of GIF by updating src with timestamp
                const cleanSrc = gif.src.split('?')[0];
                gif.src = cleanSrc + '?t=' + new Date().getTime();
            }
        }
    }

    // --- Navigation Functions ---

    function goNext() {
        if (currentSheet < totalSheets) {
            doljabiOverlay.classList.remove('active');
            
            currentSheet++;
            const sheet = sheets[currentSheet - 1];
            sheet.classList.add('flipped');
            updateZIndexes();
            checkMediaAndOverlays();
        }
    }

    function goPrev() {
        if (currentSheet > 0) {
            doljabiOverlay.classList.remove('active');

            const sheet = sheets[currentSheet - 1];
            sheet.classList.remove('flipped');
            currentSheet--;
            updateZIndexes();
            checkMediaAndOverlays();
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

    // Global Click
    document.addEventListener('click', (e) => {
        // If fullscreen overlay is active, ignore book navigation clicks
        if (fullscreenOverlay.classList.contains('active')) return;

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
        // If fullscreen overlay is active, ignore navigation or handle escape
        if (fullscreenOverlay.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeFullscreen();
            }
            return;
        }

        if (e.key === 'ArrowRight') {
            goNext();
        } else if (e.key === 'ArrowLeft') {
            goPrev();
        }
    });

    // --- Fullscreen Video Logic ---

    // Open Video
    playButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent page turn
            const videoSrc = btn.getAttribute('data-video');
            if (videoSrc) {
                // Ensure playsinline is set for better mobile/compatibility support
                fullscreenVideo.setAttribute('playsinline', '');
                fullscreenVideo.setAttribute('webkit-playsinline', '');
                
                fullscreenVideo.src = videoSrc;
                fullscreenVideo.load(); // Essential for reloading source
                
                fullscreenOverlay.classList.add('active');
                
                // Play handling
                const playPromise = fullscreenVideo.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Playback started
                    }).catch(error => {
                        console.error("Video play failed:", error);
                        // Optional: Show a "Tap to Play" button in overlay if autoplay is denied
                    });
                }
            }
        });
    });

    // Close Video Function
    function closeFullscreen() {
        fullscreenVideo.pause();
        fullscreenVideo.src = ""; 
        fullscreenVideo.load();
        fullscreenOverlay.classList.remove('active');
    }

    // Close Button
    closeFullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFullscreen();
    });

    // Prevent propagation on interactive elements
    const mediaElements = document.querySelectorAll('audio, .media-overlay, .iframe-overlay');
    mediaElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

});

