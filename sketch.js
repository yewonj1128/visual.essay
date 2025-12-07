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

    // Fullscreen Video Elements
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenVideo = document.getElementById('fullscreen-video');
    const closeFullscreenBtn = document.getElementById('close-fullscreen');
    const playButtons = document.querySelectorAll('.fullscreen-play-btn');

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
        // Doljabi Overlay (Pages 14-15)
        if (currentSheet === 7) {
            setTimeout(() => {
                if (currentSheet === 7) doljabiOverlay.classList.add('active');
            }, 600);
        } else {
            doljabiOverlay.classList.remove('active');
        }

        // Page 5 Audio
        if (currentSheet !== 2) {
            if (page5Audio && !page5Audio.paused) {
                page5Audio.pause();
            }
        }

        // Page 7 GIF Auto-Animation (optional)
        if (currentSheet === 3) {
            const page7GifContainer = document.getElementById('page7-gif-container');
            const gif = page7GifContainer ? page7GifContainer.querySelector('img') : null;
            if (gif) {
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

    // --- Fullscreen Video Logic (지금은 안 써도 됨) ---
    playButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoSrc = btn.getAttribute('data-video');
            if (videoSrc) {
                fullscreenVideo.setAttribute('playsinline', '');
                fullscreenVideo.setAttribute('webkit-playsinline', '');
                fullscreenVideo.src = videoSrc;
                fullscreenVideo.load();
                fullscreenOverlay.classList.add('active');
                fullscreenVideo.play().catch(() => {});
            }
        });
    });

    function closeFullscreen() {
        fullscreenVideo.pause();
        fullscreenVideo.src = ""; 
        fullscreenVideo.load();
        fullscreenOverlay.classList.remove('active');
    }

    closeFullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFullscreen();
    });

    const mediaElements = document.querySelectorAll('audio, .media-overlay, .iframe-overlay');
    mediaElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});
