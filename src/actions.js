class ActionManager {
  constructor(petElement, bubbleElement, audioManager) {
    this.pet = petElement;
    this.bubble = bubbleElement;
    this.audio = audioManager;
    this.isActing = false;
    this.speechTexts = [
      "Hi!", "Don't poke me!", ":3", "Wheee~",
      "Zzz...", "*purrs*", "Play with me!", "( ╹▽╹ )"
    ];
    this.triggerJump = null;
  }
  setJumpCallback(cb) {
    this.triggerJump = cb;
  }
  triggerRandomAction() {
    if (this.isActing) return;
    this.isActing = true;
    this.audio.play('tap');
    const r = Math.random();
    if (r < 0.2) {
      this.playAnimation('wiggle', 600);
    } else if (r < 0.4) {
      this.playAnimation('spin', 600);
    } else if (r < 0.6) {
      this.playAnimation('color-flash', 800);
    } else if (r < 0.8) {
      this.playAnimation('pulse', 500);
    } else if (r < 0.9) {
      if (this.triggerJump) this.triggerJump();
      this.isActing = false;
    } else {
      this.showSpeechBubble();
    }
  }
  playAnimation(className, duration) {
    this.pet.classList.add(className);
    setTimeout(() => {
      this.pet.classList.remove(className);
      this.isActing = false;
    }, duration);
  }
  showSpeechBubble(customText = null, duration = 2000) {
    this.bubble.textContent = customText || this.speechTexts[Math.floor(Math.random() * this.speechTexts.length)];
    this.bubble.style.left = '';
    this.bubble.style.top = '';
    this.bubble.classList.add('show');
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.bubble.classList.remove('show');
      this.isActing = false;
    }, duration);
  }
}
window.ActionManager = ActionManager;
