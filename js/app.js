const blinkFrames = [
  { src: "assets/blink8/nova_blink8_frame_1.png", delay: 150, label: "Open" },
  { src: "assets/blink8/nova_blink8_frame_2.png", delay: 170, label: "Squint 1" },
  { src: "assets/blink8/nova_blink8_frame_3.png", delay: 185, label: "Squint 2" },
  { src: "assets/blink8/nova_blink8_frame_4.png", delay: 200, label: "Almost Closed" },
  { src: "assets/blink8/nova_blink8_frame_5.png", delay: 220, label: "Closed" },
  { src: "assets/blink8/nova_blink8_frame_6.png", delay: 190, label: "Reopen 1" },
  { src: "assets/blink8/nova_blink8_frame_7.png", delay: 170, label: "Reopen 2" },
  { src: "assets/blink8/nova_blink8_frame_8.png", delay: 150, label: "Open End" }
];

const nova = document.getElementById("novaBlink");
const stateText = document.getElementById("stateText");
const autoText = document.getElementById("autoText");
const blinkNowBtn = document.getElementById("blinkNowBtn");
const toggleAutoBtn = document.getElementById("toggleAutoBtn");

let autoBlinkTimer = null;
let autoEnabled = true;
let isPlaying = false;

function setIdle() {
  nova.src = blinkFrames[0].src;
  stateText.textContent = "Idle";
}

function playBlinkOnce() {
  if (isPlaying) return;
  isPlaying = true;
  let i = 0;

  function nextFrame() {
    nova.src = blinkFrames[i].src;
    stateText.textContent = blinkFrames[i].label;
    const delay = blinkFrames[i].delay;
    i += 1;

    if (i < blinkFrames.length) {
      setTimeout(nextFrame, delay);
    } else {
      nova.src = blinkFrames[0].src;
      stateText.textContent = "Idle";
      isPlaying = false;
      if (autoEnabled) scheduleNextAutoBlink();
    }
  }

  nextFrame();
}

function scheduleNextAutoBlink() {
  clearTimeout(autoBlinkTimer);
  const nextDelay = 5000 + Math.floor(Math.random() * 2200);
  autoBlinkTimer = setTimeout(() => {
    playBlinkOnce();
  }, nextDelay);
  autoText.textContent = "Soft 5.0–7.2s";
}

function startAutoBlink() {
  autoEnabled = true;
  toggleAutoBtn.textContent = "Pause Auto Blink";
  scheduleNextAutoBlink();
}

function stopAutoBlink() {
  clearTimeout(autoBlinkTimer);
  autoBlinkTimer = null;
  autoEnabled = false;
  autoText.textContent = "Paused";
  toggleAutoBtn.textContent = "Resume Auto Blink";
}

blinkNowBtn.addEventListener("click", () => {
  if (autoEnabled) clearTimeout(autoBlinkTimer);
  playBlinkOnce();
});

toggleAutoBtn.addEventListener("click", () => {
  if (autoEnabled) {
    stopAutoBlink();
  } else {
    startAutoBlink();
  }
});

setIdle();
startAutoBlink();
