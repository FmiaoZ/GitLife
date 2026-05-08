'use strict';

/* ============================================================
  APPLICATION: STATE
  ============================================================ */
let user = null;
let cloudUser = null;
let selectedClass = 'explorer';
let selectedMood = 'excited';
let isDemo = false;
let selectedSkillIcon = '💡';
let selectedSkillLv = 3;

/* ============================================================
  APPLICATION: AUTH + SESSION USE CASES
  ============================================================ */
async function logout() {
  closeSettings();
  if (!confirm('确定要登出吗？')) return;
  if (USE_CLOUD && cloudUser) await db.auth.signOut();
  cloudUser = null;
  user = null;
  isDemo = false;
  document.getElementById('demo-banner').classList.remove('show');
  document.getElementById('auth-status').textContent = '';
  showScreen('screen-start');
  document.getElementById('btn-continue').textContent = '▶ PRESS START';
}

function newCharacter() {
  closeSettings();
  if (user && !isDemo && !confirm('创建新角色会覆盖当前存档，确定吗？')) return;
  openRegisterModal();
}

function exitDemo() {
  isDemo = false;
  user = null;
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
  document.getElementById('demo-banner').classList.remove('show');
  showScreen('screen-start');
  document.getElementById('btn-continue').textContent = '▶ PRESS START';
  openRegisterModal();
}

