document.addEventListener('DOMContentLoaded', () => {

    const totalSheets = 8;
    let currentSheet = 0;

    const sheets = [];
    for (let i = 1; i <= totalSheets; i++) {
        sheets.push(document.getElementById(`sheet-${i}`));
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const doljabiOverlay = document.getElementById('doljabi-overlay');
    const page5Audio = document.getElementById('page5-audio');

    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenVideo = document.getElementById('fullscreen-video');
    const closeFullscreenBtn = document.getElementById('close-fullscreen');

    function updateZIndexes() {
        sheets.forEach((sheet, idx) => {
            const num = idx + 1;
            if (num <= currentSheet) sheet.style.zIndex = num;
            else sheet.style.zIndex = totalSheets - idx + 1;
        });
    }

    updateZIndexes();

    function checkMedia() {
        if (currentSheet !== 2 && page5Audio && !page5Audio.paused) {
            page5Audio.pause();
        }

        if (currentSheet === 7) {
            setTimeout(() => {
                if (currentSheet === 7) doljabiOverlay.classList.add('active');
            }, 600);
        } else {
            doljabiOverlay.classList.remove('active');
        }
    }

    function goNext() {
        if (currentSheet < totalSheets) {
            doljabiOverlay.classList.remove('active');
            currentSheet++;
            sheets[currentSheet - 1].classList.add('flipped');
            updateZIndexes();
            checkMedia();
        }
    }

    function goPrev() {
        if (currentSheet > 0) {
            doljabiOverlay.classList.remove('active');
            sheets[currentSheet - 1].classList.remove('flipped');
            currentSheet--;
            updateZIndexes();
            checkMedia();
        }
    }

    nextBtn.onclick = e => { e.stopPropagation(); goNext(); };
    prevBtn.onclick = e => { e.stopPropagation(); goPrev(); };

    document.addEventListener('click', e => {
        if (fullscreenOverlay.classList.contains('active')) return;
        if (e.clientX > window.innerWidth / 2) goNext();
        else goPrev();
    });

    document.addEventListener('keydown', e => {
        if (fullscreenOverlay.classList.contains('active')) {
            if (e.key === 'Escape') closeFullscreen();
            return;
        }
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
    });

    function closeFullscreen() {
        fullscreenVideo.pause();
        fullscreenOverlay.classList.remove('active');
        fullscreenVideo.src = "";
    }

    closeFullscreenBtn.onclick = e => { e.stopPropagation(); closeFullscreen(); };
});
