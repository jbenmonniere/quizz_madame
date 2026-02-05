(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const store = window.DataStore || (() => {
    const STORAGE = {
      activeClass: "tc_active_class",
      classState: "tc_class_state",
      teacherContent: "tc_teacher_content",
      profile: "tc_profile",
      classes: "tc_classes"
    };
    const safeParse = (raw, fallback) => {
      try {
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    };
    const get = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
    const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const defaultClassState = { calendar: {}, progress: {}, assignments: {}, settings: {}, xp: null };
    const defaultTeacherContent = { bank: [], quizzes: [], subjects: {}, rewards: null };
    let activeClass = get(STORAGE.activeClass, null);
    let classState = get(STORAGE.classState, {});
    let teacherContent = get(STORAGE.teacherContent, defaultTeacherContent);
    let classes = get(STORAGE.classes, []);
    let profile = get(STORAGE.profile, { id: "local-user", username: "Locale" });

    const ensureClassState = (id) => {
      if (!classState[id]) classState[id] = { ...defaultClassState };
      return classState[id];
    };
    const ensureLocalClass = () => {
      if (!classes.length) {
        const local = { id: "local-class", name: "Classe locale", level: "", created_at: new Date().toISOString() };
        classes = [local];
        activeClass = local.id;
        ensureClassState(local.id);
        set(STORAGE.classes, classes);
        set(STORAGE.activeClass, activeClass);
      }
    };
    const authSession = { user: { id: "local-user" } };
    return {
      mode: "local-fallback",
      auth: {
        signIn: async () => ({ data: { session: authSession }, error: null }),
        signUp: async () => ({ data: { session: authSession }, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: authSession }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      getProfile: async () => profile,
      listClasses: async () => {
        ensureLocalClass();
        return classes;
      },
      createClass: async ({ name, level }) => {
        ensureLocalClass();
        const next = { id: `local_${Date.now()}`, name, level: level || "", created_at: new Date().toISOString() };
        classes = [next, ...classes];
        set(STORAGE.classes, classes);
        return { data: next, error: null };
      },
      loadTeacherContent: async () => teacherContent,
      loadClassState: async (id) => {
        ensureClassState(id);
        return classState[id];
      },
      getActiveClassId: () => activeClass,
      setActiveClass: (id) => {
        activeClass = id;
        set(STORAGE.activeClass, activeClass);
      },
      getCalendarScores: () => ensureClassState(activeClass).calendar,
      setCalendarScores: (data) => {
        ensureClassState(activeClass).calendar = data;
        set(STORAGE.classState, classState);
      },
      getProgressMap: () => ensureClassState(activeClass).progress,
      setProgressMap: (data) => {
        ensureClassState(activeClass).progress = data;
        set(STORAGE.classState, classState);
      },
      getAssignments: () => ensureClassState(activeClass).assignments,
      setAssignments: (data) => {
        ensureClassState(activeClass).assignments = data;
        set(STORAGE.classState, classState);
      },
      getSettings: () => ensureClassState(activeClass).settings,
      setSettings: (data) => {
        ensureClassState(activeClass).settings = data;
        set(STORAGE.classState, classState);
      },
      getXp: () => ensureClassState(activeClass).xp,
      setXp: (data) => {
        ensureClassState(activeClass).xp = data;
        set(STORAGE.classState, classState);
      },
      getBank: () => teacherContent.bank,
      setBank: (data) => {
        teacherContent = { ...teacherContent, bank: data };
        set(STORAGE.teacherContent, teacherContent);
      },
      getQuizzes: () => teacherContent.quizzes,
      setQuizzes: (data) => {
        teacherContent = { ...teacherContent, quizzes: data };
        set(STORAGE.teacherContent, teacherContent);
      },
      getRewards: () => teacherContent.rewards,
      setRewards: (data) => {
        teacherContent = { ...teacherContent, rewards: data };
        set(STORAGE.teacherContent, teacherContent);
      },
      getSubjects: () => teacherContent.subjects,
      setSubjects: (data) => {
        teacherContent = { ...teacherContent, subjects: data };
        set(STORAGE.teacherContent, teacherContent);
      }
    };
  })();

  const MAX_ROUNDS = 5;
  const SPIN_DURATION = 4500;
  const SPIN_TURNS = 15;
  const XP_BASE = 200;
  const XP_STEP = 50;
  const DEFAULT_SETTINGS = {
    questionTime: 30,
    totalTime: MAX_ROUNDS * 30
  };

  const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

  const wheelPalette = [
    "#b9f3d1",
    "#ffb6d5",
    "#a9d8ff",
    "#ffd2a6",
    "#cbbcff",
    "#ffe39a",
    "#bfe6ff",
    "#ffd9f1",
    "#c6f7d4",
    "#ffe7b3",
    "#b8d4ff",
    "#f9c6d3"
  ];

  const confettiColors = ["#ffb6d5", "#a9d8ff", "#b9f3d1", "#ffe39a", "#ffd2a6", "#cbbcff"];

  const BASE_SUBJECTS = {
    "Francais": ["Lecture", "Ecriture", "Grammaire"],
    "Mathematique": ["Nombre", "Operations", "Geometrie/mesure"],
    "Univers social": ["General"],
    "Science et technologie": ["General"]
  };

  const questionBank = {
    science: [
      { text: "Quel organe pompe le sang dans le corps humain ?", choices: ["Le foie", "Le coeur", "Le poumon", "Le cerveau"], answer: 1 },
      { text: "Quelle planète est la plus proche du Soleil ?", choices: ["Mercure", "Venus", "Mars", "Saturne"], answer: 0 },
      { text: "L'eau bout a quelle temperature (au niveau de la mer) ?", choices: ["50°C", "100°C", "150°C", "200°C"], answer: 1 },
      { text: "Quelle force nous maintient au sol ?", choices: ["Magnetisme", "Gravite", "Inertie", "Pression"], answer: 1 },
      { text: "Quel gaz respire-t-on principalement ?", choices: ["Oxygene", "Azote", "Hydrogene", "Helium"], answer: 1 }
    ],
    arts: [
      { text: "Quel est le nom de l'instrument avec 88 touches ?", choices: ["Violoncelle", "Piano", "Flute", "Tambour"], answer: 1 },
      { text: "Quel art utilise de la peinture sur toile ?", choices: ["Sculpture", "Peinture", "Danse", "Cinema"], answer: 1 },
      { text: "Dans un theatre, comment appelle-t-on les coulisses ?", choices: ["La scene", "Les loges", "Les coulisses", "La salle"], answer: 2 },
      { text: "Quel est un style musical ?", choices: ["Jazz", "Triangle", "Montagne", "Voiture"], answer: 0 },
      { text: "Lequel est un art visuel ?", choices: ["Photographie", "Basket", "Cuisine", "Natation"], answer: 0 }
    ],
    geo: [
      { text: "Quelle est la capitale de la France ?", choices: ["Lyon", "Paris", "Marseille", "Nice"], answer: 1 },
      { text: "Quel continent est le plus vaste ?", choices: ["Afrique", "Europe", "Asie", "Oceanie"], answer: 2 },
      { text: "Dans quel ocean se trouve Madagascar ?", choices: ["Atlantique", "Indien", "Arctique", "Pacifique"], answer: 1 },
      { text: "Quelle chaine de montagnes est en Europe ?", choices: ["Andes", "Himalaya", "Alpes", "Rocheuses"], answer: 2 },
      { text: "Quel pays est surnomme le pays du soleil levant ?", choices: ["Canada", "Japon", "Espagne", "Bresil"], answer: 1 }
    ],
    sports: [
      { text: "Combien de joueurs dans une equipe de football sur le terrain ?", choices: ["9", "10", "11", "12"], answer: 2 },
      { text: "Quel sport se joue avec une raquette ?", choices: ["Tennis", "Football", "Basket", "Rugby"], answer: 0 },
      { text: "Quel est un sport olympique ?", choices: ["Natation", "Dominos", "Echecs", "Quilles"], answer: 0 },
      { text: "En basket, combien vaut un panier classique ?", choices: ["1 point", "2 points", "3 points", "4 points"], answer: 1 },
      { text: "Dans quel sport utilise-t-on un gant et une balle blanche ?", choices: ["Baseball", "Golf", "Hockey", "Volley"], answer: 0 }
    ],
    histoire: [
      { text: "Les pyramides d'Egypte sont tres...", choices: ["recentes", "anciennes", "nouvelles", "futures"], answer: 1 },
      { text: "Qui etait le premier president des Etats-Unis ?", choices: ["Lincoln", "Washington", "Jefferson", "Adams"], answer: 1 },
      { text: "Quelle epoque vient avant le Moyen Age ?", choices: ["Antiquite", "Renaissance", "Moderne", "Contemporaine"], answer: 0 },
      { text: "Quelle civilisation a construit le Colisee ?", choices: ["Grecque", "Romaine", "Viking", "Maya"], answer: 1 },
      { text: "Quel evenement marque 1789 en France ?", choices: ["La Revolution", "La Decouverte de l'Amerique", "La Premiere Guerre", "La Construction de la Tour Eiffel"], answer: 0 }
    ],
    logique: [
      { text: "Quel nombre complete la suite : 2, 4, 6, 8, ... ?", choices: ["9", "10", "12", "14"], answer: 1 },
      { text: "Si tu as 3 pommes et que tu en prends 2, combien t'en reste-t-il ?", choices: ["1", "2", "3", "5"], answer: 0 },
      { text: "Quel mot est l'intrus ?", choices: ["Chien", "Chat", "Pomme", "Lapin"], answer: 2 },
      { text: "Combien de jours y a-t-il dans une semaine ?", choices: ["5", "6", "7", "8"], answer: 2 },
      { text: "Quelle forme a 4 cotes egaux ?", choices: ["Triangle", "Carre", "Cercle", "Ovale"], answer: 1 }
    ]
  };

  const state = {
    month: null,
    selectedDate: null,
    rotation: 0,
    spinning: false,
    awaitingAnswer: false,
    currentCategory: null,
    currentQuestion: null,
    questionTimerId: null,
    globalTimerId: null,
    questionDeadline: null,
    globalDeadline: null,
    waitingNext: false,
    nextStepTimeoutId: null,
    sessionXp: 0,
    wheelCategories: [],
    xpTransferKey: null,
    pendingLevelUp: null,
    selectedDatePoint: null,
    user: null,
    profile: null,
    classes: [],
    activeClass: null,
    authMode: "login",
    selectedRewardLevel: 1,
    rewardsFilter: "all"
  };

  const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const dateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const getCalendarScores = () => store.getCalendarScores();
  const setCalendarScores = (data) => store.setCalendarScores(data);
  const getProgressMap = () => store.getProgressMap();
  const setProgressMap = (data) => store.setProgressMap(data);
  const getQuizzes = () => store.getQuizzes();
  const setQuizzes = (data) => store.setQuizzes(data);
  const getAssignments = () => store.getAssignments();
  const setAssignments = (data) => store.setAssignments(data);
  const getSettings = () => ({ ...DEFAULT_SETTINGS, ...store.getSettings() });
  const setSettings = (data) => store.setSettings(data);
  const getBank = () => store.getBank();
  const setBank = (data) => store.setBank(data);
  const getXpState = () => {
    const stored = store.getXp?.();
    const safe = stored && typeof stored === "object" ? stored : {};
    const level = Math.max(1, Number(safe.level) || 1);
    const max = XP_BASE + (level - 1) * XP_STEP;
    const current = Math.max(0, Math.min(max, Number(safe.current) || 0));
    return {
      level,
      current,
      max,
      total: Math.max(0, Number(safe.total) || 0)
    };
  };
  const setXpState = (data) => {
    if (store.setXp) {
      store.setXp(data);
    }
  };

  const MAX_LEVEL = 100;
  const DEFAULT_REWARD = {
    enabled: false,
    type: "badge",
    rewardText: "",
    special: false,
    message: "",
    theme: "",
    skill: "",
    objective: "",
    audio: ""
  };

  const buildRewardsConfig = (raw) => {
    const levels = {};
    const source = raw?.levels || raw || {};
    for (let i = 1; i <= MAX_LEVEL; i += 1) {
      const entry = source[i] || source[String(i)] || {};
      levels[i] = { ...DEFAULT_REWARD, ...entry };
    }
    return { levels };
  };

  const getRewardsConfig = () => {
    if (!store.getRewards || !store.setRewards) return buildRewardsConfig({});
    const raw = store.getRewards();
    const normalized = buildRewardsConfig(raw);
    const hasLevels = raw?.levels && Object.keys(raw.levels).length >= MAX_LEVEL;
    if (!hasLevels) {
      store.setRewards(normalized);
    }
    return normalized;
  };

  const updateRewardLevel = (level, updates) => {
    if (!store.setRewards) return;
    const config = getRewardsConfig();
    config.levels[level] = { ...DEFAULT_REWARD, ...config.levels[level], ...updates };
    store.setRewards(config);
  };

  const totalXpToReachLevel = (targetLevel) => {
    let total = 0;
    for (let lvl = 1; lvl < targetLevel; lvl += 1) {
      total += XP_BASE + (lvl - 1) * XP_STEP;
    }
    return total;
  };

  const computeXpGain = (question) => {
    const base = 70 + Math.floor(Math.random() * 31);
    const rawStars = Number.isFinite(question?.difficulty) ? question.difficulty : Number(question?.difficulty);
    const stars = Number.isFinite(rawStars) ? rawStars : 0;
    const multiplier = 1 + stars / 10;
    return Math.round(base * multiplier);
  };

  const shouldDeferLevelUp = () => {
    if (document.body.dataset.screen !== "game") return false;
    const progress = getProgress(state.selectedDate);
    if (!progress) return false;
    return progress.spinsDone < MAX_ROUNDS;
  };

  const triggerBalloonImpact = (balloon) => {
    if (!balloon) return;
    balloon.classList.remove("pulse");
    void balloon.offsetWidth;
    balloon.classList.add("pulse");
    const impact = document.createElement("div");
    impact.className = "xp-impact";
    balloon.appendChild(impact);
    setTimeout(() => impact.remove(), 600);
  };

  const triggerBalloonExplosion = (balloon) => {
    if (!balloon) return;
    balloon.classList.remove("explode");
    void balloon.offsetWidth;
    balloon.classList.add("explode");
    const burst = document.createElement("div");
    burst.className = "xp-burst";
    balloon.appendChild(burst);
    setTimeout(() => burst.remove(), 800);
  };

  const triggerLevelUpSequence = (level) => {
    const balloon = getVisibleXpBalloon();
    triggerBalloonExplosion(balloon);
    setTimeout(() => showLevelUp(level), 650);
  };

  const awardXp = (amount) => {
    if (!amount) return getXpState();
    const xp = getXpState();
    let level = xp.level;
    let current = xp.current + amount;
    let total = xp.total + amount;
    let max = xp.max;
    let leveledUp = false;

    while (current >= max) {
      current -= max;
      level += 1;
      max = XP_BASE + (level - 1) * XP_STEP;
      leveledUp = true;
    }

    const next = { level, current, total };
    setXpState(next);
    if (leveledUp) {
      if (shouldDeferLevelUp()) {
        state.pendingLevelUp = Math.max(state.pendingLevelUp || 0, level);
      } else {
        triggerLevelUpSequence(level);
      }
    }
    return { ...next, max };
  };

  const showLevelUp = (level) => {
    const modal = $("#levelUpModal");
    const value = $("#levelUpValue");
    const rewardEl = $("#levelUpReward");
    const metaEl = $("#levelUpMeta");
    if (value) value.textContent = `Niveau ${level}`;
    const rewards = getRewardsConfig();
    const reward = rewards.levels[level] || DEFAULT_REWARD;
    if (rewardEl) {
      if (reward.enabled) {
        const typeLabel = {
          badge: "Badge",
          message: "Message",
          animation: "Animation",
          privilege: "Privilege"
        }[reward.type] || "Recompense";
        const text = reward.rewardText || reward.message || "";
        rewardEl.textContent = reward.special
          ? `Recompense speciale · ${typeLabel}${text ? ` : ${text}` : ""}`
          : `${typeLabel}${text ? ` : ${text}` : ""}`;
      } else {
        rewardEl.textContent = "";
      }
    }
    if (metaEl) {
      const meta = [reward.theme, reward.skill, reward.objective].filter(Boolean).join(" · ");
      metaEl.textContent = meta;
    }
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  const hideLevelUp = () => {
    const modal = $("#levelUpModal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  const formatClock = (totalSeconds) => {
    const safe = Math.max(0, Number(totalSeconds) || 0);
    const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
    const seconds = String(Math.floor(safe % 60)).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const setQuestionPill = (seconds) => {
    const pill = $("#questionTimerPill");
    if (pill) pill.textContent = `Question: ${formatClock(seconds)}`;
  };

  const setTotalPill = (seconds) => {
    const pill = $("#totalTimerPill");
    if (pill) pill.textContent = `Total: ${formatClock(seconds)}`;
  };

  const setAppMode = (mode) => {
    document.body.dataset.appMode = mode;
  };

  const setAuthMode = (mode) => {
    state.authMode = mode;
    document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.authPanel === mode);
    });
    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.authTab === mode);
    });
    setAuthMessage("");
  };

  const setAuthMessage = (text) => {
    const message = $("#authMessage");
    if (message) message.textContent = text || "";
  };

  const setClassMessage = (text) => {
    const message = $("#classMessage");
    if (message) message.textContent = text || "";
  };

  const formatAuthError = (error) => {
    if (!error) return "Une erreur est survenue.";
    const message = error.message || String(error);
    if (/already registered|User already registered/i.test(message)) {
      return "Ce nom existe deja. Essaie de te connecter.";
    }
    if (/invalid email/i.test(message)) {
      return "Nom d'utilisateur invalide. Utilise des lettres ou chiffres.";
    }
    if (/password/i.test(message) && /6|characters|length/i.test(message)) {
      return "Mot de passe trop court (minimum 6 caracteres).";
    }
    if (/rate limit exceeded/i.test(message)) {
      return "Trop d'essais en peu de temps. Attends un moment puis reessaie.";
    }
    if (/email.*not confirmed/i.test(message)) {
      return "Compte cree. Confirme l'email dans Supabase ou desactive la confirmation.";
    }
    return message;
  };

  const isValidUsername = (value) => {
    if (!value) return false;
    if (value.includes("@")) return false;
    return /^[a-zA-Z0-9._-]{3,}$/u.test(value);
  };

  const updateHeaderMeta = () => {
    const userLabel = $("#activeUserLabel");
    const classLabel = $("#activeClassLabel");
    const switchBtn = $("#switchClassBtn");
    const logoutBtn = $("#logoutBtn");
    const title = $("#appTitle");

    if (userLabel) {
      userLabel.textContent = state.profile?.username
        ? `Compte: ${state.profile.username}`
        : "";
    }
    if (title) {
      const username = state.profile?.username;
      title.textContent = username ? `Quiz de ${username}` : "Quiz de Mme Cryshtale";
    }
    if (classLabel) {
      if (state.activeClass) {
        classLabel.textContent = state.activeClass.level
          ? `${state.activeClass.name} · ${state.activeClass.level}`
          : state.activeClass.name;
      } else {
        classLabel.textContent = "";
      }
    }
    const showActions = Boolean(state.user);
    if (switchBtn) switchBtn.style.display = showActions ? "inline-flex" : "none";
    if (logoutBtn) logoutBtn.style.display = showActions ? "inline-flex" : "none";
  };

  const refreshAll = () => {
    if (!state.activeClass) return;
    refreshWheel();
    renderCalendar();
    renderDayPanel();
    renderXpPanels();
    updateHeader();
    renderProgressDots();
    renderBankList();
    refreshSubjectSelects();
    renderDifficultyFilter();
    renderQuizBankDifficultyFilter();
    renderSelectedQuestions();
    renderQuizBankList();
    renderQuizList();
    renderQuizSelect();
    renderAssignmentsList();
    renderWeeklyStats();
    renderSettings();
    renderRewardsPanel();
    initQuestionTooltip();
  };

  const setNavActive = (screen, teacherTab = "builder") => {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      const target = btn.dataset.nav;
      const isActive = screen === "calendar" ? target === "calendar" : target === teacherTab;
      btn.classList.toggle("active", isActive);
    });
  };

  const setTeacherTab = (name) => {
    document.querySelectorAll("[data-teacher-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.teacherPanel === name);
    });
    document.querySelectorAll("[data-teacher-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.teacherTab === name);
    });
    setNavActive("teacher", name);
    if (name === "questions") {
      renderBankList();
    }
    if (name === "quizz") {
      renderQuizList();
      renderQuizBankList();
      renderSelectedQuestions();
    }
    if (name === "rewards") {
      renderRewardsPanel();
    }
  };

  const getSelectContainer = (id) => document.querySelector(`[data-select="${id}"]`);

  const setSelectValue = (id, value, label, emit = true) => {
    const input = document.getElementById(id);
    const container = getSelectContainer(id);
    if (!input || !container) return;
    const valueSpan = container.querySelector(".select-value");
    input.value = value;
    if (valueSpan) {
      const placeholder = valueSpan.dataset.placeholder || "";
      if (!value) {
        valueSpan.textContent = placeholder;
        valueSpan.classList.add("placeholder");
      } else {
        valueSpan.textContent = label || value;
        valueSpan.classList.remove("placeholder");
      }
    }
    const menu = container.querySelector(".select-menu");
    if (menu) {
      menu.querySelectorAll(".select-option").forEach((opt) => {
        opt.classList.toggle("selected", opt.dataset.value === value);
      });
    }
    if (emit) {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const updateSelectOptions = (id, options, config = {}) => {
    const container = getSelectContainer(id);
    const input = document.getElementById(id);
    if (!container || !input) return;
    const menu = container.querySelector(".select-menu");
    if (!menu) return;
    const items = [];
    if (config.includeAll) {
      items.push({ value: "all", label: config.allLabel || "Tous" });
    }
    options.forEach((opt) => {
      if (typeof opt === "string") {
        items.push({ value: opt, label: opt });
        return;
      }
      if (opt && typeof opt === "object") {
        items.push({ value: String(opt.value), label: opt.label || String(opt.value) });
      }
    });
    menu.innerHTML = items
      .map((item) => `<button type="button" class="select-option" data-value="${item.value}">${item.label}</button>`)
      .join("");

    const allowed = new Set(items.map((i) => i.value));
    let nextValue = input.value || "";
    if (!allowed.has(nextValue)) {
      nextValue = config.defaultValue ?? (config.includeAll ? "all" : "");
    }
    const label = items.find((i) => i.value === nextValue)?.label || "";
    setSelectValue(id, nextValue, label, false);
  };

  const closeSelect = (container) => {
    if (!container || !container.classList.contains("open")) return;
    container.classList.remove("open");
    container.classList.add("closing");
    const trigger = container.querySelector(".select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    setTimeout(() => container.classList.remove("closing"), 200);
  };

  const openSelect = (container) => {
    if (!container) return;
    container.classList.add("open");
    container.classList.remove("closing");
    const trigger = container.querySelector(".select-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  };

  const closeAllSelects = () => {
    document.querySelectorAll(".select.open").forEach((container) => closeSelect(container));
  };

  const launchConfetti = () => {
    const layer = $("#confettiLayer");
    if (!layer) return;
    layer.innerHTML = "";
    const count = 46;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("div");
      const size = 14 + Math.random() * 16;
      const isCircle = Math.random() > 0.65;
      const left = Math.random() * 100;
      const drift = (Math.random() * 120 - 60).toFixed(1);
      const spin = (Math.random() * 720 + 360).toFixed(0);
      const delay = (Math.random() * 0.2).toFixed(2);
      const duration = (2.2 + Math.random() * 0.8).toFixed(2);

      piece.className = "confetti";
      piece.style.left = `${left}%`;
      piece.style.width = `${size}px`;
      piece.style.height = `${Math.max(8, size * 0.6)}px`;
      piece.style.background = confettiColors[i % confettiColors.length];
      piece.style.borderRadius = isCircle ? "999px" : "6px";
      piece.style.setProperty("--drift", `${drift}px`);
      piece.style.setProperty("--spin", `${spin}deg`);
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;
      frag.appendChild(piece);
    }

    layer.appendChild(frag);
    setTimeout(() => {
      layer.innerHTML = "";
    }, 3200);
  };

  const getVisibleXpBalloon = () => {
    const panels = $$("[data-xp-panel]");
    if (!panels.length) return null;
    let panel = panels.find((item) => item.closest(".finish-banner")?.classList.contains("show"));
    if (!panel) {
      panel = panels.find((item) => item.offsetParent !== null) || panels[0];
    }
    return panel ? panel.querySelector(".xp-balloon") : null;
  };

  const getXpTransferSource = () => {
    const selectedDay = document.querySelector(".day.selected");
    if (selectedDay) {
      const rect = selectedDay.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return selectedDay;
    }
    const dayTitle = $("#dayTitle");
    if (dayTitle && dayTitle.getBoundingClientRect().width > 0) return dayTitle;
    return $("#activeDateLabel") || $("#dayTitle");
  };

  const launchXpTransfer = ({ duration = 3500, onComplete, startPoint } = {}) => {
    const fallback = startPoint || state.selectedDatePoint;
    const source = fallback ? null : getXpTransferSource();
    const target = getVisibleXpBalloon();
    const layer = $("#xpTransferLayer");
    const startRect = source ? source.getBoundingClientRect() : null;
    if (!target || !layer || (!startRect && !fallback)) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const endRect = target.getBoundingClientRect();
    const startX = startRect && startRect.width && startRect.height
      ? startRect.left + startRect.width / 2
      : (fallback?.x ?? endRect.left);
    const startY = startRect && startRect.width && startRect.height
      ? startRect.top + startRect.height / 2
      : (fallback?.y ?? endRect.top);
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    const pieces = [];
    const orb = document.createElement("div");
    orb.className = "xp-orb";
    orb.style.left = `${startX}px`;
    orb.style.top = `${startY}px`;
    layer.appendChild(orb);
    pieces.push({ el: orb, size: 1.1 });

    const confettiCount = 16;
    for (let i = 0; i < confettiCount; i += 1) {
      const piece = document.createElement("div");
      piece.className = "xp-confetti";
      const size = 6 + Math.random() * 8;
      piece.style.width = `${size}px`;
      piece.style.height = `${Math.max(4, size * 0.6)}px`;
      piece.style.background =
        Math.random() > 0.5 ? "#ff3b3b" : "#ff6a6a";
      piece.style.left = `${startX}px`;
      piece.style.top = `${startY}px`;
      layer.appendChild(piece);
      pieces.push({ el: piece, size: 0.8 + Math.random() * 0.4 });
    }

    let completed = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (typeof onComplete === "function") onComplete();
    };

    pieces.forEach((item) => {
      const { el, size } = item;
      const driftX = (Math.random() * 180 - 90);
      const driftY = -(80 + Math.random() * 120);
      const midX = (startX + endX) / 2 + driftX;
      const midY = Math.min(startY, endY) + driftY;
      const rotate = Math.random() * 360;
      const anim = el.animate(
        [
          { transform: `translate(-50%, -50%) scale(${size})`, opacity: 1 },
          {
            transform: `translate(${midX - startX}px, ${midY - startY}px) rotate(${rotate}deg) scale(${size * 0.9})`,
            opacity: 0.9
          },
          {
            transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${rotate * 1.8}deg) scale(${size * 0.6})`,
            opacity: 0
          }
        ],
        {
          duration,
          delay: 0,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "forwards"
        }
      );
      anim.onfinish = () => {
        el.remove();
        completed += 1;
        if (completed === pieces.length) finish();
      };
    });

    setTimeout(finish, duration + 80);
  };

  const playWrongX = () => {
    const x = $("#wrongX");
    if (!x) return;
    x.classList.remove("show");
    void x.offsetWidth;
    x.classList.add("show");
    setTimeout(() => x.classList.remove("show"), 750);
  };

  const getProgress = (key) => {
    const map = getProgressMap();
    return map[key] || null;
  };

  const setProgress = (key, progress) => {
    const map = getProgressMap();
    if (progress) {
      map[key] = progress;
    } else {
      delete map[key];
    }
    setProgressMap(map);
  };

  const isToday = (key) => key === dateKey(new Date());

  const getQuizById = (id) => getQuizzes().find((quiz) => quiz.id === id) || null;

  const getAssignedQuizId = (key) => {
    const assignments = getAssignments();
    return assignments[key] || null;
  };

  const getAssignedQuiz = (key) => {
    const quizId = getAssignedQuizId(key);
    return quizId ? getQuizById(quizId) : null;
  };

  const draftQuiz = {
    title: "",
    questions: []
  };
  let editingQuestionId = null;
  let editingQuizId = null;
  const QUIZ_BANK_PAGE = 10;
  let quizBankVisibleCount = QUIZ_BANK_PAGE;
  const QUIZ_LIST_PAGE = 5;
  let quizListVisibleCount = QUIZ_LIST_PAGE;

  const stopQuestionTimer = () => {
    if (state.questionTimerId) {
      clearInterval(state.questionTimerId);
      state.questionTimerId = null;
    }
    state.questionDeadline = null;
  };

  const stopGlobalTimer = () => {
    if (state.globalTimerId) {
      clearInterval(state.globalTimerId);
      state.globalTimerId = null;
    }
    state.globalDeadline = null;
  };

  const stopAllTimers = () => {
    stopQuestionTimer();
    stopGlobalTimer();
  };

  const clearNextStep = () => {
    if (state.nextStepTimeoutId) {
      clearTimeout(state.nextStepTimeoutId);
      state.nextStepTimeoutId = null;
    }
    state.waitingNext = false;
  };

  const startGlobalTimer = () => {
    stopGlobalTimer();
    const settings = getSettings();
    const totalSeconds = Number(settings.totalTime) || DEFAULT_SETTINGS.totalTime;
    state.globalDeadline = Date.now() + totalSeconds * 1000;
    setTotalPill(totalSeconds);

    state.globalTimerId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((state.globalDeadline - Date.now()) / 1000));
      setTotalPill(remaining);
      if (remaining <= 0) {
        stopGlobalTimer();
        handleGlobalTimeout();
      }
    }, 250);
  };

  const startQuestionTimer = () => {
    stopQuestionTimer();
    const settings = getSettings();
    const questionSeconds = Number(settings.questionTime) || DEFAULT_SETTINGS.questionTime;
    state.questionDeadline = Date.now() + questionSeconds * 1000;
    setQuestionPill(questionSeconds);

    state.questionTimerId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((state.questionDeadline - Date.now()) / 1000));
      setQuestionPill(remaining);
      if (remaining <= 0) {
        stopQuestionTimer();
        handleAnswer(null, true);
      }
    }, 250);
  };

  const showScreen = (name) => {
    let target = name;
    if (["calendar", "game", "teacher"].includes(target) && !state.activeClass) {
      target = state.user ? "classes" : "auth";
    }
    document.body.dataset.screen = target;
    $$(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.dataset.screen === target);
    });
    if (target === "auth") {
      setAppMode("auth");
      stopAllTimers();
      clearNextStep();
      return;
    }
    if (target === "classes") {
      setAppMode("classes");
      stopAllTimers();
      clearNextStep();
      return;
    }
    setAppMode("app");
    if (target === "calendar") {
      setNavActive("calendar");
      stopAllTimers();
      clearNextStep();
      updateHeader();
      renderCalendar();
      renderDayPanel();
    }
    if (target === "game") {
      setNavActive("calendar");
    }
    if (target === "teacher") {
      stopAllTimers();
      clearNextStep();
    }
  };

  const buildWheelLabels = () => {
    const labels = $("#wheelLabels");
    if (!labels) return;
    labels.innerHTML = "";
    const wheelCategories = state.wheelCategories || [];
    if (!wheelCategories.length) return;
    const segment = 360 / wheelCategories.length;
    wheelCategories.forEach((cat, idx) => {
      const label = document.createElement("div");
      label.className = "wheel-label";
      const angle = -90 + idx * segment;
      label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(var(--label-radius) * -1)) rotate(${-angle}deg)`;
      label.textContent = cat.name;
      labels.appendChild(label);
    });
  };

  const renderWheelSlices = () => {
    const svg = $("#wheelSvg");
    if (!svg) return;
    svg.innerHTML = "";
    const wheelCategories = state.wheelCategories || [];
    if (!wheelCategories.length) return;
    const cx = 50;
    const cy = 50;
    const r = 48;
    const segment = 360 / wheelCategories.length;
    const startOffset = -90 - segment / 2;

    const polarToCartesian = (angleDeg) => {
      const rad = (angleDeg * Math.PI) / 180;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad)
      };
    };

    wheelCategories.forEach((cat, idx) => {
      const startAngle = startOffset + idx * segment;
      const endAngle = startAngle + segment;
      const start = polarToCartesian(startAngle);
      const end = polarToCartesian(endAngle);
      const largeArc = segment > 180 ? 1 : 0;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
      );
      path.setAttribute("class", "slice");
      path.setAttribute("fill", cat.color);
      svg.appendChild(path);
    });
  };

  const renderWeekdays = () => {
    const wrap = $("#calendarWeekdays");
    if (!wrap || wrap.childElementCount) return;
    weekdays.forEach((day) => {
      const el = document.createElement("div");
      el.className = "weekday";
      el.textContent = day;
      wrap.appendChild(el);
    });
  };

  const renderCalendar = () => {
    const grid = $("#calendarGrid");
    if (!grid) return;
    grid.innerHTML = "";
    renderWeekdays();

    const month = state.month;
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const scores = getCalendarScores();
    const assignments = getAssignments();

    for (let i = 0; i < startOffset; i += 1) {
      const blank = document.createElement("div");
      blank.className = "day blank";
      grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, monthIndex, day);
      const key = dateKey(date);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day";
      btn.dataset.date = key;
      if (key === state.selectedDate) btn.classList.add("selected");
      if (isToday(key)) btn.classList.add("today");
      if (scores[key]) btn.classList.add("done");
      const assignedQuizId = assignments[key];
      btn.innerHTML = `
        <div class="day-number">${day}</div>
        ${assignedQuizId ? "<div class=\"day-quiz\">Quiz</div>" : ""}
        ${scores[key] ? `<div class="day-score">${scores[key].score}/${MAX_ROUNDS}</div>` : ""}
        <span class="day-play" data-action="start-day" title="Commencer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        </span>
      `;
      btn.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest(".day-play")) {
          event.stopPropagation();
          selectDate(key);
          handleDayCta();
          return;
        }
        selectDate(key);
      });
      grid.appendChild(btn);
    }

    const monthLabel = $("#monthLabel");
    if (monthLabel) {
      monthLabel.textContent = month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }

    const selected = document.querySelector(".day.selected");
    if (selected) {
      const rect = selected.getBoundingClientRect();
      state.selectedDatePoint = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  };

  const updateHeader = () => {
    const label = $("#activeDateLabel");
    if (!label) return;
    const date = parseDateKey(state.selectedDate);
    label.textContent = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const renderDayPanel = () => {
    const dayTitle = $("#dayTitle");
    const dayStatus = $("#dayStatus");
    const dayQuizInfo = $("#dayQuizInfo");
    const dayScore = $("#dayScore");
    if (!dayTitle) return;

    const date = parseDateKey(state.selectedDate);
    const scores = getCalendarScores();
    const scoreEntry = scores[state.selectedDate];
    const progress = getProgress(state.selectedDate);
    const assignedQuiz = getAssignedQuiz(state.selectedDate);

    dayTitle.textContent = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    if (dayStatus && dayScore && dayQuizInfo) {
      if (scoreEntry) {
        dayStatus.textContent = "Defi termine";
        dayScore.textContent = `Note: ${scoreEntry.score}/${MAX_ROUNDS}`;
      } else if (progress) {
        dayStatus.textContent = "Defi en cours";
        dayScore.textContent = `Score provisoire: ${progress.correct}/${MAX_ROUNDS}`;
      } else {
        dayStatus.textContent = "Defi du jour";
        dayScore.textContent = "Aucune note encore";
      }

      if (assignedQuiz) {
        dayQuizInfo.textContent = `Quiz attribue: ${assignedQuiz.title} (${assignedQuiz.questions.length} questions)`;
      } else {
        dayQuizInfo.textContent = "Aucun quiz attribue: mode categories aleatoires.";
      }
    }
  };

  const getLevelStatus = (level, currentLevel) => {
    if (level < currentLevel) return "completed";
    if (level === currentLevel) return "active";
    return "locked";
  };

  const renderRewardsGlobal = () => {
    const bar = $(".rewards-global-bar");
    const text = $("#rewardsGlobalText");
    if (!bar || !text) return;
    const xp = getXpState();
    const totalRequired = totalXpToReachLevel(MAX_LEVEL);
    const progress = totalRequired ? Math.min(1, xp.total / totalRequired) : 0;
    bar.style.setProperty("--xp-progress", `${Math.round(progress * 100)}%`);
    text.textContent = `${xp.total} / ${totalRequired} EXP`;
  };

  const renderRewardsGrid = () => {
    const grid = $("#rewardsGrid");
    if (!grid) return;
    const rewards = getRewardsConfig();
    const currentLevel = getXpState().level;
    const filter = state.rewardsFilter || "all";
    grid.innerHTML = "";
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      const reward = rewards.levels[level];
      const status = getLevelStatus(level, currentLevel);
      if (filter === "unlocked" && status === "locked") continue;
      if (filter === "locked" && status !== "locked") continue;
      if (filter === "reward" && !reward.enabled) continue;
      if (filter === "special" && !reward.special) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `reward-tile ${status}${reward.enabled ? " has-reward" : ""}${reward.special ? " special" : ""}`;
      btn.dataset.level = String(level);
      btn.textContent = level;
      if (level === state.selectedRewardLevel) {
        btn.classList.add("selected");
      }
      grid.appendChild(btn);
    }
  };

  const renderRewardsEditor = () => {
    const rewards = getRewardsConfig();
    const currentLevel = getXpState().level;
    const level = state.selectedRewardLevel || currentLevel;
    const reward = rewards.levels[level] || DEFAULT_REWARD;
    const status = getLevelStatus(level, currentLevel);

    const levelLabel = $("#rewardsLevelLabel");
    const statusLabel = $("#rewardsStatusLabel");
    if (levelLabel) levelLabel.textContent = `Niveau ${level}`;
    if (statusLabel) {
      statusLabel.textContent = status === "completed" ? "Complete" : status === "active" ? "En cours" : "Verrouille";
    }

    const enabled = $("#rewardsEnabled");
    const type = $("#rewardsType");
    const text = $("#rewardsText");
    const special = $("#rewardsSpecial");
    const message = $("#rewardsMessage");
    const theme = $("#rewardsTheme");
    const skill = $("#rewardsSkill");
    const objective = $("#rewardsObjective");
    const audio = $("#rewardsAudio");

    if (enabled) enabled.checked = reward.enabled;
    if (type) type.value = reward.type;
    if (text) text.value = reward.rewardText || "";
    if (special) special.checked = reward.special;
    if (message) message.value = reward.message || "";
    if (theme) theme.value = reward.theme || "";
    if (skill) skill.value = reward.skill || "";
    if (objective) objective.value = reward.objective || "";
    if (audio) audio.value = reward.audio || "";

    renderRewardsPreview(level, reward);
  };

  const renderRewardsPreview = (level, reward) => {
    const previewLevel = $("#rewardsPreviewLevel");
    const previewReward = $("#rewardsPreviewReward");
    const previewMeta = $("#rewardsPreviewMeta");
    if (previewLevel) previewLevel.textContent = `Niveau ${level}`;
    if (previewReward) {
      if (reward.enabled) {
        const typeLabel = {
          badge: "Badge",
          message: "Message",
          animation: "Animation",
          privilege: "Privilege"
        }[reward.type] || "Recompense";
        const text = reward.rewardText || reward.message || "";
        previewReward.textContent = reward.special
          ? `Recompense speciale · ${typeLabel}${text ? ` : ${text}` : ""}`
          : `${typeLabel}${text ? ` : ${text}` : ""}`;
      } else {
        previewReward.textContent = "Aucune recompense active.";
      }
    }
    if (previewMeta) {
      const meta = [reward.theme, reward.skill, reward.objective].filter(Boolean).join(" · ");
      previewMeta.textContent = meta;
    }
  };

  const renderRewardsPanel = () => {
    const filterSelect = $("#rewardsFilter");
    if (filterSelect) filterSelect.value = state.rewardsFilter;
    renderRewardsGlobal();
    renderRewardsGrid();
    renderRewardsEditor();
  };

  const renderClassList = () => {
    const list = $("#classList");
    if (!list) return;
    list.innerHTML = "";
    if (!state.classes.length) {
      list.innerHTML = "<div class=\"note\">Aucune classe pour le moment.</div>";
      return;
    }
    state.classes.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "class-item";
      const level = entry.level ? `<div class="class-meta">Niveau: ${entry.level}</div>` : "";
      item.innerHTML = `
        <div>
          <strong>${entry.name}</strong>
          ${level}
        </div>
        <button class="secondary" type="button" data-action="open-class" data-id="${entry.id}">Ouvrir</button>
      `;
      list.appendChild(item);
    });
  };

  const loadClasses = async () => {
    const data = await store.listClasses?.();
    state.classes = Array.isArray(data) ? data : [];
    renderClassList();
  };

  const openClass = async (classId) => {
    if (!classId) return;
    const match = state.classes.find((item) => item.id === classId);
    state.activeClass = match || { id: classId, name: "Classe" };
    store.setActiveClass?.(classId);
    await store.loadClassState?.(classId);
    const today = new Date();
    state.month = new Date(today.getFullYear(), today.getMonth(), 1);
    state.selectedDate = dateKey(today);
    state.selectedRewardLevel = getXpState().level;
    state.sessionXp = 0;
    state.xpTransferKey = null;
    updateHeaderMeta();
    refreshAll();
    showScreen("calendar");
  };

  const handleLogin = async () => {
    const username = $("#loginUsername")?.value.trim();
    const password = $("#loginPassword")?.value;
    if (!username || !password) {
      setAuthMessage("Entre un nom d'utilisateur et un mot de passe.");
      return;
    }
    if (!isValidUsername(username)) {
      setAuthMessage("Nom d'utilisateur invalide (pas d'email, min 3 caracteres).");
      return;
    }
    setAuthMessage("Connexion...");
    const { data, error } = await store.auth.signIn(username, password);
    if (error) {
      setAuthMessage(formatAuthError(error));
      return;
    }
    const user = data?.user || data?.session?.user;
    if (!user) {
      setAuthMessage("Connexion impossible. Verifie la confirmation email dans Supabase.");
      return;
    }
    await handleSignedIn(user, username);
  };

  const handleSignup = async () => {
    const username = $("#signupUsername")?.value.trim();
    const password = $("#signupPassword")?.value;
    if (!username || !password) {
      setAuthMessage("Entre un nom d'utilisateur et un mot de passe.");
      return;
    }
    if (!isValidUsername(username)) {
      setAuthMessage("Nom d'utilisateur invalide (pas d'email, min 3 caracteres).");
      return;
    }
    setAuthMessage("Creation du compte...");
    const { data, error } = await store.auth.signUp(username, password);
    if (error) {
      setAuthMessage(formatAuthError(error));
      return;
    }
    const user = data?.user || data?.session?.user;
    if (!user) {
      setAuthMessage("Compte cree. Confirme l'email dans Supabase ou desactive la confirmation.");
      return;
    }
    await handleSignedIn(user, username);
  };

  const handleLogout = async () => {
    await store.auth.signOut();
    state.user = null;
    state.profile = null;
    state.classes = [];
    state.activeClass = null;
    updateHeaderMeta();
    setAuthMode("login");
    showScreen("auth");
  };

  const handleCreateClass = async () => {
    const name = $("#classNameInput")?.value.trim();
    const level = $("#classLevelInput")?.value.trim();
    if (!name) {
      setClassMessage("Ajoute un nom de classe.");
      return;
    }
    setClassMessage("Creation...");
    const { data, error } = await store.createClass({ name, level });
    if (error) {
      setClassMessage(error.message || "Impossible de creer la classe.");
      return;
    }
    $("#classNameInput").value = "";
    $("#classLevelInput").value = "";
    setClassMessage("Classe creee.");
    state.classes = [data, ...state.classes];
    renderClassList();
    await openClass(data.id);
  };

  const handleSignedIn = async (user, fallbackUsername) => {
    if (!user) return;
    setAuthMessage("");
    state.user = user;
    const profile = await store.getProfile?.(fallbackUsername);
    state.profile = profile || (fallbackUsername ? { username: fallbackUsername } : null);
    updateHeaderMeta();
    updateHeaderMeta();
    await store.loadTeacherContent?.();
    await loadClasses();
    const preferred = store.getActiveClassId?.();
    if (preferred && state.classes.some((item) => item.id === preferred)) {
      await openClass(preferred);
      return;
    }
    if (state.classes.length === 1) {
      await openClass(state.classes[0].id);
      return;
    }
    showScreen("classes");
  };

  const bootstrapAuth = async () => {
    const session = await store.auth.getSession();
    const user = session?.data?.session?.user;
    if (user) {
      await handleSignedIn(user);
      return;
    }
    setAuthMode("login");
    showScreen("auth");
  };

  let authListenerReady = false;
  const attachAuthListener = () => {
    if (authListenerReady || !store.auth?.onAuthStateChange) return;
    authListenerReady = true;
    store.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        state.user = null;
        state.profile = null;
        state.classes = [];
        state.activeClass = null;
        updateHeaderMeta();
        setAuthMode("login");
        showScreen("auth");
        return;
      }
      if (session?.user) {
        if (state.user?.id === session.user.id) return;
        handleSignedIn(session.user);
      }
    });
  };

  const renderXpPanels = (sessionGain = 0) => {
    const panels = $$("[data-xp-panel]");
    if (!panels.length) return;
    const xp = getXpState();
    const ratio = xp.max ? xp.current / xp.max : 0;
    const clamped = Math.max(0, Math.min(1, ratio));
    const inflate = 0.75 + clamped * 0.45;
    const gainValue = Number(sessionGain) || 0;

    panels.forEach((panel) => {
      panel.style.setProperty("--xp-inflate", inflate.toFixed(2));
      panel.style.setProperty("--xp-progress", `${Math.round(clamped * 100)}%`);
      const textEl = panel.querySelector("[data-xp-text]");
      if (textEl) {
        textEl.textContent = `${xp.current} EXP / ${xp.max} EXP`;
      }
      const barText = panel.querySelector("[data-xp-bar-text]");
      if (barText) {
        barText.textContent = `${xp.current} / ${xp.max}`;
      }
      const levelEl = panel.querySelector("[data-xp-level]");
      if (levelEl) {
        levelEl.textContent = `Niveau ${xp.level}`;
      }
      const gainEl = panel.querySelector("[data-xp-gain]");
      if (gainEl) {
        gainEl.textContent = `${gainValue >= 0 ? "+" : ""}${gainValue} EXP`;
      }
    });
  };

  const getIsoWeekInfo = (date) => {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return { year: temp.getFullYear(), week: weekNumber };
  };

  const renderWeeklyStats = () => {
    const list = $("#weeklyStats");
    if (!list) return;
    const scores = getCalendarScores();
    const groups = {};
    let totalScore = 0;
    let totalCount = 0;

    Object.entries(scores).forEach(([key, entry]) => {
      const date = parseDateKey(key);
      const { year, week } = getIsoWeekInfo(date);
      const groupKey = `${year}-S${String(week).padStart(2, "0")}`;
      if (!groups[groupKey]) {
        groups[groupKey] = { year, week, total: 0, count: 0 };
      }
      groups[groupKey].total += entry.score;
      groups[groupKey].count += 1;
      totalScore += entry.score;
      totalCount += 1;
    });

    const entries = Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.week - a.week;
    });

    list.innerHTML = "";
    if (!entries.length) {
      list.innerHTML = "<div class=\"note\">Aucune note encore.</div>";
      return;
    }

    const overall = document.createElement("div");
    overall.className = "assignment-item";
    const overallAvg = (totalScore / totalCount).toFixed(1);
    overall.innerHTML = `
      <strong>Moyenne generale</strong>
      <div>${overallAvg}/${MAX_ROUNDS} sur ${totalCount} jours</div>
    `;
    list.appendChild(overall);

    entries.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "assignment-item";
      const avg = (entry.total / entry.count).toFixed(1);
      item.innerHTML = `
        <strong>Semaine ${String(entry.week).padStart(2, "0")} - ${entry.year}</strong>
        <div>Moyenne: ${avg}/${MAX_ROUNDS} · ${entry.count} jour(s)</div>
      `;
      list.appendChild(item);
    });
  };

  const renderSettings = () => {
    const settings = getSettings();
    const questionInput = $("#questionTimeInput");
    const totalInput = $("#totalTimeInput");
    if (questionInput) questionInput.value = settings.questionTime;
    if (totalInput) totalInput.value = settings.totalTime;
  };

  const handleSaveSettings = () => {
    const questionValue = Number($("#questionTimeInput").value) || DEFAULT_SETTINGS.questionTime;
    const totalValue = Number($("#totalTimeInput").value) || DEFAULT_SETTINGS.totalTime;
    const questionTime = Math.min(Math.max(questionValue, 5), 120);
    const totalTime = Math.min(Math.max(totalValue, 30), 900);
    setSettings({ questionTime, totalTime });
    renderSettings();
    setTeacherMessage("Temps enregistres. Appliques aux prochaines parties.");
  };

  const setTeacherMessage = (text) => {
    const message = $("#teacherMessage");
    if (message) message.textContent = text || "";
    const quizMessage = $("#quizMessage");
    if (quizMessage) quizMessage.textContent = text || "";
  };

  const setSubjectModalMessage = (text) => {
    const message = $("#subjectModalMessage");
    if (message) message.textContent = text || "";
  };

  const renderBankList = () => {
    const list = $("#bankList");
    if (!list) return;
    const bank = getBank();
    const subjectFilter = $("#quizSubjectFilter")?.value || "all";
    const subthemeFilter = $("#quizSubthemeFilter")?.value || "all";
    const difficultyFilter = $("#quizDifficultyFilter")?.value || "all";
    const filtered = bank.filter((q) => {
      const subjectOk = subjectFilter === "all" || q.subject === subjectFilter;
      const subthemeOk = subthemeFilter === "all" || q.subtheme === subthemeFilter;
      const difficultyValue = Number.isFinite(q.difficulty) ? q.difficulty : 0;
      const difficultyOk =
        difficultyFilter === "all" || Math.abs(difficultyValue - Number(difficultyFilter)) < 0.01;
      return subjectOk && subthemeOk && difficultyOk;
    });
    list.innerHTML = "";
    if (!bank.length) {
      list.innerHTML = "<div class=\"note\">Aucune question dans la banque.</div>";
      return;
    }
    if (!filtered.length) {
      list.innerHTML = "<div class=\"note\">Aucune question pour ce filtre.</div>";
      return;
    }
    filtered.forEach((q) => {
      const item = document.createElement("div");
      item.className = "question-item";
      const rating = Number.isFinite(q.difficulty) ? q.difficulty : 0;
      item.innerHTML = `
        <div class="question-left">
          <strong title="${q.question}">${q.question}</strong>
        </div>
        <div class="question-right">
          <div class="question-inline">
            <div class="rating" data-id="${q.id}" style="--rating:${rating}">
              <div class="stars" aria-hidden="true">
                <span class="stars-base">★★★★★</span>
                <span class="stars-fill">★★★★★</span>
              </div>
              <input type="range" min="0" max="5" step="0.5" value="${rating}" aria-label="Difficulte" />
            </div>
            <span class="pill">${q.subtheme}</span>
            <span class="pill">${q.subject}</span>
            <div class="question-actions">
              <button class="icon-button" data-action="edit-question" data-id="${q.id}" aria-label="Modifier">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm17.71-10.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.85 1.85 3.75 3.75 1.99-1.69z"/>
                </svg>
              </button>
              <button class="icon-button danger" data-action="remove-bank" data-id="${q.id}" aria-label="Supprimer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  };

  const renderQuizBankList = () => {
    const list = $("#quizBankList");
    if (!list) return;
    const bank = getBank();
    const subjectFilter = $("#quizBankSubjectFilter")?.value || "all";
    const subthemeFilter = $("#quizBankSubthemeFilter")?.value || "all";
    const difficultyFilter = $("#quizBankDifficultyFilter")?.value || "all";
    const searchValue = ($("#quizBankSearchInput")?.value || "").trim().toLowerCase();
    list.innerHTML = "";
    const filtered = bank.filter((q) => {
      const subjectOk = subjectFilter === "all" || q.subject === subjectFilter;
      const subthemeOk = subthemeFilter === "all" || q.subtheme === subthemeFilter;
      const difficultyValue = Number.isFinite(q.difficulty) ? q.difficulty : 0;
      const difficultyOk =
        difficultyFilter === "all" || Math.abs(difficultyValue - Number(difficultyFilter)) < 0.01;
      const haystack = `${q.question} ${q.subject} ${q.subtheme}`.toLowerCase();
      const searchOk = !searchValue || haystack.includes(searchValue);
      return subjectOk && subthemeOk && difficultyOk && searchOk;
    });
    const visible = filtered.slice(0, quizBankVisibleCount);
    const moreWrap = $("#quizBankMore");
    const moreBtn = $("#quizBankMoreBtn");
    if (!filtered.length) {
      list.innerHTML = "<div class=\"note\">Aucune question dans la banque.</div>";
      if (moreWrap) moreWrap.style.display = "none";
      return;
    }
    if (moreWrap) {
      if (filtered.length > visible.length) {
        moreWrap.style.display = "flex";
        if (moreBtn) moreBtn.textContent = `Voir plus (${filtered.length - visible.length})`;
      } else {
        moreWrap.style.display = "none";
      }
    }
    visible.forEach((q) => {
      const item = document.createElement("div");
      const already = draftQuiz.questions.some((dq) => dq.id === q.id);
      item.className = `question-item${already ? " in-quiz" : ""}`;
      item.draggable = true;
      item.dataset.id = q.id;
      item.dataset.source = "bank";
      item.dataset.full = q.question;
      const rating = Number.isFinite(q.difficulty) ? q.difficulty : 0;
      item.innerHTML = `
        <div class="question-left">
          <strong title="${q.question}">${q.question}</strong>
        </div>
        <div class="question-right">
          <div class="question-inline">
            <div class="rating read-only" style="--rating:${rating}">
              <div class="stars" aria-hidden="true">
                <span class="stars-base">★★★★★</span>
                <span class="stars-fill">★★★★★</span>
              </div>
              <input type="range" min="0" max="5" step="0.5" value="${rating}" aria-label="Difficulte" disabled />
            </div>
            <span class="pill">${q.subtheme}</span>
            <span class="pill">${q.subject}</span>
            <span class="icon-placeholder" aria-hidden="true"></span>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  };

  const resetQuizBankVisible = () => {
    quizBankVisibleCount = QUIZ_BANK_PAGE;
  };

  const getAssignedDateForQuiz = (quizId) => {
    const assignments = getAssignments();
    return Object.keys(assignments).find((dateKeyValue) => assignments[dateKeyValue] === quizId) || "";
  };

  const renderQuizList = () => {
    const list = $("#quizList");
    if (!list) return;
    const searchValue = ($("#quizSearchInput")?.value || "").trim().toLowerCase();
    const all = getQuizzes().filter((quiz) => {
      if (!searchValue) return true;
      const assignedDate = getAssignedDateForQuiz(quiz.id);
      const dateLabel = assignedDate ? parseDateKey(assignedDate).toLocaleDateString("fr-FR") : "";
      const haystack = `${quiz.title} ${dateLabel}`.toLowerCase();
      return haystack.includes(searchValue);
    });
    const visible = all.slice(0, quizListVisibleCount);
    const moreWrap = $("#quizMore");
    const moreBtn = $("#quizMoreBtn");
    list.innerHTML = "";
    if (!all.length) {
      list.innerHTML = "<div class=\"note\">Aucun quiz cree pour le moment.</div>";
      if (moreWrap) moreWrap.style.display = "none";
      return;
    }
    if (moreWrap) {
      if (all.length > visible.length) {
        moreWrap.style.display = "flex";
        if (moreBtn) moreBtn.textContent = `Voir plus (${all.length - visible.length})`;
      } else {
        moreWrap.style.display = "none";
      }
    }
    visible.forEach((quiz) => {
      const item = document.createElement("div");
      item.className = "quiz-item compact";
      const assignedDate = getAssignedDateForQuiz(quiz.id);
      const dateLabel = assignedDate ? parseDateKey(assignedDate).toLocaleDateString("fr-FR") : "Non attribue";
      item.innerHTML = `
        <strong>${quiz.title}</strong>
        <div class="quiz-meta">${quiz.questions.length} question(s) · Date: ${dateLabel}</div>
        <div class="quiz-actions">
          <button class="icon-button" data-action="edit-quiz" data-id="${quiz.id}" aria-label="Modifier">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm17.71-10.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.85 1.85 3.75 3.75 1.99-1.69z"/>
            </svg>
          </button>
          <button class="icon-button danger" data-action="remove-quiz" data-id="${quiz.id}" aria-label="Supprimer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
            </svg>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  };

  const resetQuizListVisible = () => {
    quizListVisibleCount = QUIZ_LIST_PAGE;
  };

  const handleQuizDragStart = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest(".question-item");
    if (!item || !item.dataset.id || !item.dataset.source) return;
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", `${item.dataset.source}|${item.dataset.id}`);
      event.dataTransfer.setDragImage(item, 20, 20);
      event.dataTransfer.effectAllowed = "move";
    }
    item.classList.add("dragging");
  };

  const handleQuizDragEnd = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest(".question-item");
    if (item) item.classList.remove("dragging");
  };

  const handleQuizDrop = (event, targetList) => {
    event.preventDefault();
    const data = event.dataTransfer?.getData("text/plain") || "";
    const [source, id] = data.split("|");
    if (!id || !source) return;
    if (targetList === "selected" && source !== "selected") {
      handleAddToQuiz(id);
    }
    if (targetList === "bank" && source === "selected") {
      handleRemoveFromQuiz(id);
    }
  };

  const initQuestionTooltip = () => {
    const bankList = $("#quizBankList");
    if (!bankList) return;
    if ($("#questionTooltip")) return;
    const tooltip = document.createElement("div");
    tooltip.id = "questionTooltip";
    tooltip.className = "question-tooltip";
    document.body.appendChild(tooltip);

    let activeItem = null;
    bankList.addEventListener("mousemove", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const item = target.closest(".question-item");
      if (!item || !bankList.contains(item)) {
        tooltip.classList.remove("show");
        activeItem = null;
        return;
      }
      const text = item.dataset.full || "";
      if (!text) {
        tooltip.classList.remove("show");
        activeItem = null;
        return;
      }
      tooltip.textContent = text;
      if (activeItem !== item) {
        activeItem = item;
        tooltip.classList.add("show");
      }
      const offset = 16;
      const x = event.clientX + offset;
      const y = event.clientY + offset;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    });

    bankList.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
      activeItem = null;
    });
  };

  const getStoredSubjects = () => store.getSubjects?.() || {};

  const getSubjectsMap = () => {
    const merged = {};
    Object.entries(BASE_SUBJECTS).forEach(([subject, subthemes]) => {
      merged[subject] = [...subthemes];
    });
    const custom = getStoredSubjects();
    Object.entries(custom).forEach(([subject, subthemes]) => {
      if (!merged[subject]) merged[subject] = [];
      const set = new Set(merged[subject]);
      (subthemes || []).forEach((item) => set.add(item));
      merged[subject] = Array.from(set);
    });
    return merged;
  };

  const getSubjectList = () => {
    const custom = getStoredSubjects();
    const baseList = Object.keys(BASE_SUBJECTS);
    const customList = Object.keys(custom).filter((subject) => !baseList.includes(subject));
    return [...baseList, ...customList];
  };

  const getWheelCategories = () => {
    const subjects = getSubjectList();
    return subjects.map((subject, idx) => ({
      id: subject,
      name: subject,
      color: wheelPalette[idx % wheelPalette.length]
    }));
  };

  const refreshWheel = () => {
    state.wheelCategories = getWheelCategories();
    renderWheelSlices();
    buildWheelLabels();
  };

  const ensureWheelReady = () => {
    if (!state.wheelCategories || !state.wheelCategories.length) {
      refreshWheel();
    }
  };

  const getSubthemesForSubject = (subject) => {
    const map = getSubjectsMap();
    if (!subject || subject === "all") {
      return Array.from(new Set(Object.values(map).flat()));
    }
    return map[subject] || ["General"];
  };

  const renderSubjectFilter = () => {
    const select = $("#quizSubjectFilter");
    if (!select) return;
    const subjects = getSubjectList();
    updateSelectOptions("quizSubjectFilter", subjects, {
      includeAll: true,
      allLabel: "Toutes les matieres",
      defaultValue: "all"
    });
  };

  const renderSubthemeFilter = () => {
    const select = $("#quizSubthemeFilter");
    if (!select) return;
    const subjectFilter = $("#quizSubjectFilter")?.value || "all";
    const subthemes = getSubthemesForSubject(subjectFilter);
    updateSelectOptions("quizSubthemeFilter", subthemes, {
      includeAll: true,
      allLabel: "Tous les sous-themes",
      defaultValue: "all"
    });
  };

  const getDifficultyOptions = () => {
    const options = [];
    for (let i = 0; i <= 10; i += 1) {
      const value = (i * 0.5).toFixed(1);
      const display = value.replace(".0", "").replace(".", ",");
      const label = `${display} etoile${value === "1.0" ? "" : "s"}`;
      options.push({ value, label });
    }
    return options;
  };

  const renderDifficultyFilter = () => {
    const select = $("#quizDifficultyFilter");
    if (!select) return;
    updateSelectOptions("quizDifficultyFilter", getDifficultyOptions(), {
      includeAll: true,
      allLabel: "Toutes les difficultes",
      defaultValue: "all"
    });
  };

  const renderQuizBankSubjectFilter = () => {
    const select = $("#quizBankSubjectFilter");
    if (!select) return;
    const subjects = getSubjectList();
    updateSelectOptions("quizBankSubjectFilter", subjects, {
      includeAll: true,
      allLabel: "Toutes les matieres",
      defaultValue: "all"
    });
  };

  const renderQuizBankSubthemeFilter = () => {
    const select = $("#quizBankSubthemeFilter");
    if (!select) return;
    const subjectFilter = $("#quizBankSubjectFilter")?.value || "all";
    const subthemes = getSubthemesForSubject(subjectFilter);
    updateSelectOptions("quizBankSubthemeFilter", subthemes, {
      includeAll: true,
      allLabel: "Tous les sous-themes",
      defaultValue: "all"
    });
  };

  const renderQuizBankDifficultyFilter = () => {
    const select = $("#quizBankDifficultyFilter");
    if (!select) return;
    updateSelectOptions("quizBankDifficultyFilter", getDifficultyOptions(), {
      includeAll: true,
      allLabel: "Toutes les difficultes",
      defaultValue: "all"
    });
  };


  const renderSelectedQuestions = () => {
    const list = $("#selectedQuestionList");
    if (!list) return;
    list.innerHTML = "";
    if (!draftQuiz.questions.length) {
      list.innerHTML = "<div class=\"note\">Aucune question selectionnee.</div>";
      return;
    }
    draftQuiz.questions.forEach((q, idx) => {
      const item = document.createElement("div");
      item.className = "question-item";
      item.draggable = true;
      item.dataset.id = q.id;
      item.dataset.source = "selected";
      const rating = Number.isFinite(q.difficulty) ? q.difficulty : 0;
      item.innerHTML = `
        <div class="question-left">
          <strong>Q${idx + 1}: ${q.question}</strong>
        </div>
        <div class="question-right">
          <div class="question-inline">
            <div class="rating read-only" style="--rating:${rating}">
              <div class="stars" aria-hidden="true">
                <span class="stars-base">★★★★★</span>
                <span class="stars-fill">★★★★★</span>
              </div>
              <input type="range" min="0" max="5" step="0.5" value="${rating}" aria-label="Difficulte" disabled />
            </div>
            <span class="pill">${q.subtheme}</span>
            <span class="pill">${q.subject}</span>
            <div class="question-actions">
              <button class="icon-button" data-action="remove-from-quiz" data-id="${q.id}" aria-label="Retirer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  };

  const renderBankSubjectSelect = () => {
    const subjectSelect = $("#bankSubjectSelect");
    if (!subjectSelect) return;
    const subjects = getSubjectList();
    updateSelectOptions("bankSubjectSelect", subjects, {
      includeAll: false,
      defaultValue: ""
    });
  };

  const renderBankSubthemeSelect = () => {
    const subject = $("#bankSubjectSelect")?.value || "";
    const subthemeSelect = $("#bankSubthemeSelect");
    if (!subthemeSelect) return;
    const subthemes = subject ? getSubthemesForSubject(subject) : [];
    updateSelectOptions("bankSubthemeSelect", subthemes, {
      includeAll: false,
      defaultValue: ""
    });
  };

  const renderEditSubjectSelect = () => {
    const subjectSelect = $("#editSubjectSelect");
    if (!subjectSelect) return;
    const subjects = getSubjectList();
    updateSelectOptions("editSubjectSelect", subjects, {
      includeAll: false,
      defaultValue: ""
    });
  };

  const renderEditSubthemeSelect = () => {
    const subject = $("#editSubjectSelect")?.value || "";
    const subthemeSelect = $("#editSubthemeSelect");
    if (!subthemeSelect) return;
    const subthemes = subject ? getSubthemesForSubject(subject) : [];
    updateSelectOptions("editSubthemeSelect", subthemes, {
      includeAll: false,
      defaultValue: ""
    });
  };

  const renderAddSubthemeSubjectSelect = () => {
    const select = $("#addSubthemeSubjectSelect");
    if (!select) return;
    const subjects = getSubjectList();
    updateSelectOptions("addSubthemeSubjectSelect", subjects, {
      includeAll: false,
      defaultValue: ""
    });
  };

  const refreshSubjectSelects = () => {
    renderBankSubjectSelect();
    renderBankSubthemeSelect();
    renderEditSubjectSelect();
    renderEditSubthemeSelect();
    renderSubjectFilter();
    renderSubthemeFilter();
    renderAddSubthemeSubjectSelect();
    renderQuizBankSubjectFilter();
    renderQuizBankSubthemeFilter();
    refreshWheel();
  };

  const normalizeLabel = (value) => value.trim().replace(/\s+/g, " ");

  const handleCreateSubject = () => {
    const subject = normalizeLabel($("#newSubjectInput").value || "");
    const subtheme = normalizeLabel($("#newSubjectSubthemeInput").value || "");
    if (!subject || !subtheme) {
      setSubjectModalMessage("Ajoute une matiere et un sous-theme.");
      return;
    }
    const map = getSubjectsMap();
    if (map[subject]) {
      setSubjectModalMessage("Cette matiere existe deja. Ajoute un sous-theme.");
      return;
    }
    const custom = getStoredSubjects();
    custom[subject] = [subtheme];
    store.setSubjects(custom);
    $("#newSubjectInput").value = "";
    $("#newSubjectSubthemeInput").value = "";
    refreshSubjectSelects();
    setSubjectModalMessage("Matiere creee.");
  };

  const handleAddSubtheme = () => {
    const subject = $("#addSubthemeSubjectSelect").value.trim();
    const subtheme = normalizeLabel($("#newSubthemeInput").value || "");
    if (!subject || !subtheme) {
      setSubjectModalMessage("Choisis une matiere et un sous-theme.");
      return;
    }
    const map = getSubjectsMap();
    if (!map[subject]) {
      setSubjectModalMessage("Cette matiere n'existe pas.");
      return;
    }
    if (map[subject].includes(subtheme)) {
      setSubjectModalMessage("Ce sous-theme existe deja.");
      return;
    }
    const custom = getStoredSubjects();
    if (!custom[subject]) custom[subject] = [];
    custom[subject].push(subtheme);
    store.setSubjects(custom);
    $("#newSubthemeInput").value = "";
    refreshSubjectSelects();
    setSubjectModalMessage("Sous-theme ajoute.");
  };

  const openSubjectModal = () => {
    setSubjectModalMessage("");
    renderAddSubthemeSubjectSelect();
    const modal = $("#subjectModal");
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  const closeSubjectModal = () => {
    const modal = $("#subjectModal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  const resetBankInputs = () => {
    $("#bankSubjectSelect").value = "";
    $("#bankSubthemeSelect").value = "";
    $("#bankQuestionInput").value = "";
    $("#bankChoiceAInput").value = "";
    $("#bankChoiceBInput").value = "";
    $("#bankChoiceCInput").value = "";
    $("#bankChoiceDInput").value = "";
    $("#bankCorrectA").checked = true;
    renderBankSubthemeSelect();
  };

  const updateQuestionDifficulty = (id, difficulty) => {
    if (!id) return;
    const value = Math.min(Math.max(difficulty, 0), 5);
    const bank = getBank();
    const target = bank.find((q) => q.id === id);
    if (!target) return;
    target.difficulty = value;
    setBank(bank);
    draftQuiz.questions = draftQuiz.questions.map((q) =>
      q.id === id ? { ...q, difficulty: value } : q
    );
  };

  const openEditModal = (question) => {
    if (!question) return;
    editingQuestionId = question.id;
    renderEditSubjectSelect();
    setSelectValue("editSubjectSelect", question.subject, question.subject, false);
    renderEditSubthemeSelect();
    setSelectValue("editSubthemeSelect", question.subtheme, question.subtheme, false);
    $("#editQuestionInput").value = question.question || "";
    $("#editChoiceAInput").value = question.choices?.[0] || "";
    $("#editChoiceBInput").value = question.choices?.[1] || "";
    $("#editChoiceCInput").value = question.choices?.[2] || "";
    $("#editChoiceDInput").value = question.choices?.[3] || "";
    const correct = document.querySelector(`input[name="editCorrect"][value="${question.answer}"]`);
    if (correct) correct.checked = true;
    const modal = $("#editModal");
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  const closeEditModal = () => {
    const modal = $("#editModal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
    editingQuestionId = null;
  };

  const handleSaveEdit = () => {
    if (!editingQuestionId) return;
    const subject = $("#editSubjectSelect").value.trim();
    const subtheme = $("#editSubthemeSelect").value.trim();
    const question = $("#editQuestionInput").value.trim();
    const choices = [
      $("#editChoiceAInput").value.trim(),
      $("#editChoiceBInput").value.trim(),
      $("#editChoiceCInput").value.trim(),
      $("#editChoiceDInput").value.trim()
    ];
    const selected = document.querySelector('input[name="editCorrect"]:checked');
    const answer = selected ? Number(selected.value) : NaN;
    if (!subject || !subtheme || !question || choices.some((c) => !c)) {
      setTeacherMessage("Complete tous les champs pour modifier la question.");
      return;
    }
    if (Number.isNaN(answer)) {
      setTeacherMessage("Choisis la bonne reponse.");
      return;
    }
    const bank = getBank();
    const idx = bank.findIndex((q) => q.id === editingQuestionId);
    if (idx === -1) return;
    const current = bank[idx];
    const updated = {
      ...current,
      subject,
      subtheme,
      question,
      text: question,
      choices,
      answer
    };
    bank[idx] = updated;
    setBank(bank);
    draftQuiz.questions = draftQuiz.questions.map((q) => (q.id === updated.id ? { ...updated } : q));
    renderBankList();
    renderSelectedQuestions();
    renderQuizBankList();
    setTeacherMessage("Question modifiee.");
    closeEditModal();
  };

  const handleAddBankQuestion = () => {
    const subject = $("#bankSubjectSelect").value.trim();
    const subtheme = $("#bankSubthemeSelect").value.trim();
    const question = $("#bankQuestionInput").value.trim();
    const choices = [
      $("#bankChoiceAInput").value.trim(),
      $("#bankChoiceBInput").value.trim(),
      $("#bankChoiceCInput").value.trim(),
      $("#bankChoiceDInput").value.trim()
    ];
    const selected = document.querySelector('input[name="bankCorrect"]:checked');
    const answer = selected ? Number(selected.value) : NaN;
    if (!subject || !subtheme || !question || choices.some((c) => !c)) {
      setTeacherMessage("Complete tous les champs pour ajouter a la banque.");
      return;
    }
    if (Number.isNaN(answer)) {
      setTeacherMessage("Choisis la bonne reponse.");
      return;
    }
    const bank = getBank();
    bank.unshift({
      id: uid("bank"),
      subject,
      subtheme,
      question,
      text: question,
      choices,
      answer,
      difficulty: 0,
      createdAt: new Date().toISOString()
    });
    setBank(bank);
    resetBankInputs();
    renderBankList();
    renderSubjectFilter();
    renderSubthemeFilter();
    renderQuizBankList();
    setTeacherMessage("Question ajoutee a la banque.");
  };

  const handleAddToQuiz = (id) => {
    const bank = getBank();
    const question = bank.find((q) => q.id === id);
    if (!question) return;
    if (draftQuiz.questions.some((q) => q.id === id)) return;
    draftQuiz.questions.push({ ...question });
    renderSelectedQuestions();
    renderQuizBankList();
  };

  const handleRemoveFromQuiz = (id) => {
    draftQuiz.questions = draftQuiz.questions.filter((q) => q.id !== id);
    renderSelectedQuestions();
    renderQuizBankList();
  };

  const handleRemoveBankQuestion = (id) => {
    const bank = getBank().filter((q) => q.id !== id);
    setBank(bank);
    draftQuiz.questions = draftQuiz.questions.filter((q) => q.id !== id);
    renderBankList();
    renderSubjectFilter();
    renderSubthemeFilter();
    renderSelectedQuestions();
    renderQuizBankList();
  };

  const renderQuizSelect = () => {
    const select = $("#assignQuizSelect");
    if (!select) return;
    const quizzes = getQuizzes();
    select.innerHTML = "";
    if (!quizzes.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Aucun quiz disponible";
      select.appendChild(opt);
      return;
    }
    quizzes.forEach((quiz) => {
      const opt = document.createElement("option");
      opt.value = quiz.id;
      opt.textContent = `${quiz.title} (${quiz.questions.length} Q)`;
      select.appendChild(opt);
    });
  };

  const renderAssignmentsList = () => {
    const list = $("#assignmentList");
    if (!list) return;
    const assignments = getAssignments();
    const entries = Object.entries(assignments).sort(([a], [b]) => a.localeCompare(b));
    list.innerHTML = "";
    if (!entries.length) {
      list.innerHTML = "<div class=\"note\">Aucune date attribuee.</div>";
      return;
    }
    entries.forEach(([dateKeyValue, quizId]) => {
      const quiz = getQuizById(quizId);
      const item = document.createElement("div");
      item.className = "assignment-item";
      item.innerHTML = `
        <strong>${parseDateKey(dateKeyValue).toLocaleDateString("fr-FR")}</strong>
        <div>${quiz ? quiz.title : "Quiz introuvable"}</div>
        <button class="ghost" data-action="remove" data-date="${dateKeyValue}">Retirer</button>
      `;
      list.appendChild(item);
    });
  };

  const handleSaveQuiz = () => {
    const title = $("#quizTitleInput").value.trim();
    if (!title) {
      setTeacherMessage("Ajoute un titre au quiz.");
      return;
    }
    if (draftQuiz.questions.length < MAX_ROUNDS) {
      setTeacherMessage(`Ajoute au moins ${MAX_ROUNDS} questions pour enregistrer.`);
      return;
    }
    const quizzes = getQuizzes();
    const quizDate = $("#quizDateInput")?.value || "";
    const quizId = editingQuizId || uid("quiz");
    const existingIndex = quizzes.findIndex((quiz) => quiz.id === quizId);
    const quizPayload = {
      id: quizId,
      title,
      questions: draftQuiz.questions.map((q) => ({ ...q })),
      createdAt: existingIndex === -1 ? new Date().toISOString() : quizzes[existingIndex].createdAt,
      updatedAt: new Date().toISOString()
    };
    if (existingIndex === -1) {
      quizzes.unshift(quizPayload);
    } else {
      quizzes[existingIndex] = quizPayload;
    }
    setQuizzes(quizzes);

    const assignments = getAssignments();
    Object.keys(assignments).forEach((dateKeyValue) => {
      if (assignments[dateKeyValue] === quizId) delete assignments[dateKeyValue];
    });
    if (quizDate) {
      assignments[quizDate] = quizId;
    }
    setAssignments(assignments);

    editingQuizId = null;
    draftQuiz.title = "";
    draftQuiz.questions = [];
    $("#quizTitleInput").value = "";
    if ($("#quizDateInput")) $("#quizDateInput").value = "";
    renderSelectedQuestions();
    renderQuizBankList();
    renderQuizList();
    renderQuizSelect();
    renderAssignmentsList();
    renderCalendar();
    renderDayPanel();
    setTeacherMessage("Quiz enregistre !");
  };

  const loadQuizForEdit = (id) => {
    const quiz = getQuizById(id);
    if (!quiz) return;
    editingQuizId = id;
    draftQuiz.title = quiz.title || "";
    draftQuiz.questions = quiz.questions ? quiz.questions.map((q) => ({ ...q })) : [];
    $("#quizTitleInput").value = draftQuiz.title;
    const dateValue = getAssignedDateForQuiz(id);
    if ($("#quizDateInput")) $("#quizDateInput").value = dateValue;
    renderSelectedQuestions();
    renderQuizBankList();
    setTeacherMessage("Mode modification actif.");
  };

  const handleRemoveQuiz = (id) => {
    const quizzes = getQuizzes().filter((quiz) => quiz.id !== id);
    setQuizzes(quizzes);
    const assignments = getAssignments();
    Object.keys(assignments).forEach((dateKeyValue) => {
      if (assignments[dateKeyValue] === id) delete assignments[dateKeyValue];
    });
    setAssignments(assignments);
    if (editingQuizId === id) {
      editingQuizId = null;
      draftQuiz.title = "";
      draftQuiz.questions = [];
      $("#quizTitleInput").value = "";
      if ($("#quizDateInput")) $("#quizDateInput").value = "";
      renderSelectedQuestions();
    }
    renderQuizList();
    renderAssignmentsList();
    renderCalendar();
    renderDayPanel();
  };

  const handleAssignQuiz = () => {
    const dateValue = $("#assignDateInput").value;
    const quizId = $("#assignQuizSelect").value;
    if (!dateValue || !quizId) {
      setTeacherMessage("Choisis une date et un quiz.");
      return;
    }
    const quiz = getQuizById(quizId);
    if (!quiz || quiz.questions.length < MAX_ROUNDS) {
      setTeacherMessage(`Ce quiz doit avoir au moins ${MAX_ROUNDS} questions.`);
      return;
    }
    const assignments = getAssignments();
    assignments[dateValue] = quizId;
    setAssignments(assignments);
    setTeacherMessage("Quiz attribue au calendrier.");
    renderAssignmentsList();
    renderCalendar();
    renderDayPanel();
  };

  const handleRemoveAssignment = (dateValue) => {
    const assignments = getAssignments();
    delete assignments[dateValue];
    setAssignments(assignments);
    renderAssignmentsList();
    renderCalendar();
    renderDayPanel();
  };

  const selectDate = (key) => {
    state.selectedDate = key;
    updateHeader();
    renderCalendar();
    renderDayPanel();
    const selected = document.querySelector(`.day[data-date="${key}"]`);
    if (selected) {
      const rect = selected.getBoundingClientRect();
      state.selectedDatePoint = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1);
    state.month = newMonth;
    state.selectedDate = dateKey(newMonth);
    updateHeader();
    renderDayPanel();
    renderCalendar();
  };

  const ensureProgress = (key) => {
    let progress = getProgress(key);
    if (!progress) {
      progress = { date: key, spinsDone: 0, correct: 0, used: {} };
      setProgress(key, progress);
    }
    return progress;
  };

  const resetQuestionUI = () => {
    const category = $("#questionCategory");
    const text = $("#questionText");
    const choices = $("#choiceList");
    const feedback = $("#answerFeedback");
    if (category) {
      category.textContent = "Categorie";
      category.style.background = "";
      category.style.borderColor = "";
    }
    if (text) text.textContent = "Tourne la roue pour lancer une question.";
    if (choices) choices.innerHTML = "";
    if (feedback) feedback.textContent = "";
    $(".question-card")?.classList.remove("show");
    $(".wheel-card")?.classList.remove("hidden");
    $("#wrongX")?.classList.remove("show");
  };

  const renderProgressDots = () => {
    const wrap = $("#progressDots");
    if (!wrap || wrap.childElementCount) return;
    for (let i = 0; i < MAX_ROUNDS; i += 1) {
      const dot = document.createElement("div");
      dot.className = "progress-dot";
      wrap.appendChild(dot);
    }
  };

  const updateGameUI = () => {
    const progress = getProgress(state.selectedDate);
    if (!progress) return;

    const roundPill = $("#roundPill");
    const scorePill = $("#scorePill");
    const wheelNote = $("#wheelNote");
    const finishBanner = $("#finishBanner");
    const finishScore = $("#finishScore");

    const nextRound = Math.min(progress.spinsDone + 1, MAX_ROUNDS);
    if (roundPill) roundPill.textContent = `Ronde ${nextRound}/${MAX_ROUNDS}`;
    if (scorePill) scorePill.textContent = `Score ${progress.correct}/${MAX_ROUNDS}`;

    const dots = $$(".progress-dot");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("done", idx < progress.spinsDone);
    });

    const spinBtn = $("#spinBtn");
    if (progress.spinsDone >= MAX_ROUNDS) {
      if (finishScore) finishScore.textContent = `Note finale: ${progress.correct}/${MAX_ROUNDS}`;
      if (finishBanner) finishBanner.classList.add("show");
      if (state.xpTransferKey !== state.selectedDate) {
        state.xpTransferKey = state.selectedDate;
        const originPoint = state.quizOriginPoint ? { ...state.quizOriginPoint } : null;
        state.quizOriginPoint = null;
        setTimeout(() => {
          launchXpTransfer({
            duration: 3500,
            startPoint: originPoint,
            onComplete: () => {
              const balloon = getVisibleXpBalloon();
              triggerBalloonImpact(balloon);
              if (state.pendingLevelUp) {
                const level = state.pendingLevelUp;
                state.pendingLevelUp = null;
                setTimeout(() => triggerLevelUpSequence(level), 250);
              }
            }
          });
        }, 120);
      } else if (state.pendingLevelUp) {
        const level = state.pendingLevelUp;
        state.pendingLevelUp = null;
        setTimeout(() => triggerLevelUpSequence(level), 250);
      }
      if (wheelNote) wheelNote.textContent = "Defi termine !";
      spinBtn?.setAttribute("disabled", "disabled");
    } else {
      if (finishBanner) finishBanner.classList.remove("show");
      if (wheelNote) wheelNote.textContent = "Tourne la roue pour continuer.";
      if (!state.awaitingAnswer && !state.spinning && !state.waitingNext) {
        spinBtn?.removeAttribute("disabled");
      }
    }
  };

  const pickQuestion = (categoryId) => {
    const progress = getProgress(state.selectedDate);
    if (!progress) return null;

    const bank = getBank();
    let pool = bank.filter((q) => q.subject === categoryId);
    if (!pool.length) pool = bank;
    if (!pool.length) pool = Object.values(questionBank).flat();
    if (!pool.length) return null;

    const used = new Set(progress.used[categoryId] || []);
    const withKeys = pool.map((q, idx) => ({
      question: q,
      key: q.id || q._id || `${categoryId}_${idx}`
    }));

    let available = withKeys.filter((item) => !used.has(item.key));
    if (!available.length) {
      progress.used[categoryId] = [];
      available = withKeys;
    }
    const pickEntry = available[Math.floor(Math.random() * available.length)];
    if (pickEntry?.key) {
      progress.used[categoryId] = [...(progress.used[categoryId] || []), pickEntry.key];
      setProgress(state.selectedDate, progress);
    }
    return pickEntry?.question || null;
  };

  const showQuestion = (categoryIndex) => {
    const categories = state.wheelCategories || [];
    const category = categories[categoryIndex];
    if (!category) return;

    const progress = getProgress(state.selectedDate);
    if (!progress) return;

    const assignedQuiz = getAssignedQuiz(state.selectedDate);
    let question = null;
    let labelText = category.name;
    let labelColor = category.color;

    if (assignedQuiz) {
      question = assignedQuiz.questions[progress.spinsDone % assignedQuiz.questions.length];
      labelText = `Quiz: ${assignedQuiz.title}`;
      labelColor = "#ffb6d5";
    } else {
      question = pickQuestion(category.id);
    }

    if (!question) return;

    state.currentCategory = category;
    state.currentQuestion = question;
    state.awaitingAnswer = true;

    const categoryLabel = $("#questionCategory");
    const text = $("#questionText");
    const choicesWrap = $("#choiceList");
    const feedback = $("#answerFeedback");

    if (categoryLabel) {
      categoryLabel.textContent = labelText;
      categoryLabel.style.background = `${labelColor}33`;
      categoryLabel.style.borderColor = labelColor;
    }
    if (text) text.textContent = question.text || question.question || "";
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "answer-feedback";
    }

    if (choicesWrap) {
      choicesWrap.innerHTML = "";
      question.choices.forEach((choice, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.textContent = choice;
        btn.addEventListener("click", () => handleAnswer(idx));
        choicesWrap.appendChild(btn);
      });
    }

    $(".question-card")?.classList.add("show");
    $(".wheel-card")?.classList.add("hidden");
    startQuestionTimer();
  };

  const handleAnswer = (index, isTimeout = false) => {
    if (!state.awaitingAnswer) return;
    const progress = getProgress(state.selectedDate);
    if (!progress) return;
    stopQuestionTimer();

    const correctIndex = state.currentQuestion.answer;
    const choices = $$(".choice-btn");

    choices.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIndex) btn.classList.add("correct");
      if (typeof index === "number" && idx === index && idx !== correctIndex) btn.classList.add("wrong");
    });

    const feedback = $("#answerFeedback");
    if (index === correctIndex) {
      progress.correct += 1;
      const gained = computeXpGain(state.currentQuestion);
      state.sessionXp += gained;
      awardXp(gained);
      renderXpPanels(state.sessionXp);
      if (feedback) {
        feedback.textContent = "Bonne reponse !";
        feedback.className = "answer-feedback good";
      }
      launchConfetti();
    } else if (feedback) {
      if (isTimeout) {
        feedback.textContent = `Temps ecoule ! La bonne reponse est : ${state.currentQuestion.choices[correctIndex]}`;
      } else {
        feedback.textContent = `Oups ! La bonne reponse est : ${state.currentQuestion.choices[correctIndex]}`;
      }
      feedback.className = "answer-feedback bad";
      playWrongX();
    }

    progress.spinsDone += 1;
    setProgress(state.selectedDate, progress);
    state.awaitingAnswer = false;
    clearNextStep();

    const spinBtn = $("#spinBtn");
    if (progress.spinsDone >= MAX_ROUNDS) {
      finalizeDay(progress);
    } else if (spinBtn) {
      state.waitingNext = true;
      spinBtn.disabled = true;
      state.nextStepTimeoutId = setTimeout(() => {
        resetQuestionUI();
        state.waitingNext = false;
        updateGameUI();
      }, 5000);
    }

    updateGameUI();
  };

  const handleGlobalTimeout = () => {
    const progress = getProgress(state.selectedDate);
    if (!progress) return;
    stopQuestionTimer();
    clearNextStep();
    state.awaitingAnswer = false;

    const choices = $$(".choice-btn");
    const correctIndex = state.currentQuestion?.answer;
    choices.forEach((btn, idx) => {
      btn.disabled = true;
      if (typeof correctIndex === "number" && idx === correctIndex) {
        btn.classList.add("correct");
      }
    });

    const feedback = $("#answerFeedback");
    if (feedback) {
      feedback.textContent = "Temps total ecoule. Partie terminee.";
      feedback.className = "answer-feedback bad";
    }

    progress.spinsDone = MAX_ROUNDS;
    setProgress(state.selectedDate, progress);
    finalizeDay(progress);
    updateGameUI();
  };

  const finalizeDay = (progress) => {
    const scores = getCalendarScores();
    scores[state.selectedDate] = {
      score: progress.correct,
      total: MAX_ROUNDS,
      completedAt: new Date().toISOString()
    };
    setCalendarScores(scores);
    progress.completed = true;
    setProgress(state.selectedDate, progress);

    const spinBtn = $("#spinBtn");
    if (spinBtn) spinBtn.disabled = true;
    stopAllTimers();
    clearNextStep();
    renderWeeklyStats();
    renderCalendar();
  };

  const handleSpin = () => {
    const progress = getProgress(state.selectedDate);
    if (!progress || progress.spinsDone >= MAX_ROUNDS) return;
    if (state.spinning || state.awaitingAnswer) return;

    const wheel = $("#wheel");
    const spinBtn = $("#spinBtn");
    if (!wheel || !spinBtn) return;

    ensureWheelReady();
    const categories = state.wheelCategories || [];
    if (!categories.length) return;

    state.spinning = true;
    spinBtn.disabled = true;

    const categoryIndex = Math.floor(Math.random() * categories.length);
    const segment = 360 / categories.length;
    const targetAngle = (360 - categoryIndex * segment) % 360;
    const currentAngle = ((state.rotation % 360) + 360) % 360;
    let delta = targetAngle - currentAngle;
    if (delta < 0) delta += 360;
    state.rotation += 360 * SPIN_TURNS + delta;

    wheel.style.setProperty("--spin-rotate", `${state.rotation}deg`);
    wheel.classList.add("is-spinning");

    setTimeout(() => {
      state.spinning = false;
      wheel.classList.remove("is-spinning");
      showQuestion(categoryIndex);
    }, SPIN_DURATION);
  };

  const startGame = (key) => {
    const dayButton = document.querySelector(`.day[data-date="${key}"]`);
    if (dayButton) {
      const rect = dayButton.getBoundingClientRect();
      state.quizOriginPoint = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    } else if (state.selectedDatePoint) {
      state.quizOriginPoint = { ...state.selectedDatePoint };
    } else {
      state.quizOriginPoint = null;
    }
    ensureProgress(key);
    state.awaitingAnswer = false;
    state.currentQuestion = null;
    state.currentCategory = null;
    state.sessionXp = 0;
    state.xpTransferKey = null;
    clearNextStep();
    ensureWheelReady();
    showScreen("game");
    resetQuestionUI();
    renderProgressDots();
    updateGameUI();
    renderXpPanels(state.sessionXp);
    const spinBtn = $("#spinBtn");
    if (spinBtn) spinBtn.disabled = false;
    const settings = getSettings();
    setQuestionPill(settings.questionTime);
    setTotalPill(settings.totalTime);
    startGlobalTimer();
  };

  const handleDayCta = () => {
    const scores = getCalendarScores();
    const assignedQuiz = getAssignedQuiz(state.selectedDate);
    if (assignedQuiz && assignedQuiz.questions.length < MAX_ROUNDS) {
      alert(`Le quiz attribue doit avoir au moins ${MAX_ROUNDS} questions.`);
      return;
    }
    if (scores[state.selectedDate]) {
      const proceed = window.confirm("Cette journee a deja une note. Rejouer et remplacer la note ?");
      if (!proceed) return;
      delete scores[state.selectedDate];
      setCalendarScores(scores);
      setProgress(state.selectedDate, null);
    }
    startGame(state.selectedDate);
  };

  const init = () => {
    const today = new Date();
    state.month = new Date(today.getFullYear(), today.getMonth(), 1);
    state.selectedDate = dateKey(today);
    setAuthMode("login");
    setAppMode("auth");
    updateHeaderMeta();
    const navs = document.querySelectorAll(".tc-nav");
    if (navs.length > 1) {
      navs.forEach((nav, idx) => {
        if (idx > 0) nav.remove();
      });
    }

    $("#prevMonth")?.addEventListener("click", () => changeMonth(-1));
    $("#nextMonth")?.addEventListener("click", () => changeMonth(1));
    $("#backToCalendar")?.addEventListener("click", () => showScreen("calendar"));
    $("#finishBack")?.addEventListener("click", () => showScreen("calendar"));
    $("#spinBtn")?.addEventListener("click", handleSpin);
    $("#openTeacher")?.addEventListener("click", () => {
      if (!state.user) {
        showScreen("auth");
        return;
      }
      if (!state.activeClass) {
        showScreen("classes");
        return;
      }
      setTeacherMessage("");
      renderBankList();
      refreshSubjectSelects();
      renderDifficultyFilter();
      renderQuizBankDifficultyFilter();
      renderSelectedQuestions();
      renderQuizBankList();
      renderQuizList();
      renderQuizSelect();
      renderAssignmentsList();
      renderWeeklyStats();
      renderSettings();
      initQuestionTooltip();
      const assignInput = $("#assignDateInput");
      if (assignInput) assignInput.value = state.selectedDate;
      showScreen("teacher");
      setTeacherTab("builder");
    });
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.nav;
        if (!target) return;
        if (!state.user) {
          showScreen("auth");
          return;
        }
        if (!state.activeClass) {
          showScreen("classes");
          return;
        }
        if (target === "calendar") {
          showScreen("calendar");
          return;
        }
        showScreen("teacher");
        setTeacherTab(target);
      });
    });
    document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.authTab;
        if (mode) setAuthMode(mode);
      });
    });
    $("#loginBtn")?.addEventListener("click", handleLogin);
    $("#signupBtn")?.addEventListener("click", handleSignup);
    $("#switchClassBtn")?.addEventListener("click", async () => {
      await loadClasses();
      showScreen("classes");
    });
    $("#logoutBtn")?.addEventListener("click", handleLogout);
    $("#createClassBtn")?.addEventListener("click", handleCreateClass);
    $("#classList")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.dataset.action || target.closest("[data-action]")?.dataset.action;
      const id = target.dataset.id || target.closest("[data-id]")?.dataset.id;
      if (action === "open-class" && id) {
        openClass(id);
      }
    });
    $("#backToCalendarFromTeacher")?.addEventListener("click", () => showScreen("calendar"));
    $("#addBankQuestionBtn")?.addEventListener("click", handleAddBankQuestion);
    $("#saveQuizBtn")?.addEventListener("click", handleSaveQuiz);
    $("#assignQuizBtn")?.addEventListener("click", handleAssignQuiz);
    $("#saveSettingsBtn")?.addEventListener("click", handleSaveSettings);
    $("#bankSubjectSelect")?.addEventListener("change", renderBankSubthemeSelect);
    $("#editSubjectSelect")?.addEventListener("change", renderEditSubthemeSelect);
    $("#quizSubjectFilter")?.addEventListener("change", () => {
      renderSubthemeFilter();
      renderBankList();
    });
    $("#quizSubthemeFilter")?.addEventListener("change", renderBankList);
    $("#quizDifficultyFilter")?.addEventListener("change", renderBankList);
    $("#quizBankSubjectFilter")?.addEventListener("change", () => {
      resetQuizBankVisible();
      renderQuizBankSubthemeFilter();
      renderQuizBankList();
    });
    $("#quizBankSubthemeFilter")?.addEventListener("change", () => {
      resetQuizBankVisible();
      renderQuizBankList();
    });
    $("#quizBankDifficultyFilter")?.addEventListener("change", () => {
      resetQuizBankVisible();
      renderQuizBankList();
    });
    $("#quizBankSearchInput")?.addEventListener("input", () => {
      resetQuizBankVisible();
      renderQuizBankList();
    });
    $("#quizBankMoreBtn")?.addEventListener("click", () => {
      quizBankVisibleCount += QUIZ_BANK_PAGE;
      renderQuizBankList();
    });
    $("#quizSearchInput")?.addEventListener("input", () => {
      resetQuizListVisible();
      renderQuizList();
    });
    $("#quizMoreBtn")?.addEventListener("click", () => {
      quizListVisibleCount += QUIZ_LIST_PAGE;
      renderQuizList();
    });

    $("#rewardsFilter")?.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      state.rewardsFilter = target.value || "all";
      renderRewardsGrid();
    });

    $("#rewardsGrid")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest(".reward-tile");
      if (!btn) return;
      const level = Number(btn.dataset.level);
      if (!Number.isFinite(level)) return;
      state.selectedRewardLevel = level;
      renderRewardsGrid();
      renderRewardsEditor();
    });

    const rewardsInputs = [
      "rewardsEnabled",
      "rewardsType",
      "rewardsText",
      "rewardsSpecial",
      "rewardsMessage",
      "rewardsTheme",
      "rewardsSkill",
      "rewardsObjective",
      "rewardsAudio"
    ];
    rewardsInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      const handler = () => {
        const level = state.selectedRewardLevel || getXpState().level;
        const updates = {
          enabled: Boolean($("#rewardsEnabled")?.checked),
          type: $("#rewardsType")?.value || "badge",
          rewardText: $("#rewardsText")?.value || "",
          special: Boolean($("#rewardsSpecial")?.checked),
          message: $("#rewardsMessage")?.value || "",
          theme: $("#rewardsTheme")?.value || "",
          skill: $("#rewardsSkill")?.value || "",
          objective: $("#rewardsObjective")?.value || "",
          audio: $("#rewardsAudio")?.value || ""
        };
        updateRewardLevel(level, updates);
        renderRewardsGrid();
        renderRewardsPreview(level, { ...DEFAULT_REWARD, ...updates });
      };
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    });

    document.querySelectorAll("[data-teacher-tab]").forEach((btn) => {
      btn.addEventListener("click", () => setTeacherTab(btn.dataset.teacherTab));
    });

    document.addEventListener("click", (event) => {
      const option = event.target.closest(".select-option");
      if (option) {
        const container = option.closest(".select");
        if (!container) return;
        const selectId = container.dataset.select;
        if (!selectId) return;
        setSelectValue(selectId, option.dataset.value || "", option.textContent || "", true);
        closeSelect(container);
        const headerCell = option.closest(".header-cell");
        if (headerCell) headerCell.classList.remove("open");
        return;
      }

      const trigger = event.target.closest(".select-trigger");
      if (trigger) {
        const container = trigger.closest(".select");
        if (!container) return;
        if (container.classList.contains("open")) {
          closeSelect(container);
        } else {
          closeAllSelects();
          openSelect(container);
        }
        return;
      }

      if (!event.target.closest(".select") && !event.target.closest(".header-cell")) {
        closeAllSelects();
      }
    });

    document.addEventListener("click", (event) => {
      const toggle = event.target.closest(".header-filter-toggle");
      if (toggle) {
        const filterId = toggle.dataset.filter;
        const cell = toggle.closest(".header-cell");
        if (!filterId || !cell) return;
        document.querySelectorAll(".header-cell.open").forEach((openCell) => {
          if (openCell !== cell) openCell.classList.remove("open");
        });
        const container = document.querySelector(`[data-select="${filterId}"]`);
        const willOpen = !cell.classList.contains("open");
        if (willOpen) {
          cell.classList.add("open");
          if (container) {
            closeAllSelects();
            openSelect(container);
          }
        } else {
          cell.classList.remove("open");
          if (container) closeSelect(container);
        }
        return;
      }

      if (!event.target.closest(".header-cell")) {
        document.querySelectorAll(".header-cell.open").forEach((cell) => cell.classList.remove("open"));
      }
    });

    $("#bankList")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.dataset.action || target.closest("[data-action]")?.dataset.action;
      const id = target.dataset.id || target.closest("[data-id]")?.dataset.id;
      if (!action || !id) return;
      if (action === "edit-question") {
        const bank = getBank();
        const question = bank.find((q) => q.id === id);
        if (question) openEditModal(question);
      }
      if (action === "remove-bank") {
        handleRemoveBankQuestion(id);
      }
    });

    $("#bankList")?.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.closest(".rating")) return;
      const wrapper = target.closest(".rating");
      const id = wrapper?.dataset.id;
      const value = Number(target.value);
      if (wrapper) wrapper.style.setProperty("--rating", String(value));
      if (id) updateQuestionDifficulty(id, value);
    });

    $("#selectedQuestionList")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const removeBtn = target.closest("[data-action=\"remove-from-quiz\"]");
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        if (id) handleRemoveFromQuiz(id);
      }
    });

    $("#saveEditBtn")?.addEventListener("click", handleSaveEdit);
    $("#openCreateQuestionBtn")?.addEventListener("click", () => {
      showScreen("teacher");
      setTeacherTab("builder");
      const anchor = $("#bankQuestionInput");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    $("#openSubjectModalBtn")?.addEventListener("click", openSubjectModal);
    $("#createSubjectBtn")?.addEventListener("click", handleCreateSubject);
    $("#addSubthemeBtn")?.addEventListener("click", handleAddSubtheme);

    $("#quizList")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.dataset.action || target.closest("[data-action]")?.dataset.action;
      const id = target.dataset.id || target.closest("[data-id]")?.dataset.id;
      if (!action || !id) return;
      if (action === "edit-quiz") {
        loadQuizForEdit(id);
        setTeacherTab("quizz");
      }
      if (action === "remove-quiz") {
        handleRemoveQuiz(id);
      }
    });

    const bankDragList = $("#quizBankList");
    const selectedDragList = $("#selectedQuestionList");
    const dropZone = $("#quizDropZone");
    if (bankDragList) {
      bankDragList.addEventListener("dragstart", handleQuizDragStart);
      bankDragList.addEventListener("dragend", handleQuizDragEnd);
      bankDragList.addEventListener("dragover", (event) => {
        event.preventDefault();
        bankDragList.classList.add("drag-over");
      });
      bankDragList.addEventListener("dragleave", () => bankDragList.classList.remove("drag-over"));
      bankDragList.addEventListener("drop", (event) => {
        bankDragList.classList.remove("drag-over");
        handleQuizDrop(event, "bank");
      });
    }
    if (selectedDragList) {
      selectedDragList.addEventListener("dragstart", handleQuizDragStart);
      selectedDragList.addEventListener("dragend", handleQuizDragEnd);
      selectedDragList.addEventListener("dragover", (event) => {
        event.preventDefault();
        selectedDragList.classList.add("drag-over");
      });
      selectedDragList.addEventListener("dragleave", () => selectedDragList.classList.remove("drag-over"));
      selectedDragList.addEventListener("drop", (event) => {
        selectedDragList.classList.remove("drag-over");
        handleQuizDrop(event, "selected");
      });
    }

    if (dropZone) {
      dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
      });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
      dropZone.addEventListener("drop", (event) => {
        dropZone.classList.remove("drag-over");
        handleQuizDrop(event, "selected");
      });
    }

    $("#editModal")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.action === "close-edit" || target.classList.contains("modal-backdrop")) {
        closeEditModal();
      }
    });

    $("#subjectModal")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.action === "close-subject" || target.classList.contains("modal-backdrop")) {
        closeSubjectModal();
      }
    });

    $("#levelUpClose")?.addEventListener("click", hideLevelUp);
    $("#levelUpModal")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.levelupClose !== undefined) {
        hideLevelUp();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeEditModal();
        closeSubjectModal();
        hideLevelUp();
      }
    });

    $("#assignmentList")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.action === "remove") {
        const dateValue = target.dataset.date;
        if (dateValue) handleRemoveAssignment(dateValue);
      }
    });
  };

  init();
  attachAuthListener();
  const boot = async () => {
    if (store?.ready?.then) {
      await store.ready;
    }
    await bootstrapAuth();
  };
  boot();
  if (typeof store?.onSync === "function") {
    store.onSync(() => {
      if (state.activeClass) {
        refreshAll();
      }
    });
  }
})();
