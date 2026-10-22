
const siteLogger = (function () {
  const STORAGE_KEY = 'yasmina_site_logs';
  let currentSession = null;

  function getUA() {
    const ua = navigator.userAgent;

    let device = 'ПК';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) device = 'Телефон';
    else if (/Tablet|iPad/i.test(ua)) device = 'Планшет';


    let os = 'Неизвестно';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Win/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';


    let browser = 'Неизвестно';
    if (/YaBrowser/i.test(ua)) browser = 'Яндекс Браузер';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';

    return { device, os, browser };
  }

  function formatTime(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function startSession() {
    const { device, os, browser } = getUA();
    const screen = `${window.screen.width}x${window.screen.height}`;
    const now = new Date();

    currentSession = {
      time: formatTime(now),
      timestamp: now.getTime(),
      device,
      os,
      browser,
      screen,
      ip: 'localStorage',
      actions: []
    };
  }

  function logAction(label) {
    if (!currentSession) return;

    const last = currentSession.actions[currentSession.actions.length - 1];
    if (last === label) return;
    currentSession.actions.push(label);
    saveSession();
  }

  function saveSession() {
    if (!currentSession) return;
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
      const idx = logs.findIndex(s => s.timestamp === currentSession.timestamp);
      if (idx >= 0) {
        logs[idx] = currentSession;
      } else {
        logs.unshift(currentSession); 

        if (logs.length > 200) logs.length = 200;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }

  return { startSession, logAction };
})();


const state = {
  candlesBlown: 0,
  totalCandles: 19,
  audioContext: null,
  isMusicPlaying: false,
  musicOscillator: null,
  currentVoiceAudio: null,
  currentVoiceCard: null,
  quizCurrentStep: 0,
  quizScore: 0
};


const roundVideosData = [
  { file: 'round_video_messages/video.mp4', thumb: 'round_video_messages/video.mp4_thumb.jpg', date: '22 Февраля 2026', title: 'Зимний кружочек' },
  { file: 'round_video_messages/video (1).mp4', thumb: 'round_video_messages/video (1).mp4_thumb.jpg', date: '22 Марта 2026', title: 'Весеннее настроение' },
  { file: 'round_video_messages/video (2).mp4', thumb: 'round_video_messages/video (2).mp4_thumb.jpg', date: '23 Марта 2026', title: 'Улыбка Яси' },
  { file: 'round_video_messages/video (3).mp4', thumb: 'round_video_messages/video (3).mp4_thumb.jpg', date: '12 Апреля 2026', title: 'Апрельский день' },
  { file: 'round_video_messages/video (4).mp4', thumb: 'round_video_messages/video (4).mp4_thumb.jpg', date: '12 Апреля 2026', title: 'Привет в чат' },
  { file: 'round_video_messages/video (5).mp4', thumb: 'round_video_messages/video (5).mp4_thumb.jpg', date: '27 Июля 2026', title: 'Летняя прогулка' }
];

const selectedPhotos = [
  { src: 'photos/photo_1@18-01-2026_17-40-08.jpg', caption: '18 января • Первые фото в чате' },
  { src: 'photos/photo_2@31-01-2026_10-09-21.jpg', caption: '31 января • Январский день' },
  { src: 'photos/photo_21@06-03-2026_18-16-07.jpg', caption: '6 марта • Накануне праздника' },
  { src: 'photos/photo_20@01-03-2026_20-12-35.jpg', caption: '1 марта • Начало весны' },
  { src: 'photos/photo_27@22-03-2026_21-27-03.jpg', caption: '22 марта • «Скажи что ты на диете»' },
  { src: 'photos/photo_37@12-04-2026_18-11-11.jpg', caption: '12 апреля • Пчелка в говне' },
  { src: 'photos/photo_40@02-05-2026_20-03-19.jpg', caption: '2 мая • Совместные катки' }
];

const selectedVoices = [
  { file: 'voice_messages/audio_1@12-02-2026_19-02-12.ogg', title: 'Голосовое #1', date: '12 февраля 2026' },
  { file: 'voice_messages/audio_2@18-02-2026_21-10-26.ogg', title: 'Голосовое #2', date: '18 февраля 2026' },
  { file: 'voice_messages/audio_3@18-02-2026_21-12-53.ogg', title: 'Голосовое #3', date: '18 февраля 2026' },
  { file: 'voice_messages/audio_9@19-03-2026_14-19-50.ogg', title: 'Голосовое #4', date: '19 марта 2026' },
  { file: 'voice_messages/audio_13@21-03-2026_19-27-02.ogg', title: 'Голосовое #5', date: '21 марта 2026' },
  { file: 'voice_messages/audio_22@22-04-2026_19-41-48.ogg', title: 'Голосовое #6', date: '22 апреля 2026' },
  { file: 'voice_messages/audio_24@27-07-2026_20-59-00.ogg', title: 'Голосовое #7', date: '27 июля 2026' },
  { file: 'voice_messages/audio_29@17-10-2026_19-39-16.ogg', title: 'Голосовое #8', date: '17 октября 2026' }
];

const quizQuestions = [
  {
    q: 'Где мы с тобой впервые познакомились и списались?',
    options: [
      { text: 'В Mobile Legends (мобла)', correct: true },
      { text: 'На дне рождения сестры в кафе', correct: false },
      { text: 'В социальных сетях', correct: false },
      { text: 'Случайно в очереди за кофе', correct: false }
    ],
    explanation: 'Да, 13 января 2026 ты написала в ТГ: «Ты с моблы правильно же?»'
  },
  {
    q: 'Какое забавное прозвище Тимур написал для Яси в октябре?',
    options: [
      { text: '«Ясминьон»', correct: true },
      { text: '«Ягодка»', correct: false },
      { text: '«Капитан»', correct: false },
      { text: '«Солнышко»', correct: false }
    ],
    explanation: 'Именно: «Привет, ясминьон, погли играти»'
  },
  {
    q: 'Какая фраза от Тимура звучала в нашем чате чаще всего (более 30 раз)?',
    options: [
      { text: '«Приятного аппетита!»', correct: true },
      { text: '«Скинь домашку»', correct: false },
      { text: '«Я пошел спать»', correct: false },
      { text: '«Где тиммейты?!»', correct: false }
    ],
    explanation: 'Каждый раз, когда ты упоминала еду или готовку, обязательно звучало «Приятного аппетита!»'
  },
  {
    q: 'Как Тимур в шутку поприветствовал тебя 7 марта в чате?',
    options: [
      { text: '«Здравствуйте тетя под именем Яся»', correct: true },
      { text: '«Привет, бабуля»', correct: false },
      { text: '«Добрый день, мадам»', correct: false },
      { text: '«Салам алейкум, босс»', correct: false }
    ],
    explanation: 'Да, и ты сразу ответила: «Почему не подросток то?!»'
  },
  {
    q: 'Примерно сколько сообщений в нашем с тобой чате?',
    options: [
      { text: '3 758', correct: true },
      { text: '1 200', correct: false },
      { text: '5 600', correct: false },
      { text: '800', correct: false }
    ],
    explanation: 'Три тысячи семьсот пятьдесят восемь. Это много или мало — решай сама.'
  }
];

const complimentsList = [
  'Ты очень искренняя, и с тобой всегда легко и уютно в разговоре.',
  'Ты же когда нибудь сыграешь в лесу?🤔',
  'Спасибо что ты есть.',
  'С тобой даже неудачная катка превращается в весёлое времяпрепровождение.',
  'Ты умеешь выслушать и поддержать, когда это по-настоящему нужно.',
  'Спасибо что ты всегда откровенна со мной и делишься своими мыслями.',
  'Ты замечательный собеседник и надежный тиммейт.',
  'Пусть твои 19 лет будут наполнены только хорошими моментами и радостью.'
];

function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  const stars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 90; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let s of stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha) * 0.75})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

