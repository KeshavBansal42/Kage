class PhysicsEngine {
  constructor() {
    this.gravity = 600;
    this.jumpVelocityMin = -120;
    this.jumpVelocityMax = -220;
    this.vx = 0;
    this.vy = 0;
    this.screenWidth = 1920;
    this.screenHeight = 1080;
    this.petSize = 150; 
    this.groundY = 0;

    this.state = 'idle';
    this.stateTimer = 0;
    this.idleTime = 0;
    this.paused = false;
    this.rotation = 0;

    this.jumpShiftsGround = false;
    this.jumpTargetGroundY = 0;
  }

  updateScreenBounds(bounds) {
    this.screenWidth = bounds.width;
    this.screenHeight = bounds.height;
  }

  setGroundY(y) {
    this.groundY = Math.max(50, Math.min(y, this.screenHeight - this.petSize - 20));
  }

  pause() {
    this.paused = true;
    this.vx = 0;
    this.vy = 0;
  }

  resume() {
    this.paused = false;
    this.idleTime = 0;
  }

  triggerJump() {
    if (this.state !== 'jumping') {
      this.state = 'jumping';
      this.vy = this.jumpVelocityMin + Math.random() * (this.jumpVelocityMax - this.jumpVelocityMin);
      const horizSpeed = 30 + Math.random() * 50;
      this.vx = (this.vx !== 0) ? (this.vx > 0 ? horizSpeed : -horizSpeed) : (Math.random() > 0.5 ? horizSpeed : -horizSpeed);

      this.jumpShiftsGround = Math.random() < 0.3;
      if (this.jumpShiftsGround) {
        const shift = (Math.random() > 0.5 ? -1 : 1) * (30 + Math.random() * 90);
        this.jumpTargetGroundY = Math.max(100, Math.min(this.groundY + shift, this.screenHeight - this.petSize - 20));
      }
      this.idleTime = 0;
    }
  }

  update(dt, currentWinX, currentWinY) {
    if (this.paused) return { dx: 0, dy: 0 };

    this.idleTime += dt;
    this.stateTimer -= dt;

    if (this.stateTimer <= 0 && this.state !== 'jumping') this.pickNewState();
    if (this.idleTime > 45 + Math.random() * 45 && this.state !== 'jumping') this.triggerJump();

    if (this.state === 'jumping') {
      this.vy += this.gravity * dt;
    } else {
      this.vy = 0;
    }

    let dx = this.vx * dt;
    let dy = this.vy * dt;

    if (currentWinX + dx <= 0) {
      dx = -currentWinX;
      this.vx = Math.abs(this.vx);
    } else if (currentWinX + dx >= this.screenWidth - this.petSize) {
      dx = this.screenWidth - this.petSize - currentWinX;
      this.vx = -Math.abs(this.vx);
    }

    const landingY = this.jumpShiftsGround ? this.jumpTargetGroundY : this.groundY;
    if (this.state === 'jumping' && currentWinY + dy >= landingY && this.vy > 0) {
      if (this.jumpShiftsGround) {
        this.groundY = this.jumpTargetGroundY;
        this.jumpShiftsGround = false;
      }
      dy = this.groundY - currentWinY;
      this.vy = 0;
      this.vx = 0;
      this.state = 'idle';
      this.stateTimer = 0.5 + Math.random() * 1;
    } else if (this.state !== 'jumping') {
      dy = this.groundY - currentWinY;
    }

    if (this.vx !== 0 && this.state === 'roaming') {
      const perimeter = 44 * 4; 
      this.rotation += (dx / perimeter) * 360;
    } else {
      const nearest90 = Math.round(this.rotation / 90) * 90;
      this.rotation += (nearest90 - this.rotation) * Math.min(1, dt * 8);
      if (Math.abs(this.rotation - nearest90) < 0.5) this.rotation = nearest90;
    }

    return { dx, dy };
  }

  forceRoam() {
    this.state = 'roaming';

    const speed = 25 + Math.random() * 20;
    this.vx = Math.random() > 0.5 ? speed : -speed;
    this.stateTimer = 5 + Math.random() * 5; 
    this.idleTime = 0;
  }

  pickNewState() {
    if (Math.random() < 0.15) {

      this.state = 'idle';
      this.vx = 0;
      this.stateTimer = 0.5 + Math.random() * 1; 
    } else {

      this.state = 'roaming';
      const speed = 15 + Math.random() * 20;
      this.vx = Math.random() > 0.5 ? speed : -speed;
      this.stateTimer = 4 + Math.random() * 6; 
    }
  }
}

window.PhysicsEngine = PhysicsEngine;
