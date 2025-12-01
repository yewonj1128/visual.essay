// --- Configuration ---
const TOTAL_PAGES = 16;
const IMAGES_PATH = 'images/';
const PAGE_TURN_THRESHOLD = 50; 

// --- State ---
let spreads = []; 
let pages = []; // Array of { img, status }
let pageVideos = {}; 
let currentSpreadIndex = 0;

// Animation State
let animationState = {
  active: false,
  type: 'none', // 'turn_next', 'turn_prev', 'snap_back'
  progress: 0,
  startProgress: 0, // For snapping back from current drag position
  direction: 0, // -1 or 1
  targetSpread: 0
};

// Drag State
let dragState = {
  active: false,
  startX: 0,
  currentX: 0,
  startTime: 0
};

// --- Setup & Preload ---

function preload() {
  // Initialize pages array (1-based index)
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    let path = IMAGES_PATH + 'page' + i + '.jpg';
    
    pages[i] = {
      id: i,
      status: 'loading',
      img: loadImage(
        path,
        () => {
          pages[i].status = 'loaded';
        },
        () => {
          pages[i].status = 'error';
          pages[i].img = null;
        }
      )
    };
  }
  
  // Load Video for Spread 5 (Pages 10-11)
  pageVideos['spread5'] = createVideo([IMAGES_PATH + 'page11.mp4']);
  pageVideos['spread5'].hide(); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Helvetica');
  
  initSpreads();
  updateVideoState();
}

