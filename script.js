const CONFIG = {
  birthdayName: "Layla",
  birthdayDate: "2026.03.25",
  openingLine: "今晚，掌声只属于你",
  openingSubline: "这一场特别演出，为你开幕",
  storyLines: [
    "愿你在 Pokopia 收集到 3 月限定宝可梦。",
    "愿你在西野们看上桑桑和三小只，愿桑桑冲向你的面前卖萌舔爪。",
    "愿你在 TypeHelp、福安饭、电视台......这些网页解密游戏永远玩不完。",
    "愿你今年可以在粤剧特朗普、大状王大吃特吃，愿今年在唐璜再见酱马可。"
  ],
  finalTitle: "生日快乐",
  finalLine: "愿接下来一年工作顺心，杂音退场，老登退散，麻烦绕路！",
  ticket: {
    no: "No. 20260325-01",
    season: "2026年春演出季",
    showTitle: "沉浸式人生音乐剧《幕已开启·愿望即将上演》",
    showSub: "All your wishes find their way to you.",
    place: "主剧场 Grand Theatre",
    section: "一楼观众厅 Stall",
    seat: "1排 1座",
    session: "19:30",
    type: "纪念票（非卖品）",
    message: "今晚唯一主角 · 请尽情闪耀"
  },
  verifyOptions: [
    { name: "今日寿星·Layla", avatar: "🌟", correct: true },
    { name: "邻座观众", avatar: "🎭", correct: false },
    { name: "幕后导演", avatar: "🎬", correct: false },
    { name: "返场嘉宾", avatar: "🎻", correct: false }
  ],
  wrongHints: ["这个人今天不是 C 位喔", "再选一次，主角只有一个", "差一点点，今晚主角另有其人"],
  music: {
    src: "Tim Minchin - When I Grow Up.m4a",
    autoplayAfterFirstTap: true
  }
};

const sceneIds = ["loading", "verify", "opening", "story", "entry", "cake", "finale"];
let currentScene = "loading";
let loadingDone = false;
let verified = false;
let storyIndex = 0;
let autoMusicTried = false;
let toastTimer = null;
let grandShowRunning = false;

const dom = {
  app: document.getElementById("app"),
  scenes: Object.fromEntries(sceneIds.map((id) => [id, document.getElementById(`scene-${id}`)])),
  loadingProgress: document.getElementById("loading-progress"),
  loadingText: document.getElementById("loading-text"),
  loadingTrack: document.querySelector(".loading-track"),
  candidateGrid: document.getElementById("candidate-grid"),
  verifyFeedback: document.getElementById("verify-feedback"),
  openingLine: document.getElementById("opening-line"),
  openingSubline: document.getElementById("opening-subline"),
  openToStory: document.getElementById("open-to-story"),
  storyCards: document.getElementById("story-cards"),
  storyPrev: document.getElementById("story-prev"),
  storyNext: document.getElementById("story-next"),
  storyIndicator: document.getElementById("story-indicator"),
  entryToCake: document.getElementById("entry-to-cake"),
  ticketCake: document.getElementById("ticket-cake"),
  cakeToFinale: document.getElementById("cake-to-finale"),
  ticketNo: document.getElementById("ticket-no"),
  ticketSeason: document.getElementById("ticket-season"),
  ticketShowTitle: document.getElementById("ticket-show-title"),
  ticketShowSub: document.getElementById("ticket-show-sub"),
  ticketName: document.getElementById("ticket-name"),
  ticketPlace: document.getElementById("ticket-place"),
  ticketSection: document.getElementById("ticket-section"),
  ticketDate: document.getElementById("ticket-date"),
  ticketSeat: document.getElementById("ticket-seat"),
  ticketSession: document.getElementById("ticket-session"),
  ticketType: document.getElementById("ticket-type"),
  ticketMessage: document.getElementById("ticket-message"),
  finalTitle: document.getElementById("final-title"),
  finalLine: document.getElementById("final-line"),
  restart: document.getElementById("restart"),
  musicToggle: document.getElementById("music-toggle"),
  bgm: document.getElementById("bgm"),
  toast: document.getElementById("toast")
};

