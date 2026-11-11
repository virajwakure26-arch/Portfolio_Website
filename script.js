const $ = s => document.querySelector(s);
const root = document.documentElement;

// Theme (dark / light)
const themeBtn = $('#themeBtn');
function setTheme(t) {
  root.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved || 'dark');
themeBtn.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

// Mobile menu
const links = $('#links'), menuBtn = $('#menuBtn');
menuBtn.onclick = () => menuBtn.setAttribute('aria-expanded', links.classList.toggle('open'));
links.onclick = e => { if (e.target.tagName === 'A') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } };

// Active section highlight
const navLinks = [...links.querySelectorAll('a')];
const spy = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => spy.observe($(a.getAttribute('href'))));

// Scroll progress bar + back-to-top button
addEventListener('scroll', () => {
  const h = root.scrollHeight - innerHeight;
  $('#progress').style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  $('#top').classList.toggle('show', scrollY > 600);
}, { passive: true });
$('#top').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// Typing effect
const roles = ['B.Tech CSE student', 'Java and Python learner', 'web developer in the making', 'cricket lover'];
const typed = $('#typed');
let r = 0, c = 0, del = false;
(function tick() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
  if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
  c += del ? -1 : 1;
  setTimeout(tick, del ? 40 : 85);
})();

// Skill bars + counting percentages
const bars = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, goal = +el.dataset.level, label = el.querySelector('b');
  el.querySelector('i').style.width = goal + '%';
  let n = 0;
  const t = setInterval(() => { n += 1; label.textContent = n + '%'; if (n >= goal) clearInterval(t); }, 1100 / goal);
  bars.unobserve(el);
}), { threshold: 0.4 });
document.querySelectorAll('.skill').forEach(s => bars.observe(s));

// Project details popup
const modal = $('#modal');
document.querySelectorAll('.project .btn').forEach(b => b.onclick = () => {
  $('#mTitle').textContent = b.dataset.title;
  $('#mDesc').textContent = b.dataset.desc;
  $('#mTech').textContent = b.dataset.tech;
  $('#mLink').href = b.dataset.link;
  modal.showModal();
});
$('#mClose').onclick = () => modal.close();
modal.onclick = e => { if (e.target === modal) modal.close(); };

// Contact form validation
const form = $('#form'), ok = $('#ok');
function check(id, test, msg) {
  const el = $('#' + id), bad = !test(el.value.trim());
  $('#' + id + 'Err').textContent = bad ? msg : '';
  el.classList.toggle('invalid', bad);
  return !bad;
}
form.onsubmit = e => {
  e.preventDefault(); ok.textContent = '';
  const a = check('name', v => v.length >= 2, 'Enter your name (at least 2 characters).');
  const b = check('email', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Enter a valid email, like name@example.com.');
  const m = check('msg', v => v.length >= 10, 'Write a message of at least 10 characters.');
  if (a && b && m) { ok.textContent = 'Message sent. Thank you for reaching out!'; form.reset(); }
};

// Hero background: drifting connected dots
const cv = $('#bg'), ctx = cv.getContext('2d');
let W, H, pts = [];
function size() {
  W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
  pts = Array.from({ length: Math.min(70, Math.floor(W / 18)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5 }));
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  const col = getComputedStyle(root).getPropertyValue('--b').trim();
  ctx.fillStyle = col; ctx.strokeStyle = col;
  pts.forEach((p, i) => {
    p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
    ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill();
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
      if (d < 120) { ctx.globalAlpha = (1 - d / 120) * .25; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
  });
  requestAnimationFrame(draw);
}
size(); addEventListener('resize', size);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