const fireworksEngine = (function() {
  let canvas, ctx, width, height;
  let particles = [];
  let animationId = null;

  function init() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function launchConfetti(x, y, count = 70) {
    if (!canvas) return;
    const colors = ['#ff5e7e', '#ffd166', '#a855f7', '#2aabee', '#06d6a0', '#ffffff', '#ff9a9e'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: x || width / 2,
        y: y || height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.18,
        drag: 0.96,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }
    if (!animationId) loop();
  }

  function launchGrandSalute() {
    const bursts = 6;
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        const x = Math.random() * (width * 0.7) + width * 0.15;
        const y = Math.random() * (height * 0.5) + height * 0.1;
        launchConfetti(x, y, 90);
        soundEngine.playPop();
      }, i * 350);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(loop);
    } else {
      animationId = null;
      ctx.clearRect(0, 0, width, height);
    }
  }

  return { init, launchConfetti, launchGrandSalute };
})();


const soundEngine = (function() {
  function getCtx() {
    if (!state.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  function playPuff() {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { console.log(e); }
  }

  function playPop() {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + Math.random() * 300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  function playFanfare() {
    try {
      const ctx = getCtx();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.65);
        }, idx * 100);
      });
    } catch (e) {}
  }

  let melodyTimeout = null;
  function startMelody() {
    if (state.isMusicPlaying) return;
    state.isMusicPlaying = true;
    updateMusicButton();

    const ctx = getCtx();
 
    const melody = [
      { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 392.00, d: 0.7 },
      { f: 523.25, d: 0.7 }, { f: 493.88, d: 1.2 },
      { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 392.00, d: 0.7 },
      { f: 587.33, d: 0.7 }, { f: 523.25, d: 1.2 },
      { f: 392.00, d: 0.35 }, { f: 392.00, d: 0.35 }, { f: 783.99, d: 0.7 }, { f: 659.25, d: 0.7 },
      { f: 523.25, d: 0.7 }, { f: 493.88, d: 0.7 }, { f: 440.00, d: 0.9 },
      { f: 698.46, d: 0.35 }, { f: 698.46, d: 0.35 }, { f: 659.25, d: 0.7 }, { f: 523.25, d: 0.7 },
      { f: 587.33, d: 0.7 }, { f: 523.25, d: 1.5 }
    ];

    let noteIdx = 0;
    function playNextNote() {
      if (!state.isMusicPlaying) return;
      const note = melody[noteIdx];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.d * 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + note.d);

      noteIdx = (noteIdx + 1) % melody.length;
      melodyTimeout = setTimeout(playNextNote, note.d * 1000 + 40);
    }

    playNextNote();
  }

  function stopMelody() {
    state.isMusicPlaying = false;
    if (melodyTimeout) clearTimeout(melodyTimeout);
    updateMusicButton();
  }

  function toggleMelody() {
    if (state.isMusicPlaying) {
      stopMelody();
    } else {
      startMelody();
    }
  }

  function updateMusicButton() {
    const btn = document.getElementById('music-btn');
    if (!btn) return;
    const iconSpan = btn.querySelector('.icon');
    if (!iconSpan) return;
    if (state.isMusicPlaying) {
      btn.classList.remove('muted');
      iconSpan.innerHTML = '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    } else {
      btn.classList.add('muted');
      iconSpan.innerHTML = '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73l4.73 4.73c-.22.17-.45.32-.73.44v2.06c.8-.25 1.51-.67 2.12-1.21l1.61 1.61L21 21.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/></svg>';
    }
  }

  return { playPuff, playPop, playFanfare, startMelody, stopMelody, toggleMelody };
})();


