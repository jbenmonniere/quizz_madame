import { createClient } from "@supabase/supabase-js";

const STORAGE = {
  activeClass: "tc_active_class",
  classState: "tc_class_state",
  teacherContent: "tc_teacher_content",
  profile: "tc_profile",
  classes: "tc_classes"
};

const DEFAULT_CLASS_STATE = {
  calendar: {},
  progress: {},
  assignments: {},
  settings: {},
  xp: null
};

const DEFAULT_TEACHER_CONTENT = {
  bank: [],
  quizzes: [],
  subjects: {}
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

const normalizeClassState = (data = {}) => ({
  calendar: data.calendar ?? DEFAULT_CLASS_STATE.calendar,
  progress: data.progress ?? DEFAULT_CLASS_STATE.progress,
  assignments: data.assignments ?? DEFAULT_CLASS_STATE.assignments,
  settings: data.settings ?? DEFAULT_CLASS_STATE.settings,
  xp: data.xp ?? DEFAULT_CLASS_STATE.xp
});

const normalizeTeacherContent = (data = {}) => ({
  bank: data.bank ?? DEFAULT_TEACHER_CONTENT.bank,
  quizzes: data.quizzes ?? DEFAULT_TEACHER_CONTENT.quizzes,
  subjects: data.subjects ?? DEFAULT_TEACHER_CONTENT.subjects
});

const loadLocalState = () => ({
  activeClass: readLocal(STORAGE.activeClass, null),
  classState: readLocal(STORAGE.classState, {}),
  teacherContent: readLocal(STORAGE.teacherContent, DEFAULT_TEACHER_CONTENT),
  profile: readLocal(STORAGE.profile, null),
  classes: readLocal(STORAGE.classes, [])
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
  writeLocal(STORAGE.activeClass, cache.activeClass);
  writeLocal(STORAGE.classState, cache.classState);
  writeLocal(STORAGE.teacherContent, cache.teacherContent);
  writeLocal(STORAGE.profile, cache.profile);
  writeLocal(STORAGE.classes, cache.classes);
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
let mode = supabase ? "supabase" : "local";
let classSaveTimer = null;
let teacherSaveTimer = null;
let currentUserId = null;

const normalizeUsername = (value = "") => value.trim().toLowerCase();
const sanitizeUsername = (value = "") => normalizeUsername(value).replace(/[^a-z0-9._-]/g, "");
const usernameToEmail = (value = "") => `${sanitizeUsername(value) || "enseignante"}@quiz.local`;

const ensureClassState = (classId) => {
  if (!classId) return normalizeClassState();
  if (!cache.classState[classId]) {
    cache.classState[classId] = normalizeClassState();
  }
  return cache.classState[classId];
};

const getClassState = () => {
  if (!cache.activeClass) return normalizeClassState();
  return ensureClassState(cache.activeClass);
};

const setClassState = (next) => {
  if (!cache.activeClass) return;
  cache.classState[cache.activeClass] = normalizeClassState(next);
  writeLocal(STORAGE.classState, cache.classState);
  scheduleClassSave();
};

const getTeacherContent = () => cache.teacherContent || normalizeTeacherContent();

const setTeacherContent = (next) => {
  cache.teacherContent = normalizeTeacherContent(next);
  writeLocal(STORAGE.teacherContent, cache.teacherContent);
  scheduleTeacherSave();
};

const buildClassPayload = (classId) => ({
  class_id: classId,
  data: ensureClassState(classId)
});

const buildTeacherPayload = () => ({
  user_id: currentUserId,
  data: normalizeTeacherContent(cache.teacherContent)
});

const upsertClassState = async () => {
  if (!supabase || !currentUserId || !cache.activeClass) return;
  const payload = buildClassPayload(cache.activeClass);
  const { error } = await supabase
    .from("class_state")
    .upsert(payload, { onConflict: "class_id" });
  if (error) {
    console.warn("[DataStore] class_state upsert failed:", error.message || error);
  }
};

const upsertTeacherContent = async () => {
  if (!supabase || !currentUserId) return;
  const payload = buildTeacherPayload();
  const { error } = await supabase
    .from("teacher_content")
    .upsert(payload, { onConflict: "user_id" });
  if (error) {
    console.warn("[DataStore] teacher_content upsert failed:", error.message || error);
  }
};

const scheduleClassSave = () => {
  if (!supabase || !currentUserId || !cache.activeClass) return;
  if (classSaveTimer) clearTimeout(classSaveTimer);
  classSaveTimer = setTimeout(() => {
    classSaveTimer = null;
    upsertClassState();
  }, 600);
};

const scheduleTeacherSave = () => {
  if (!supabase || !currentUserId) return;
  if (teacherSaveTimer) clearTimeout(teacherSaveTimer);
  teacherSaveTimer = setTimeout(() => {
    teacherSaveTimer = null;
    upsertTeacherContent();
  }, 600);
};

const fetchProfile = async (fallbackUsername) => {
  if (!supabase || !currentUserId) return cache.profile;
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("id, username")
    .eq("id", currentUserId)
    .maybeSingle();
  if (error && error.message) {
    console.warn("[DataStore] teacher_profiles fetch failed:", error.message);
    return cache.profile;
  }
  if (data) {
    cache.profile = data;
    persistLocal();
    return data;
  }
  const username = (fallbackUsername || cache.profile?.username || "").trim();
  if (!username) return cache.profile;
  const insertPayload = { id: currentUserId, username };
  const { data: inserted, error: insertError } = await supabase
    .from("teacher_profiles")
    .insert(insertPayload)
    .select("id, username")
    .single();
  if (insertError) {
    console.warn("[DataStore] teacher_profiles insert failed:", insertError.message || insertError);
    return cache.profile;
  }
  cache.profile = inserted;
  persistLocal();
  return inserted;
};

const fetchTeacherContent = async () => {
  if (!supabase || !currentUserId) return normalizeTeacherContent(cache.teacherContent);
  const { data, error } = await supabase
    .from("teacher_content")
    .select("data")
    .eq("user_id", currentUserId)
    .maybeSingle();
  if (error && error.message) {
    console.warn("[DataStore] teacher_content fetch failed:", error.message);
    return normalizeTeacherContent(cache.teacherContent);
  }
  if (data?.data) {
    cache.teacherContent = normalizeTeacherContent(data.data);
    persistLocal();
    notifySync();
    return cache.teacherContent;
  }
  await upsertTeacherContent();
  return normalizeTeacherContent(cache.teacherContent);
};

const fetchClassState = async (classId) => {
  if (!supabase || !currentUserId || !classId) return ensureClassState(classId);
  const { data, error } = await supabase
    .from("class_state")
    .select("data")
    .eq("class_id", classId)
    .maybeSingle();
  if (error && error.message) {
    console.warn("[DataStore] class_state fetch failed:", error.message);
    return ensureClassState(classId);
  }
  if (data?.data) {
    cache.classState[classId] = normalizeClassState(data.data);
    persistLocal();
    notifySync();
    return cache.classState[classId];
  }
  await upsertClassState();
  return ensureClassState(classId);
};

const listClasses = async () => {
  if (!supabase || !currentUserId) return cache.classes || [];
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, level, created_at")
    .eq("teacher_id", currentUserId)
    .order("created_at", { ascending: false });
  if (error && error.message) {
    console.warn("[DataStore] classes fetch failed:", error.message);
    return cache.classes || [];
  }
  cache.classes = data || [];
  persistLocal();
  return cache.classes;
};

const createClass = async (payload) => {
  const name = payload?.name?.trim();
  if (!name) return { data: null, error: { message: "Nom de classe obligatoire." } };
  const level = payload?.level?.trim() || null;
  if (!supabase || !currentUserId) {
    const local = {
      id: `local_${Date.now()}`,
      name,
      level,
      created_at: new Date().toISOString()
    };
    cache.classes = [local, ...(cache.classes || [])];
    ensureClassState(local.id);
    persistLocal();
    return { data: local, error: null };
  }
  const { data, error } = await supabase
    .from("classes")
    .insert({ teacher_id: currentUserId, name, level })
    .select("id, name, level, created_at")
    .single();
  if (error) return { data: null, error };
  cache.classes = [data, ...(cache.classes || [])];
  persistLocal();
  return { data, error: null };
};

const setActiveClass = (classId) => {
  cache.activeClass = classId || null;
  writeLocal(STORAGE.activeClass, cache.activeClass);
};

const clearUserCache = () => {
  cache.activeClass = null;
  cache.classState = {};
  cache.teacherContent = normalizeTeacherContent();
  cache.profile = null;
  cache.classes = [];
  persistLocal();
};

const localEnsureDefaults = () => {
  currentUserId = "local-user";
  if (!cache.profile) {
    cache.profile = { id: currentUserId, username: "Locale" };
  }
  if (!cache.classes || !cache.classes.length) {
    const localClass = {
      id: "local-class",
      name: "Classe locale",
      level: "",
      created_at: new Date().toISOString()
    };
    cache.classes = [localClass];
    ensureClassState(localClass.id);
    cache.activeClass = localClass.id;
  }
  persistLocal();
};

const ready = (async () => {
  if (!supabase) {
    localEnsureDefaults();
    return;
  }
  try {
    const { data } = await supabase.auth.getSession();
    currentUserId = data?.session?.user?.id || null;
  } catch (err) {
    console.warn("[DataStore] auth session fetch failed:", err);
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
  auth: {
    signIn: async (username, password) => {
      if (!supabase) {
        localEnsureDefaults();
        return { data: { session: { user: { id: currentUserId } } }, error: null };
      }
      const email = usernameToEmail(username);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      currentUserId = data?.user?.id || data?.session?.user?.id || null;
      return { data, error };
    },
    signUp: async (username, password) => {
      if (!supabase) {
        localEnsureDefaults();
        return { data: { session: { user: { id: currentUserId } } }, error: null };
      }
      const email = usernameToEmail(username);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() }
        }
      });
      currentUserId = data?.user?.id || data?.session?.user?.id || null;
      return { data, error };
    },
    signOut: async () => {
      if (!supabase) {
        clearUserCache();
        return { error: null };
      }
      const { error } = await supabase.auth.signOut();
      currentUserId = null;
      clearUserCache();
      return { error };
    },
    getSession: async () => {
      if (!supabase) {
        localEnsureDefaults();
        return { data: { session: { user: { id: currentUserId } } }, error: null };
      }
      const { data, error } = await supabase.auth.getSession();
      currentUserId = data?.session?.user?.id || null;
      return { data, error };
    },
    onAuthStateChange: (cb) => {
      if (!supabase) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
      return supabase.auth.onAuthStateChange((event, session) => {
        currentUserId = session?.user?.id || null;
        cb?.(event, session);
      });
    }
  },
  getProfile: async (fallbackUsername) => {
    if (!supabase) {
      localEnsureDefaults();
      return cache.profile;
    }
    return fetchProfile(fallbackUsername);
  },
  listClasses: async () => {
    if (!supabase) {
      localEnsureDefaults();
      return cache.classes || [];
    }
    return listClasses();
  },
  createClass: async (payload) => createClass(payload),
  loadTeacherContent: async () => fetchTeacherContent(),
  loadClassState: async (classId) => fetchClassState(classId),
  getActiveClassId: () => cache.activeClass,
  setActiveClass,
  getCalendarScores: () => getClassState().calendar,
  setCalendarScores: (data) => {
    const current = getClassState();
    setClassState({ ...current, calendar: data });
  },
  getProgressMap: () => getClassState().progress,
  setProgressMap: (data) => {
    const current = getClassState();
    setClassState({ ...current, progress: data });
  },
  getAssignments: () => getClassState().assignments,
  setAssignments: (data) => {
    const current = getClassState();
    setClassState({ ...current, assignments: data });
  },
  getSettings: () => getClassState().settings,
  setSettings: (data) => {
    const current = getClassState();
    setClassState({ ...current, settings: data });
  },
  getXp: () => getClassState().xp,
  setXp: (data) => {
    const current = getClassState();
    setClassState({ ...current, xp: data });
  },
  getBank: () => getTeacherContent().bank,
  setBank: (data) => {
    const current = getTeacherContent();
    setTeacherContent({ ...current, bank: data });
  },
  getQuizzes: () => getTeacherContent().quizzes,
  setQuizzes: (data) => {
    const current = getTeacherContent();
    setTeacherContent({ ...current, quizzes: data });
  },
  getSubjects: () => getTeacherContent().subjects,
  setSubjects: (data) => {
    const current = getTeacherContent();
    setTeacherContent({ ...current, subjects: data });
  },
  syncNow: async () => {
    await upsertTeacherContent();
    await upsertClassState();
  },
  _keys: STORAGE,
  _usernameToEmail: usernameToEmail
};

window.DataStore = DataStore;
