let song;
let fft;
const numPoints = 30;
const bins = 1024;
const allAdjustedAmps = [];
const fromFile = false;
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

  return adjustedAmps;
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

const exaggerateLocalPeaks = (amps, factor = 1.01) => {
  const len = amps.length;
  return amps.map((amp, i) => {
    if (amp === 140) {
      return amp;
    }
    // get neighboring indices with wrap-around
    const prevIndex = (i - 1 + len) % len;
    const nextIndex = (i + 1) % len;

    // compute the average of neighboring amplitudes
    const neighborAvg = (amps[prevIndex] + amps[nextIndex]) / 2;

    const diff = amp - neighborAvg;

    // if the current amplitude is higher than neighbors, exaggerate the peak
    if (diff > 0) {
      return amp + diff * factor;
    } else {
      return amp;
    }
  });
};

const drawPoints = (points) => {
  colorMode(HSB);
  points.forEach(({ x, y, hue }) => {
    stroke(hue, 100, 100);
    fill(hue, 100, 100);
    ellipse(x, y, 5, 5);
  });
  colorMode(RGB);
};

const drawNumbering = (points, anglePerPoint) => {
  colorMode(HSB);
  points.forEach(({ x, y, hue, index }) => {
    fill(hue, 100, 100);
    noStroke();
    textSize(12);
    const offsetX = 10 * cos(index * anglePerPoint);
    const offsetY = 10 * sin(index * anglePerPoint);
    text(index, x + offsetX, y + offsetY);
  });

  colorMode(RGB);
};

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
    : exaggerateLocalPeaks(calculateAdjustedAmps(spectrum), 10).map((amp) =>
        Math.round(amp)
      );

  allAdjustedAmps.push(adjustedAmps);

  fileAmpCounter += 1;

  const anglePerPoint = 360 / numPoints;

  // calculate points on the circle
  const points = adjustedAmps.map((r, i) => {
    const angle = i * anglePerPoint;

    const x = r * cos(angle);
    const y = r * sin(angle);
    const hue = map(i, 0, numPoints, 0, 360);

    return { x, y, hue, index: i };
  });

  // extend points array for smooth curve wrapping
  const extendedPoints = [
    points[points.length - 2],
    points[points.length - 1],
    ...points,
    points[0],
    points[1],
  ];

  fill(255);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  const displayText = adjustedAmps
    .map((amp, index) => `Index ${index}: ${amp.toFixed(2)}`)
    .join("\n");
  text(displayText, -width / 2 + 10, -height / 2 + 10);

  beginShape();

  extendedPoints.forEach(({ x, y }) => {
    curveVertex(x, y);
  });
  endShape();

  drawPoints(points);
  drawNumbering(points, anglePerPoint);
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
