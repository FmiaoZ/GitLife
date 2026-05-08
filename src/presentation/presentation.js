'use strict';

/* ============================================================
  PRESENTATION: NAVIGATION + MODALS + FEEDBACK
  ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

function goToTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  const idx = {character:0, map:1, world:2, items:3}[name] ?? 0;
  document.querySelectorAll('.nav-btn')[idx]?.classList.add('active');
}

function notify(msg, isErr) {
  document.querySelectorAll('.notif').forEach(n => n.remove());
  const el = document.createElement('div');
  el.className = 'notif' + (isErr ? ' err' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function toggleSettings() {
  document.getElementById('settings-menu').classList.toggle('open');
}

function closeSettings() {
  document.getElementById('settings-menu').classList.remove('open');
}

/* ============================================================
  PRESENTATION: CHARACTER
  ============================================================ */
function renderChar() {
  if (!user) return;
  const cls = CLASS_DB[user.cls] || CLASS_DB.explorer;
  const lv = calcLv(user.bday);

  checkAchievements(lv);

  document.getElementById('avatar-emoji').textContent = user.avatar || cls.emoji;
  document.getElementById('avatar-lv').textContent = `Lv.${lv.level}`;
  document.getElementById('top-lv').textContent = `Lv.${lv.level}`;
  document.getElementById('char-name').textContent = user.name;
  document.getElementById('char-class').textContent = `▸ ${cls.name}`;
  document.getElementById('lv-num').textContent = lv.level;
  document.getElementById('exp-txt').textContent = `${lv.daysIn} / 365 days`;
  document.getElementById('days-note').innerHTML =
    `已生活 <b>${lv.totalDays.toLocaleString()}</b> 天 · 距下一级 <b>${lv.toNext}</b> 天`;

  const expBar = document.getElementById('exp-bar');
  expBar.style.transition = 'none';
  expBar.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    expBar.style.transition = 'width 1.4s ease';
    expBar.style.width = Math.min(lv.pct, 100) + '%';
  }));

  renderEquipment();
  renderSkills();
  renderTags();
  renderAchievements();
  document.getElementById('char-bio').textContent = user.bio;
}

function renderEquipment() {
  Object.keys(SLOT_LABELS).forEach(slot => {
    const el = document.querySelector(`.eq-slot[data-slot="${slot}"]`);
    if (!el) return;
    const id = user.equipment[slot];
    const itm = id ? ITEMS_DB[id] : null;
    if (itm) {
      el.classList.add('filled');
      el.innerHTML = `<div class="eq-icon">${itm.icon}</div><div class="eq-name">${itm.name}</div>`;
    } else {
      el.classList.remove('filled');
      el.innerHTML = `<div class="eq-icon">${SLOT_DEFAULT[slot]}</div><div class="eq-name">${SLOT_LABELS[slot]}</div><div class="eq-empty">空槽</div>`;
    }
  });
}

function renderSkills() {
  const skills = user.skills || [];
  const list = document.getElementById('skills-list');
  if (!list) return;

  const rows = skills.map((sk, i) => {
    const pct = (sk.lv / 5) * 100;
    const dots = [1,2,3,4,5].map(n =>
      `<div class="skill-dot ${n <= sk.lv ? 'on' : ''}"></div>`
    ).join('');
    return `
      <div class="skill-row">
        <div class="skill-icon-sm">${sk.icon}</div>
        <div class="skill-mid">
          <div class="skill-name-txt">${sk.name}</div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="skill-right">
          <div class="skill-dots">${dots}</div>
          <div class="skill-lv-lbl">${SKILL_LV_LABELS[sk.lv]}</div>
        </div>
        <button class="skill-remove-btn" onclick="removeSkill(${i})" title="删除">✕</button>
      </div>
    `;
  }).join('');

  list.innerHTML = rows + `<button class="add-skill-btn" onclick="openAddSkill()">+ 添加技能</button>`;
}

