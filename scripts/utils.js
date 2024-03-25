import { settings } from "./script.js";

let ambienceAudio;

export const getAudio = (index) => {
    const audio = new Audio(`assets/audio/vibraphone/key-${index}.wav`)
    audio.volume = settings.volume;
    return audio;
}

export const calculateNextImpactTime = (currentImpactTime, distance, velocity) => {
    return currentImpactTime + (distance / velocity) * 1000;
}

export const getAmbienceAudio = () => {
    if (ambienceAudio)
        return ambienceAudio;

    ambienceAudio = new Audio(`assets/audio/ambience/${settings.ambience}.mp3`);
    ambienceAudio.volume = 0.5;
    return ambienceAudio;
}

export const setAmbienceAudio = (audio) => {
    if (ambienceAudio) {
        ambienceAudio.pause();
        ambienceAudio.currentTime = 0;
    }

    ambienceAudio = new Audio(`assets/audio/ambience/${audio}.mp3`);
    ambienceAudio.volume = 0.5;
}