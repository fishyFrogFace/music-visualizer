let song;
let fft;
let started = false;
let numBars = 60;  // Set the desired number of bars

const removeZeros = (arr) => arr.filter(index => index !== 0);

function preload() {
    song = loadSound('swing.mp3');  // Replace with your audio file path
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT(0.8, 1024);  // Keep a high number of FFT bins for more detail

    // Show a message prompting the user to start the audio
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text('Click to start/stop', width / 2, height / 2);
}

function draw() {
    if (!started) return;

    background(16, 126, 125);
    stroke(255, 255, 255);
    fill(227, 181, 5);
    translate(width / 2, height / 2);

    let spectrum = removeZeros(fft.analyze());
    let binsPerBar = floor(spectrum.length / numBars);  // Number of bins per bar
    let anglePerBar = 360 / numBars;  // Each bar covers this angle
    let threshold = 0;  // Set a threshold value to ignore low amplitudes

    for (let i = 0; i < numBars; i++) {
        let startIdx = i * binsPerBar;
        let endIdx = startIdx + binsPerBar;

        // Average the amplitude over the bins for this bar
        let ampSum = 0;
        for (let j = startIdx; j < endIdx; j++) {
            ampSum += spectrum[j];
        }
        let amp = ampSum / binsPerBar;

        if (amp > threshold) {  // Only draw if amplitude exceeds the threshold
            let r1 = 0;  // Start from the center (radius = 0)
            let r2 = map(amp, 0, 256, 50, 400);  // Extend the bars outward
            let angle = i * anglePerBar;  // Start angle for this bar

            // Calculate the corners of the bar
            let x1 = r1 * cos(angle - anglePerBar / 2);
            let y1 = r1 * sin(angle - anglePerBar / 2);
            let x2 = r2 * cos(angle - anglePerBar / 2);
            let y2 = r2 * sin(angle - anglePerBar / 2);

            let x3 = r2 * cos(angle + anglePerBar / 2);
            let y3 = r2 * sin(angle + anglePerBar / 2);
            let x4 = r1 * cos(angle + anglePerBar / 2);
            let y4 = r1 * sin(angle + anglePerBar / 2);

            beginShape();
            vertex(x1, y1);
            vertex(x2, y2);
            vertex(x3, y3);
            vertex(x4, y4);
            endShape(CLOSE);
        }
    }
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
