/* ═══════════════════════════════════════════════════════
   MINGMA SHERPA — RHYTHM & CODE
   Vanilla JS — Cursor, Nav, Reveal, Player
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── CUSTOM CURSOR ──────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    const animateFollower = () => {
      followerX += (mouseX - followerX - 14) * 0.12;
      followerY += (mouseY - followerY - 14) * 0.12;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      requestAnimationFrame(animateFollower);
    };
    animateFollower();

    const hoverTargets = document.querySelectorAll('a, button, .track-item, .progress-track, .pill');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ─── NAVBAR SCROLL ──────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ─── MOBILE NAV TOGGLE ──────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ─── HERO LOAD ANIMATIONS ───────────────────────── */
  const heroRevealOrder = ['.hero-eyebrow', '.hero-headline', '.hero-sub', '.hero-cta'];
  heroRevealOrder.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) {
      setTimeout(() => el.classList.add('animate'), 200 + i * 200);
    }
  });

  /* ─── SCROLL REVEAL ──────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal:not(.hero-eyebrow):not(.hero-headline):not(.hero-sub):not(.hero-cta)');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children)
          .filter(c => c.classList.contains('reveal'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── AUDIO PLAYER ───────────────────────────────── */
  const tracks = [
    { title: 'Vibing',     duration: '3:03', totalSecs: 183, src: 'audio/vibing.mp3' },
    { title: 'Child of God',      duration: '3:13', totalSecs: 192, src: 'audio/child_of_god.mp3' },
    { title: 'Kaalpanik Vastavik',         duration: '4:00', totalSecs: 240, src: 'audio/kaalpanik_astavik.mp3' },
    { title: 'Living Lowkey',       duration: '3:06', totalSecs: 186, src: 'audio/living-lowkey.mp3' },
    { title: 'Grown up',      duration: '3:25', totalSecs: 205, src: 'audio/grown-up.mp3' },
    { title: 'Fukera',  duration: '2:32', totalSecs: 152, src: 'audio/fukera.mp3' },
  ];

  let currentTrack = 0;
  let isPlaying = false;
  let progressInterval = null;
  let currentSecs = 0;

  const nowTitle    = document.getElementById('nowTitle');
  const timeTotal   = document.getElementById('timeTotal');
  const timeCurrent = document.getElementById('timeCurrent');
  const progressFill  = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const btnPlay     = document.getElementById('btnPlay');
  const btnPrev     = document.getElementById('btnPrev');
  const btnNext     = document.getElementById('btnNext');
  const trackItems  = document.querySelectorAll('.track-item');
  const albumArt    = document.getElementById('albumArt');
  const playerVis   = document.getElementById('playerVis');
  const iconPlay    = btnPlay?.querySelector('.icon-play');
  const iconPause   = btnPlay?.querySelector('.icon-pause');

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function loadTrack(index) {
    currentTrack = index;
    currentSecs = 0;
    const t = tracks[index];

    if (nowTitle) {
      nowTitle.style.opacity = '0';
      nowTitle.style.transform = 'translateY(6px)';
      setTimeout(() => {
        nowTitle.textContent = t.title;
        nowTitle.style.opacity = '1';
        nowTitle.style.transform = 'translateY(0)';
        nowTitle.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }, 150);
    }

    if (timeTotal) timeTotal.textContent = t.duration;
    if (timeCurrent) timeCurrent.textContent = '0:00';
    setProgress(0);

    trackItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  function setProgress(pct) {
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
  }

  function startProgress() {
    clearInterval(progressInterval);
    const t = tracks[currentTrack];
    progressInterval = setInterval(() => {
      currentSecs++;
      if (currentSecs >= t.totalSecs) {
        clearInterval(progressInterval);
        playNext();
        return;
      }
      const pct = (currentSecs / t.totalSecs) * 100;
      setProgress(pct);
      if (timeCurrent) timeCurrent.textContent = formatTime(currentSecs);
    }, 1000);
  }

  function stopProgress() {
    clearInterval(progressInterval);
  }

  function setPlayState(playing) {
    isPlaying = playing;
    if (iconPlay)  iconPlay.classList.toggle('hidden', playing);
    if (iconPause) iconPause.classList.toggle('hidden', !playing);
    if (albumArt)  albumArt.classList.toggle('spinning', playing);
    if (playerVis) playerVis.classList.toggle('active', playing);
  }

  function playNext() {
    loadTrack((currentTrack + 1) % tracks.length);
    if (isPlaying) startProgress();
  }

  function playPrev() {
    if (currentSecs > 3) {
      currentSecs = 0;
      setProgress(0);
      if (timeCurrent) timeCurrent.textContent = '0:00';
      if (isPlaying) startProgress();
    } else {
      loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
      if (isPlaying) startProgress();
    }
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (isPlaying) {
        stopProgress();
        setPlayState(false);
      } else {
        startProgress();
        setPlayState(true);
      }
    });
  }

  if (btnNext) btnNext.addEventListener('click', () => { playNext(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { playPrev(); });

  trackItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      stopProgress();
      loadTrack(i);
      setPlayState(true);
      startProgress();
    });
  });

  // Progress bar scrubbing
  const progressTrack = document.getElementById('progressTrack');
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const t = tracks[currentTrack];
      currentSecs = Math.floor(pct * t.totalSecs);
      setProgress(pct * 100);
      if (timeCurrent) timeCurrent.textContent = formatTime(currentSecs);
    });
  }

  // Initialise
  loadTrack(0);

  /* ─── CONTACT FORM ───────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.name?.value.trim();
      const email = contactForm.email?.value.trim();
      const message = contactForm.message?.value.trim();

      if (!name || !email || !message) return;

      // Simulate send
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'Sending...';
      }

      setTimeout(() => {
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.querySelector('.btn-text').textContent = 'Send It';
        }
        if (formSuccess) formSuccess.classList.add('visible');
        setTimeout(() => formSuccess?.classList.remove('visible'), 5000);
      }, 1200);
    });
  }

  /* ─── PROJECT CARD CURSOR TRACK ─────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      card.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─── SMOOTH ACTIVE NAV LINK ─────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--white)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => navObserver.observe(sec));

});
