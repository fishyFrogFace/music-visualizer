let song;
let fft;
const numBars = 60;
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

const getAmp = (index, adjustedAmps) => {
  console.log(index, index + numBars, (index + numBars) % numBars);
  return adjustedAmps[(index + numBars) % numBars];
};

const range = (size, startAt = 0) =>
  [...Array(size).keys()].map((i) => i + startAt);

const frequencyWeighting = (amp, bin) => {
  if (bin < 8) {
    return amp * 0.8;
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
  song = loadSound(songList[7].mp3);
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

  background(0, 112, 144);
  strokeWeight(0);
  fill(30, 30, 36);
  stroke(255, 255, 255);
  translate(width / 2, height / 2);

  const spectrum = removeTrailingZeros(fft.analyze());
  const adjustedAmps = [];

  // Determine the number of points for the curve, e.g., 360 points for a full circle
  const numPoints = 120;
  const anglePerPoint = 360 / numPoints;

  // Adjust the spectrum to fit the number of points
  const binsPerPoint = floor(spectrum.length / numPoints);

  // Calculate the adjusted amplitudes
  range(numPoints).forEach((i) => {
    const startIdx = i * binsPerPoint;
    const endIdx = startIdx + binsPerPoint;

    // Average amplitude for the point
    const ampSum = range(endIdx - startIdx + 1, startIdx)
      .map((frequencyIndex) => spectrum[frequencyIndex])
      .reduce((ampSum, currentValue) => ampSum + currentValue, 0);

    const amp = frequencyWeighting(ampSum / binsPerPoint, i);
    const adjustedAmp = amp / 3 + 140;

    adjustedAmps.push(adjustedAmp);
  });

  beginShape();
  range(numPoints).forEach((i) => {
    // Smooth the amplitude by averaging it with neighboring values
    const ampAfterAvg =
      i < 5 || i > numPoints - 5
        ? (adjustedAmps[i] +
            getAmp(i - 1, adjustedAmps) +
            getAmp(i - 2, adjustedAmps) +
            getAmp(i + 1, adjustedAmps) +
            getAmp(i + 2, adjustedAmps)) /
          5
        : adjustedAmps[i];

    const r = map(ampAfterAvg, 0, 356, 0, 356);
    const angle = i * anglePerPoint;

    const x = r * cos(angle);
    const y = r * sin(angle);

    curveVertex(x, y); // Create smooth curve
  });
  endShape(CLOSE);

  // Optional: draw inner circle for reference
  circle(0, 0, 350);
  fill(30, 30, 36);
  circle(0, 0, 300);
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
