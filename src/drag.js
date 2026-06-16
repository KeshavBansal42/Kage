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
  }

  async handleMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.pet.classList.remove('grabbed');

    const dist = Math.hypot(e.clientX - this.initialMouseX, e.clientY - this.initialMouseY);
    const wasClick = dist < 5;

    const winPos = await window.kageAPI.getWindowPos();
    if (this.onDragEnd) this.onDragEnd(winPos, wasClick);
  }
}

window.DragManager = DragManager;