function initContent() {
  dom.openingLine.textContent = CONFIG.openingLine;
  dom.openingSubline.textContent = CONFIG.openingSubline;

  dom.ticketNo.textContent = CONFIG.ticket.no;
  dom.ticketSeason.textContent = CONFIG.ticket.season;
  dom.ticketShowTitle.textContent = CONFIG.ticket.showTitle;
  dom.ticketShowSub.textContent = CONFIG.ticket.showSub;
  dom.ticketName.textContent = CONFIG.birthdayName;
  dom.ticketPlace.textContent = CONFIG.ticket.place;
  dom.ticketSection.textContent = CONFIG.ticket.section;
  dom.ticketDate.textContent = CONFIG.birthdayDate;
  dom.ticketSeat.textContent = CONFIG.ticket.seat;
  dom.ticketSession.textContent = CONFIG.ticket.session;
  dom.ticketType.textContent = CONFIG.ticket.type;
  dom.ticketMessage.textContent = CONFIG.ticket.message;

  dom.finalTitle.textContent = `${CONFIG.birthdayName}，${CONFIG.finalTitle}`;
  dom.finalLine.textContent = CONFIG.finalLine;

  if (CONFIG.music.src) {
    dom.bgm.src = CONFIG.music.src;
  }

  renderVerifyOptions();
  renderStoryCards();
}

function goScene(target) {
  if (!dom.scenes[target] || target === currentScene) return;
  dom.scenes[currentScene].classList.remove("active");
  dom.scenes[target].classList.add("active");
  currentScene = target;

  if (target === "opening") {
    dom.openToStory.classList.add("hidden");
    window.setTimeout(() => {
      dom.openToStory.classList.remove("hidden");
    }, 3200);
    fireworkState.setMode("opening");
  } else if (target === "cake") {
    fireworkState.setMode("cake");
    dom.scenes.cake.scrollTop = 0;
    pulseCake();
  } else if (target === "finale") {
    fireworkState.setMode("finale");
  } else {
    fireworkState.setMode("idle");
  }
}

function runLoading() {
  let progress = 0;
  const timer = window.setInterval(() => {
    progress += Math.max(2, Math.floor(Math.random() * 8));
    if (progress > 100) progress = 100;
    dom.loadingProgress.style.width = `${progress}%`;
    dom.loadingText.textContent = `舞台布景加载中 ${progress}%`;
    dom.loadingTrack.setAttribute("aria-valuenow", String(progress));

    if (progress >= 100) {
      window.clearInterval(timer);
      loadingDone = true;
      dom.loadingText.textContent = "舞台就绪，正在拉开帷幕...";
      window.setTimeout(() => goScene("verify"), 700);
    }
  }, 130);
}

function renderVerifyOptions() {
  dom.candidateGrid.innerHTML = "";
  dom.verifyFeedback.className = "verify-feedback";
  dom.verifyFeedback.textContent = " ";

  CONFIG.verifyOptions.slice(0, 4).forEach((item, idx) => {
    const btn = document.createElement("button");
    btn.className = "candidate-btn";
    btn.type = "button";
    btn.dataset.index = String(idx);
    const visualMarkup = item.image
      ? `<img class="candidate-image" src="${item.image}" alt="${item.name}" />`
      : `<span class="candidate-fallback">${item.avatar || "🎂"}</span>`;
    btn.innerHTML = `${visualMarkup}<span class="candidate-overlay"></span><span class="candidate-name">${item.name}</span>`;
    btn.addEventListener("click", () => handleVerifyClick(btn, item));
    dom.candidateGrid.appendChild(btn);
  });
}

function handleVerifyClick(button, item) {
  if (verified || !loadingDone) return;

  maybeAutoplayMusic();

  if (item.correct) {
    verified = true;
    button.classList.add("is-hit");
    dom.verifyFeedback.className = "verify-feedback success";
    dom.verifyFeedback.textContent = "验证通过，今晚的主角已确认。欢迎进入专属生日剧场。";
    sparkleBurst();
    window.setTimeout(() => goScene("opening"), 1100);
    return;
  }

  button.classList.add("is-miss");
  window.setTimeout(() => button.classList.remove("is-miss"), 360);
  dom.verifyFeedback.className = "verify-feedback error";
  dom.verifyFeedback.textContent = CONFIG.wrongHints[Math.floor(Math.random() * CONFIG.wrongHints.length)];
}

