import { pendulumArcs, settings } from "../script.js";
import { BaseTheme } from "./base.js";
import { calculateNextImpactTime, getAudio } from "../utils.js";

const MIN_OPACITY = 0.15;
const MAX_OPACITY = 0.9;
const OPACITY_DURATION = 1000;

export const MIN_ANGLE = Math.PI / 4;
export const MAX_ANGLE = 3 * MIN_ANGLE;

export class Pendulum extends BaseTheme {
    constructor(pen, paper, currentTime, elapsedTime) {
        super(pen, paper, currentTime, elapsedTime);

        const y = this.paper.height * 0.25;

        this.start = {
            x: this.paper.width * 0.2,
            y: y
        };

        this.end = {
            x: this.paper.width * 0.8,
            y: y
        };

        this.center = {
            x: this.paper.width / 2,
            y: y
        }

        this.maxVerticalSpace = (this.paper.height * 0.95) - y;
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
        this.pen.lineWidth = 6;
        this.pen.globalAlpha = 0.05;

        this.pen.beginPath();

        this.pen.moveTo(this.center.x - 100, this.center.y);
        this.pen.lineTo(this.center.x + 100, this.center.y);

        this.pen.stroke();

        this.pen.lineWidth = 2;
        this.pen.moveTo(this.center.x, this.center.y);
        this.pen.lineTo(this.center.x, this.paper.height * 0.97);

        this.pen.stroke();
    }

    drawThread(x, y, color) {
        this.pen.moveTo(this.center.x, this.center.y);
        this.pen.lineTo(x, y);
        this.pen.lineWidth = 1;

        this.pen.stroke();
    }

    drawPoint(index, radius, arc) {
        let distance = (Math.PI / 2) + this.elapsedTime * arc.velocity;
        distance = distance % Math.PI;

        if (distance > MAX_ANGLE) {
            distance = MAX_ANGLE - (distance % MAX_ANGLE);
        }

        if (distance < MIN_ANGLE) {
            distance = MIN_ANGLE + (MIN_ANGLE - distance);
        }

        const actualDistance = distance;

        radius += index * 1.3;

        const x = this.center.x + radius * Math.cos(actualDistance);
        const y = this.center.y + radius * Math.sin(actualDistance);

        const pointRadius = this.maxVerticalSpace * (0.008 + index * 0.0004);
        this.drawThread(x, y - pointRadius, arc.color)

        this.pen.beginPath();
        this.pen.fillStyle = arc.color;
        this.pen.arc(x, y, pointRadius, 0, 2 * Math.PI);
        this.pen.fill();
    }

    draw() {
        this.drawBaseLine();

        const initialArcRadius = this.maxVerticalSpace * 0.2;
        const spacing = (this.maxVerticalSpace - initialArcRadius) / pendulumArcs.length;

        pendulumArcs.forEach((arc, index) => {
            const radius = initialArcRadius + index * spacing;

            this.pen.globalAlpha = this.determineOpacity(arc.lastImpactTime);
            // this.pen.globalAlpha = 0.15;

            this.drawPoint(index, radius, arc);

            const nextImpactTime = arc.nextImpactTime;

            if (this.currentTime >= nextImpactTime) {
                if (settings.isSoundEnabled) {
                    getAudio(index).play();
                }

                arc.lastImpactTime = nextImpactTime;
                arc.nextImpactTime = calculateNextImpactTime(nextImpactTime, Math.PI / 2, arc.velocity);
            }
        });
    }
}