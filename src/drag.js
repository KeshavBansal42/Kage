class DragManager {
  constructor(petElement, callbacks) {
    this.pet = petElement;
    this.isDragging = false;
    this.onDragStart = callbacks.onDragStart;
    this.onDragEnd = callbacks.onDragEnd;
    this.onShake = callbacks.onShake; 
    this.grabOffsetX = 0;
    this.grabOffsetY = 0;
    this.initialMouseX = 0;
    this.initialMouseY = 0;
    this.lastX = 0;
    this.lastDx = 0;
    this.shakeCount = 0;
    this.mouseHistory = [];
    this.pet.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  async handleMouseDown(e) {
    if (e.button !== 0) return;
    this.initialMouseX = e.clientX;
    this.initialMouseY = e.clientY;
    this.isDragging = true;
    this.pet.classList.add('grabbed');
    if (this.onDragStart) this.onDragStart();
    this.lastX = e.screenX;
    this.lastDx = 0;
    this.shakeCount = 0;
    const winPos = await window.kageAPI.getWindowPos();
    this.grabOffsetX = e.screenX - winPos.x;
    this.grabOffsetY = e.screenY - winPos.y;
    this.mouseHistory = [{ x: e.screenX, y: e.screenY, t: performance.now() }];
  }
  handleMouseMove(e) {
    if (!this.isDragging) return;
    const newX = e.screenX - this.grabOffsetX;
    const newY = e.screenY - this.grabOffsetY;
    window.kageAPI.setWindowPos(newX, newY);
    const dx = e.screenX - this.lastX;
    if (Math.abs(dx) > 15) { 
      if (Math.sign(dx) !== Math.sign(this.lastDx) && this.lastDx !== 0) {
        this.shakeCount++;
        if (this.shakeCount >= 6) { 
          if (this.onShake) this.onShake();
          this.shakeCount = 0;
        }
      }
      this.lastDx = dx;
      this.lastX = e.screenX;
    }
    this.mouseHistory.push({ x: e.screenX, y: e.screenY, t: performance.now() });
    if (this.mouseHistory.length > 5) this.mouseHistory.shift();
  }
  async handleMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.pet.classList.remove('grabbed');
    const dist = Math.hypot(e.clientX - this.initialMouseX, e.clientY - this.initialMouseY);
    const wasClick = dist < 5;
    const winPos = await window.kageAPI.getWindowPos();
    let throwVx = 0;
    let throwVy = 0;
    const now = performance.now();
    if (this.mouseHistory.length >= 2 && now - this.mouseHistory[this.mouseHistory.length - 1].t < 100) {
       const oldest = this.mouseHistory[0];
       const newest = this.mouseHistory[this.mouseHistory.length - 1];
       const dt = (newest.t - oldest.t) / 1000;
       if (dt > 0) {
          throwVx = (newest.x - oldest.x) / dt;
          throwVy = (newest.y - oldest.y) / dt;
       }
    }
    if (this.onDragEnd) this.onDragEnd(winPos, wasClick, throwVx, throwVy);
  }
}
window.DragManager = DragManager;