function initCake() {
  const container = document.getElementById('candles-container');
  const counterLabel = document.getElementById('candles-left');
  const blowAllBtn = document.getElementById('blow-all-candles-btn');
  const wishReveal = document.getElementById('cake-wish-reveal');
  const cakeBody = document.querySelector('.cake-body');

  if (!container) return;

  container.innerHTML = '';
  state.candlesBlown = 0;

  for (let i = 1; i <= state.totalCandles; i++) {
    const candle = document.createElement('div');
    const colorClass = `c-color-${((i - 1) % 5) + 1}`;
    candle.className = 'candle-unit';
    candle.id = `candle-${i}`;
    candle.innerHTML = `
      <div class="candle-smoke"></div>
      <div class="candle-flame"></div>
      <div class="candle-wick"></div>
      <div class="candle-stick ${colorClass}"></div>
    `;

    candle.addEventListener('click', (e) => {
      e.stopPropagation();
      blowSingleCandle(candle);
    });

    container.appendChild(candle);
  }

  function blowSingleCandle(candleEl) {
    if (!candleEl || candleEl.classList.contains('blown')) return;
    candleEl.classList.add('blown');
    if (typeof candleEl.blur === 'function') {
      candleEl.blur();
    }
    state.candlesBlown++;
    soundEngine.playPuff();
    updateCounter();

  
    if (state.candlesBlown === 1) {
      siteLogger.logAction('Начала задувать свечи на торте');
    }

    const rect = candleEl.getBoundingClientRect();
    fireworksEngine.launchConfetti(rect.left + rect.width / 2, rect.top, 8);

    if (state.candlesBlown === state.totalCandles) {
      celebrateCakeComplete();
    }
  }

 
  let isTouchingCandles = false;
  function blowCandleAtPoint(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return;
    const candle = el.closest('.candle-unit');
    if (candle && !candle.classList.contains('blown')) {
      blowSingleCandle(candle);
    }
  }

  container.addEventListener('touchstart', (e) => {
    isTouchingCandles = true;
    if (e.touches && e.touches[0]) {
      blowCandleAtPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isTouchingCandles) return;
    if (e.touches && e.touches[0]) {
      blowCandleAtPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isTouchingCandles = false;
  }, { passive: true });

  
  if (cakeBody) {
    cakeBody.style.cursor = 'pointer';
    cakeBody.addEventListener('click', () => {
      const firstUnblown = container.querySelector('.candle-unit:not(.blown)');
      if (firstUnblown) {
        blowSingleCandle(firstUnblown);
      }
    });
  }

  function updateCounter() {
    if (counterLabel) {
      counterLabel.textContent = state.totalCandles - state.candlesBlown;
    }
  }

  blowAllBtn.addEventListener('click', () => {
    const unblown = document.querySelectorAll('.candle-unit:not(.blown)');
    unblown.forEach((c, idx) => {
      setTimeout(() => {
        blowSingleCandle(c);
      }, idx * 60);
    });
  });


  const micBtn = document.getElementById('mic-blow-btn');
  const micBtnLabel = document.getElementById('mic-btn-label');
  const micLevelBar = document.getElementById('mic-level-bar');
  const micLevelFill = document.getElementById('mic-level-fill');

  let micStream = null;
  let micAnalyser = null;
  let micAnimFrame = null;
  let isListening = false;


  let blowCooldown = false;

  function startMicListening() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Ваш браузер не поддерживает микрофон');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        micStream = stream;
        isListening = true;
        micBtn.classList.add('listening');
        micBtnLabel.textContent = 'Слушаю... дуй!';
        micLevelBar.classList.remove('hidden');

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 512;
        micAnalyser.smoothingTimeConstant = 0.3;
        source.connect(micAnalyser);

        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);

        function detectBlow() {
          if (!isListening) return;
          micAnimFrame = requestAnimationFrame(detectBlow);

          micAnalyser.getByteFrequencyData(dataArray);

     
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

      
          const pct = Math.min(100, (avg / 70) * 100);
          if (micLevelFill) micLevelFill.style.width = pct + '%';

          const BLOW_THRESHOLD = 16;

          if (avg > BLOW_THRESHOLD && !blowCooldown) {
            blowCooldown = true;


            let count;
            if (avg < 28)      count = 1;
            else if (avg < 42) count = Math.round(2 + (avg - 28) / 14);   
            else if (avg < 60) count = Math.round(4 + (avg - 42) / 6);  
            else               count = Math.min(10, Math.round(7 + (avg - 60) / 10)); 

            let blown = 0;
            function blowNext() {
              if (blown >= count) return;
              const nextCandle = container.querySelector('.candle-unit:not(.blown)');
              if (nextCandle) {
                blowSingleCandle(nextCandle);
                blown++;
                setTimeout(blowNext, 80);
              }
            }
            blowNext();

           
            const cooldownMs = avg < 35 ? 400 : avg < 55 ? 600 : 900;
            setTimeout(() => { blowCooldown = false; }, cooldownMs);
          }
        }

        detectBlow();
      })
      .catch(err => {
        if (err.name === 'NotAllowedError') {
          alert('Разреши доступ к микрофону в браузере, чтобы дуть на свечи');
        } else {
          alert('Не удалось получить доступ к микрофону');
        }
      });
  }

  function stopMicListening() {
    isListening = false;
    if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    micBtn.classList.remove('listening');
    micBtnLabel.textContent = 'Дунь в микрофон';
    micLevelBar.classList.add('hidden');
    if (micLevelFill) micLevelFill.style.width = '0%';
    blowCooldown = false;
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopMicListening();
      } else {
        startMicListening();
      }
    });
  }


  const _origCelebrate = celebrateCakeComplete;

  function celebrateCakeComplete() {
    siteLogger.logAction('Задула все 19 свечей!');
    stopMicListening();
    soundEngine.playFanfare();
    fireworksEngine.launchGrandSalute();
    if (wishReveal) {
      wishReveal.classList.remove('hidden');
      wishReveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}


function initRoundVideos() {
  const grid = document.getElementById('video-bubbles-container');
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('active-round-video');
  const modalTitle = document.getElementById('video-modal-title');
  const modalDate = document.getElementById('video-modal-date');
  const closeBtn = document.getElementById('video-modal-close');
  const overlay = document.getElementById('video-modal-overlay');

  if (!grid) return;
  grid.innerHTML = '';

  roundVideosData.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'video-bubble-card';
    card.innerHTML = `
      <div class="bubble-circle">
        <div class="bubble-inner">
          <img src="${item.thumb || item.file}" alt="${item.title}">
          <div class="bubble-play-overlay">
            <svg class="svg-icon icon-lg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="bubble-title">${item.title}</div>
      <div class="bubble-date">${item.date}</div>
    `;

    card.addEventListener('click', () => {
      openVideo(item);
    });

    grid.appendChild(card);
  });

  function openVideo(item) {
    if (!modal || !modalVideo) return;
    modalVideo.src = item.file;
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modal.classList.remove('hidden');
    modalVideo.play().catch(e => console.log('Autoplay blocked:', e));
    soundEngine.stopMelody(); 
  }

  function closeVideo() {
    if (!modal || !modalVideo) return;
    modalVideo.pause();
    modalVideo.src = '';
    modal.classList.add('hidden');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeVideo);
  if (overlay) overlay.addEventListener('click', closeVideo);
}