function openAddSkill() {
  selectedSkillIcon = '💡';
  selectedSkillLv = 3;
  document.getElementById('skill-name-input').value = '';
  document.getElementById('skill-icon-custom').value = '';

  document.getElementById('skill-icon-picker').innerHTML = SKILL_ICONS.map(e => `
    <div onclick="pickSkillIcon('${e}', this)"
         style="font-size:22px;padding:6px;background:var(--bg2);
                border:2px solid ${e==='💡'?'var(--gold)':'var(--border-dim)'};
                cursor:pointer;transition:border-color .15s;line-height:1"
         onmouseover="this.style.borderColor='var(--gold)'"
         onmouseout="this.style.borderColor='${e==='💡'?'var(--gold)':'var(--border-dim)'}'">
      ${e}
    </div>
  `).join('');

  document.getElementById('skill-lv-picker').innerHTML = [1,2,3,4,5].map(n => `
    <div onclick="pickSkillLv(${n})" data-lv="${n}"
         style="background:var(--bg2);border:2px solid ${n===3?'var(--gold)':'var(--border-dim)'};
                padding:8px 10px;cursor:pointer;text-align:center;transition:all .15s;min-width:56px">
      <div style="font-size:18px;margin-bottom:4px">${'■'.repeat(n)}${'□'.repeat(5-n)}</div>
      <div style="font-size:6px;color:var(--text-dim)">${SKILL_LV_LABELS[n]}</div>
    </div>
  `).join('');

  openModal('modal-add-skill');
}

function pickSkillIcon(icon, el) {
  selectedSkillIcon = icon;
  document.getElementById('skill-icon-custom').value = '';
  document.querySelectorAll('#skill-icon-picker > div').forEach(d => {
    d.style.borderColor = 'var(--border-dim)';
  });
  el.style.borderColor = 'var(--gold)';
}

function pickSkillLv(lv) {
  selectedSkillLv = lv;
  document.querySelectorAll('#skill-lv-picker > div').forEach(d => {
    d.style.borderColor = parseInt(d.dataset.lv) === lv ? 'var(--gold)' : 'var(--border-dim)';
  });
}

function renderTags() {
  const tags = user.tags || [];
  document.getElementById('tags-wrap').innerHTML =
    tags.map((t, i) => `
      <div class="tag removable">${t}
        <span class="tag-x" onclick="removeTag(${i})">✕</span>
      </div>
    `).join('') +
    `<button class="add-tag-btn" onclick="openEditTags()">+ 添加</button>`;
}

function renderAchievements() {
  const unlocked = new Set(user.achievements || []);
  document.getElementById('ach-grid').innerHTML =
    ACHIEVEMENTS_DB.map(a => `
      <div class="ach-badge ${unlocked.has(a.id) ? '' : 'locked'}" title="${a.desc}">
        ${a.icon}
        <div class="ach-tip">${a.name}</div>
      </div>
    `).join('');
}

function openEditTags() {
  closeSettings();
  document.getElementById('add-tag-input').value = '';
  openModal('modal-add-tag');
}

function openEditBio() {
  closeSettings();
  document.getElementById('edit-bio-input').value = user.bio || '';
  openModal('modal-edit-bio');
}

/* ============================================================
  PRESENTATION: MAP
  ============================================================ */
function renderMap() {
  const evs = [...(user.events || [])].sort((a,b) => new Date(a.date) - new Date(b.date));
  document.getElementById('quest-map').innerHTML = evs.map((ev, i) => {
    const cat = CAT_DB[ev.cat] || CAT_DB.life;
    const year = ev.date ? new Date(ev.date).getFullYear() : '';
    const last = i === evs.length - 1;
    return `
      <div class="qnode" onclick="openEventDetail(${ev.id})">
        <div class="qnode-connector">
          <div class="qnode-dot ${last?'cur':''}">${last ? '★' : (i+1)}</div>
          <div class="qnode-line"></div>
        </div>
        <div class="node-card ${ev.cat}">
          <div class="node-ch">CH.${String(i).padStart(2,'0')} · ${year}</div>
          <div class="node-title">
            <span class="node-cat-icon">${cat.icon}</span>${ev.title}
          </div>
          <div class="node-meta">
            ${ev.location ? `<div class="node-meta-item">📍 ${ev.location}</div>` : ''}
            <div class="node-meta-item">${MOOD_DB[ev.mood] || '😊'} ${MOOD_LBL[ev.mood] || ''}</div>
            <div class="node-meta-item">${cat.label}</div>
          </div>
          <div class="node-exp">+${ev.exp || 0} EXP</div>
        </div>
      </div>
    `;
  }).join('');
}

