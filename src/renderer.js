document.addEventListener('DOMContentLoaded', async () => {
  const pet = document.getElementById('pet');
  const bubble = document.getElementById('bubble');

  const urlParams = new URLSearchParams(window.location.search);
  const entityType = urlParams.get('entity') || 'pet';

  const audioManager = window.audioManager;
  const physics = new PhysicsEngine();
  const actions = new ActionManager(pet, bubble, audioManager);
  if (entityType === 'pet') {
    actions.setJumpCallback(() => physics.triggerJump());
  }

  if (entityType === 'ball') {
    pet.classList.add('entity-ball');
  } else {
    pet.classList.add('entity-pet');
  }

  physics.entityType = entityType;
  physics.petWidth = 100;
  physics.petHeight = 100;

  const displays = await window.kageAPI.getAllDisplays();
  physics.updateDisplays(displays);

  let currentWinPos = await window.kageAPI.getWindowPos();

  window.kageAPI.onForceState((state) => {
    physics.state = state;
    if (state === 'sleeping') {
      physics.idleTime = 0;
      physics.stateTimer = 999999;
    }
  });

  window.kageAPI.onBallPosition((pos) => {
    physics.ballPos = pos;
  });

  if (entityType === 'ball') {
    window.kageAPI.onApplyForce((force) => {
      physics.resume(force.vx, force.vy);
    });
  }

  let dizzyCount = 0;
  let lastDizzyTime = 0;

  let redness = 0; 
  let lastClickTime = 0;

  setInterval(() => {
    if (redness > 0) {
      redness = Math.max(0, redness - 0.2);
      pet.style.setProperty('--pet-color', `color-mix(in srgb, #ff4757 ${redness}%, #40e0d0)`);
    }
  }, 100);

  pet.addEventListener('dblclick', () => {
    physics.forceRoam();
  });

  const dragManager = new DragManager(pet, {
    onDragStart: () => physics.pause(),
    onDragEnd: (newWinPos, wasClick, throwVx, throwVy) => {
      currentWinPos = newWinPos;
      
      const throwSpeed = Math.hypot(throwVx || 0, throwVy || 0);
      if (throwSpeed > 300) {
        
        physics.resume(throwVx, throwVy);
      } else {
        
        physics.setGroundY(newWinPos.y);
        physics.resume();
      }

      if (wasClick) {
        const now = Date.now();

        if (now - lastClickTime < 600) {

          redness += 3.5; 
          pet.style.setProperty('--pet-color', `color-mix(in srgb, #ff4757 ${redness}%, #40e0d0)`);

          if (redness >= 100) {
            redness = 100;
            actions.showSpeechBubble("I'm ded x_x", 3000);
            pet.classList.add('dead');
            physics.pause();
            setTimeout(() => window.kageAPI.quitApp(), 2500);
            return; 
          } else if (redness > 60) {

            if (Math.random() < 0.3) {
              const warningTexts = ["plz slow down!", "stop poking me!", "too much clicking!", "it hurts!"];
              actions.showSpeechBubble(warningTexts[Math.floor(Math.random() * warningTexts.length)], 1500);
            }
          } else {
            actions.triggerRandomAction();
          }
        } else {
          actions.triggerRandomAction();
        }
        lastClickTime = now;
      }
    },
    onShake: () => {
      const now = Date.now();

      if (now - lastDizzyTime > 30000) {
        dizzyCount = 0; 
      }

      dizzyCount++;
      lastDizzyTime = now;

      if (dizzyCount >= 3) {

        actions.showSpeechBubble("I'm ded x_x", 3000);
        pet.classList.add('dead');
        dragManager.isDragging = false; 
        pet.classList.remove('grabbed');
        physics.resume();

        setTimeout(() => {
          window.kageAPI.quitApp();
        }, 2500);
      } else {

        const dizzyTexts = ["I'm dizzy @_@", "Plz stop I'll puke", "Too fast!!"];
        const text = dizzyTexts[Math.floor(Math.random() * dizzyTexts.length)];
        actions.showSpeechBubble(text, 2000);
      }
    }
  });

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.kageAPI.showContextMenu();
  });

  window.kageAPI.onResetGround(async () => {
    const newDisplays = await window.kageAPI.getAllDisplays();
    physics.updateDisplays(newDisplays);
    const winPos = await window.kageAPI.getWindowPos();
    currentWinPos = winPos;
  });

  let lastTimestamp = performance.now();
  let subPixelX = 0;
  let subPixelY = 0;

  
  let previousState = '';

  function tick(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    if (!dragManager.isDragging) {
      const { dx, dy } = physics.update(dt, currentWinPos.x, currentWinPos.y);

      if (dx !== 0 || dy !== 0) {
        subPixelX += dx;
        subPixelY += dy;

        const moveX = Math.round(subPixelX);
        const moveY = Math.round(subPixelY);

        if (moveX !== 0 || moveY !== 0) {
          window.kageAPI.moveWindow(moveX, moveY);
          subPixelX -= moveX;
          subPixelY -= moveY;
          currentWinPos.x += moveX;
          currentWinPos.y += moveY;
        }
      }

      
      if (physics.state !== previousState) {
        if (previousState) pet.classList.remove(`state-${previousState}`);
        pet.classList.add(`state-${physics.state}`);
        previousState = physics.state;
      }
      
      
      if (entityType === 'pet') {
        if (physics.vx < 0 && !pet.classList.contains('facing-left')) {
          pet.classList.add('facing-left');
          pet.classList.remove('facing-right');
        } else if (physics.vx > 0 && !pet.classList.contains('facing-right')) {
          pet.classList.add('facing-right');
          pet.classList.remove('facing-left');
        }
      }
    }

      
      if (entityType === 'ball') {
         window.kageAPI.updateBallPosition(currentWinPos.x, currentWinPos.y);
      }

    
    pet.style.transform = `rotate(${physics.rotation}deg)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