function initPhotoGallery() {
  const grid = document.getElementById('photos-grid');
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-photo-img');
  const modalCaption = document.getElementById('modal-photo-caption');
  const closeBtn = document.getElementById('photo-modal-close');
  const overlay = document.getElementById('photo-modal-overlay');

  if (!grid) return;
  grid.innerHTML = '';

  selectedPhotos.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    const rotation = ((idx % 5) - 2) * 1.5;
    card.style.setProperty('--rotation', `${rotation}deg`);

    card.innerHTML = `
      <div class="polaroid-img-wrap">
        <img src="${item.src}" alt="Воспоминание" loading="lazy">
      </div>
      <div class="polaroid-caption">${item.caption}</div>
    `;

    card.addEventListener('click', () => {
      if (!modal || !modalImg) return;
      modalImg.src = item.src;
      modalCaption.textContent = item.caption;
      modal.classList.remove('hidden');
    });

    grid.appendChild(card);
  });

  function closePhoto() {
    if (!modal) return;
    modal.classList.add('hidden');
  }

  if (closeBtn) closeBtn.addEventListener('click', closePhoto);
  if (overlay) overlay.addEventListener('click', closePhoto);
}


function initVoiceMessages() {
  const grid = document.getElementById('voices-grid');
  if (!grid) return;
  grid.innerHTML = '';

  selectedVoices.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'voice-card';
    card.innerHTML = `
      <button class="voice-play-btn" title="Слушать">▶</button>
      <div class="voice-info">
        <div class="voice-title">${item.title}</div>
        <div class="voice-date">${item.date}</div>
        <div class="voice-wave-anim">
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
        </div>
      </div>
      <audio src="${item.file}" preload="none"></audio>
    `;

    const playBtn = card.querySelector('.voice-play-btn');
    const audio = card.querySelector('audio');

    playBtn.addEventListener('click', () => {
      if (state.currentVoiceAudio && state.currentVoiceAudio !== audio) {
        state.currentVoiceAudio.pause();
        state.currentVoiceAudio.currentTime = 0;
        if (state.currentVoiceCard) {
          state.currentVoiceCard.classList.remove('playing');
          state.currentVoiceCard.querySelector('.voice-play-btn').textContent = '▶';
        }
      }

      if (audio.paused) {
        audio.play().then(() => {
          card.classList.add('playing');
          playBtn.textContent = '⏸';
          state.currentVoiceAudio = audio;
          state.currentVoiceCard = card;
          soundEngine.stopMelody();
        }).catch(err => console.log('Audio error:', err));
      } else {
        audio.pause();
        card.classList.remove('playing');
        playBtn.textContent = '▶';
        state.currentVoiceAudio = null;
        state.currentVoiceCard = null;
      }
    });

    audio.addEventListener('ended', () => {
      card.classList.remove('playing');
      playBtn.textContent = '▶';
      state.currentVoiceAudio = null;
      state.currentVoiceCard = null;
    });

    grid.appendChild(card);
  });
}


