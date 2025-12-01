// 현재 페이지 (0부터 시작, 사람이 보는 건 +1 해서 보여줄 거야)
let currentPage = 0;
const TOTAL_PAGES = 16;

// "영상 들어갈 예정"인 페이지 (0-based index) - 예시로 5, 10페이지를 비워둠
// 나중에 원하면 숫자 바꿔도 됨!
const videoPages = [4, 9]; // 5페이지, 10페이지

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Helvetica'); // 대충 기본 폰트
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  
  const a4Ratio = 210 / 297;

  // 기본적으로 화면 높이의 80%를 종이 높이로 가정
  let pageHeight = height * 0.8;
  let pageWidth = pageHeight * a4Ratio;

  // 만약 이렇게 했더니 가로가 화면보다 너무 크면, 가로 기준으로 다시 맞추기
  if (pageWidth > width * 0.9) {
    pageWidth = width * 0.9;
    pageHeight = pageWidth / a4Ratio;
  }

  const pageX = (width - pageWidth) / 2;
  const pageY = (height - pageHeight) / 2;

  // 흰 종이
  noStroke();
  fill(255);
  rect(pageX, pageY, pageWidth, pageHeight, 0);

  // 페이지 안 내용(placeholder) 그리기
  drawPageContent(pageX, pageY, pageWidth, pageHeight);
  
  if (mouseX > width / 2){
  cursor('e-resize');
}else {
  cursor('w-resize');
}
}

function drawPageContent(x, y, w, h) {
  const pageNumber = currentPage + 1; // 사람 기준 페이지 번호

  // 텍스트 스타일
  fill(0);
  textAlign(CENTER, CENTER);

  // 페이지 번호 표시 (위쪽)
  textSize(h * 0.02);
  text(`PAGE ${pageNumber} / ${TOTAL_PAGES}`, x + w / 2, y + h * 0.025);

  // 본문 영역
  const contentX = x + w * 0.1;
  const contentY = y + h * 0.15;
  const contentW = w * 0.8;
  const contentH = h * 0.7;

  // 이 페이지가 "영상용 페이지"인지 확인
  const isVideoPage = videoPages.includes(currentPage);

  if (isVideoPage) {
    // 비디오 placeholder
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
    // 일반 페이지 placeholder 텍스트
    noStroke();
    textSize(h * 0.02);
    text(
      'EMPTY PAGE\n(나중에 내용 넣기)',
      x + w / 2,
      y + h / 2
    );
  }
}

// 클릭하면 좌/우에 따라 페이지 이동
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
