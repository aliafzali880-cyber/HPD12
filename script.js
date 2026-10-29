/* =========================================================
   تنظیمات قابل تغییر
   ========================================================= */
const CONFIG = {
  // رنگ‌های کانفتی و بادکنک
  colors: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff7eb6", "#ffffff"],
  balloonCount: 9,          // تعداد بادکنک‌ها
  sparkleCount: 55,         // تعداد ذرات درخشان
  confettiOnLoad: 120,      // تعداد کانفتی موقع لود
  confettiOnClick: 160      // تعداد کانفتی با کلیک
};

/* ابزار: عدد تصادفی بین دو مقدار */
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* =========================================================
   کانفتی (ساخت دستی با canvas)
   ========================================================= */
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ساخت یک بارش کانفتی از بالای صفحه */
function launchConfetti(count = CONFIG.confettiOnClick) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: rand(0, window.innerWidth),
      y: rand(-window.innerHeight * 0.4, -10),
      w: rand(6, 11),
      h: rand(8, 16),
      color: pick(CONFIG.colors),
      vx: rand(-1.5, 1.5),
      vy: rand(2, 5),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      swing: rand(0, Math.PI * 2)
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(confettiLoop);
  }
}

function confettiLoop() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  confettiCtx.clearRect(0, 0, w, h);

  confettiPieces.forEach((p) => {
    p.swing += 0.05;
    p.x += p.vx + Math.sin(p.swing) * 0.8;
    p.y += p.vy;
    p.rot += p.vr;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });

  // حذف ذراتی که از صفحه خارج شدن
  confettiPieces = confettiPieces.filter((p) => p.y < h + 30);

  if (confettiPieces.length > 0) {
    requestAnimationFrame(confettiLoop);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, w, h);
  }
}

/* =========================================================
   بادکنک‌های شناور
   ========================================================= */
function createBalloons() {
  const container = document.getElementById("balloons");
  for (let i = 0; i < CONFIG.balloonCount; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.setProperty("--color", pick(CONFIG.colors.slice(0, 6)));
    balloon.style.setProperty("--size", `${rand(40, 75)}px`);
    balloon.style.setProperty("--duration", `${rand(16, 30)}s`);
    balloon.style.setProperty("--delay", `${rand(-20, 0)}s`); // تأخیر منفی: از ابتدا پخش شده‌ن
    balloon.style.left = `${rand(2, 95)}%`;
    container.appendChild(balloon);
  }
}

/* =========================================================
   ذرات درخشان پس‌زمینه
   ========================================================= */
const sparkleCanvas = document.getElementById("sparkle-canvas");
const sparkleCtx = sparkleCanvas.getContext("2d");
let sparkles = [];

function createSparkles() {
  sparkles = [];
  for (let i = 0; i < CONFIG.sparkleCount; i++) {
    sparkles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.8, 2.6),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.3, -0.05),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.01, 0.04)
    });
  }
}

function sparkleLoop() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  sparkleCtx.clearRect(0, 0, w, h);

  sparkles.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.phase += s.speed;

    // برگشت از پایین وقتی از بالا خارج شد
    if (s.y < -5) { s.y = h + 5; s.x = rand(0, w); }
    if (s.x < -5) s.x = w + 5;
    if (s.x > w + 5) s.x = -5;

    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase)); // چشمک‌زدن
    sparkleCtx.beginPath();
    sparkleCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sparkleCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    sparkleCtx.shadowColor = "rgba(255, 255, 255, 0.9)";
    sparkleCtx.shadowBlur = 8;
    sparkleCtx.fill();
  });

  requestAnimationFrame(sparkleLoop);
}

/* =========================================================
   پیام سورپرایز
   ========================================================= */
const surprise = document.getElementById("surprise");

function openSurprise() {
  surprise.classList.add("is-open");
  surprise.setAttribute("aria-hidden", "false");
  launchConfetti(CONFIG.confettiOnClick);
}

function closeSurprise() {
  surprise.classList.remove("is-open");
  surprise.setAttribute("aria-hidden", "true");
}

/* =========================================================
   موسیقی پس‌زمینه
   ========================================================= */
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");

function toggleMusic() {
  if (music.paused) {
    // مرورگرها ممکنه پخش رو رد کنن (یا فایل پیدا نشه)
    music.play().then(() => {
      musicBtn.textContent = "⏸️ توقف موسیقی";
      musicBtn.setAttribute("aria-pressed", "true");
    }).catch(() => {
      alert("فایل موسیقی پیدا نشد یا مرورگر اجازه پخش نداد.");
    });
  } else {
    music.pause();
    musicBtn.textContent = "🎵 پخش موسیقی";
    musicBtn.setAttribute("aria-pressed", "false");
  }
}

/* =========================================================
   راه‌اندازی و رویدادها
   ========================================================= */
function init() {
  resizeCanvas(confettiCanvas);
  resizeCanvas(sparkleCanvas);
  createSparkles();
  createBalloons();
  sparkleLoop();

  // کانفتی خودکار موقع لود
  setTimeout(() => launchConfetti(CONFIG.confettiOnLoad), 400);

  document.getElementById("confetti-btn").addEventListener("click", () => launchConfetti(CONFIG.confettiOnClick));
  document.getElementById("surprise-btn").addEventListener("click", openSurprise);
  document.getElementById("surprise-close").addEventListener("click", closeSurprise);
  musicBtn.addEventListener("click", toggleMusic);

  // بستن پیام با کلیک روی پس‌زمینه یا کلید Esc
  surprise.addEventListener("click", (e) => { if (e.target === surprise) closeSurprise(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSurprise(); });

  window.addEventListener("resize", () => {
    resizeCanvas(confettiCanvas);
    resizeCanvas(sparkleCanvas);
    createSparkles();
  });
}

init();