function initQuiz() {
  const stepLabel = document.getElementById('quiz-step-label');
  const scoreLabel = document.getElementById('quiz-score-label');
  const questionText = document.getElementById('quiz-question-text');
  const optionsGrid = document.getElementById('quiz-options-container');
  const feedback = document.getElementById('quiz-feedback');
  const quizBox = document.getElementById('quiz-box');
  const resultCard = document.getElementById('quiz-result-card');
  const finalScore = document.getElementById('quiz-final-score');
  const retryBtn = document.getElementById('retry-quiz-btn');
  const progressFill = document.getElementById('quiz-progress-fill');

  state.quizCurrentStep = 0;
  state.quizScore = 0;

  if (resultCard) resultCard.classList.add('hidden');
  if (quizBox) quizBox.classList.remove('hidden');
  if (feedback) feedback.classList.add('hidden');

  function loadQuestion() {
    if (state.quizCurrentStep >= quizQuestions.length) {
      showResults();
      return;
    }

    const current = quizQuestions[state.quizCurrentStep];
    stepLabel.textContent = `Вопрос ${state.quizCurrentStep + 1} из ${quizQuestions.length}`;
    scoreLabel.textContent = `Очки: ${state.quizScore}`;
    questionText.textContent = current.q;
    optionsGrid.innerHTML = '';
    feedback.className = 'quiz-feedback hidden';
    feedback.textContent = '';

    const progress = ((state.quizCurrentStep + 1) / quizQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;

    current.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span>${opt.text}</span> <span class="opt-status"></span>`;

      btn.addEventListener('click', () => {
        handleOptionClick(btn, opt, current.explanation);
      });

      optionsGrid.appendChild(btn);
    });
  }

  function handleOptionClick(selectedBtn, option, explanation) {
    const allBtns = optionsGrid.querySelectorAll('.quiz-option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (option.correct) {
      selectedBtn.classList.add('correct');
      state.quizScore++;
      scoreLabel.textContent = `Очки: ${state.quizScore}`;
      feedback.className = 'quiz-feedback success';
      feedback.innerHTML = `<svg class="svg-icon" style="color: #10b981; margin-right: 4px;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> <strong>Правильно!</strong> ${explanation}`;
      soundEngine.playPop();
      fireworksEngine.launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 25);
    } else {
      selectedBtn.classList.add('wrong');
      feedback.className = 'quiz-feedback error';
      feedback.innerHTML = `<svg class="svg-icon" style="color: #ef4444; margin-right: 4px;" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> <strong>Не совсем!</strong> ${explanation}`;
    }

    feedback.classList.remove('hidden');

    setTimeout(() => {
      state.quizCurrentStep++;
      loadQuestion();
    }, 2200);
  }

  function showResults() {
    quizBox.classList.add('hidden');
    resultCard.classList.remove('hidden');
    finalScore.textContent = `Ты набрала ${state.quizScore} из ${quizQuestions.length} баллов!`;
    siteLogger.logAction(`Прошла тестик — ${state.quizScore} из ${quizQuestions.length}`);
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    soundEngine.playFanfare();
    fireworksEngine.launchGrandSalute();
  }

  retryBtn.addEventListener('click', () => {
    state.quizCurrentStep = 0;
    state.quizScore = 0;
    resultCard.classList.add('hidden');
    quizBox.classList.remove('hidden');
    quizBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    loadQuestion();
  });

  loadQuestion();
}


