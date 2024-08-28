let song;
let fft;
let started = false;

const removeZeros = (arr) => arr.filter(index => index !== 0)

function preload() {
    song = loadSound('swing.mp3');  // Replace with your audio file path
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT(0.8, 1024); // Use 512 bins, a power of two

    // Show a message prompting the user to start the audio
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text('Click to start/stop', width / 2, height / 2);
}

function draw() {
    if (!started) return;

    background(0);
    stroke(255);
    noFill();
    translate(width / 2, height / 2);

    let spectrum = removeZeros(fft.analyze());
    console.log(spectrum)
    console.log(spectrum.filter(i => i === 0).length)
    let binsPerDegree = spectrum.length / 360; // Calculate how many bins per degree
    let threshold = 0; // Set a threshold value to ignore low amplitudes

    beginShape();
    for (let i = 0; i < 360; i++) {
        let binIndex = floor(i * binsPerDegree); // Find the corresponding bin
        let amp = spectrum[binIndex];

        if (amp > threshold) { // Only draw if amplitude exceeds the threshold
            let r = map(amp, 0, 256, 20, 200);
            let angle = i; // Use i directly as the angle in degrees
            let x = r * cos(angle);
            let y = r * sin(angle);
            vertex(x, y);
        }
    }
    endShape(CLOSE);
}

function mousePressed() {
    if (!started) {
        song.play();
        started = true;
    } else {
        song.stop()
        started = false
    }
}