function pickClass(el) {
  document.querySelectorAll('.class-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  selectedClass = el.dataset.cls;
}

function pickMood(el) {
  document.querySelectorAll('.mood-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  selectedMood = el.dataset.mood;
}

function openRegisterModal() {
  selectedClass = 'explorer';
  document.querySelectorAll('.class-opt').forEach(o =>
    o.classList.toggle('sel', o.dataset.cls === 'explorer')
  );
  ['rg-name','rg-bday','rg-bio','rg-email','rg-pw'].forEach(id => {
    document.getElementById(id).value = '';
  });
  openModal('modal-register');
}

function switchToRegister() { closeModal('modal-login'); openRegisterModal(); }
function switchToLogin() { closeModal('modal-register'); openModal('modal-login'); }

async function doRegister() {
  const name = document.getElementById('rg-name').value.trim();
  const bday = document.getElementById('rg-bday').value;
  const bio = document.getElementById('rg-bio').value.trim();
  const email = document.getElementById('rg-email').value.trim();
  const pw = document.getElementById('rg-pw').value;

  if (!name) { notify('请输入角色名称！', true); return; }
  if (!bday) { notify('请输入出生日期！', true); return; }

  const newUser = {
    name, bday,
    bio: bio || '这个冒险者很神秘，还没有留下介绍。',
    cls: selectedClass,
    avatar: CLASS_DB[selectedClass].emoji,
    equipment: {weapon:null,armor:null,helmet:null,boots:null,accessory:null,mount:null},
    tags: defaultTags(selectedClass),
    skills: defaultSkills(selectedClass),
    achievements: ['born'],
    inventory: ['sword','boots1','helmet1','leather'],
    events: defaultEvents(name, bday),
  };

  if (USE_CLOUD) {
    if (!email) { notify('请输入邮箱！', true); return; }
    if (pw.length < 6) { notify('密码至少6位！', true); return; }

    const btn = document.getElementById('btn-do-register');
    btn.textContent = '注册中…';
    btn.disabled = true;

    const { data, error } = await db.auth.signUp({ email, password: pw });
    if (error) {
      btn.textContent = '✦ 开始冒险';
      btn.disabled = false;
      notify(error.message, true);
      return;
    }
    cloudUser = data.user;

    const { error: saveErr } = await db.from('profiles').upsert({
      id: cloudUser.id, name, bday, bio: newUser.bio,
      cls: selectedClass, avatar: newUser.avatar,
      equipment: newUser.equipment, tags: newUser.tags, skills: newUser.skills,
      achievements: newUser.achievements, inventory: newUser.inventory, events: newUser.events,
    });
    if (saveErr) console.warn('Profile create:', saveErr.message);

    btn.textContent = '✦ 开始冒险';
    btn.disabled = false;
  }

  user = newUser;
  isDemo = false;
  saveLocal();
  closeModal('modal-register');
  launch();
  notify(`✦ 欢迎，${name}！你的冒险开始了！`);
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;

  if (!email) { notify('请输入邮箱！', true); return; }
  if (!pw) { notify('请输入密码！', true); return; }

  const btn = document.getElementById('btn-do-login');
  btn.textContent = '登入中…';
  btn.disabled = true;

  const { data, error } = await db.auth.signInWithPassword({ email, password: pw });
  if (error) {
    btn.textContent = '▶ 进入游戏';
    btn.disabled = false;
    notify('邮箱或密码错误！', true);
    return;
  }
  cloudUser = data.user;

  const { data: profile, error: loadErr } = await db.from('profiles')
    .select('*').eq('id', cloudUser.id).single();

  if (loadErr || !profile) {
    btn.textContent = '▶ 进入游戏';
    btn.disabled = false;
    notify('找不到角色数据，请先注册！', true);
    await db.auth.signOut();
    cloudUser = null;
    return;
  }

  user = profileToUser(profile);
  isDemo = false;
  saveLocal();
  btn.textContent = '▶ 进入游戏';
  btn.disabled = false;
  closeModal('modal-login');
  launch();
  notify(`✦ 欢迎回来，${user.name}！`);
}

function launch() {
  showScreen('screen-main');
  document.getElementById('demo-banner').classList.toggle('show', isDemo);
  renderChar();
  renderMap();
  renderWorld();
  renderInv();
}

/* ============================================================
  APPLICATION: GAME RULES + MUTATIONS
  ============================================================ */
function checkAchievements(lv) {
  const ach = user.achievements || [];
  const add = id => { if (!ach.includes(id)) ach.push(id); };
  if (lv.level >= 10) add('lv10');
  if (lv.level >= 20) add('lv20');
  if ((user.events || []).length >= 2) add('chapter1');
  if ((user.events || []).some(e => e.cat === 'travel')) add('traveler');
  if ((user.events || []).some(e => e.cat === 'education')) add('student');
  if ((user.events || []).length >= 5) add('5chapters');
  if (ach.length >= 4) add('builder');
  user.achievements = ach;
  if (!isDemo) save();
}

function saveSkill() {
  const name = document.getElementById('skill-name-input').value.trim();
  const custom = document.getElementById('skill-icon-custom').value.trim();
  if (!name) { notify('请输入技能名称！', true); return; }
  const icon = custom || selectedSkillIcon;
  user.skills = user.skills || [];
  user.skills.push({ icon, name, lv: selectedSkillLv });
  if (!isDemo) save();
  renderSkills();
  closeModal('modal-add-skill');
  notify(`✦ 技能已添加：${icon} ${name}`);
}

function removeSkill(idx) {
  user.skills.splice(idx, 1);
  if (!isDemo) save();
  renderSkills();
}

function saveTag() {
  const val = document.getElementById('add-tag-input').value.trim();
  if (!val) { notify('请输入标签内容！', true); return; }
  user.tags = user.tags || [];
  user.tags.push(val);
  if (!isDemo) save();
  renderTags();
  closeModal('modal-add-tag');
  notify(`✦ 标签已添加：${val}`);
}

function removeTag(idx) {
  user.tags.splice(idx, 1);
  if (!isDemo) save();
  renderTags();
}

function saveBio() {
  user.bio = document.getElementById('edit-bio-input').value.trim()
    || '这个冒险者很神秘，还没有留下介绍。';
  if (!isDemo) save();
  document.getElementById('char-bio').textContent = user.bio;
  closeModal('modal-edit-bio');
  notify('✦ 个人介绍已更新');
}

function saveEvent() {
  const title = document.getElementById('ev-title').value.trim();
  const loc = document.getElementById('ev-loc').value.trim();
  const date = document.getElementById('ev-date').value;
  const cat = document.getElementById('ev-cat').value;
  const desc = document.getElementById('ev-desc').value.trim();
  if (!title) { notify('请输入关卡标题！', true); return; }

  const exp = Math.floor(Math.random() * 160 + 60);
  user.events.push({ id: Date.now(), title, location: loc, date, cat, desc, mood: selectedMood, exp });
  checkAchievements(calcLv(user.bday));
  if (!isDemo) save();
  renderMap();
  renderChar();
  closeModal('modal-create-event');
  goToTab('map');
  notify(`✦ 新关卡已解锁！获得 +${exp} EXP`);
}

function toggleEquip(itemId) {
  const itm = ITEMS_DB[itemId];
  if (!itm) return;
  const slot = itm.slot;
  const equipping = user.equipment[slot] !== itemId;
  user.equipment[slot] = equipping ? itemId : null;
  if (!isDemo) save();
  renderChar();
  renderInv();
  closeModal('modal-equip');
  notify(equipping ? `✦ 装备了 ${itm.name}！` : `已卸下 ${itm.name}`);
}

function setAvatar(e) {
  user.avatar = e;
  if (!isDemo) save();
  document.getElementById('avatar-emoji').textContent = e;
  closeModal('modal-avatar');
  notify('✦ 外观已更换！');
}

function loadDemo() {
  isDemo = true;
  user = {
    name:'Lin Miao', bday:'2002-03-15',
    bio:'探险家 · 旅行者 · 网球玩家。\n从苏州出发，穿越太平洋，在多伦多书写新的故事。',
    cls:'explorer', avatar:'🌍',
    equipment:{weapon:'camera',armor:'hoodie',helmet:null,boots:'hikeboots',accessory:'watch',mount:'bike'},
    tags:['🌍 探险家','✈️ 旅行者','🎾 网球玩家','📚 终身学习者','🚀 创业者'],
    skills:[
      {icon:'💻',name:'全栈开发', lv:4},
      {icon:'🎾',name:'网球', lv:3},
      {icon:'📷',name:'摄影', lv:3},
      {icon:'✈️',name:'旅行规划', lv:5},
      {icon:'🚀',name:'产品思维', lv:4},
      {icon:'🗣️',name:'公开演讲', lv:3},
    ],
    achievements:['born','chapter1','traveler','student','lv10','lv20'],
    inventory:['camera','sword','hoodie','leather','hikeboots','boots1','watch','ring1','medal','bike','plane','helmet1','crown'],
    events:[
      {id:1, title:'苏州 · 人生起点', location:'苏州, 中国', date:'2002-03-15', cat:'life', desc:'江南水乡，园林古城。这座城市是我人生故事的起点，苏州园林的每一块假山、每一处游廊都是童年的记忆。', mood:'happy', exp:0},
      {id:2, title:'来到多伦多', location:'Toronto, Canada', date:'2020-09-01', cat:'life', desc:'跨越太平洋，来到枫叶之国。CN Tower 第一次出现在视野里的那一刻，心里既紧张又兴奋。这是我第一次真正意义上的独立生活。', mood:'nervous', exp:280},
      {id:3, title:'大学生活开始', location:'University of Toronto', date:'2021-01-10', cat:'education', desc:'进入 UofT，开始了真正意义上的大学生活。图书馆、课堂、社团，每一天都充满新的可能性和挑战。', mood:'excited', exp:320},
      {id:4, title:'迈阿密旅行', location:'Miami, USA', date:'2022-07-20', cat:'travel', desc:'第一次去迈阿密，海滩、棕榈树、游轮，南部城市的热情完全颠覆了我对美国的认知。带着相机记录下每一个瞬间。', mood:'excited', exp:210},
      {id:5, title:'创业项目启动', location:'Toronto, Canada', date:'2023-03-01', cat:'work', desc:'和朋友一起启动了第一个创业项目。从零开始，学了无数东西——产品设计、用户访谈、技术实现。失败和成长同步发生。', mood:'excited', exp:350},
      {id:6, title:'网球联赛冠军', location:'Toronto, Canada', date:'2024-05-15', cat:'achievement', desc:'坚持练了两年网球，终于在校际联赛中赢得冠军。这一刻不只是关于网球，而是关于坚持和相信自己。', mood:'proud', exp:450},
    ],
  };
  launch();
  notify('⚡ Demo 模式 · 数据不会保存');
}
