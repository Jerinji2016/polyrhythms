import { BaseTheme } from "./base.js";
import { arcs, settings } from "../script.js";
import { calculateNextImpactTime, getAudio } from "../utils.js";

const MIN_OPACITY = 0.2;
const MAX_OPACITY = 0.6;
const OPACITY_DURATION = 1000;

export class FullCircle extends BaseTheme {
    constructor(pen, paper, currentTime, elapsedTime) {
        super(pen, paper, currentTime, elapsedTime);

        this.shortestSide = Math.min(this.paper.height, this.paper.width);
        this.maxArcsLength = this.shortestSide - this.shortestSide * 0.2;

        const y = this.paper.height * 0.6;

        this.start = {
            x: this.paper.width * 0.1,
            y: y,
        };

        this.end = {
            x: this.paper.width * 0.9,
            y: y,
        };

        this.length = this.end.x - this.start.x;

        this.center = {
            x: this.paper.width * 0.5,
            y: y
        };
    }

    determineOpacity(lastImpactTime) {
        const ttl = this.currentTime - lastImpactTime;
        if (!settings.isSoundEnabled || ttl > OPACITY_DURATION)
            return MIN_OPACITY;

        const opacity = ttl / OPACITY_DURATION;
        const alpha = MAX_OPACITY - (MAX_OPACITY - MIN_OPACITY) * opacity
        return Math.max(alpha, MIN_OPACITY)
    }

    drawBaseLine() {
        this.pen.strokeStyle = "white";
        this.pen.lineWidth = 2;
        this.pen.globalAlpha = 0.8;

        this.pen.beginPath();

        const sx = (this.paper.width / 2) - (this.maxArcsLength / 2);
        const ex = this.paper.width - sx;

        this.pen.moveTo(sx, this.start.y);
        this.pen.lineTo(ex, this.end.y);

        this.pen.stroke();
    }

    drawArc(radius, color) {
        this.pen.beginPath();
        this.pen.strokeStyle = color;
        this.pen.arc(this.center.x, this.center.y, radius, 0, 2 * Math.PI);
        this.pen.stroke();
    }

    drawPoint(radius, arc) {
        const distance = Math.PI + (this.elapsedTime * arc.velocity);
        const maxDistance = 2 * Math.PI;
        const actualDistance = distance % maxDistance;

        const x = this.center.x + radius * Math.cos(actualDistance);
        const y = this.center.y + radius * Math.sin(actualDistance);

        this.pen.beginPath();
        this.pen.fillStyle = arc.color;
        this.pen.arc(x, y, this.maxArcsLength * 0.008, 0, 2 * Math.PI);
        this.pen.fill();
    }

    draw() {
        this.drawBaseLine();

        const initialArcRadius = this.maxArcsLength * 0.05;
        const spacing = (this.maxArcsLength / 2 - initialArcRadius) / arcs.length;

        arcs.forEach((arc, index) => {
            const radius = initialArcRadius + index * spacing;

            this.pen.globalAlpha = this.determineOpacity(arc.lastImpactTime);

            this.drawArc(radius, arc.color);
            this.drawPoint(radius, arc);

            const nextImpactTime = arc.nextImpactTime;
            if (this.currentTime >= nextImpactTime) {
                if (settings.isSoundEnabled) {
                    getAudio(index).play();
                }

                arc.lastImpactTime = nextImpactTime;
                arc.nextImpactTime = calculateNextImpactTime(nextImpactTime, Math.PI, arc.velocity);
            }
        })
    }
}