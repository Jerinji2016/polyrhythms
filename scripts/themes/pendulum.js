import { BaseTheme } from "./base.js";

export class Pendulum extends BaseTheme {
    constructor(pen, paper, currentTime, elapsedTime) {
        super(pen, paper, currentTime, elapsedTime);

        this.start = {
            x: this.paper.width * 0.25,
            y: this.paper.width *0.2,
        }

        this.end = {
            x: this.paper.width * 0.75,
            y: this.paper.width *0.2,
        }
    }
}