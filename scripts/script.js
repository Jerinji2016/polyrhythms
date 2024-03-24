import { FullCircle } from "./themes/full-circle.js";
import SemiCircle from "./themes/semi-circle.js";
import { calculateNextImpactTime } from "./utils.js";

const paper = document.getElementById("paper");
const pen = paper.getContext("2d");

export const startTime = new Date().getTime();

export const settings = {
    resetDuration: 600,
    maxLoops: 50,
    volume: 0.15,
    isSoundEnabled: false,
    isAmbientNoiseEnabled: false
}

const colors = Array(21).fill("#A6C48A");

export const arcs = colors.map((color, index) => {
    const oneFullLoop = 2 * Math.PI;
    const velocity = oneFullLoop * (settings.maxLoops - index) / settings.resetDuration;
    const lastImpactTime = 0;
    const nextImpactTime = calculateNextImpactTime(startTime, Math.PI, velocity)
    return { color, velocity, lastImpactTime, nextImpactTime }
});

const toggles = {
    sound: document.querySelector("#sound-toggle"),
    ambientNoise: document.querySelector("#ambient-noise-toggle"),
}

document.onvisibilitychange = () => {
    handleSound(false);
    rainAudio.pause();
}

paper.onclick = () => handleSound();

const handleSound = (enabled = !settings.isSoundEnabled) => {
    settings.isSoundEnabled = enabled;
    toggles.sound.dataset.toggled = enabled;

    if (settings.isAmbientNoiseEnabled)
        handleRain(true);
}

const rainAudio = new Audio("assets/audio/ambience/soft_rain.mp3");

const handleRain = (enabled = !settings.isAmbientNoiseEnabled) => {
    settings.isAmbientNoiseEnabled = enabled;
    toggles.ambientNoise.dataset.toggled = enabled;

    if (enabled && settings.isSoundEnabled) {
        rainAudio.volume = 0.5;
        rainAudio.play();
    } else {
        rainAudio.pause();
    }
}

toggles.sound.onclick = () => handleSound();

toggles.ambientNoise.onclick = () => handleRain();

const draw = () => {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;

    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;

    const theme = new FullCircle(pen, paper, currentTime, elapsedTime);
    // const theme = new SemiCircle(pen, paper, currentTime, elapsedTime);
    theme.draw();

    requestAnimationFrame(draw);
}

draw();