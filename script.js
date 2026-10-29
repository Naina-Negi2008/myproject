/**
 * Naina Negi - Portfolio Interactive Engine
 * Vanilla JavaScript (ES6+)
 * Features: Typewriter, Canvas Particles, 3D Tilt, Theme Switcher,
 * Web Audio FX, Interactive Terminal Runner, ScrollSpy & Toast Alerts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set copyright year
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     1. Web Audio API Sound Effects (Zero External Asset Dependencies)
     ========================================================================== */
  let soundEnabled = localStorage.getItem('naina_sound_enabled') === 'true';
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundOnIcon = soundToggleBtn ? soundToggleBtn.querySelector('.sound-on') : null;
  const soundOffIcon = soundToggleBtn ? soundToggleBtn.querySelector('.sound-off') : null;

  function updateSoundUI() {
    if (!soundOnIcon || !soundOffIcon) return;
    if (soundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }
  updateSoundUI();

  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  function playClickSound() {
    playTone(700, 'sine', 0.05, 0.03);
  }

  function playSuccessSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.04, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('naina_sound_enabled', soundEnabled);
      updateSoundUI();
      if (soundEnabled) {
        playTone(600, 'sine', 0.1, 0.05);
        showToast('Sound feedback enabled! 🔊', 'info');
      } else {
        showToast('Sound feedback muted. 🔇', 'info');
      }
    });
  }

  // Attach subtle click sound to buttons and links
  document.querySelectorAll('button, .btn, .nav-link, .pg-tab, .copy-btn').forEach(elem => {
    elem.addEventListener('click', () => {
      playClickSound();
    });
  });

  /* ==========================================================================
     2. Theme Switcher (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggle');
  const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.sun-icon') : null;
  const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.moon-icon') : null;
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('naina_theme') || 'dark';
  setTheme(savedTheme);

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('naina_theme', theme);
    if (!sunIcon || !moonIcon) return;
    if (theme === 'light') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      showToast(`Switched to ${nextTheme} theme 🌓`, 'info');
    });
  }

  /* ==========================================================================
     3. Custom Cursor Follower & Hover State
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateOutline);
    }
    requestAnimationFrame(animateOutline);

    // Expand cursor over interactive elements
    const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .skill-card, .achievement-card, .goal-card, .tilt-card-wrapper');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.6)';
        cursorOutline.style.borderColor = 'rgba(139, 92, 246, 0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.borderColor = 'rgba(6, 182, 212, 0.6)';
      });
    });
  }

  /* ==========================================================================
     4. Typewriter Effect (Hero Subtitle)
     ========================================================================== */
  const typewriterEl = document.getElementById('typewriterText');
  const phrases = [
    'BCA 1st Year Student',
    'C & Python Programming',
    'Building Innovative Projects',
    'Algorithmic Problem Solving',
    'Aspiring Full-Stack Software Engineer'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 45;
  const pauseAfterPhrase = 1800;

  function typeEffect() {
    if (!typewriterEl) return;
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeEffect, pauseAfterPhrase);
        return;
      }
    } else {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeEffect, isDeleting ? deleteSpeed : typeSpeed);
  }
  typeEffect();

  /* ==========================================================================
     5. 3D Tilt Card Interaction (Hero Code Terminal)
     ========================================================================== */
  const heroTiltCard = document.getElementById('heroTiltCard');
  if (heroTiltCard) {
    const card = heroTiltCard.querySelector('.terminal-card');

    heroTiltCard.addEventListener('mousemove', (e) => {
      const rect = heroTiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroTiltCard.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  /* ==========================================================================
     6. Particle Canvas System (Smooth Background Constellation)
     ========================================================================== */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 55);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(renderParticles);
    }
    requestAnimationFrame(renderParticles);
  }

  /* ==========================================================================
     7. Live Interactive Code Playground (Python / C Language)
     ========================================================================== */
  const codeSnippets = {
    python: {
      title: "naina_innovate.py",
      code: `<span class="code-keyword">def</span> <span class="code-func">generate_project_idea</span>(domain, focus):
    ideas = {
        <span class="code-str">"education"</span>: <span class="code-str">"AI Powered Study Planner for BCA students"</span>,
        <span class="code-str">"utilities"</span>: <span class="code-str">"Real-Time Pointer & Memory Visualizer"</span>,
        <span class="code-str">"community"</span>: <span class="code-str">"Peer-to-Peer Campus Tech Collab Portal"</span>
    }
    <span class="code-keyword">return</span> ideas.get(domain, <span class="code-str">"Innovative Tech Solution"</span>)

author = <span class="code-str">"Naina Negi"</span>
year = <span class="code-str">"BCA 1st Year"</span>
result = generate_project_idea(<span class="code-str">"education"</span>, focus=<span class="code-str">"innovation"</span>)

<span class="code-func">print</span>(<span class="code-str">f"Developer: {author} ({year})"</span>)
<span class="code-func">print</span>(<span class="code-str">f"Next Big Build: {result}"</span>)
<span class="code-func">print</span>(<span class="code-str">"Status: Ready to engineer the future! ✨"</span>)`,
      outputLines: [
        { text: "[Python 3.12.6 Interpreter initialized]", type: "system-msg" },
        { text: "Executing naina_innovate.py...", type: "system-msg" },
        { text: "Developer: Naina Negi (BCA 1st Year)", type: "highlight-out" },
        { text: "Next Big Build: AI Powered Study Planner for BCA students", type: "success-msg" },
        { text: "Status: Ready to engineer the future! ✨", type: "highlight-out" },
        { text: "Process finished with exit code 0 (success)", type: "system-msg" }
      ]
    },
    c: {
      title: "pointer_logic.c",
      code: `<span class="code-keyword">#include</span> <span class="code-str">&lt;stdio.h&gt;</span>
<span class="code-keyword">#include</span> <span class="code-str">&lt;stdlib.h&gt;</span>

<span class="code-keyword">typedef struct</span> {
    <span class="code-keyword">char</span> name[<span class="code-param">30</span>];
    <span class="code-keyword">char</span> vision[<span class="code-param">50</span>];
} <span class="code-class">StudentCoder</span>;

<span class="code-keyword">int</span> <span class="code-func">main</span>() {
    <span class="code-class">StudentCoder</span> naina = {
        <span class="code-str">"Naina Negi"</span>, 
        <span class="code-str">"Turn logic into innovative projects"</span>
    };
    <span class="code-class">StudentCoder</span> *ptr = &naina;

    <span class="code-func">printf</span>(<span class="code-str">"C Memory Address: %p\\n"</span>, (<span class="code-keyword">void</span>*)ptr);
    <span class="code-func">printf</span>(<span class="code-str">"Coder: %s\\n"</span>, ptr-&gt;name);
    <span class="code-func">printf</span>(<span class="code-str">"Vision: %s\\n"</span>, ptr-&gt;vision);
    <span class="code-keyword">return</span> <span class="code-param">0</span>;
}`,
      outputLines: [
        { text: "[GCC Compiler 13.2.0 - compiling pointer_logic.c]", type: "system-msg" },
        { text: "C Memory Address: 0x7fff5fbff8a0", type: "system-msg" },
        { text: "Coder: Naina Negi", type: "highlight-out" },
        { text: "Vision: Turn logic into innovative projects", type: "success-msg" },
        { text: "Program executed in 0.002s with exit code 0", type: "system-msg" }
      ]
    }
  };

  const editorCode = document.getElementById('editorCode');
  const termScreen = document.getElementById('termScreen');
  const runCodeBtn = document.getElementById('runCodeBtn');
  const pgTabs = document.querySelectorAll('.pg-tab');

  let activeLang = 'python';

  function renderEditor() {
    if (!editorCode) return;
    editorCode.innerHTML = codeSnippets[activeLang].code;
  }
  renderEditor();

  pgTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pgTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeLang = tab.getAttribute('data-lang');
      renderEditor();

      if (termScreen) {
        termScreen.innerHTML = `<div class="term-line system-msg">Switched to ${activeLang.toUpperCase()}. Click "Run Program" to execute...</div>`;
      }
    });
  });

  if (runCodeBtn && termScreen) {
    runCodeBtn.addEventListener('click', () => {
      runCodeBtn.disabled = true;
      runCodeBtn.style.opacity = '0.7';
      termScreen.innerHTML = `<div class="term-line system-msg">Compiling and running ${codeSnippets[activeLang].title}...</div>`;

      const lines = codeSnippets[activeLang].outputLines;
      let lineIndex = 0;

      const interval = setInterval(() => {
        if (lineIndex < lines.length) {
          const item = lines[lineIndex];
          const div = document.createElement('div');
          div.className = `term-line ${item.type}`;
          div.textContent = item.text;
          termScreen.appendChild(div);
          termScreen.scrollTop = termScreen.scrollHeight;
          lineIndex++;
        } else {
          clearInterval(interval);
          runCodeBtn.disabled = false;
          runCodeBtn.style.opacity = '1';
          playSuccessSound();
        }
      }, 240);
    });
  }

  /* ==========================================================================
     8. Animated Milestone Number Counter (Intersection Observer)
     ========================================================================== */
  const counterElements = document.querySelectorAll('.counter-num');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counterElements.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.4 });

  const counterBanner = document.querySelector('.milestone-counter-banner');
  if (counterBanner) {
    counterObserver.observe(counterBanner);
  }

  /* ==========================================================================
     9. Scroll Reveal Animations & ScrollSpy Navigation Active State
     ========================================================================== */
  const revealElements = document.querySelectorAll('.animate-fade');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Trigger initial elements in view
  setTimeout(() => {
    document.querySelectorAll('.hero-content .animate-fade, .hero-visual.animate-fade').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);

  // ScrollSpy for Nav Links
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     10. Mobile Menu Navigation
     ========================================================================== */
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksContainer = document.getElementById('navLinks');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('mobile-open');
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('mobile-open');
      });
    });
  }

  /* ==========================================================================
     11. Email Copy to Clipboard Feature
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailTextEl = document.getElementById('emailText');

  function copyEmail() {
    const emailToCopy = "naina.negi.bca@example.com";
    navigator.clipboard.writeText(emailToCopy).then(() => {
      playSuccessSound();
      showToast('Email address copied to clipboard! 📋', 'success');
    }).catch(() => {
      showToast('Email: naina.negi.bca@example.com', 'info');
    });
  }

  if (copyEmailBtn) copyEmailBtn.addEventListener('click', copyEmail);
  if (emailTextEl) emailTextEl.addEventListener('click', (e) => {
    e.preventDefault();
    copyEmail();
  });

  /* ==========================================================================
     12. Interactive Contact Form Submission Simulation
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const message = document.getElementById('userMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      // Show loading spinner
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const sendIcon = submitBtn.querySelector('.send-icon');
      if (btnText) btnText.textContent = 'Sending...';
      if (sendIcon) sendIcon.classList.add('hidden');
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      setTimeout(() => {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        if (sendIcon) sendIcon.classList.remove('hidden');
        if (btnSpinner) btnSpinner.classList.add('hidden');

        playSuccessSound();
        showToast(`Thank you, ${name}! Your message has been sent successfully. 🚀`, 'success');
        contactForm.reset();
      }, 1200);
    });
  }

  /* ==========================================================================
     13. Dynamic Toast Notification System
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOutToast 0.3s forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3800);
  }
});