function openEventDetail(id) {
  const ev = (user.events || []).find(e => e.id === id);
  if (!ev) return;
  const cat = CAT_DB[ev.cat] || CAT_DB.life;
  const locKey = (ev.location || '').toLowerCase().split(',')[0].trim();
  const scene = SCENE_DB[ev.location] || SCENE_DB[locKey] || [cat.icon, ev.location || '未知地点'];
  const dateStr = ev.date
    ? new Date(ev.date).toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'})
    : '';

  document.getElementById('ed-scene-icon').textContent = scene[0];
  document.getElementById('ed-title').textContent = ev.title;
  document.getElementById('ed-desc').textContent = ev.desc || '暂无记录';
  document.getElementById('ed-exp').textContent = `✦ 此关卡获得 EXP +${ev.exp || 0}`;
  document.getElementById('ed-meta').innerHTML = `
    ${ev.location ? `<div class="meta-chip">📍 ${ev.location}</div>` : ''}
    ${dateStr ? `<div class="meta-chip">📅 ${dateStr}</div>` : ''}
    <div class="meta-chip">${cat.icon} ${cat.label}</div>
    <div class="meta-chip">${MOOD_DB[ev.mood] || '😊'} ${MOOD_LBL[ev.mood] || ''}</div>
    <div class="meta-chip">🎨 ${scene[1]}</div>
  `;
  openModal('modal-event-detail');
}

function openCreateEvent() {
  document.getElementById('ev-date').value = new Date().toISOString().split('T')[0];
  selectedMood = 'excited';
  document.querySelectorAll('.mood-opt').forEach(o =>
    o.classList.toggle('sel', o.dataset.mood === 'excited')
  );
  document.getElementById('ev-title').value = '';
  document.getElementById('ev-loc').value = '';
  document.getElementById('ev-desc').value = '';
  openModal('modal-create-event');
}

/* ============================================================
  PRESENTATION: EQUIPMENT + AVATAR + INVENTORY
  ============================================================ */
function openEquip(slot) {
  document.getElementById('equip-modal-title').textContent = `选择${SLOT_LABELS[slot]}`;
  const inv = user.inventory || [];
  const items = inv.filter(id => ITEMS_DB[id]?.slot === slot);
  const curEq = user.equipment[slot];
  const grid = document.getElementById('equip-sel-grid');

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;
      font-size:8px;color:var(--text-dim)">背包中没有可用的${SLOT_LABELS[slot]}</div>`;
  } else {
    grid.innerHTML = items.map(id => {
      const itm = ITEMS_DB[id];
      return `
        <div class="inv-cell ${curEq === id ? 'equipped' : ''}" onclick="toggleEquip('${id}')">
          <div class="inv-icon">${itm.icon}</div>
          <div class="inv-name">${itm.name}</div>
          <div class="inv-rar ${itm.rar}">${rarLabel(itm.rar)}</div>
        </div>
      `;
    }).join('');
  }
  openModal('modal-equip');
}

function showAvatarPicker() {
  document.getElementById('avatar-picker-grid').innerHTML =
    AVATAR_OPTIONS.map(e => `
      <div onclick="setAvatar('${e}')"
           style="font-size:30px;text-align:center;padding:10px;background:var(--bg2);
                  border:2px solid ${user.avatar===e?'var(--gold)':'var(--border-dim)'};
                  cursor:pointer;transition:border-color .2s"
           onmouseover="this.style.borderColor='var(--gold)'"
           onmouseout="this.style.borderColor='${user.avatar===e?'var(--gold)':'var(--border-dim)'}'"
      >${e}</div>
    `).join('');
  openModal('modal-avatar');
}