function renderStoryCards() {
  dom.storyCards.innerHTML = "";
  CONFIG.storyLines.forEach((line, i) => {
    const card = document.createElement("article");
    card.className = "story-card";
    card.innerHTML = `<p class="story-index">SCENE ${String(i + 1).padStart(2, "0")}</p><p class="story-line">${line}</p>`;
    dom.storyCards.appendChild(card);
  });
  updateStoryCard();
}

function updateStoryCard() {
  const cards = dom.storyCards.querySelectorAll(".story-card");
  cards.forEach((card, i) => card.classList.toggle("active", i === storyIndex));

  dom.storyPrev.disabled = storyIndex === 0;
  dom.storyPrev.style.opacity = storyIndex === 0 ? "0.4" : "1";

  if (storyIndex === cards.length - 1) {
    dom.storyNext.textContent = "前往彩蛋";
  } else {
    dom.storyNext.textContent = "下一幕";
  }

  dom.storyIndicator.textContent = `${storyIndex + 1} / ${cards.length}`;
}

function showToast(text) {
  dom.toast.textContent = text;
  dom.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => dom.toast.classList.remove("show"), 1500);
}

function maybeAutoplayMusic() {
  if (autoMusicTried || !CONFIG.music.autoplayAfterFirstTap) return;
  autoMusicTried = true;
  if (!CONFIG.music.src) return;
  dom.bgm.play().then(() => {
    dom.musicToggle.classList.add("is-on");
  }).catch(() => {
    dom.musicToggle.classList.remove("is-on");
  });
}

function toggleMusic() {
  if (!CONFIG.music.src) {
    showToast("未配置背景音乐，可在 script.js 的 CONFIG.music.src 中设置");
    return;
  }

  if (dom.bgm.paused) {
    dom.bgm.play().then(() => {
      dom.musicToggle.classList.add("is-on");
    }).catch(() => {
      showToast("浏览器限制了自动播放，请再次点击");
    });
  } else {
    dom.bgm.pause();
    dom.musicToggle.classList.remove("is-on");
  }
}

function setupInteractions() {
  dom.openToStory.addEventListener("click", () => {
    goScene("story");
  });

  dom.storyPrev.addEventListener("click", () => {
    storyIndex = Math.max(0, storyIndex - 1);
    updateStoryCard();
  });

  dom.storyNext.addEventListener("click", () => {
    const total = CONFIG.storyLines.length;
    if (storyIndex < total - 1) {
      storyIndex += 1;
      updateStoryCard();
      return;
    }
    goScene("entry");
  });

  dom.entryToCake.addEventListener("click", () => goScene("cake"));
  dom.cakeToFinale.addEventListener("click", () => goScene("finale"));

  dom.restart.addEventListener("click", () => {
    storyIndex = 0;
    verified = false;
    renderVerifyOptions();
    updateStoryCard();
    dom.ticketCake.classList.remove("is-lit");
    goScene("verify");
  });

  dom.musicToggle.addEventListener("click", toggleMusic);

  dom.ticketCake.addEventListener("click", pulseCake);
  dom.ticketCake.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pulseCake();
    }
  });

  const enableTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (enableTilt) {
    dom.ticketCake.addEventListener("pointermove", (event) => {
      const rect = dom.ticketCake.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      dom.ticketCake.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
      dom.ticketCake.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
      dom.ticketCake.style.setProperty("--gloss-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      dom.ticketCake.style.setProperty("--gloss-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });

    dom.ticketCake.addEventListener("pointerleave", () => {
      dom.ticketCake.style.setProperty("--tilt-x", "0deg");
      dom.ticketCake.style.setProperty("--tilt-y", "0deg");
      dom.ticketCake.style.setProperty("--gloss-x", "24%");
      dom.ticketCake.style.setProperty("--gloss-y", "12%");
    });
  }
}

function pulseCake() {
  dom.ticketCake.classList.add("is-lit");
  sparkleBurst();
  runGrandFireworksShow();
  window.setTimeout(() => dom.ticketCake.classList.remove("is-lit"), 1200);
}

