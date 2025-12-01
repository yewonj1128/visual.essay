let currentPage = 0;
const TOTAL_PAGES = 16;

function drawSinglePage(pageNumber, x, y, w, h) {
  fill(255);
  noStroke();
  rect(x, y, w, h, 0);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(h * 0.02);
  text("PAGE " + pageNumber, x + w / 2, y + h / 2);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Helvetica');
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  const page = currentPage + 1;
  const a4Ratio = 210 / 297;

  let pageHeight = height * 0.75;
  let pageWidth = pageHeight * a4Ratio;

  let spreadWidth = pageWidth * 2;
  let spreadX = (width - spreadWidth) / 2;
  let pageY = (height - pageHeight) / 2;
  let leftPage = null;
  let rightPage = null;

  if (page === 1) {
    rightPage = 1;

  } else if (page === TOTAL_PAGES) {
    leftPage = TOTAL_PAGES;

  } else if (page % 2 === 0) {
    leftPage = page;
    rightPage = page + 1;

  } else {
    leftPage = page - 1;
    rightPage = page;
  }


  if (leftPage) {
    drawSinglePage(leftPage, spreadX, pageY, pageWidth, pageHeight);
  }
  if (rightPage) {
    drawSinglePage(rightPage, spreadX + pageWidth, pageY, pageWidth, pageHeight);
  }
  
stroke(180);
strokeWeight(1);
line(width/2, pageY, width/2, pageY+pageHeight);
noStroke();

  // mouse cursor arrow
  if (mouseX > width / 2){
  cursor('e-resize');
}else {
  cursor('w-resize');
}
}

  // page by mouse 
  function mousePressed() {
  let page = currentPage + 1;   
  let spreadStart = (page % 2 === 0) ? page : page - 1;

  if (mouseX > width / 2) {
    let nextStart = spreadStart + 2;
    if (nextStart <= TOTAL_PAGES) currentPage = nextStart - 1;

  } else {
    let prevStart = spreadStart - 2;
    if (prevStart >= 1) currentPage = prevStart - 1;
  }
}

  // page by keyboard 
  function keyPressed() {
  let page = currentPage + 1;
  let spreadStart = (page % 2 === 0) ? page : page - 1;

  if (keyCode === RIGHT_ARROW) {
    let nextStart = spreadStart + 2;
    if (nextStart <= TOTAL_PAGES) currentPage = nextStart - 1;
  }

  if (keyCode === LEFT_ARROW) {
    let prevStart = spreadStart - 2;
    if (prevStart >= 1) currentPage = prevStart - 1;
  }
}
