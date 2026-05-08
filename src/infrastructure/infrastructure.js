'use strict';

/* ============================================================
  INFRASTRUCTURE: SUPABASE + LOCAL STORAGE
  ============================================================ */
const SUPABASE_URL = 'https://qmoiegliryymkwwsllrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtb2llZ2xpcnl5bWt3d3NsbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTIwMjAsImV4cCI6MjA5Mzc4ODAyMH0.fPRTkLaOahQVTr4nu1us40VF-snQHjz9oyF1HJwpZCM';
const USE_CLOUD = !SUPABASE_URL.startsWith('YOUR_');
const db = USE_CLOUD ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const SAVE_KEY = 'liferpg_v1';

function saveLocal() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(user)); } catch(e) {}
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

function save() {
  if (isDemo) return;
  saveLocal();
  if (USE_CLOUD && cloudUser) {
    db.from('profiles').upsert({
      id: cloudUser.id,
      name: user.name, bday: user.bday, bio: user.bio,
      cls: user.cls, avatar: user.avatar,
      equipment: user.equipment, tags: user.tags,
      skills: user.skills, achievements: user.achievements,
      inventory: user.inventory, events: user.events,
    }).then(({ error }) => { if (error) console.warn('Cloud save:', error.message); });
  }
}

function profileToUser(p) {
  return {
    name: p.name, bday: p.bday, bio: p.bio,
    cls: p.cls, avatar: p.avatar,
    equipment: p.equipment || {weapon:null,armor:null,helmet:null,boots:null,accessory:null,mount:null},
    tags: p.tags || [], skills: p.skills || [],
    achievements: p.achievements || [], inventory: p.inventory || [],
    events: p.events || [],
  };
}
