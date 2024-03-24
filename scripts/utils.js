import { settings } from "./script.js";

export const getAudio = (index) => {
    const audio = new Audio(`assets/audio/vibraphone/vibraphone-key-${index}.wav`)
    audio.volume = settings.volume;
    return audio;
}

export const calculateNextImpactTime = (currentImpactTime, distance, velocity) => {
    return currentImpactTime + (distance / velocity) * 1000;
}