function initCompliments() {
  const btn = document.getElementById('gen-compliment-btn');
  const bubble = document.getElementById('compliment-text');
  let lastIdx = 0;

  if (!btn || !bubble) return;

  btn.addEventListener('click', (e) => {
    let nextIdx = Math.floor(Math.random() * complimentsList.length);
    if (nextIdx === lastIdx) nextIdx = (nextIdx + 1) % complimentsList.length;
    lastIdx = nextIdx;

    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(0.95)';

    setTimeout(() => {
      bubble.textContent = `«${complimentsList[nextIdx]}»`;
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1)';
    }, 200);

    soundEngine.playPop();
    const rect = btn.getBoundingClientRect();
    fireworksEngine.launchConfetti(rect.left + rect.width / 2, rect.top, 30);
  });
}


function initEnvelope() {
  const envelope = document.getElementById('envelope-trigger');
  const unfolded = document.getElementById('unfolded-letter');
  const closeBtn = document.getElementById('close-letter-btn');

  if (!envelope || !unfolded) return;

  envelope.addEventListener('click', () => {
    siteLogger.logAction('Открыла личное письмо');
    soundEngine.playPop();
    fireworksEngine.launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 50);
    envelope.style.display = 'none';
    unfolded.classList.remove('hidden');
    unfolded.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      unfolded.classList.add('hidden');
      envelope.style.display = 'block';
    });
  }
}

function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  const startBtn = document.getElementById('start-btn');
  const giftTrigger = document.getElementById('gift-trigger');
  const mainContent = document.getElementById('main-content');

  function openGift() {
    siteLogger.logAction('Открыла подарок (нажала кнопку)');
    soundEngine.playFanfare();
    fireworksEngine.launchGrandSalute();
    soundEngine.startMelody();

    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
      mainContent.classList.remove('hidden');
    }, 800);
  }

  if (startBtn) startBtn.addEventListener('click', openGift);
  if (giftTrigger) giftTrigger.addEventListener('click', openGift);
}


function initControls() {
  const musicBtn = document.getElementById('music-btn');
  const confettiBtn = document.getElementById('confetti-btn');

  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      soundEngine.toggleMelody();
    });
  }

  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      soundEngine.playPop();
      fireworksEngine.launchGrandSalute();
    });
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initStars();
  fireworksEngine.init();
  siteLogger.startSession();
  siteLogger.logAction('Открыла страницу поздравления');
  initIntro();
  initCake();
  initPhotoGallery();
  initQuiz();
  initCompliments();
  initEnvelope();
  initControls();
});
