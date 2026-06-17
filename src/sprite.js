class SpriteRenderer {
    constructor(element, windowSize, animations) {
        this.element = element;
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.imageRendering = 'pixelated';
        this.windowSize = windowSize;
        this.animations = animations; 
        this.currentAnim = null;
        this.currentFrameIndex = 0;
        this.fps = 8;
        this.lastFrameTime = 0;
        
        this.scale = 6.0;
        this.stride = 32 * this.scale;
        this.offsetX = 7 * this.scale;
        this.offsetY = 32 * this.scale - this.windowSize;
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
            if (animConfig.sheetCols && animConfig.sheetRows) {
                this.element.style.backgroundSize = `${this.stride * animConfig.sheetCols}px ${this.stride * animConfig.sheetRows}px`;
            } else {
                this.element.style.backgroundSize = `${this.stride * animConfig.frames}px ${this.stride}px`;
            }
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
        const xOffset = -(this.currentFrameIndex * this.stride + this.offsetX);
        const animConfig = this.animations[this.currentAnim];
        const row = animConfig && animConfig.row !== undefined ? animConfig.row : 0;
        const yOffset = -(row * this.stride + this.offsetY);
        this.element.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
    }
}
