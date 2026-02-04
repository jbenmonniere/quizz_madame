import { createClient } from "@supabase/supabase-js";

const STORAGE = {
  calendar: "tc_calendar_scores",
  progress: "tc_progress",
  quizzes: "tc_quizzes",
  assignments: "tc_assignments",
  settings: "tc_settings",
  bank: "tc_question_bank",
  subjects: "tc_subjects",
  xp: "tc_xp"
};

const DEFAULT_STATE = {
  calendar: {},
  progress: {},
  quizzes: [],
  assignments: {},
  settings: {},
  bank: [],
  subjects: {},
  xp: null
};

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
};

const hasStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readLocal = (key, fallback) => {
  if (!hasStorage) return fallback;
  return safeParse(localStorage.getItem(key), fallback);
};

const writeLocal = (key, value) => {
  if (!hasStorage) return;
  localStorage.setItem(key, JSON.stringify(value));
};

const loadLocalState = () => ({
  calendar: readLocal(STORAGE.calendar, DEFAULT_STATE.calendar),
  progress: readLocal(STORAGE.progress, DEFAULT_STATE.progress),
  quizzes: readLocal(STORAGE.quizzes, DEFAULT_STATE.quizzes),
  assignments: readLocal(STORAGE.assignments, DEFAULT_STATE.assignments),
  settings: readLocal(STORAGE.settings, DEFAULT_STATE.settings),
  bank: readLocal(STORAGE.bank, DEFAULT_STATE.bank),
  subjects: readLocal(STORAGE.subjects, DEFAULT_STATE.subjects),
  xp: readLocal(STORAGE.xp, DEFAULT_STATE.xp)
});

const normalizeState = (data = {}) => ({
  calendar: data.calendar ?? DEFAULT_STATE.calendar,
  progress: data.progress ?? DEFAULT_STATE.progress,
  quizzes: data.quizzes ?? DEFAULT_STATE.quizzes,
  assignments: data.assignments ?? DEFAULT_STATE.assignments,
  settings: data.settings ?? DEFAULT_STATE.settings,
  bank: data.bank ?? DEFAULT_STATE.bank,
  subjects: data.subjects ?? DEFAULT_STATE.subjects,
  xp: data.xp ?? DEFAULT_STATE.xp
});

let cache = loadLocalState();
const listeners = new Set();

const notifySync = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      // Ignore listener errors to avoid breaking sync.
    }
  });
};

const persistLocal = () => {
  writeLocal(STORAGE.calendar, cache.calendar);
  writeLocal(STORAGE.progress, cache.progress);
  writeLocal(STORAGE.quizzes, cache.quizzes);
  writeLocal(STORAGE.assignments, cache.assignments);
  writeLocal(STORAGE.settings, cache.settings);
  writeLocal(STORAGE.bank, cache.bank);
  writeLocal(STORAGE.subjects, cache.subjects);
  writeLocal(STORAGE.xp, cache.xp);
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseTable = process.env.NEXT_PUBLIC_SUPABASE_TABLE || "quiz_state";
const supabaseRowId = process.env.NEXT_PUBLIC_SUPABASE_ROW_ID || "default";

let supabase = null;
let mode = "local";
let saveTimer = null;

const buildPayload = () => ({
  id: supabaseRowId,
  data: {
    calendar: cache.calendar,
    progress: cache.progress,
    quizzes: cache.quizzes,
    assignments: cache.assignments,
    settings: cache.settings,
    bank: cache.bank,
    subjects: cache.subjects,
    xp: cache.xp
  }
});

const hydrateCache = (data) => {
  cache = normalizeState(data);
  persistLocal();
  notifySync();
};

const upsertRemote = async () => {
  if (!supabase) return;
  const payload = buildPayload();
  const { error } = await supabase
    .from(supabaseTable)
    .upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("[DataStore] Supabase upsert failed:", error.message || error);
  }
};

const scheduleSave = () => {
  if (!supabase) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    upsertRemote();
  }, 600);
};

const fetchRemote = async () => {
  const { data, error } = await supabase
    .from(supabaseTable)
    .select("data")
    .eq("id", supabaseRowId)
    .maybeSingle();

  if (error) {
    console.warn("[DataStore] Supabase fetch failed:", error.message || error);
    return;
  }

  if (data?.data) {
    hydrateCache(data.data);
    return;
  }

  await upsertRemote();
};

const ready = (async () => {
  if (!supabaseUrl || !supabaseAnonKey) return;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    mode = "supabase";
    await fetchRemote();
  } catch (err) {
    mode = "local";
    console.warn("[DataStore] Supabase init failed:", err);
  }
})();

const DataStore = {
  get mode() {
    return mode;
  },
  ready,
  onSync: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getCalendarScores: () => cache.calendar,
  setCalendarScores: (data) => {
    cache.calendar = data;
    writeLocal(STORAGE.calendar, data);
    scheduleSave();
  },
  getProgressMap: () => cache.progress,
  setProgressMap: (data) => {
    cache.progress = data;
    writeLocal(STORAGE.progress, data);
    scheduleSave();
  },
  getQuizzes: () => cache.quizzes,
  setQuizzes: (data) => {
    cache.quizzes = data;
    writeLocal(STORAGE.quizzes, data);
    scheduleSave();
  },
  getAssignments: () => cache.assignments,
  setAssignments: (data) => {
    cache.assignments = data;
    writeLocal(STORAGE.assignments, data);
    scheduleSave();
  },
  getSettings: () => cache.settings,
  setSettings: (data) => {
    cache.settings = data;
    writeLocal(STORAGE.settings, data);
    scheduleSave();
  },
  getBank: () => cache.bank,
  setBank: (data) => {
    cache.bank = data;
    writeLocal(STORAGE.bank, data);
    scheduleSave();
  },
  getSubjects: () => cache.subjects,
  setSubjects: (data) => {
    cache.subjects = data;
    writeLocal(STORAGE.subjects, data);
    scheduleSave();
  },
  getXp: () => cache.xp,
  setXp: (data) => {
    cache.xp = data;
    writeLocal(STORAGE.xp, data);
    scheduleSave();
  },
  syncNow: async () => {
    await upsertRemote();
  },
  _keys: STORAGE
};

window.DataStore = DataStore;
