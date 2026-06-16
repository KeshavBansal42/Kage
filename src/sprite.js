class SpriteRenderer {
    constructor(element, frameWidth, animations) {
        this.element = element;
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.imageRendering = 'pixelated';
        this.frameWidth = frameWidth;
        this.animations = animations; 
        this.currentAnim = null;
        this.currentFrameIndex = 0;
        this.fps = 8;
        this.lastFrameTime = 0;
    }
    play(animName, fps = 8) {
        if (!this.animations[animName]) {
            console.warn(`Animation ${animName} not found!`);
            return;
        }
        if (this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.currentFrameIndex = 0;
            this.fps = fps;
            const animConfig = this.animations[animName];
            this.element.style.backgroundImage = `url('${animConfig.file}')`;
            this.element.style.backgroundSize = `${this.frameWidth * animConfig.frames}px ${this.frameWidth}px`;
            this.updateFrame();
        }
    }
    update(dt) {
        if (!this.currentAnim) return;
        this.lastFrameTime += dt;
        const frameDuration = 1 / this.fps;
        while (this.lastFrameTime >= frameDuration) {
            this.lastFrameTime -= frameDuration;
            const numFrames = this.animations[this.currentAnim].frames;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % numFrames;
            this.updateFrame();
        }
    }
    updateFrame() {
        const xOffset = -(this.currentFrameIndex * this.frameWidth);
        this.element.style.backgroundPosition = `${xOffset}px 0px`;
    }
}