function sparkleBurst() {
  fireworkState.burst(2);
}

function runGrandFireworksShow() {
  if (grandShowRunning) return;
  grandShowRunning = true;
  dom.app.classList.add("fireworks-front");

  const waves = [
    {
      delay: 0,
      shots: [
        [0.22, 0.42, 1.3],
        [0.78, 0.42, 1.3],
        [0.5, 0.34, 1.8]
      ]
    },
    {
      delay: 280,
      shots: [
        [0.15, 0.3, 1.4],
        [0.85, 0.3, 1.4],
        [0.33, 0.25, 1.2],
        [0.67, 0.25, 1.2]
      ]
    },
    {
      delay: 620,
      shots: [
        [0.1, 0.46, 1.35],
        [0.9, 0.46, 1.35],
        [0.5, 0.2, 2.1]
      ]
    },
    {
      delay: 980,
      shots: [
        [0.25, 0.22, 1.45],
        [0.5, 0.18, 1.85],
        [0.75, 0.22, 1.45]
      ]
    },
    {
      delay: 1360,
      shots: [
        [0.2, 0.38, 1.25],
        [0.4, 0.28, 1.25],
        [0.6, 0.28, 1.25],
        [0.8, 0.38, 1.25],
        [0.5, 0.24, 2.2]
      ]
    },
    {
      delay: 1780,
      shots: [
        [0.14, 0.2, 1.55],
        [0.86, 0.2, 1.55],
        [0.32, 0.43, 1.25],
        [0.68, 0.43, 1.25]
      ]
    }
  ];

  waves.forEach((wave) => {
    window.setTimeout(() => {
      wave.shots.forEach(([xRate, yRate, intensity]) => {
        fireworkState.burstAt(window.innerWidth * xRate, window.innerHeight * yRate, intensity);
      });
    }, wave.delay);
  });

  window.setTimeout(() => {
    grandShowRunning = false;
    dom.app.classList.remove("fireworks-front");
  }, 2600);
}

function createFireworksEngine() {
  const canvas = document.getElementById("fireworks-canvas");
  const ctx = canvas.getContext("2d");
  const particles = [];
  const baseColors = [
    "#ff4d6d",
    "#ff7f50",
    "#ffb703",
    "#ffd60a",
    "#00bbf9",
    "#4cc9f0",
    "#80ed99",
    "#9b5de5",
    "#f15bb5"
  ];
  let lastTs = 0;
  let mode = "idle";
  let autoTimer = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(customCount = 1) {
    for (let j = 0; j < customCount; j += 1) {
      const x = window.innerWidth * (0.2 + Math.random() * 0.6);
      const y = window.innerHeight * (0.2 + Math.random() * 0.45);
      spawnExplosion(x, y, 1);
    }
  }

  function spawnExplosion(x, y, intensity = 1) {
    const num = Math.floor((24 + Math.random() * 18) * intensity);

    for (let i = 0; i < num; i += 1) {
      const angle = (Math.PI * 2 * i) / num;
      const speed = 0.65 + Math.random() * (1.8 + intensity);
      const color = baseColors[Math.floor(Math.random() * baseColors.length)];
      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * (2.1 + intensity * 0.2),
        life: 0,
        maxLife: 48 + Math.random() * (34 + intensity * 12),
        color
      });
    }
  }

  function burstAt(x, y, intensity = 1.2) {
    const groups = intensity >= 1.9 ? 2 : 1;
    for (let i = 0; i < groups; i += 1) {
      spawnExplosion(x, y, intensity);
    }
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 16.67, 1.8);
    lastTs = ts;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (mode === "opening" || mode === "cake" || mode === "finale") {
      autoTimer += dt;
      const limit = mode === "cake" ? 20 : 34;
      if (autoTimer > limit) {
        autoTimer = 0;
        burst(mode === "cake" ? 2 : 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.035 * dt;
      p.vx *= 0.994;
      p.vy *= 0.994;

      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);

  return {
    setMode(nextMode) {
      mode = nextMode;
    },
    burst,
    burstAt
  };
}

const fireworkState = createFireworksEngine();

initContent();
setupInteractions();
runLoading();
