const paper = document.getElementById("paper");
const pen = paper.getContext("2d");

const startTime = new Date().getTime();

let start, end, center;
let length;

const settings = {
    resetDuration: 600,
    maxLoops: 50,
    volume: 0.15,
    isSoundEnabled: false,
    isAmbientNoiseEnabled: false
}

const toggles = {
    sound: document.querySelector("#sound-toggle"),
    ambientNoise: document.querySelector("#ambient-noise-toggle"),
}

const colors = Array(21).fill("#A6C48A");

const calculateNextImpactTime = (currentImpactTime, velocity) => {
    return currentImpactTime + (Math.PI / velocity) * 1000;
}

document.onvisibilitychange = () => {
    handleSound(false);
    handleRain(false);
}

paper.onclick = () => handleSound();

const handleSound = (enabled = !settings.isSoundEnabled) => {
    settings.isSoundEnabled = enabled;
    toggles.sound.dataset.toggled = enabled;

    handleRain(enabled);
}

const rainAudio = new Audio("ambience/soft_rain.mp3");

const handleRain = (enabled = !settings.isAmbientNoiseEnabled) => {
    settings.isAmbientNoiseEnabled = enabled;
    toggles.ambientNoise.dataset.toggled = enabled;

    if (enabled) {
        rainAudio.volume = 0.5;
        rainAudio.play();
    } else {
        rainAudio.pause();
    }
}

const arcs = colors.map((color, index) => {
    const oneFullLoop = 2 * Math.PI;
    const velocity = oneFullLoop * (settings.maxLoops - index) / settings.resetDuration;
    const lastImpactTime = 0;
    const nextImpactTime = calculateNextImpactTime(startTime, velocity)
    return { color, velocity, lastImpactTime, nextImpactTime }
});

const getAudio = (index) => {
    const audio = new Audio(`notes/vibraphone-key-${index}.wav`)
    audio.volume = settings.volume;
    return audio;
}

const determineOpacity = (currentTime, lastImpactTime, duration, minOpacity, maxOpacity) => {
    const ttl = currentTime - lastImpactTime;
    if (!settings.isSoundEnabled || ttl > duration)
        return minOpacity;

    const opacity = ttl / duration;
    const alpha = maxOpacity - (maxOpacity - minOpacity) * opacity
    return Math.max(alpha, minOpacity)
}

const drawBaseLine = () => {
    pen.strokeStyle = "white";
    pen.lineWidth = 2;

    pen.beginPath();
    pen.moveTo(start.x, start.y);
    pen.lineTo(end.x, end.y);
    pen.stroke();
}

const drawArc = (radius, color) => {
    pen.beginPath();
    pen.strokeStyle = color;
    pen.arc(center.x, center.y, radius, Math.PI, 2 * Math.PI);
    pen.stroke();
}

const drawPoint = (radius, elapsedTime, arc) => {
    const distance = Math.PI + (elapsedTime * arc.velocity);
    const maxDistance = 2 * Math.PI;
    const modDistance = distance % maxDistance;
    const actualDistance = modDistance > Math.PI ? distance : maxDistance - distance;

    const x = center.x + radius * Math.cos(actualDistance);
    const y = center.y + radius * Math.sin(actualDistance);

    pen.beginPath();
    pen.fillStyle = arc.color;
    pen.arc(x, y, length * 0.0065, 0, 2 * Math.PI);
    pen.fill();
}

const draw = () => {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;

    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;

    start = {
        x: paper.width * 0.1,
        y: paper.height * 0.9,
    };

    end = {
        x: paper.width * 0.9,
        y: paper.height * 0.9,
    };

    length = end.x - start.x;

    center = {
        x: paper.width * 0.5,
        y: paper.height * 0.9
    };

    drawBaseLine();

    const initialArcRadius = length * 0.05;

    const spacing = (length / 2 - initialArcRadius) / arcs.length;
    arcs.forEach((arc, index) => {
        const radius = initialArcRadius + index * spacing;

        // pen.globalAlpha = 0.2;
        pen.globalAlpha = determineOpacity(currentTime, arc.lastImpactTime, 1000, 0.2, 0.8);

        drawArc(radius, arc.color);
        drawPoint(radius, elapsedTime, arc);

        const nextImpactTime = arc.nextImpactTime;

        if (currentTime >= nextImpactTime) {
            if (settings.isSoundEnabled) {
                getAudio(index).play();
            }

            arc.lastImpactTime = nextImpactTime;
            arc.nextImpactTime = calculateNextImpactTime(nextImpactTime, arc.velocity);
        }
    });

    requestAnimationFrame(draw);
}

draw();