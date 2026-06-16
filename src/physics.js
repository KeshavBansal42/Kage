class PhysicsEngine {
  constructor() {
    this.gravity = 800;
    this.jumpVelocityMin = -400;
    this.jumpVelocityMax = -650;
    this.vx = 0;
    this.vy = 0;
    this.entityType = 'pet'; 
    this.petWidth = 60; 
    this.petHeight = 60; 
    this.displays = [];
    this.ballPos = null;
    this.lastBallPos = null;
    this.targetFloorY = null; 
    this.state = 'idle'; 
    this.stateTimer = 0;
    this.idleTime = 0;
    this.boredTimer = 0;
    this.wantsToPlay = false; 
    this.fallStartY = null;
    this.mustRoamAfterLanding = false; 
    this.wasThrown = false; 
    this.bounceCount = 0; 
    this.paused = false;
    this.rotation = 0;
  }
  updateDisplays(displays) {
    this.displays = displays;
  }
  setGroundY(y) {
    if (this.entityType === 'ball') {
       this.targetFloorY = null; 
    } else {
       this.targetFloorY = y + this.petHeight;
    }
  }
  clampFloorY(x, targetY) {
    for (const d of this.displays) {
      if (x >= d.x && x <= d.x + d.width) {
        return Math.max(d.y + 150, Math.min(targetY, d.y + d.height));
      }
    }
    return targetY;
  }
  pause() {
    this.paused = true;
    this.vx = 0;
    this.vy = 0;
  }
  resume(throwVx, throwVy) {
    this.paused = false;
    this.idleTime = 0;
    if (throwVx !== undefined && throwVy !== undefined && (throwVx !== 0 || throwVy !== 0)) {
      this.vx = Math.max(-1500, Math.min(1500, throwVx));
      this.vy = Math.max(-1500, Math.min(1500, throwVy));
      this.state = 'falling';
      this.targetFloorY = null; 
      this.wasThrown = true;
      this.bounceCount = 0;
    } else {
      if (this.state === 'sleeping') {
         this.state = 'idle';
         this.stateTimer = 2;
      }
    }
  }
  triggerJump(currentWinX, currentWinY) {
    if (this.entityType === 'ball' || this.state === 'sleeping') return;
    if (this.state !== 'jumping' && this.state !== 'falling' && this.state !== 'wall-jumping') {
      this.state = 'jumping';
      this.vy = this.jumpVelocityMin + Math.random() * (this.jumpVelocityMax - this.jumpVelocityMin);
      const horizSpeed = 80 + Math.random() * 120;
      this.vx = (this.vx !== 0) ? (this.vx > 0 ? horizSpeed : -horizSpeed) : (Math.random() > 0.5 ? horizSpeed : -horizSpeed);
      this.idleTime = 0;
      if (currentWinX !== undefined && currentWinY !== undefined) {
          const maxHeight = (this.vy * this.vy) / (2 * this.gravity);
          const shift = -(maxHeight * (0.6 + Math.random() * 0.3)); 
          const cx = currentWinX + this.petWidth / 2;
          const newFloor = (this.targetFloorY || (currentWinY + this.petHeight)) + shift;
          if (this.isInsideAnyDisplay(cx, newFloor)) {
            this.targetFloorY = this.clampFloorY(cx, newFloor);
          }
      }
    }
  }
  forceRoam() {
    this.state = 'roaming';
    const speed = 40 + Math.random() * 40;
    this.vx = Math.random() > 0.5 ? speed : -speed;
    this.stateTimer = 5 + Math.random() * 5; 
    this.idleTime = 0;
  }
  pickNewState() {
    if (this.entityType === 'ball') {
       this.state = 'idle';
       this.stateTimer = 99999;
       return;
    }
    if (this.targetFloorY !== null && Math.random() < 0.3) {
        this.targetFloorY = null;
        this.state = 'falling';
        return;
    }
    if (Math.random() < 0.15) {
      this.state = 'idle';
      this.vx = 0;
      this.stateTimer = 0.5 + Math.random() * 1.5; 
    } else {
      this.state = 'roaming';
      const speed = 20 + Math.random() * 30;
      this.vx = Math.random() > 0.5 ? speed : -speed;
      this.stateTimer = 4 + Math.random() * 6; 
    }
  }
  isInsideAnyDisplay(x, y) {
     for (const d of this.displays) {
        if (x >= d.x && x <= d.x + d.width && y >= d.y && y <= d.y + d.height) {
           return true;
        }
     }
     return false;
  }
  isCloseToWall(x, y) {
     const cx = x + this.petWidth / 2;
     const cy = y + this.petHeight / 2;
     for (const d of this.displays) {
        if (cx >= d.x && cx <= d.x + d.width && cy >= d.y && cy <= d.y + d.height) {
           const distLeft = cx - d.x;
           const distRight = (d.x + d.width) - cx;
           if (distLeft < 80 || distRight < 80) {
               return true;
           }
        }
     }
     return false;
  }
  getGroundYAt(x, y) {
    const cx = x + this.petWidth / 2;
    const petBottom = y + this.petHeight;
    let groundY = Infinity;
    for (const d of this.displays) {
       if (cx >= d.x && cx <= d.x + d.width) {
          const displayBottom = d.y + d.height;
          if (displayBottom >= petBottom - 30 && displayBottom < groundY) {
             groundY = displayBottom;
          }
       }
    }
    let virtualY = Infinity;
    if (this.targetFloorY !== null) {
        if (this.targetFloorY >= petBottom - 30) {
          virtualY = this.targetFloorY;
        }
    }
    const finalGround = Math.min(groundY, virtualY);
    if (finalGround === Infinity) return null;
    return finalGround - this.petHeight;
  }
  update(dt, currentWinX, currentWinY) {
    if (this.paused || this.displays.length === 0) return { dx: 0, dy: 0 };
    this.idleTime += dt;
    this.stateTimer -= dt;
    this.boredTimer -= dt;
    if (this.entityType === 'pet') {
      if (this.idleTime > 180 && this.state !== 'sleeping') {
          this.state = 'sleeping';
          this.vx = 0;
          this.stateTimer = 99999;
      }
      if (this.ballPos) {
          const bx = this.ballPos.x + 30;
          const by = this.ballPos.y + 30;
          const cx = currentWinX + this.petWidth / 2;
          const cy = currentWinY + this.petHeight / 2;
          const distToBall = Math.hypot(bx - cx, by - cy);
          if (this.lastBallPos) {
              const ballSpeed = Math.hypot(bx - this.lastBallPos.x, by - this.lastBallPos.y) / dt;
              if (ballSpeed > 500) {
                  this.boredTimer = 0;
                  this.wantsToPlay = true;
                  if (this.state === 'sleeping') {
                     this.state = 'idle';
                  }
                  if (this.state !== 'playing' && this.state !== 'chasing-ball') {
                     this.state = 'chasing-ball';
                     this.stateTimer = 8;
                  }
              }
          }
          this.lastBallPos = { x: bx, y: by };
          if (!this.wantsToPlay && this.boredTimer <= 0 && distToBall <= 80 && this.state !== 'sleeping') {
              this.wantsToPlay = true;
              this.state = 'playing';
              this.stateTimer = 30;
              this.bounceCount = 0;
          }
          if (this.state !== 'sleeping' && this.wantsToPlay) {
              if (this.state === 'chasing-ball') {
                  const horizontalDist = Math.abs(bx - cx);
                  let dir = Math.sign(bx - cx);
                  if (horizontalDist < 15) {
                      dir = Math.sign(this.vx) || 1; 
                  } else {
                      dir = dir || 1;
                  }
                  const verticalDiff = by - cy; 
                  this.vx = dir * (300 + Math.random() * 200);
                  if (this.vy === 0 && Math.random() < 0.1) {
                     this.state = 'jumping';
                     this.vy = this.jumpVelocityMin + Math.random() * (this.jumpVelocityMax - this.jumpVelocityMin);
                     this.vx = dir * (200 + Math.random() * 250);
                     if (verticalDiff < -50) {
                        const targetFloor = by + this.petHeight + Math.random() * 50;
                        const fcx = currentWinX + this.petWidth / 2;
                        if (this.isInsideAnyDisplay(fcx, targetFloor)) {
                           this.targetFloorY = this.clampFloorY(fcx, targetFloor);
                        }
                     }
                     if (verticalDiff > 50) {
                        this.targetFloorY = null;
                     }
                  }
                  if (distToBall <= 105) {
                     this.state = 'playing';
                     this.stateTimer = 30;
                     this.bounceCount = 0;
                  }
              }
              if (this.state === 'playing') {
                  const horizontalDist = Math.abs(bx - cx);
                  let dir = Math.sign(bx - cx);
                  if (horizontalDist < 15) {
                      dir = Math.sign(this.vx) || 1; 
                  } else {
                      dir = dir || 1;
                  }
                  this.vx = dir * (100 + Math.random() * 150);
                  if (this.vy === 0 && Math.random() < 0.04) {
                     this.state = 'jumping';
                     this.vy = this.jumpVelocityMin * 0.7;
                     this.vx = dir * (100 + Math.random() * 100);
                  }
                  if (distToBall <= 80) {
                      window.kageAPI.pushBall(dir * (400 + Math.random() * 400), -300 - Math.random() * 200);
                      this.vx = -dir * (100 + Math.random() * 200);
                  }
                  if (this.stateTimer <= 0) {
                      this.wantsToPlay = false;
                      this.boredTimer = 10; 
                      this.state = 'roaming';
                      this.stateTimer = 5;
                  }
              }
          }
      }
      if (this.stateTimer <= 0 && (this.state === 'idle' || this.state === 'roaming' || this.state === 'forced-roaming')) {
         this.pickNewState();
      }
      if ((this.state === 'idle' || this.state === 'roaming') && Math.random() < 0.015) {
         this.triggerJump(currentWinX, currentWinY);
      }
    } else {
      if (this.stateTimer <= 0) this.pickNewState();
    }
    if (this.state === 'sleeping') {
      this.vx = 0;
    }
    this.vy += this.gravity * dt;
    let dx = this.vx * dt;
    let dy = this.vy * dt;
    if (this.entityType === 'pet' && this.vy > 100 && (this.state === 'falling' || this.state === 'jumping' || this.state === 'wall-jumping')) {
       if (this.fallStartY === null) {
          this.fallStartY = currentWinY;
       }
       const fallDistance = currentWinY - this.fallStartY;
       if (fallDistance > 200 && this.state !== 'chasing-ball') {
          const catchProbability = Math.min(1, (fallDistance - 200) / 200); 
          if (Math.random() < catchProbability) {
             const cx = currentWinX + this.petWidth / 2;
             const hereFloor = currentWinY + this.petHeight;
             if (this.isInsideAnyDisplay(cx, hereFloor)) {
                this.targetFloorY = hereFloor;
                this.fallStartY = null;
                this.bounceCount = 0; 
                this.mustRoamAfterLanding = true; 
             }
          }
       }
    } else {
       this.fallStartY = null;
    }
    const nextCx = currentWinX + dx + this.petWidth / 2;
    const nextCy = currentWinY + this.petHeight / 2;
    const wasCloseToWall = this.isCloseToWall(currentWinX, currentWinY);
    const isCloseNow = this.isCloseToWall(currentWinX + dx, currentWinY + dy);
    if (isCloseNow) {
        if (!wasCloseToWall && this.state !== 'wall-jumping') {
            this.vy = this.jumpVelocityMin + Math.random() * (this.jumpVelocityMax - this.jumpVelocityMin);
            this.vx = Math.sign(this.vx || 1) * -(150 + Math.random() * 150);
            this.state = 'wall-jumping';
            const maxHeight = (this.vy * this.vy) / (2 * this.gravity);
            const shift = -(maxHeight * (0.6 + Math.random() * 0.3));
            const cx = currentWinX + this.petWidth / 2;
            const newFloor = currentWinY + this.petHeight + shift;
            if (this.isInsideAnyDisplay(cx, newFloor)) {
               this.targetFloorY = this.clampFloorY(cx, newFloor);
            }
        }
    }
    const isLeftInside = this.isInsideAnyDisplay(currentWinX + dx, nextCy);
    const isRightInside = this.isInsideAnyDisplay(currentWinX + dx + this.petWidth, nextCy);
    if (!isLeftInside || !isRightInside) {
       dx = 0;
       this.vx = -this.vx * (this.entityType === 'ball' ? 0.7 : 1); 
    }
    const isTopInside = this.isInsideAnyDisplay(currentWinX + dx + this.petWidth / 2, currentWinY + dy);
    if (!isTopInside && this.vy < 0) {
       dy = 0;
       this.vy = Math.abs(this.vy) * 0.5; 
    }
    const targetGroundY = this.getGroundYAt(currentWinX + dx, currentWinY + dy);
    if (targetGroundY !== null && currentWinY + dy >= targetGroundY && this.vy > 0) {
       dy = targetGroundY - currentWinY;
       if (this.entityType === 'ball' && this.bounceCount < 3) {
          this.bounceCount++;
          this.vy = -Math.abs(this.vy) * 0.5; 
          this.vx *= 0.7;
          return { dx, dy };
       }
       if (this.entityType === 'pet' && this.vy > 250 && this.bounceCount < 2 && this.state !== 'chasing-ball') {
          this.bounceCount++;
          this.vy = -Math.abs(this.vy) * 0.35; 
          this.vx *= 0.8;
          return { dx, dy };
       }
       this.vy = 0;
       const wasInteracting = (this.state === 'playing' || this.state === 'chasing-ball');
       const savedTimer = this.stateTimer;
       if (this.state === 'jumping' || this.state === 'falling' || this.state === 'wall-jumping') {
          if (this.mustRoamAfterLanding) {
             this.state = 'forced-roaming';
             const speed = 60 + Math.random() * 60;
             this.vx = Math.random() > 0.5 ? speed : -speed;
             this.stateTimer = 3 + Math.random() * 4; 
             this.mustRoamAfterLanding = false;
          } else {
             this.vx = 0;
             this.state = 'idle';
             this.stateTimer = 0.5 + Math.random() * 1;
          }
          if (!this.wasThrown && !wasInteracting && Math.random() < 0.5) {
             const randomShift = -(50 + Math.random() * 250);
             const newFloorY = currentWinY + dy + this.petHeight + randomShift;
             const cx = currentWinX + this.petWidth / 2;
             if (this.isInsideAnyDisplay(cx, newFloorY)) {
                this.targetFloorY = this.clampFloorY(cx, newFloorY);
             }
          } else if (this.wasThrown || wasInteracting) {
             this.targetFloorY = null;
          }
          this.wasThrown = false;
          this.bounceCount = 0;
       }
       if (wasInteracting && savedTimer > 0) {
          this.state = 'chasing-ball';
          this.stateTimer = savedTimer;
       }
    } else if (targetGroundY === null || currentWinY + dy < targetGroundY - 5) {
       if (this.state !== 'jumping' && this.state !== 'wall-jumping' && this.state !== 'playing' && this.state !== 'chasing-ball') {
          this.state = 'falling';
       }
    }
    let lowestDisplayY = -Infinity;
    for (const d of this.displays) {
       lowestDisplayY = Math.max(lowestDisplayY, d.y + d.height);
    }
    if (currentWinY > lowestDisplayY + 500) {
       const pd = this.displays[0];
       dx = pd.x + (pd.width / 2) - currentWinX;
       dy = pd.y + (pd.height / 2) - currentWinY;
       this.vx = 0;
       this.vy = 0;
       this.state = 'falling';
    }
    if (this.vx !== 0 && (this.state === 'roaming' || this.state === 'forced-roaming' || this.state === 'playing' || this.state === 'chasing-ball' || this.entityType === 'ball')) {
      const perimeter = 44 * 4; 
      this.rotation += (dx / perimeter) * 360;
    } else {
      const nearest90 = Math.round(this.rotation / 90) * 90;
      this.rotation += (nearest90 - this.rotation) * Math.min(1, dt * 8);
      if (Math.abs(this.rotation - nearest90) < 0.5) this.rotation = nearest90;
    }
    return { dx, dy };
  }
}
window.PhysicsEngine = PhysicsEngine;
