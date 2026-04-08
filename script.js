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
    { title: 'Vibing',             duration: '3:03', src: 'audio/vibing.mp3' },
    { title: 'Child of God',       duration: '3:13', src: 'audio/child_of_god.mp3' },
    { title: 'Maya Timilai',       duration: '3:34', src: 'audio/maya-timilai.mp3' },
    { title: 'Living Lowkey',      duration: '3:06', src: 'audio/living_lowkey.mp3' },
    { title: 'Grown up',           duration: '3:25', src: 'audio/grown_up.mp3' },
    { title: 'Fukera',             duration: '2:32', src: 'audio/fukera.mp3' },
  ];

  let currentTrack = 0;
  const audio = document.getElementById('audioPlayer');

  const nowTitle      = document.getElementById('nowTitle');
  const timeTotal     = document.getElementById('timeTotal');
  const timeCurrent   = document.getElementById('timeCurrent');
  const progressFill  = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const btnPlay       = document.getElementById('btnPlay');
  const btnPrev       = document.getElementById('btnPrev');
  const btnNext       = document.getElementById('btnNext');
  const trackItems    = document.querySelectorAll('.track-item');
  const albumArt      = document.getElementById('albumArt');
  const playerVis     = document.getElementById('playerVis');
  const iconPlay      = btnPlay?.querySelector('.icon-play');
  const iconPause     = btnPlay?.querySelector('.icon-pause');
  const progressTrack = document.getElementById('progressTrack');

  function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function loadTrack(index) {
    currentTrack = index;
    const t = tracks[index];
    
    audio.src = t.src;
    audio.load();

    // Update UI text
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

    // Update active state in playlist
    trackItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  function setProgress(pct) {
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
  }

  function updateUIPlayState() {
    const isPlaying = !audio.paused;
    if (iconPlay)  iconPlay.classList.toggle('hidden', isPlaying);
    if (iconPause) iconPause.classList.toggle('hidden', !isPlaying);
    if (albumArt)  albumArt.classList.toggle('spinning', isPlaying);
    if (playerVis) playerVis.classList.toggle('active', isPlaying);
  }

  // Play/Pause Button Logic
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });
  }

  // Next/Prev Buttons Logic
  function playNext() {
    loadTrack((currentTrack + 1) % tracks.length);
    audio.play();
  }

  function playPrev() {
    // If more than 3 seconds in, restart the song. Otherwise, go to previous track.
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
      audio.play();
    }
  }

  if (btnNext) btnNext.addEventListener('click', playNext);
  if (btnPrev) btnPrev.addEventListener('click', playPrev);

  // Playlist Click Logic
  trackItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      loadTrack(i);
      audio.play();
    });
  });

  // Native Audio Events (This syncs the progress bar perfectly with the actual audio)
  if (audio) {
    audio.addEventListener('play', updateUIPlayState);
    audio.addEventListener('pause', updateUIPlayState);
    audio.addEventListener('ended', playNext);
    
    audio.addEventListener('timeupdate', () => {
      const pct = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(pct);
      if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    });
  }

  // Scrubbing the progress bar
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (audio.duration) {
        audio.currentTime = pct * audio.duration;
      }
    });
  }

  // Initialize first track on load
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

/* ─── 2D AVATAR EYE TRACKING ─────────────────────── */
  const pupilLeft = document.getElementById('pupil-left');
  const pupilRight = document.getElementById('pupil-right');
  const eyeLeftCenter = document.getElementById('eye-left-center');
  const eyeRightCenter = document.getElementById('eye-right-center');

  if (pupilLeft && pupilRight && eyeLeftCenter && eyeRightCenter) {
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Group eyes to loop through them easily
      const eyes = [
        { pupil: pupilLeft, centerEl: eyeLeftCenter },
        { pupil: pupilRight, centerEl: eyeRightCenter }
      ];

      eyes.forEach(eye => {
        // Get the current position of the eye relative to the viewport
        const rect = eye.centerEl.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        // Calculate the angle between the eye center and the mouse
        const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
        
        // Calculate the distance (cap it at 4px so the pupil stays inside the white area)
        const distanceToMouse = Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY);
        const maxDistance = 3.5; 
        const moveDistance = Math.min(maxDistance, distanceToMouse / 30); 

        // Use math to figure out the X and Y translation
        const moveX = Math.cos(angle) * moveDistance;
        const moveY = Math.sin(angle) * moveDistance;

        // Apply the transformation directly to the SVG element
        eye.pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  }
