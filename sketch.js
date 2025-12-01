let currentPage = 0;
const TOTAL_PAGES = 16;
const videoPages = [4, 9];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Helvetica');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  const a4Ratio = 210 / 297;
  let pageHeight = height * 0.8;
  let pageWidth = pageHeight * a4Ratio;

  if (pageWidth > width * 0.9) {
    pageWidth = width * 0.9;
    pageHeight = pageWidth / a4Ratio;
  }

  const pageX = (width - pageWidth) / 2;
  const pageY = (height - pageHeight) / 2;

  noStroke();
  fill(255);
  rect(pageX, pageY, pageWidth, pageHeight, 12);

  drawPageContent(pageX, pageY, pageWidth, pageHeight);
  drawHelpText();
}

function drawPageContent(x, y, w, h) {
  const pageNumber = currentPage + 1;

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(h * 0.04);
  text(`PAGE ${pageNumber} / ${TOTAL_PAGES}`, x + w / 2, y + h * 0.08);

  const contentX = x + w * 0.1;
  const contentY = y + h * 0.15;
  const contentW = w * 0.8;
  const contentH = h * 0.7;

  const isVideoPage = videoPages.includes(currentPage);

  if (isVideoPage) {
    noFill();
    stroke(0);
    strokeWeight(2);
    rect(contentX, contentY, contentW, contentH, 16);

    noStroke();
    textSize(h * 0.05);
    text(
      'VIDEO PAGE\n(영상 들어갈 자리)',
      x + w / 2,
      y + h / 2
    );
  } else {
    noStroke();
    textSize(h * 0.06);
    text(
      'EMPTY PAGE\n(나중에 내용 넣기)',
      x + w / 2,
      y + h / 2
    );
  }
}

function mousePressed() {
  if (mouseX > width / 2) {
    if (currentPage < TOTAL_PAGES - 1) {
      currentPage++;
    }
  } else {
    if (currentPage > 0) {
      currentPage--;
    }
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    if (currentPage < TOTAL_PAGES - 1) currentPage++;
  } else if (keyCode === LEFT_ARROW) {
    if (currentPage > 0) currentPage--;
  }
}

function drawHelpText() {
  fill(200);
  textAlign(CENTER, CENTER);
  textSize(14);
  const msg = '← 왼쪽 클릭: 이전 / 오른쪽 클릭: 다음 (키보드 ← →도 가능)';
  text(msg, width / 2, height - 24);
}
