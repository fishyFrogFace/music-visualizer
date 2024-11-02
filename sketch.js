let song;
let fft;
const numPoints = 120;
const bins = 1024;

const songList = [
  { id: 0, mp3: "ES_8-Bit Hop - Ash Sculptures.mp3" },
  { id: 1, mp3: "ES_8-bit Sheriff - Wave Saver.mp3" },
  { id: 2, mp3: "ES_Feline (Instrumental Version) - Kadant.mp3" },
  { id: 3, mp3: "ES_Forget About Today - Blue Fret.mp3" },
  { id: 4, mp3: "ES_Old Grump - Smartface.mp3" },
  { id: 5, mp3: "ES_Sayonara - Rocket Jr.mp3" },
  { id: 6, mp3: "ES_Time to Level Up - Josef Bel Habib.mp3" },
  { id: 7, mp3: "theme.mp3" },
];

const removeTrailingZeros = (arr, cap = 650) => {
  const lastNonZeroIndex = arr.findLastIndex((element) => element !== 0);
  return arr.slice(0, lastNonZeroIndex + 1 < cap ? cap : lastNonZeroIndex + 1);
};

const getAmp = (index, adjustedAmps) =>
  adjustedAmps[(index + numPoints) % numPoints];

const range = (size, startAt = 0) =>
  [...Array(size).keys()].map((i) => i + startAt);

const frequencyWeighting = (amp, bin) => {
  if (bin < 8) {
    return amp * 0.3;
  } else if (bin < 15) {
    return amp * 0.9;
  } else if (bin < 23) {
    return amp;
  } else if (bin < 28) {
    return amp;
  } else if (bin < 38) {
    return amp * 1.1;
  } else if (bin < 45) {
    return amp * 1.1;
  } else if (bin < 53) {
    return amp * 1.2;
  } else {
    return amp * 1.4;
  }
};

function preload() {
  song = loadSound("children’s horror slow.mp3");
}

function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  fft = new p5.FFT();

  textAlign(CENTER, CENTER);
  textSize(90);
  background(0, 112, 144);
  fill(255);
  stroke(16, 126, 125);
  text("Click to start/stop", width / 2, height / 2);
}

function draw() {
  if (!song.isPlaying()) return;

  background(255, 255, 255);
  strokeWeight(0);

  stroke(255, 255, 255);
  translate(width / 2, height / 2);
  fill(255, 0, 0);
  circle(0, 0, 280);
  fill(0, 0, 0);
  const spectrum = removeTrailingZeros(fft.analyze());
  const adjustedAmps = [];

  const anglePerPoint = 360 / numPoints;

  const binsPerPoint = floor(spectrum.length / numPoints);

  range(numPoints).forEach((i) => {
    const startIdx = i * binsPerPoint;
    const endIdx = startIdx + binsPerPoint;

    const ampSum = range(endIdx - startIdx + 1, startIdx)
      .map((frequencyIndex) => spectrum[frequencyIndex])
      .reduce((ampSum, currentValue) => ampSum + currentValue, 0);

    const amp = frequencyWeighting(ampSum / binsPerPoint, i);
    const adjustedAmp = amp / 3 + 140;

    adjustedAmps.push(adjustedAmp);
  });

  beginShape();
  range(numPoints).forEach((i) => {
    const ampAfterAvg =
      i < 5 || i > numPoints - 5
        ? (adjustedAmps[i] +
            getAmp(i - 1, adjustedAmps) +
            getAmp(i - 2, adjustedAmps) +
            getAmp(i + 1, adjustedAmps) +
            getAmp(i + 2, adjustedAmps)) /
          5
        : adjustedAmps[i];

    const r = ampAfterAvg; // max: (255 * 1.4) / 3 + 140 = 257
    const angle = i * anglePerPoint;

    const x = r * cos(angle);
    const y = r * sin(angle);

    strokeWeight(2);
    stroke(255);
    //point(x, y);
    strokeWeight(0);

    curveVertex(x, y); // Create smooth curve
  });
  endShape(CLOSE);

  //circle(0, 0, 350);
  //fill(30, 30, 36);
  //circle(0, 0, 300);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();
    }
  } else {
    location.reload();
  }
}
