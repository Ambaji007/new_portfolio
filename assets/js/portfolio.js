(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  /* ---------- Loader ---------- */
  const loader = document.querySelector('[data-loader]');
  const loaderBar = document.querySelector('[data-loader-bar]');
  const hero = document.querySelector('.hero');
  const brand = document.querySelector('[data-split-text]');

  const finishIntro = () => {
    if (loader) loader.classList.add('is-done');
    if (hero) hero.classList.add('is-ready');
    if (brand) requestAnimationFrame(() => brand.classList.add('is-in'));
  };

  if (brand) {
    const text = brand.textContent.trim();
    brand.setAttribute('aria-label', text);
    brand.innerHTML = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${0.04 * i + 0.05}s`;
      brand.appendChild(span);
    });
  }

  if (loader && loaderBar && !reduceMotion) {
    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        loaderBar.style.width = '100%';
        setTimeout(finishIntro, 220);
        return;
      }
      loaderBar.style.width = `${progress}%`;
      setTimeout(tick, 90);
    };
    tick();
  } else {
    finishIntro();
  }

  /* ---------- Header / mobile nav ---------- */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobileNav.toggleAttribute('hidden', open);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        mobileNav.setAttribute('hidden', '');
      });
    });
  }

  /* ---------- Scroll progress ---------- */
  const progressEl = document.querySelector('[data-scroll-progress]');
  const updateProgress = () => {
    if (!progressEl) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressEl.style.width = `${value}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('[data-cursor]');
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('has-cursor');
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add('is-ready');
    }, { passive: true });

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot) {
        dot.style.setProperty('--x', `${x}px`);
        dot.style.setProperty('--y', `${y}px`);
      }
      if (ring) {
        ring.style.setProperty('--rx', `${rx}px`);
        ring.style.setProperty('--ry', `${ry}px`);
      }
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('[data-cursor-hover], a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Magnetic elements ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 18;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${mx / strength}px, ${my / strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Parallax orbs ---------- */
  const parallaxRoot = document.querySelector('[data-parallax-root]');
  if (parallaxRoot && !reduceMotion && finePointer) {
    const layers = parallaxRoot.querySelectorAll('[data-parallax]');
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach((layer) => {
        const depth = parseFloat(layer.getAttribute('data-parallax') || '0.1');
        layer.style.transform = `translate3d(${nx * depth * -40}px, ${ny * depth * -30}px, 0)`;
      });
    }, { passive: true });
  }

  /* ---------- Line split headings ---------- */
  document.querySelectorAll('[data-reveal-lines]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    const mask = document.createElement('span');
    mask.className = 'line-mask';
    const inner = document.createElement('span');
    inner.textContent = text;
    mask.appendChild(inner);
    el.appendChild(mask);
  });

  /* ---------- Reveal on scroll (Notion-like stagger) ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');

  const applyStagger = (root) => {
    root.querySelectorAll('[data-stagger]').forEach((group) => {
      [...group.children].forEach((child, i) => {
        child.style.transitionDelay = `${80 + i * 70}ms`;
      });
    });
    if (root.matches?.('[data-stagger]')) {
      [...root.children].forEach((child, i) => {
        child.style.transitionDelay = `${80 + i * 70}ms`;
      });
    }
  };

  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        applyStagger(entry.target);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      observer.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* Soft section enter */
  document.querySelectorAll('.section').forEach((section) => {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    io.observe(section);
  });

  /* Soft magnetic already exists — add gentle link ripple press */
  if (!reduceMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('pointerdown', () => btn.classList.add('is-pressed'));
      btn.addEventListener('pointerup', () => btn.classList.remove('is-pressed'));
      btn.addEventListener('pointerleave', () => btn.classList.remove('is-pressed'));
    });
  }

  /* ---------- Section rail ---------- */
  const rails = document.querySelectorAll('[data-rail]');
  const sections = document.querySelectorAll('[data-observe-section]');
  if (rails.length && sections.length && 'IntersectionObserver' in window) {
    const map = new Map();
    rails.forEach((rail) => map.set(rail.getAttribute('data-section'), rail));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('data-observe-section');
        rails.forEach((r) => r.classList.remove('is-active'));
        const active = map.get(id);
        if (active) active.classList.add('is-active');
      });
    }, { threshold: 0.35, rootMargin: '-20% 0px -35% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Timeline fill ---------- */
  const timeline = document.querySelector('[data-timeline]');
  const timelineFill = document.querySelector('[data-timeline-fill]');
  if (timeline && timelineFill && !reduceMotion) {
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const view = window.innerHeight * 0.65;
      const total = rect.height;
      const passed = Math.min(Math.max(view - rect.top, 0), total);
      const pct = total ? (passed / total) * 100 : 0;
      timelineFill.style.height = `${pct}%`;
    };
    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  /* ---------- Project tilt ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach((wrap) => {
      const screen = wrap.querySelector('.project-screen');
      if (!screen) return;
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 10;
        const ry = (x - 0.5) * 12;
        screen.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      wrap.addEventListener('mouseleave', () => {
        screen.style.transform = '';
      });
    });
  }

  /* ============================================================
     PREMIUM BACKGROUND DESIGN ENGINE
     ============================================================ */

  if (reduceMotion) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const sizeCanvas = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w, h, cssW: rect.width, cssH: rect.height };
  };

  /* ----- Mouse spotlight ----- */
  const spotlight = document.querySelector('[data-spotlight]');
  if (spotlight && finePointer) {
    let sx = window.innerWidth * 0.65;
    let sy = window.innerHeight * 0.35;
    const moveSpot = () => {
      sx += (mouse.tx * window.innerWidth - sx) * 0.08;
      sy += (mouse.ty * window.innerHeight - sy) * 0.08;
      spotlight.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(moveSpot);
    };
    moveSpot();
  }

  /* ----- Silk ribbons + soft dust ----- */
  const bgCanvas = document.querySelector('[data-bg-canvas]');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    const ribbonCount = isMobile ? 4 : 6;
    const dustCount = isMobile ? 24 : 48;

    const ribbons = Array.from({ length: ribbonCount }, (_, i) => ({
      amp: 0.045 + i * 0.012,
      freq: 1.1 + i * 0.35,
      speed: 0.18 + i * 0.05,
      y: 0.22 + i * 0.12,
      width: 1.1 + (i % 2) * 0.6,
      teal: i % 2 === 0,
    }));

    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      s: 0.00008 + Math.random() * 0.00018,
      a: 0.12 + Math.random() * 0.25,
      teal: Math.random() > 0.45,
    }));

    const drawBg = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const { w, h } = sizeCanvas(bgCanvas);
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.001;
      const mx = (mouse.x - 0.5) * 40 * dpr;
      const my = (mouse.y - 0.5) * 28 * dpr;

      ribbons.forEach((r, idx) => {
        ctx.beginPath();
        const steps = isMobile ? 48 : 120;
        for (let i = 0; i <= steps; i++) {
          const p = i / steps;
          const x = p * w;
          const y =
            r.y * h +
            Math.sin(p * Math.PI * r.freq + t * r.speed) * r.amp * h +
            Math.cos(p * Math.PI * 1.5 - t * r.speed * 0.7) * (r.amp * 0.35) * h +
            Math.sin(p * Math.PI * 2.8 + t * 0.35 + idx) * 12 * dpr +
            my * (0.2 + idx * 0.05) +
            mx * (p - 0.5) * 0.12;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        if (r.teal) {
          grad.addColorStop(0, 'rgba(13, 115, 119, 0)');
          grad.addColorStop(0.25, 'rgba(13, 115, 119, 0.28)');
          grad.addColorStop(0.55, 'rgba(13, 115, 119, 0.16)');
          grad.addColorStop(1, 'rgba(13, 115, 119, 0)');
        } else {
          grad.addColorStop(0, 'rgba(232, 93, 4, 0)');
          grad.addColorStop(0.35, 'rgba(232, 93, 4, 0.24)');
          grad.addColorStop(0.7, 'rgba(232, 93, 4, 0.12)');
          grad.addColorStop(1, 'rgba(232, 93, 4, 0)');
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = r.width * dpr;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // soft intersecting arcs
      for (let i = 0; i < 4; i++) {
        const cx = w * (0.15 + i * 0.25) + mx * 0.35;
        const cy = h * (0.35 + Math.sin(t * 0.2 + i) * 0.08) + my * 0.25;
        const radius = Math.min(w, h) * (0.15 + i * 0.06);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, t * 0.18 + i, t * 0.18 + i + Math.PI * 1.3);
        ctx.strokeStyle = i % 2 === 1
          ? 'rgba(232, 93, 4, 0.12)'
          : 'rgba(13, 115, 119, 0.12)';
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      }

      dust.forEach((d) => {
        d.y -= d.s;
        d.x += Math.sin(t + d.y * 12) * 0.00015;
        if (d.y < -0.02) {
          d.y = 1.02;
          d.x = Math.random();
        }

        // Beautiful reactive mouse physics on background dust
        const px = d.x * w;
        const py = d.y * h;
        const mpx = mouse.x * w;
        const mpy = mouse.y * h;
        const dx = px - mpx;
        const dy = py - mpy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let forceX = 0;
        let forceY = 0;
        const interactionRadius = 160 * dpr;
        if (dist < interactionRadius) {
          const force = (interactionRadius - dist) / interactionRadius;
          forceX = (dx / (dist || 1)) * force * 24 * dpr;
          forceY = (dy / (dist || 1)) * force * 24 * dpr;
        }

        const finalX = px + mx * 0.15 + forceX;
        const finalY = py + my * 0.1 + forceY;

        ctx.beginPath();
        ctx.arc(finalX, finalY, d.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = d.teal
          ? `rgba(13, 115, 119, ${d.a * 1.15})`
          : `rgba(232, 93, 4, ${d.a * 1.05})`;
        ctx.fill();
      });

      requestAnimationFrame(drawBg);
    };
    drawBg();
  }

  /* ----- Hero atmospheric canvas ----- */
  const heroCanvas = document.querySelector('[data-hero-canvas]');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');

    const drawHero = () => {
      const { w, h } = sizeCanvas(heroCanvas);
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.001;
      const cx = w * (0.72 + (mouse.x - 0.5) * 0.035);
      const cy = h * (0.4 + (mouse.y - 0.5) * 0.035);

      // breathing luminous core
      const coreSize = Math.min(w, h) * (0.35 + Math.sin(t * 0.45) * 0.03);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      core.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      core.addColorStop(0.22, 'rgba(13, 115, 119, 0.16)');
      core.addColorStop(0.58, 'rgba(232, 93, 4, 0.08)');
      core.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // layered elliptical orbits with dynamic glowing gradients
      for (let i = 0; i < 4; i++) {
        const rx = Math.min(w, h) * (0.14 + i * 0.07);
        const ry = rx * (0.62 + Math.sin(t * 0.3 + i) * 0.04);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.sin(t * 0.15 + i * 0.4) * 0.35, 0, Math.PI * 2);

        const orbitGrad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
        orbitGrad.addColorStop(0, `rgba(13, 115, 119, ${0.14 - i * 0.02})`);
        orbitGrad.addColorStop(0.5, `rgba(232, 93, 4, ${0.09 - i * 0.01})`);
        orbitGrad.addColorStop(1, `rgba(13, 115, 119, ${0.05 - i * 0.01})`);

        ctx.strokeStyle = orbitGrad;
        ctx.lineWidth = (1 + (3 - i) * 0.35) * dpr;
        ctx.stroke();
      }

      // traveling signal dots on orbits
      for (let i = 0; i < 6; i++) {
        const a = t * (0.32 + i * 0.07) + i * 1.3;
        const rx = Math.min(w, h) * (0.16 + (i % 3) * 0.08);
        const ry = rx * 0.65;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        ctx.beginPath();
        ctx.arc(x, y, (i % 2 === 0 ? 2.6 : 1.8) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0
          ? 'rgba(232, 93, 4, 0.85)'
          : 'rgba(13, 115, 119, 0.8)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(cx + Math.cos(a - 0.4) * rx, cy + Math.sin(a - 0.4) * ry);
        ctx.strokeStyle = i % 2 === 0
          ? 'rgba(232, 93, 4, 0.25)'
          : 'rgba(13, 115, 119, 0.22)';
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      }

      requestAnimationFrame(drawHero);
    };
    drawHero();
  }

  /* ----- Contact wave field ----- */
  const contactCanvas = document.querySelector('[data-contact-canvas]');
  if (contactCanvas) {
    const ctx = contactCanvas.getContext('2d');
    let running = false;
    let raf = null;

    const drawContact = () => {
      if (!running) return;
      const { w, h } = sizeCanvas(contactCanvas);
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.001;
      const rows = isMobile ? 7 : 10;

      for (let row = 0; row < rows; row++) {
        ctx.beginPath();
        const yBase = ((row + 1) / (rows + 1)) * h;
        for (let x = 0; x <= w; x += 8 * dpr) {
          const y =
            yBase +
            Math.sin(x * 0.008 + t * 1.4 + row * 0.55) * 10 * dpr +
            Math.cos(x * 0.004 + t * 0.8 + row) * 6 * dpr;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const alpha = 0.08 + (row / rows) * 0.1;
        ctx.strokeStyle = row % 2 === 0
          ? `rgba(13, 115, 119, ${alpha})`
          : `rgba(232, 93, 4, ${alpha * 0.9})`;
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();
      }
      raf = requestAnimationFrame(drawContact);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting;
          if (running) drawContact();
          else if (raf) cancelAnimationFrame(raf);
        });
      }, { threshold: 0.1 });
      io.observe(contactCanvas);
    } else {
      running = true;
      drawContact();
    }
  }
})();






