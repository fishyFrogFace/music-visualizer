let song;
let fft;
let started = false;

function preload() {
    song = loadSound('swing.mp3');  // Replace with your audio file path
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    fft = new p5.FFT();

    // Show a message to click to start the audio
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text('Click to start', width / 2, height / 2);
}

function draw() {
    if (!started) return;

    background(0);
    stroke(255);
    noFill();
    translate(width / 2, height / 2);

    let spectrum = fft.analyze();
    console.log(spectrum.length)
    beginShape();
    for (let i = 0; i < 360; i++) {
        let amp = spectrum[i];
        let r = map(amp, 0, 256, 20, 200);
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
    } else {
        song.stop()
        started = false
    }
}
