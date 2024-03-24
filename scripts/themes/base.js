export class BaseTheme {
    constructor(pen, paper, currentTime, elapsedTime) {
        this.pen = pen;
        this.paper = paper;
        this.currentTime = currentTime;
        this.elapsedTime = elapsedTime;
    }

    draw() {
        throw new Error('unimplemented error');
    }
}