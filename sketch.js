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
  if (bin < 5 || bin > 120 - 5) {
    return amp * 1.8;
  } else if (bin < 10 || bin > 120 - 10) {
    return amp * 1.7;
  } else if (bin < 15 || bin > 120 - 15) {
    return amp * 1.6;
  } else if (bin < 20 || bin > 120 - 20) {
    return amp * 1.5;
  } else if (bin < 25 || bin > 120 - 25) {
    return amp * 1.4;
  } else if (bin < 30 || bin > 120 - 30) {
    return amp * 1.3;
  } else if (bin < 35 || bin > 120 - 35) {
    return amp * 1.2;
  } else if (bin < 40 || bin > 120 - 40) {
    return amp * 1.1;
  } else if (bin < 45 || bin > 120 - 45) {
    return amp;
  } else if (bin < 50 || bin > 120 - 50) {
    return amp * 0.9;
  } else if (bin < 55 || bin > 120 - 55) {
    return amp * 0.8;
  } else {
    return amp * 0.7;
  }
};

const mirror = (analysisArray) => {
  const reverse = [...analysisArray].reverse();
  return reverse.concat(analysisArray);
};

function preload() {
  song = loadSound("d1f11aaf-a5d0-4a33-8aaa-859d846d4fa1.mp3");
}

function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  fft = new p5.FFT();

  textAlign(CENTER, CENTER);
  textSize(90);
  background(0, 112, 144);
  fill(255);
  //stroke(16, 126, 125);
  text("Click to start/stop", width / 2, height / 2);
}

function draw() {
  if (!song.isPlaying()) return;

  background(68, 151, 26);
  strokeWeight(0);

  stroke(255, 255, 255);
  translate(width / 2, height / 2);
  //fill(255, 0, 0);
  circle(0, 0, 280);
  fill(255);

  // removing trailing zeroes because high frequencies often does not have any amplitude, which makes the circle look uneven
  const spectrum = removeTrailingZeros(fft.analyze());

  const mirroredSpectrum = mirror(spectrum);

  const adjustedAmps = [];

  const anglePerPoint = 360 / numPoints;

  const binsPerPoint = floor(mirroredSpectrum.length / numPoints);

  range(numPoints).forEach((i) => {
    const startIdx = i * binsPerPoint;
    const endIdx = startIdx + binsPerPoint;

    const ampSum = range(endIdx - startIdx + 1, startIdx)
      .map((frequencyIndex) => mirroredSpectrum[frequencyIndex])
      .reduce((ampSum, currentValue) => ampSum + currentValue, 0);

    const amp = frequencyWeighting(ampSum / binsPerPoint, i);
    const adjustedAmp = amp / 3 + 140;

    adjustedAmps.push(adjustedAmp);
  });

  beginShape();
  range(numPoints).forEach((i) => {
    /*     const mirror =
      i > numPoints - 10 ? adjustedAmps[numPoints - i] : adjustedAmps[i]; */

    const r = adjustedAmps[i]; // max: (255 * 1.4) / 3 + 140 = 257
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