function renderInv() {
  const inv = user.inventory || [];
  const equipped = new Set(Object.values(user.equipment).filter(Boolean));
  let cells = inv.map(id => {
    const itm = ITEMS_DB[id];
    if (!itm) return '';
    const isEq = equipped.has(id);
    return `
      <div class="inv-cell ${isEq?'equipped':''}" onclick="toggleEquip('${id}')" title="${itm.name}">
        <div class="inv-icon">${itm.icon}</div>
        <div class="inv-name">${itm.name}</div>
        <div class="inv-rar ${itm.rar}">${rarLabel(itm.rar)}</div>
        ${isEq ? '<div class="inv-eq-label">已装备</div>' : ''}
      </div>
    `;
  });
  while (cells.length < 16) cells.push('<div class="inv-cell"></div>');
  document.getElementById('inv-grid').innerHTML = cells.join('');
}

/* ============================================================
  PRESENTATION: WORLD
  ============================================================ */
function renderWorld() {
  document.getElementById('explorer-grid').innerHTML =
    SAMPLE_EXPLORERS.map(e => `
      <div class="explorer-card">
        <div class="ex-avi">${e.ava}</div>
        <div class="ex-name">${e.name}</div>
        <div class="ex-meta">Lv.${e.lv} · ${e.loc}</div>
        <div class="ex-cls">${CLASS_DB[e.cls]?.name || e.cls}</div>
      </div>
    `).join('');

  document.getElementById('zone-list').innerHTML =
    HOT_ZONES.map(z => `
      <div class="zone-row">
        <div class="zone-icon">${z.icon}</div>
        <div>
          <div class="zone-name">${z.name}</div>
          <div class="zone-type">${z.type}</div>
        </div>
        <div class="zone-count">${z.players} 在线</div>
      </div>
    `).join('');
}

/* ============================================================
  PRESENTATION: BOOTSTRAP + DOM EVENTS
  ============================================================ */
window.addEventListener('load', async () => {
  const status = document.getElementById('auth-status');
  const btnCont = document.getElementById('btn-continue');

  if (USE_CLOUD) {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      cloudUser = session.user;
      const { data: profile } = await db.from('profiles')
        .select('*').eq('id', cloudUser.id).single();
      if (profile) {
        user = profileToUser(profile);
        saveLocal();
        btnCont.textContent = `▶ 继续 · ${user.name}`;
        status.textContent = `已登录：${session.user.email}`;
      }
    }
  } else {
    const stored = loadLocal();
    if (stored) {
      btnCont.textContent = `▶ 继续 · ${stored.name}`;
    }
    status.textContent = '⚠ 本地模式，数据仅存在此设备';
    status.classList.add('err');
  }

  btnCont.onclick = () => {
    if (user) {
      launch();
      notify(`✦ 欢迎回来，${user.name}！`);
    } else if (USE_CLOUD) {
      openModal('modal-login');
    } else {
      const stored = loadLocal();
      if (stored) {
        user = stored;
        isDemo = false;
        launch();
        notify(`✦ 欢迎回来，${user.name}！`);
      } else {
        openRegisterModal();
      }
    }
  };

  document.getElementById('lnk-register').onclick = () => openRegisterModal();
  document.getElementById('lnk-demo').onclick = loadDemo;

  document.getElementById('rg-name').addEventListener('keydown', e => { if (e.key==='Enter') doRegister(); });
  document.getElementById('login-email').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
  document.getElementById('login-pw').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
  document.getElementById('ev-title').addEventListener('keydown', e => { if (e.key==='Enter') saveEvent(); });
  document.getElementById('add-tag-input').addEventListener('keydown', e => { if (e.key==='Enter') saveTag(); });
  document.getElementById('skill-name-input').addEventListener('keydown', e => { if (e.key==='Enter') saveSkill(); });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    const menu = document.getElementById('settings-menu');
    if (menu.classList.contains('open') &&
        !menu.contains(e.target) &&
        !e.target.closest('.topbar-settings')) {
      menu.classList.remove('open');
    }
  });
});
