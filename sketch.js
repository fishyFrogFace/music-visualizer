let song;
let fft;
let started = false;
let smoothing = 0.8; // Adjust this value for more or less smoothing
let bins = 360; // Number of frequency bands to analyze

function preload() {
    song = loadSound('swing.mp3'); // Replace with your actual file path
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT(smoothing, bins); // FFT with smoothing and number of bins

    // Display a message prompting the user to start the audio
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text('Click to start', width / 2, height / 2);
}

function draw() {
    if (!started) return; // Wait until the user has interacted

    background(0);
    stroke(255);
    noFill();
    translate(width / 2, height / 2);

    let spectrum = fft.analyze();
    beginShape();
    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        // Adjust the mapping to reduce the impact of large spikes
        let r = map(amp, 0, 256, 20, 150);
        let x = r * cos(i);
        let y = r * sin(i);
        vertex(x, y);
    }
    endShape(CLOSE);
}

function mousePressed() {
    if (!started) {
        song.play();
        started = true;
    }
}
