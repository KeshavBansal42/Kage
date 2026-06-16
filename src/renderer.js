document.addEventListener('DOMContentLoaded', async () => {
  const pet = document.getElementById('pet');
  const bubble = document.getElementById('bubble');

  const audioManager = window.audioManager;
  const physics = new PhysicsEngine();
  const actions = new ActionManager(pet, bubble, audioManager);
  actions.setJumpCallback(() => physics.triggerJump());

  const bounds = await window.kageAPI.getScreenBounds();
  physics.updateScreenBounds(bounds);
  let currentWinPos = await window.kageAPI.getWindowPos();
  physics.setGroundY(currentWinPos.y);

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
    onDragEnd: (newWinPos, wasClick) => {
      currentWinPos = newWinPos;
      physics.setGroundY(newWinPos.y);
      physics.resume();

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
    const screenBounds = await window.kageAPI.getScreenBounds();
    physics.updateScreenBounds(screenBounds);
    const winPos = await window.kageAPI.getWindowPos();
    currentWinPos = winPos;
    physics.setGroundY(winPos.y);
  });

  let lastTimestamp = performance.now();
  let subPixelX = 0;
  let subPixelY = 0;

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
    }

    pet.style.transform = `rotate(${physics.rotation}deg)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
