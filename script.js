// ===== Data dinâmica (hoje) =====
(function setDates() {
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = meses[hoje.getMonth()];

  const pill = document.getElementById('today-date');
  if (pill) pill.textContent = `${dia} de ${mes}`;

  const banner = document.getElementById('banner-date');
  if (banner) banner.textContent = `${dia} DE ${mes.toUpperCase()}`;
})();

// ===== Carrossel genérico (auto + manual) =====
function makeCarousel({ carId, cardSel, gap, intervalMs, exposeFnName }) {
  const car = document.getElementById(carId);
  if (!car) return;

  const cards = car.querySelectorAll(cardSel);
  if (!cards.length) return;

  function step() {
    const card = car.querySelector(cardSel);
    return card.offsetWidth + (parseInt(getComputedStyle(car).gap) || gap);
  }

  let timer = null;
  let pausedUntil = 0;
  function pauseFor(ms) { pausedUntil = Date.now() + ms; }

  // expõe nav manual no escopo global
  if (exposeFnName) {
    window[exposeFnName] = function(dir) {
      car.scrollBy({ left: dir * step(), behavior: 'smooth' });
      pauseFor(8000);
    };
  }

  function tick() {
    if (Date.now() < pausedUntil) return;
    if (document.hidden) return;
    const nearEnd = car.scrollLeft + car.clientWidth >= car.scrollWidth - 8;
    if (nearEnd) car.scrollTo({ left: 0, behavior: 'smooth' });
    else car.scrollBy({ left: step(), behavior: 'smooth' });
  }

  function start() { if (!timer) timer = setInterval(tick, intervalMs); }
  function stop() { clearInterval(timer); timer = null; }

  ['mouseenter','touchstart','pointerdown'].forEach(ev =>
    car.addEventListener(ev, () => pauseFor(6000), { passive: true })
  );
  car.addEventListener('scroll', () => pauseFor(4000), { passive: true });

  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }, { threshold: 0.2 });
  io.observe(car);
}

makeCarousel({ carId: 'modules-carousel', cardSel: '.mod-card',   gap: 14, intervalMs: 3000, exposeFnName: 'scrollModules' });
makeCarousel({ carId: 'bonus-carousel',   cardSel: '.bonus-card', gap: 16, intervalMs: 3500, exposeFnName: 'scrollBonus'  });

// ===== Reveal on scroll =====
(function initReveal() {
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  const targets = document.querySelectorAll('.section, .hero');
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
})();

// ===== Sticky CTA — esconde no hero e na oferta =====
(function initStickyCta() {
  const sticky = document.querySelector('.sticky-cta');
  if (!sticky) return;
  const hero = document.querySelector('.hero');
  const offer = document.querySelector('#oferta');
  const state = { hero: true, offer: false };
  const update = () => sticky.classList.toggle('hidden', state.hero || state.offer);

  if (hero) new IntersectionObserver(([e]) => { state.hero = e.isIntersecting; update(); }, { threshold: 0.25 }).observe(hero);
  if (offer) new IntersectionObserver(([e]) => { state.offer = e.isIntersecting; update(); }, { threshold: 0.25 }).observe(offer);
})();
