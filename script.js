const CONFIG = {
  birthdayName: "Layla",
  birthdayDate: "2026.03.24",
  openingLine: "今晚，掌声只属于你",
  openingSubline: "这一场特别演出，为你开幕",
  storyLines: [
    "你把平凡日常，过成了有光的章节。",
    "愿你永远保留那份热爱，像剧场灯亮起时的第一束期待。",
    "愿未来每一次谢幕，都有人为你站起来鼓掌。",
    "愿你被认真偏爱，也愿你继续成为让世界变温柔的人。"
  ],
  finalTitle: "生日快乐",
  finalLine: "愿你的人生永远有灯光、有掌声、有热爱。",
  ticket: {
    no: "No. 20260324-07",
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
    { name: "今日寿星", avatar: "🌟", correct: true },
    { name: "邻座观众", avatar: "🎭", correct: false },
    { name: "幕后导演", avatar: "🎬", correct: false },
    { name: "返场嘉宾", avatar: "🎻", correct: false }
  ],
  wrongHints: ["这个人今天不是 C 位喔", "再选一次，主角只有一个", "差一点点，今晚主角另有其人"],
  music: {
    src: "",
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

const dom = {
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

  CONFIG.verifyOptions.forEach((item, idx) => {
    const btn = document.createElement("button");
    btn.className = "candidate-btn";
    btn.type = "button";
    btn.dataset.index = String(idx);
    const avatarMarkup = item.image
      ? `<span class="candidate-avatar"><img src="${item.image}" alt="${item.name}" /></span>`
      : `<span class="candidate-avatar">${item.avatar || "🎂"}</span>`;
    btn.innerHTML = `${avatarMarkup}<span class="candidate-name">${item.name}</span>`;
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

  dom.ticketCake.addEventListener("pointermove", (event) => {
    const rect = dom.ticketCake.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    dom.ticketCake.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  });

  dom.ticketCake.addEventListener("pointerleave", () => {
    dom.ticketCake.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

function pulseCake() {
  dom.ticketCake.classList.add("is-lit");
  sparkleBurst();
  fireworkState.burst(3);
  window.setTimeout(() => dom.ticketCake.classList.remove("is-lit"), 1200);
}

function sparkleBurst() {
  fireworkState.burst(2);
}

function createFireworksEngine() {
  const canvas = document.getElementById("fireworks-canvas");
  const ctx = canvas.getContext("2d");
  const particles = [];
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
    const baseColors = ["#ffd28d", "#f6a9a9", "#f5eac2", "#ffc0cb", "#f9b86f"];
    for (let j = 0; j < customCount; j += 1) {
      const x = window.innerWidth * (0.2 + Math.random() * 0.6);
      const y = window.innerHeight * (0.2 + Math.random() * 0.45);
      const num = 24 + Math.floor(Math.random() * 18);
      const color = baseColors[Math.floor(Math.random() * baseColors.length)];

      for (let i = 0; i < num; i += 1) {
        const angle = (Math.PI * 2 * i) / num;
        const speed = 0.7 + Math.random() * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1 + Math.random() * 2,
          life: 0,
          maxLife: 50 + Math.random() * 35,
          color
        });
      }
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
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);

  return {
    setMode(nextMode) {
      mode = nextMode;
    },
    burst
  };
}

const fireworkState = createFireworksEngine();

initContent();
setupInteractions();
runLoading();
