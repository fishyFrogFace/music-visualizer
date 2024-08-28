let song;
let fft;
let started = false;

const removeZeros = (arr) => arr.filter(index => index !== 0);

function preload() {
    song = loadSound('swing.mp3');  // Replace with your audio file path
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT(0.8, 64);  // Reduce bins to 64 for thicker bars

    // Show a message prompting the user to start the audio
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text('Click to start/stop', width / 2, height / 2);
}

function draw() {
    if (!started) return;

    background(0);
    stroke(255, 0, 0);  // Set the border (stroke) color (red in this case)
    fill(0, 0, 255);  // Set the fill color (blue in this case)
    translate(width / 2, height / 2);

    let spectrum = removeZeros(fft.analyze());
    let numBars = spectrum.length;  // Number of bars equals the number of bins
    let anglePerBar = 360 / numBars;  // Each bar covers this angle
    let threshold = 0;  // Set a threshold value to ignore low amplitudes

    let barThickness = anglePerBar;  // Bar thickness matches the angle they cover

    for (let i = 0; i < numBars; i++) {
        let amp = spectrum[i];

        if (amp > threshold) {  // Only draw if amplitude exceeds the threshold
            let logAmp = log(amp + 1) / log(256 + 1);  // Normalized logarithmic amplitude
            let r1 = map(logAmp, 0, 1, 20, 200);  // Map to inner radius
            let r2 = r1 + 50;  // The outer radius defines the bar's length
            let angle = i * anglePerBar;  // Start angle for this bar

            // Calculate the corners of the bar
            let x1 = r1 * cos(angle - barThickness / 2);
            let y1 = r1 * sin(angle - barThickness / 2);
            let x2 = r2 * cos(angle - barThickness / 2);
            let y2 = r2 * sin(angle - barThickness / 2);

            let x3 = r2 * cos(angle + barThickness / 2);
            let y3 = r2 * sin(angle + barThickness / 2);
            let x4 = r1 * cos(angle + barThickness / 2);
            let y4 = r1 * sin(angle + barThickness / 2);

            beginShape();
            vertex(x1, y1);
            vertex(x2, y2);
            vertex(x3, y3);
            vertex(x4, y4);
            endShape(CLOSE);
        }
    }
}

function mousePressed() {
    if (!started) {
        song.play();
        started = true;
    } else {
        song.stop();
        started = false;
    }
}
