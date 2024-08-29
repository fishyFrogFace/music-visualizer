let song;
let fft;
let started = false;
const numBars = 60;

const removeZeros = (arr) => arr.filter(index => index !== 0);

const range = (size, startAt = 0) => [...Array(size).keys()].map(i => i + startAt)

function preload() {
    song = loadSound('swing.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT(0.8, 1024);

    textAlign(CENTER, CENTER);
    textSize(90);
    background(16, 126, 125);
    fill(255);
    stroke(16, 126, 125)
    text('Click to start/stop', width / 2, height / 2);
}

function draw() {
    if (!started) return;

    background(16, 126, 125);
    stroke(255, 255, 255);
    fill(227, 181, 5);
    translate(width / 2, height / 2);

    const spectrum = fft.analyze();
    const binsPerBar = floor(spectrum.length / numBars);
    const anglePerBar = 360 / numBars; // each bar covers this angle
    const threshold = 0;  // set to ignore low amplitudes

    range(numBars - 1).forEach((bar) => {
        const startIdx = bar * binsPerBar;
        const endIdx = startIdx + binsPerBar;

        // average the amplitude over the bins for this bar
        const ampSum = range(endIdx - startIdx + 1, startIdx)
            .map((frequencyIndex) => spectrum[frequencyIndex])
            .reduce((ampSum, currentValue) => ampSum + currentValue, 0);

        const amp = ampSum / binsPerBar;

        if (amp > threshold) {
            const r1 = 0; // start from the center (radius = 0)
            const r2 = map(amp, 0, 256, 50, 400);  // extend the bars outward
            const angle = bar * anglePerBar;  // start angle for this bar

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
    })
}

// make this check if playing and pause if it is, or play if it isn't
function mousePressed() {
    if (!started) {
        song.play();
        started = true;
    } else {
        song.pause();
        started = false;
    }
}