// toggles***********************

document.addEventListener('DOMContentLoaded', function () {

    const carousel = document.getElementById('projectCarousel');
    const prevBtn = document.getElementById('projectPrev');
    const nextBtn = document.getElementById('projectNext');
    const dots = document.querySelectorAll('.project-dot');

    if (!carousel) {
        return;
    }

    const slides = carousel.querySelectorAll('.project-feature');

    let currentIndex = 0;

    function goToSlide(index) {

        if (!slides.length) {
            return;
        }

        // Loop to first
        if (index >= slides.length) {
            index = 0;
        }

        // Loop to last
        if (index < 0) {
            index = slides.length - 1;
        }

        currentIndex = index;

        slides[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
        });

        updateDots();
    }


    function updateDots() {

        dots.forEach(function (dot, index) {

            dot.classList.toggle(
                'active',
                index === currentIndex
            );

        });

    }


    // Previous
    if (prevBtn) {

        prevBtn.addEventListener('click', function () {

            goToSlide(currentIndex - 1);

        });

    }


    // Next
    if (nextBtn) {

        nextBtn.addEventListener('click', function () {

            goToSlide(currentIndex + 1);

        });

    }


    // Dots
    dots.forEach(function (dot, index) {

        dot.addEventListener('click', function () {

            goToSlide(index);

        });

    });


    // Detect slide while scrolling
    let scrollTimer;

    carousel.addEventListener('scroll', function () {

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(function () {

            const carouselRect =
                carousel.getBoundingClientRect();

            let closestIndex = 0;
            let closestDistance = Infinity;

            slides.forEach(function (slide, index) {

                const rect =
                    slide.getBoundingClientRect();

                const distance =
                    Math.abs(
                        rect.left - carouselRect.left
                    );

                if (distance < closestDistance) {

                    closestDistance = distance;
                    closestIndex = index;

                }

            });

            currentIndex = closestIndex;

            updateDots();

        }, 80);

    });


    // Keyboard support
    document.addEventListener('keydown', function (event) {

        if (event.key === 'ArrowRight') {
            goToSlide(currentIndex + 1);
        }

        if (event.key === 'ArrowLeft') {
            goToSlide(currentIndex - 1);
        }

    });

});