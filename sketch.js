let song;
let fft;
const numPoints = 60;
const bins = 1024;
const allAdjustedAmps = [];
const fromFile = true;
let fileAmpCounter = 0;

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
  const binFactor = numPoints / 12;
  if (bin < binFactor) {
    return amp * 0.6;
  } else if (bin < binFactor * 2) {
    return amp * 0.7;
  } else if (bin < binFactor * 3) {
    return amp * 0.8;
  } else if (bin < binFactor * 4) {
    return amp * 0.9;
  } else if (bin < binFactor * 5) {
    return amp;
  } else if (bin < binFactor * 6) {
    return amp * 1.1;
  } else if (bin < binFactor * 7) {
    return amp * 1.2;
  } else if (bin < binFactor * 8) {
    return amp * 1.3;
  } else if (bin < binFactor * 9) {
    return amp * 1.4;
  } else if (bin < binFactor * 10) {
    return amp * 1.5;
  } else {
    return amp * 1.6;
  }
};

const mirror = (analysisArray) => {
  const reverse = [...analysisArray].reverse();
  return reverse.concat(analysisArray);
};

const calculateAdjustedAmps = (spectrum) => {
  const binsPerPoint = floor(spectrum.length / numPoints);

  const adjustedAmps = range(numPoints).map((i) => {
    const startIdx = i * binsPerPoint;
    const endIdx = startIdx + binsPerPoint;

    const ampSum = range(endIdx - startIdx + 1, startIdx)
      .map((frequencyIndex) => spectrum[frequencyIndex])
      .reduce((sum, currentValue) => sum + currentValue, 0);

    const amp = frequencyWeighting(ampSum / binsPerPoint, i);
    const adjustedAmp = amp / 3 + 140;

    return adjustedAmp;
  });

  allAdjustedAmps.push(adjustedAmps);
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
  const adjustedAmps = fromFile
    ? amps[fileAmpCounter]
    : calculateAdjustedAmps(spectrum);

  fileAmpCounter += 1;

  const anglePerPoint = 360 / numPoints;

  // calculate points on the circle
  const points = adjustedAmps.map((r, i) => {
    const angle = i * anglePerPoint;

    const x = r * cos(angle);
    const y = r * sin(angle);

    return { x, y };
  });

  // extend points array for smooth curve wrapping
  const extendedPoints = [
    points[points.length - 2],
    points[points.length - 1],
    ...points,
    points[0],
    points[1],
  ];

  beginShape();

  extendedPoints.forEach(({ x, y }) => {
    curveVertex(x, y);
  });
  endShape();
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveJSON(allAdjustedAmps, "adjustedAmps.json");
  }
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
