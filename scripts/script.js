import { AMBIENCE_SOUNDS, DISPLAY_THEME } from "./constants.js";
import { FullCircle } from "./themes/full-circle.js";
import SemiCircle from "./themes/semi-circle.js";
import { calculateNextImpactTime, getAmbienceAudio, setAmbienceAudio } from "./utils.js";

const paper = document.getElementById("paper");
const pen = paper.getContext("2d");

export const startTime = new Date().getTime();

export const settings = {
    resetDuration: 600,
    maxLoops: 50,
    volume: 0.15,
    isSoundEnabled: false,
    isAmbientNoiseEnabled: false,
    displayTheme: DISPLAY_THEME.fullCircle,
    ambience: AMBIENCE_SOUNDS.softRain,
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
    customizations: document.querySelector("#customize-toggle"),
}

const selectors = {
    ambience: document.querySelector("#ambience"),
    displayTheme: document.querySelector("#display-theme"),
    keyNote: document.querySelector("#key-note"),
}

document.onvisibilitychange = () => {
    handleSound(false);
    getAmbienceAudio().pause();
}

paper.onclick = () => {
    const isCustomizationPanelOpen = toggles.customizations.dataset.toggled;
    if (isCustomizationPanelOpen == "true") {
        toggles.customizations.dataset.toggled = false;
        return;
    }

    handleSound();
}

const handleSound = (enabled = !settings.isSoundEnabled) => {
    settings.isSoundEnabled = enabled;
    toggles.sound.dataset.toggled = enabled;

    if (settings.isAmbientNoiseEnabled)
        handleAmbience(true);
}

const handleAmbience = (enabled = !settings.isAmbientNoiseEnabled) => {
    settings.isAmbientNoiseEnabled = enabled;
    toggles.ambientNoise.dataset.toggled = enabled;

    if (enabled && settings.isSoundEnabled) {
        getAmbienceAudio().play();
    } else {
        getAmbienceAudio().pause();
    }
}

const handleCustomization = () => {
    const isCustomizationPanelOpen = toggles.customizations.dataset.toggled == "true";
    toggles.customizations.dataset.toggled = !isCustomizationPanelOpen;
}

toggles.sound.onclick = () => handleSound();

toggles.ambientNoise.onclick = () => handleAmbience();

toggles.customizations.onclick = () => handleCustomization();

selectors.displayTheme.onchange = (event) => {
    settings.displayTheme = event.target.value;
}

selectors.ambience.onchange = (event) => {
    const value = event.target.value;

    settings.ambience = value;
    setAmbienceAudio(value);

    handleAmbience(settings.isAmbientNoiseEnabled);
}

const draw = () => {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;

    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;

    let theme;
    switch (settings.displayTheme) {
        case DISPLAY_THEME.fullCircle:
            theme = new FullCircle(pen, paper, currentTime, elapsedTime);
            break;
        case DISPLAY_THEME.semiCircle:
            theme = new SemiCircle(pen, paper, currentTime, elapsedTime);
            break;
        default:
            throw new Error("unimplemented theme");
    }
    theme.draw();

    requestAnimationFrame(draw);
}

draw();