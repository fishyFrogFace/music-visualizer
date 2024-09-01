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
];

const removeTrailingZeros = (arr, cap = 650) => {
  const lastNonZeroIndex = arr.findLastIndex((element) => element !== 0);
  return arr.slice(0, lastNonZeroIndex + 1 < cap ? cap : lastNonZeroIndex + 1);
};

const range = (size, startAt = 0) =>
  [...Array(size).keys()].map((i) => i + startAt);

const frequencyWeighting = (amp, bin) => {
  if (bin < 8) {
    return amp * 0.6;
  } else if (bin < 15) {
    return amp * 0.7;
  } else if (bin < 23) {
    return amp * 0.8;
  } else if (bin < 28) {
    return amp * 0.9;
  } else if (bin < 32) {
    return amp;
  } else if (bin < 38) {
    return amp * 1.1;
  } else if (bin < 45) {
    return amp * 1.2;
  } else if (bin < 53) {
    return amp * 1.3;
  } else {
    return amp * 1.4;
  }
};

function preload() {
  song = loadSound(songList[2].mp3);
}

function setup() {
  createCanvas(800, 500);
  angleMode(DEGREES);
  fft = new p5.FFT();

  textAlign(CENTER, CENTER);
  textSize(90);
  background(16, 126, 125);
  fill(255);
  stroke(16, 126, 125);
  text("Click to start/stop", width / 2, height / 2);
}

function draw() {
  if (!song.isPlaying()) return;

  background(16, 126, 125);
  strokeWeight(1);
  stroke(255, 255, 255);
  fill(98, 60, 234);
  translate(width / 2, height / 2);

  //const spectrum = fft.analyze();
  const spectrum = removeTrailingZeros(fft.analyze());
  //console.log("spectrum.length", spectrum.length);
  const binsPerBar = floor(spectrum.length / numBars);
  const anglePerBar = 360 / numBars; // each bar covers this angle
  const threshold = 0; // set to ignore low amplitudes

  range(numBars - 1).forEach((bar) => {
    const startIdx = bar * binsPerBar;
    const endIdx = startIdx + binsPerBar;

    // average the amplitude over the bins for this bar
    const ampSum = range(endIdx - startIdx + 1, startIdx)
      .map((frequencyIndex) => spectrum[frequencyIndex])
      .reduce((ampSum, currentValue) => ampSum + currentValue, 0);

    const amp = frequencyWeighting(ampSum / binsPerBar, bar);
    const adjustedAmp = amp / 2 + 100;

    if (adjustedAmp > threshold) {
      const r1 = 0; // start from the center (radius = 0)
      const r2 = map(adjustedAmp, 0, 356, 0, 356); // extend the bars outward
      const angle = bar * anglePerBar; // start angle for this bar

      // corners of the bar
      const x1 = r1 * cos(angle - anglePerBar / 2);
      const y1 = r1 * sin(angle - anglePerBar / 2);
      const x2 = r2 * cos(angle - anglePerBar / 2);
      const y2 = r2 * sin(angle - anglePerBar / 2);

      const x3 = r2 * cos(angle + anglePerBar / 2);
      const y3 = r2 * sin(angle + anglePerBar / 2);
      const x4 = r1 * cos(angle + anglePerBar / 2);
      const y4 = r1 * sin(angle + anglePerBar / 2);

      beginShape();
      vertex(x1, y1);
      vertex(x2, y2);
      vertex(x3, y3);
      vertex(x4, y4);
      endShape(CLOSE);
    }
  });

  //fill(98, 60, 234);
  stroke(0, 0, 0);
  strokeWeight(0);
  circle(0, 0, 205);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();
    }
  } else {
    song.stop();
  }
}

function doubleClicked() {
  location.reload();
}