function initSpreads() {
  spreads = [];
  
  // Logic: 
  // Page 1 is Spread 0 (Right)
  // Page 2,3 is Spread 1 (Left, Right)
  // ...
  // Page 16 is Spread 8 (Left)
  
  // Spread 0
  spreads.push({ type: 'IMAGE', left: null, right: 1 });
  
  // Spreads 1 to 7 (Pages 2-15)
  // Pairs: (2,3), (4,5), (6,7), (8,9), (10,11), (12,13), (14,15)
  for (let i = 2; i <= 15; i += 2) {
    let spreadIndex = spreads.length;
    let left = i;
    let right = i + 1;
    
    // Check for Video Overrides
    // Requested: Spread with video (Page 11 is video, so Spread covering 10-11)
    if (left === 10 && right === 11) {
       spreads.push({ type: 'VIDEO', videoKey: 'spread5', left: 10, right: 11 });
    } else {
       spreads.push({ type: 'IMAGE', left: left, right: right });
    }
  }
  
  // Last Spread (Page 16)
  spreads.push({ type: 'IMAGE', left: 16, right: null });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- Main Draw Loop ---

function draw() {
  background(0); 
  
  let layout = calculateLayout();

  // 1. Handle Dragging
  if (dragState.active) {
    let dragOffset = dragState.currentX - dragState.startX;
    let direction = dragOffset < 0 ? -1 : 1; // -1 = Next (Drag Left), 1 = Prev (Drag Right)
    
    // Calculate progress based on spread width (drag 50% of screen to full turn)
    let maxDrag = width / 2;
    let rawProgress = map(abs(dragOffset), 0, maxDrag, 0, 1);
    let progress = constrain(rawProgress, 0, 1);
    
    // Draw the manual turn
    drawPageTurn(currentSpreadIndex, direction, progress, layout);
  } 
  // 2. Handle Animation
  else if (animationState.active) {
    updateAnimation();
    
    if (animationState.type === 'snap_back') {
      // Revert turn (animate progress back to 0)
      drawPageTurn(currentSpreadIndex, animationState.direction, animationState.progress, layout);
    } else {
      // Complete turn (animate progress to 1)
      drawPageTurn(currentSpreadIndex, animationState.direction, animationState.progress, layout);
    }
  } 
  // 3. Static State
  else {
    drawSpread(currentSpreadIndex, layout);
    drawGutter(currentSpreadIndex, layout);
  }
  
  updateCursor(layout);
}

function calculateLayout() {
  const a4Ratio = 210 / 297;
  let pageHeight = height * 0.75;
  let pageWidth = pageHeight * a4Ratio;
  let spreadWidth = pageWidth * 2;
  let startX = (width - spreadWidth) / 2;
  let startY = (height - pageHeight) / 2;
  
  return { pageHeight, pageWidth, spreadWidth, startX, startY };
}

function updateAnimation() {
  // Ease out function
  let speed = 0.15; 
  
  if (animationState.type === 'snap_back') {
    // Target is 0
    animationState.progress = lerp(animationState.progress, 0, speed);
    if (animationState.progress < 0.005) {
      animationState.active = false;
      animationState.progress = 0;
      // Stay on current spread
      updateVideoState();
    }
  } else {
    // Target is 1
    animationState.progress = lerp(animationState.progress, 1, speed);
    if (1 - animationState.progress < 0.005) {
      animationState.active = false;
      animationState.progress = 0;
      // Commit change
      currentSpreadIndex = animationState.targetSpread;
      updateVideoState();
    }
  }
}

// --- Drawing Functions ---

function drawSpread(index, layout) {
  if (index < 0 || index >= spreads.length) return;
  let spread = spreads[index];
  let { startX, startY, pageWidth, pageHeight } = layout;
  
  if (spread.type === 'VIDEO') {
    drawVideoSpread(spread, layout);
  } else {
    // Draw Left
    if (spread.left) drawSinglePage(spread.left, startX, startY, pageWidth, pageHeight);
    // Draw Right
    if (spread.right) drawSinglePage(spread.right, startX + pageWidth, startY, pageWidth, pageHeight);
  }
}

function drawVideoSpread(spread, layout) {
  let vid = pageVideos[spread.videoKey];
  let { startX, startY, pageWidth, pageHeight } = layout;
  if (!vid || vid.width === 0 || vid.height === 0) {
    fill(0);
    rect(startX, startY, pageWidth * 2, pageHeight);
    return;
  }
  
  let maxW = pageWidth * 2;
  let maxH = pageHeight;
  let scale = Math.min(maxW / vid.width, maxH / vid.height);
  let drawW = vid.width * scale;
  let drawH = vid.height * scale;
  let offsetX = startX + (maxW - drawW) / 2;
  let offsetY = startY + (maxH - drawH) / 2;
  
  image(vid, offsetX, offsetY, drawW, drawH);
}

function drawGutter(index, layout) {
  if (index < 0 || index >= spreads.length) return;
  let spread = spreads[index];
  let { startX, startY, pageWidth, pageHeight } = layout;
  
  if (spread.type === 'IMAGE') {
    stroke(30);
    strokeWeight(1);
    line(startX + pageWidth, startY, startX + pageWidth, startY + pageHeight);
    noStroke();
  }
}

function drawSinglePage(pageNum, x, y, w, h) {
  let p = pages[pageNum];
  if (!p) return;
  
  // Check if loaded (callback might lag, but width check is robust)
  if (p.status === 'loaded' || (p.img && p.img.width > 0)) {
    // Ensure status is up to date if width check passes but callback didn't fire
    if (p.status === 'loading' && p.img.width > 0) p.status = 'loaded';
    
    image(p.img, x, y, w, h);
  } else {
    drawPlaceholder(pageNum, p.status, x, y, w, h);
  }
}

function drawPlaceholder(pageNum, status, x, y, w, h) {
  fill(240);
  rect(x, y, w, h);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(w * 0.1);
  noStroke();
  
  let msg = status === 'loading' ? "Loading..." : ("Missing:\npage" + pageNum);
  text(msg, x + w / 2, y + h / 2);
}

function drawPageTurn(currentIndex, direction, progress, layout) {
  let { startX, startY, pageWidth, pageHeight } = layout;
  
  let targetIndex = currentIndex - direction;
  
  // Boundary Check: If invalid turn, just clamp/resist
  if (targetIndex < 0 || targetIndex >= spreads.length) {
    // Just draw static current spread
    drawSpread(currentIndex, layout);
    return;
  }
  
  // 3-Layer Rendering for realistic turn
  
  // Layer 1: Bottom (Target Spread)
  // The pages that will be revealed
  drawSpread(targetIndex, layout);
  
  // Layer 2: Static Page of Current Spread
  // If Going Next (Right to Left): Left page stays.
  // If Going Prev (Left to Right): Right page stays.
  
  let currentSpread = spreads[currentIndex];
  
  if (direction === -1) { // NEXT
    // Static: Left Page
    if (currentSpread.type === 'VIDEO') {
      let vid = pageVideos[currentSpread.videoKey];
      if (vid) image(vid, startX, startY, pageWidth, pageHeight, 0, 0, vid.width/2, vid.height);
    } else if (currentSpread.left) {
      drawSinglePage(currentSpread.left, startX, startY, pageWidth, pageHeight);
    }
  } else { // PREV
    // Static: Right Page
    if (currentSpread.type === 'VIDEO') {
       let vid = pageVideos[currentSpread.videoKey];
       if (vid) image(vid, startX + pageWidth, startY, pageWidth, pageHeight, vid.width/2, 0, vid.width/2, vid.height);
    } else if (currentSpread.right) {
      drawSinglePage(currentSpread.right, startX + pageWidth, startY, pageWidth, pageHeight);
    }
  }
  
  // Layer 3: The Turning Page
  // Uses masking or 2.5D skew
  push();
  translate(startX + pageWidth, startY); // Spine Pivot
  
  let angle = progress * PI; 
  
  if (direction === -1) { // NEXT (Turning Right -> Left)
    let turnWidth = pageWidth * cos(angle); // Positive -> Negative
    
    if (angle < HALF_PI) {
      // FRONT of Moving Page (Current Right)
      // Drawn on Right side (0 to turnWidth)
      let content = getDrawContent(currentIndex, 'right');
      drawTurningContent(content, 0, 0, turnWidth, pageHeight, 'front', angle);
    } else {
      // BACK of Moving Page (Target Left)
      // Drawn on Left side (0 to turnWidth (neg))
      let content = getDrawContent(targetIndex, 'left');
      drawTurningContent(content, 0, 0, turnWidth, pageHeight, 'back', angle);
    }
    
  } else { // PREV (Turning Left -> Right)
    // Angle 0: Left Page flat. Angle PI: Left Page flipped to right.
    // turnWidth: -pageWidth -> +pageWidth.
    // But cos(0) = 1. We want start at -1. So -cos.
    let turnWidth = -pageWidth * cos(angle);
    
    if (angle < HALF_PI) {
      // FRONT of Moving Page (Current Left)
      // Drawn on Left side (0 to turnWidth (neg))
      let content = getDrawContent(currentIndex, 'left');
      drawTurningContent(content, 0, 0, turnWidth, pageHeight, 'front', angle);
    } else {
      // BACK of Moving Page (Target Right)
      // Drawn on Right side (0 to turnWidth (pos))
      let content = getDrawContent(targetIndex, 'right');
      drawTurningContent(content, 0, 0, turnWidth, pageHeight, 'back', angle);
    }
  }
  pop();
  
  // Draw Spine/Shadow Overlay
  drawSpineShadow(layout, progress);
}

function getDrawContent(spreadIndex, side) {
  if (spreadIndex < 0 || spreadIndex >= spreads.length) return null;
  let spread = spreads[spreadIndex];
  
  if (spread.type === 'VIDEO') {
    let vid = pageVideos[spread.videoKey];
    if (!vid || vid.width === 0 || vid.height === 0) return null;
    return {
      type: 'video',
      img: vid,
      cropX: side === 'left' ? 0 : vid.width/2,
      cropW: vid.width/2
    };
  } else {
    let pageNum = side === 'left' ? spread.left : spread.right;
    let p = pages[pageNum];
    if (!p) return null;
    return {
      type: 'image',
      img: p.img,
      status: p.status,
      pageNum: pageNum
    };
  }
}

function drawTurningContent(content, x, y, w, h, face, angle) {
  if (!content) return;
  
  // If width is tiny, skip to avoid rendering glitches
  if (abs(w) < 1) return;

  if (content.type === 'video') {
    // Draw video
    // Use scale to flip if needed? image() with neg width handles it.
    image(content.img, x, y, w, h, content.cropX, 0, content.cropW, content.img.height);
  } else if (content.type === 'image') {
    // Robust check
    if ((content.status === 'loaded' || (content.img && content.img.width > 0)) && content.img) {
      image(content.img, x, y, w, h);
    } else {
      drawPlaceholder(content.pageNum, content.status, x, y, w, h);
    }
  }
  
  // Dynamic Shadow based on angle
  // 0 -> 0 opacity. 90 -> high opacity. 180 -> 0.
  let shadowOpacity = map(sin(angle), 0, 1, 0, 100);
  fill(0, shadowOpacity);
  noStroke();
  rect(x, y, w, h);
  
  // Highlight edge
  // rect(x + w - 2, y, 2, h); // Crude highlight
}

function drawSpineShadow(layout, progress) {
  let { startX, startY, pageWidth, pageHeight } = layout;
  // Shadow in the gutter
  fill(0, 30);
  rect(startX + pageWidth - 5, startY, 10, pageHeight);
}

// --- Interaction ---

function mousePressed() {
  dragState.active = true;
  dragState.startX = mouseX;
  dragState.currentX = mouseX;
  dragState.startTime = millis();
}

function mouseDragged() {
  if (dragState.active) {
    dragState.currentX = mouseX;
  }
  return false; 
}

function mouseReleased() {
  if (!dragState.active) return;
  dragState.active = false;
  
  let dragOffset = mouseX - dragState.startX;
  let dragTime = millis() - dragState.startTime;
  
  // Click Detection
  if (dragTime < 300 && abs(dragOffset) < 10) {
    if (!handlePageClick()) {
      handleNavigationClick(mouseX);
    }
    return;
  }
  
  // Turn Detection
  let direction = dragOffset < 0 ? -1 : 1; 
  if (abs(dragOffset) > PAGE_TURN_THRESHOLD) {
    // Trigger Turn
    initiateAnimation('turn', direction);
  } else {
    // Trigger Snap Back
    // We need to know current progress to start animation from there
    let maxDrag = width / 2;
    let progress = constrain(map(abs(dragOffset), 0, maxDrag, 0, 1), 0, 1);
    
    animationState.active = true;
    animationState.type = 'snap_back';
    animationState.progress = progress;
    animationState.direction = direction;
    animationState.targetSpread = currentSpreadIndex; // Stay same
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    initiateAnimation('turn', -1);
  } else if (keyCode === LEFT_ARROW) {
    initiateAnimation('turn', 1);
  } else if (keyCode === ESCAPE) {
     if (window.closeZoomModal) window.closeZoomModal();
  }
}

function initiateAnimation(type, direction) {
  if (type === 'turn') {
    let target = currentSpreadIndex - direction;
    if (target >= 0 && target < spreads.length) {
      animationState.active = true;
      animationState.type = direction === -1 ? 'turn_next' : 'turn_prev';
      animationState.targetSpread = target;
      animationState.direction = direction;
      animationState.progress = 0;
    }
  }
}

function handlePageClick() {
  let layout = calculateLayout();
  let { startX, startY, pageWidth, spreadWidth, pageHeight } = layout;
  
  if (pointInRect(mouseX, mouseY, startX, startY, pageWidth, pageHeight)) {
    return openZoomForSide('left');
  }
  if (pointInRect(mouseX, mouseY, startX + pageWidth, startY, pageWidth, pageHeight)) {
    return openZoomForSide('right');
  }
  return false;
}

function pointInRect(px, py, rx, ry, rw, rh) {
  return px > rx && px < rx + rw && py > ry && py < ry + rh;
}

function handleNavigationClick(clickX) {
  if (clickX >= width / 2) {
    initiateAnimation('turn', -1);
  } else {
    initiateAnimation('turn', 1);
  }
}

function openZoomForSide(side) {
  let spread = spreads[currentSpreadIndex];
  if (spread.type === 'VIDEO') return true; 
  
  let pageNum = side === 'left' ? spread.left : spread.right;
  if (!pageNum) return true;
  
  if (pages[pageNum] && pages[pageNum].status === 'loaded') {
    let path = IMAGES_PATH + 'page' + pageNum + '.jpg';
    if (window.openZoomModal) window.openZoomModal(path);
  }
  return true;
}

function updateVideoState() {
  for (let key in pageVideos) {
    pageVideos[key].pause();
    pageVideos[key].hide(); 
  }
  
  let spread = spreads[currentSpreadIndex];
  if (spread.type === 'VIDEO') {
    let vid = pageVideos[spread.videoKey];
    if (vid) vid.loop(); 
  }
}

function updateCursor(layout) {
  if (dragState.active) {
    cursor('grabbing');
    return;
  }
  
  let { startX, startY, pageWidth, spreadWidth, pageHeight } = layout;
  
  if (pointInRect(mouseX, mouseY, startX, startY, pageWidth, pageHeight)) {
    cursor('w-resize');
  } else if (pointInRect(mouseX, mouseY, startX + pageWidth, startY, pageWidth, pageHeight)) {
    cursor('e-resize');
  } else if (mouseX >= width / 2) {
    cursor('e-resize');
  } else {
    cursor('w-resize');
  }
}

