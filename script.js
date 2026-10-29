/* =========================================================
   تنظیمات سریع
   ========================================================= */
const CONFIG = {
  autoConfettiOnLoad: true,   // شلیک کاغذ رنگی هنگام باز شدن صفحه
  balloons: true,             // بادکنک‌های شناور
  balloonCount: 12,
  starCount: 70,
  mouseSparkles: true,        // جرقه دنبال ماوس
  typingSpeed: 45,            // میلی‌ثانیه برای هر حرف
};

/* =========================================================
   ستاره‌ها
   ========================================================= */
const starsBox = document.getElementById('stars');
for (let i = 0; i < CONFIG.starCount; i++) {
  const s = document.createElement('div');
  const size = Math.random() * 2.5 + 1;
  s.className = 'star';
  s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${size}px;height:${size}px;--d:${2 + Math.random() * 4}s;animation-delay:${Math.random() * 4}s`;
  starsBox.appendChild(s);
}

/* =========================================================
   کاغذ رنگی (Confetti)
   ========================================================= */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let W, H, pieces = [];
const COLORS = ['#ffd36b', '#ff7eb6', '#8fd0ff', '#ffffff', '#a58bff', '#6dffb3', '#ff9a5c'];

function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize);
resize();

function addPiece(x, y, vx, vy) {
  pieces.push({
    x, y, vx, vy,
    size: Math.random() * 8 + 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    shape: Math.random() < 0.3 ? 'circle' : 'rect',
    life: 0,
  });
}

function burst(x, y, count = 120) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 10 + 4;
    addPiece(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 4);
  }
}

function rain(duration = 3500) {
  const end = performance.now() + duration;
  (function drop() {
    for (let i = 0; i < 6; i++) addPiece(Math.random() * W, -20, (Math.random() - 0.5) * 3, Math.random() * 3 + 2);
    if (performance.now() < end) requestAnimationFrame(drop);
  })();
}

function celebrate() {
  burst(W * 0.2, H * 0.6, 100);
  burst(W * 0.8, H * 0.6, 100);
  setTimeout(() => burst(W * 0.5, H * 0.4, 160), 250);
  rain();
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  pieces = pieces.filter(p => p.y < H + 30 && p.life < 400);
  for (const p of pieces) {
    p.vy += 0.18;          // جاذبه
    p.vx *= 0.99;
    p.x += p.vx + Math.sin(p.life / 12) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;
    p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, (400 - p.life) / 80);
    if (p.shape === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    ctx.restore();
  }
  requestAnimationFrame(loop);
}
loop();

/* کلیک روی هر جای صفحه = انفجار کاغذ رنگی */
addEventListener('click', (e) => {
  if (e.target.closest('video, .btn')) return;
  burst(e.clientX, e.clientY, 50);
});

/* =========================================================
   بادکنک‌ها
   ========================================================= */
const balloonBox = document.getElementById('balloons');
let balloonsOn = CONFIG.balloons;
let balloonTimer = null;

function spawnBalloon() {
  const b = document.createElement('div');
  const w = 45 + Math.random() * 45;
  const c = COLORS[Math.floor(Math.random() * (COLORS.length - 1))];
  b.className = 'balloon';
  b.style.cssText = `left:${Math.random() * 95}%;--w:${w}px;--c:${c};--t:${11 + Math.random() * 9}s;--sx:${(Math.random() - 0.5) * 120}px`;
  b.addEventListener('click', (e) => {          // ترکوندن بادکنک
    e.stopPropagation();
    const r = b.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 40);
    b.remove();
  });
  b.addEventListener('animationend', () => b.remove());
  balloonBox.appendChild(b);
}

function startBalloons() {
  stopBalloons();
  for (let i = 0; i < 5; i++) setTimeout(spawnBalloon, i * 400);
  balloonTimer = setInterval(() => {
    if (balloonBox.children.length < CONFIG.balloonCount) spawnBalloon();
  }, 1400);
}
function stopBalloons() { clearInterval(balloonTimer); balloonTimer = null; }

const btnBalloons = document.getElementById('btnBalloons');
function syncBalloonBtn() { btnBalloons.classList.toggle('on', balloonsOn); }
btnBalloons.addEventListener('click', () => {
  balloonsOn = !balloonsOn;
  if (balloonsOn) startBalloons();
  else { stopBalloons(); balloonBox.innerHTML = ''; }
  syncBalloonBtn();
});
if (balloonsOn) startBalloons();
syncBalloonBtn();

/* =========================================================
   تایپ شدن متن
   ========================================================= */
const msg = document.getElementById('messageText');
const fullText = msg.textContent.trim();
let typeTimer = null;

function typeText() {
  clearTimeout(typeTimer);
  msg.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  msg.appendChild(cursor);
  let i = 0;
  (function step() {
    if (i < fullText.length) {
      cursor.before(document.createTextNode(fullText[i++]));
      msg.scrollTop = msg.scrollHeight;
      typeTimer = setTimeout(step, CONFIG.typingSpeed);
    } else {
      setTimeout(() => cursor.remove(), 1500);
    }
  })();
}

function initMessage() {
  if (msg.dataset.typewriter === 'true') {
    // وقتی باکس دیده شد شروع به تایپ کن
    msg.textContent = '';
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { typeText(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(msg);
  }
}
initMessage();
document.getElementById('btnType').addEventListener('click', () => {
  msg.textContent = fullText;
  typeText();
});

/* =========================================================
   ویدئو (نمایش پیام راهنما اگر فایل پیدا نشد)
   ========================================================= */
const video = document.getElementById('mainVideo');
const placeholder = document.getElementById('videoPlaceholder');
const source = video.querySelector('source');
function showPlaceholder() { placeholder.classList.add('show'); }
if (source) source.addEventListener('error', showPlaceholder);
video.addEventListener('error', showPlaceholder);
video.addEventListener('loadeddata', () => placeholder.classList.remove('show'));
// وقتی ویدئو پخش شد، یه مقدار کاغذ رنگی بزن
video.addEventListener('play', () => burst(W / 2, H / 2, 60), { once: true });

/* =========================================================
   موزیک
   ========================================================= */
const music = document.getElementById('bgMusic');
const btnMusic = document.getElementById('btnMusic');
let musicBroken = false;
music.addEventListener('error', () => { musicBroken = true; btnMusic.style.display = 'none'; });
btnMusic.addEventListener('click', () => {
  if (musicBroken) return;
  if (music.paused) { music.play().catch(() => {}); btnMusic.classList.add('on'); }
  else { music.pause(); btnMusic.classList.remove('on'); }
});
// موقع پخش ویدئو موزیک متوقف بشه که با هم قاطی نشن
video.addEventListener('play', () => { if (!music.paused) { music.pause(); btnMusic.classList.remove('on'); } });

/* =========================================================
   دکمه‌ها
   ========================================================= */
document.getElementById('btnConfetti').addEventListener('click', celebrate);
document.getElementById('btnFull').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

/* =========================================================
   حرکت سه‌بعدی باکس‌ها با ماوس (Tilt)
   ========================================================= */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (e.target.closest('video')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* =========================================================
   ظاهر شدن با اسکرول
   ========================================================= */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); revealObs.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
  revealObs.observe(el);
});

/* =========================================================
   جرقه‌های دنبال ماوس
   ========================================================= */
if (CONFIG.mouseSparkles && matchMedia('(pointer:fine)').matches) {
  let last = 0;
  addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - last < 45) return;
    last = now;
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    s.style.setProperty('--dx', (Math.random() - 0.5) * 50 + 'px');
    s.style.setProperty('--dy', Math.random() * 50 + 10 + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  });
}

/* =========================================================
   شروع
   ========================================================= */
if (CONFIG.autoConfettiOnLoad) setTimeout(celebrate, 600);
