/* ============================================================
   GitLife Redesign Overlay — D4: Adventure Map reimagined
   Replaces the vertical dotted-line quest list with an isometric
   pixel-world map. Reads existing .qnode children rendered by
   the original presentation layer, and re-paints them as map pins.
   Drop-in: include AFTER presentation.js. No other code changes.
   ============================================================ */
(function () {
  const QUEST_ID = 'quest-map';
  const COLORS = {
    bg: '#070d18', line: '#22405e', gold: '#ffd84d',
    green: '#5fe39a', blue: '#5da9ff', purple: '#b07cff', red: '#ff6b8a',
    text: '#dde7f2', dim: '#7892b0',
  };
  const CAT_COLOR = {
    travel: COLORS.blue, work: COLORS.gold, growth: COLORS.purple,
    achieve: COLORS.green, life: COLORS.red, default: COLORS.gold,
  };

  // Inject CSS for the new map (scoped under #quest-map.d4)
  const css = `
    #${QUEST_ID}.d4 { padding: 0 !important; position: relative; }
    #${QUEST_ID}.d4 .d4-map-frame {
      background: ${COLORS.bg};
      border: 1px solid ${COLORS.line};
      padding: 12px;
      position: relative;
      overflow: hidden;
      margin-bottom: 14px;
    }
    #${QUEST_ID}.d4 .d4-map-svg { display: block; width: 100%; height: auto; }
    #${QUEST_ID}.d4 .d4-pin { cursor: pointer; }
    #${QUEST_ID}.d4 .d4-pin:hover .d4-pin-glyph { filter: brightness(1.3); }
    #${QUEST_ID}.d4 .d4-zoom {
      position: absolute; bottom: 14px; right: 14px;
      display: flex; flex-direction: column; gap: 4px;
    }
    #${QUEST_ID}.d4 .d4-zoom span {
      width: 26px; height: 26px; background: #0f1e30;
      border: 1px solid ${COLORS.line};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Press Start 2P', monospace; font-size: 10px;
      color: ${COLORS.dim}; cursor: pointer; user-select: none;
    }
    #${QUEST_ID}.d4 .d4-detail {
      background: #0f1e30;
      border: 1px solid ${COLORS.gold};
      padding: 14px; position: relative;
      margin-bottom: 14px; min-height: 56px;
    }
    #${QUEST_ID}.d4 .d4-detail::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: ${COLORS.green};
    }
    #${QUEST_ID}.d4 .d4-detail-cat {
      font-family: 'Press Start 2P', monospace; font-size: 7px;
      letter-spacing: 2px; color: ${COLORS.green}; margin-bottom: 6px;
    }
    #${QUEST_ID}.d4 .d4-detail-title {
      font-family: 'VT323', monospace; font-size: 22px;
      color: ${COLORS.text}; line-height: 1.1; margin-bottom: 6px;
    }
    #${QUEST_ID}.d4 .d4-detail-meta {
      font-family: 'VT323', monospace; font-size: 14px;
      color: ${COLORS.dim}; display: flex; gap: 14px; flex-wrap: wrap;
    }
    #${QUEST_ID}.d4 .d4-detail-empty {
      font-family: 'Press Start 2P', monospace; font-size: 8px;
      color: ${COLORS.dim}; letter-spacing: 1.5px; text-align: center;
      padding: 8px 0;
    }
    #${QUEST_ID}.d4 .d4-chips {
      display: flex; gap: 6px; padding-bottom: 12px;
      overflow-x: auto; scrollbar-width: none;
    }
    #${QUEST_ID}.d4 .d4-chips::-webkit-scrollbar { display: none; }
    #${QUEST_ID}.d4 .d4-chip {
      font-family: 'Press Start 2P', monospace; font-size: 7px;
      padding: 6px 10px; border: 1px solid ${COLORS.line};
      color: ${COLORS.dim}; white-space: nowrap; letter-spacing: 1px;
      cursor: pointer; user-select: none;
    }
    #${QUEST_ID}.d4 .d4-chip.on {
      border-color: ${COLORS.gold}; color: ${COLORS.gold};
      background: rgba(255,216,77,0.08);
    }
    #${QUEST_ID}.d4 .qnode { display: none !important; }
    @media (min-width: 1100px) {
      #${QUEST_ID}.d4 .d4-map-frame { padding: 18px; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'd4-overlay-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Extract events from rendered DOM (or fall back to demo data)
  function extractEvents(host) {
    const nodes = host.querySelectorAll('.qnode');
    if (!nodes.length) {
      // demo data so the screen isn't empty before user adds chapters
      return [
        { title: '出生 BORN', icon: '🌱', cat: 'life', date: '2001', current: false },
        { title: '小学 First school', icon: '🎓', cat: 'growth', date: '2007', current: false },
        { title: '搬到东京 Tokyo', icon: '🗼', cat: 'travel', date: '2013', current: false },
        { title: '第一份工作 First job', icon: '💼', cat: 'work', date: '2019', current: false },
        { title: '巴厘岛 Bali', icon: '🏝️', cat: 'travel', date: '2022', current: false },
        { title: 'GitLife shipped', icon: '💻', cat: 'achieve', date: '2024', current: false },
        { title: 'TODAY · 现在', icon: '⭐', cat: 'achieve', date: '2026', current: true },
      ];
    }
    return Array.from(nodes).map((n, i) => {
      const dot = n.querySelector('.qnode-dot');
      const card = n.querySelector('.node-card, .qnode-card');
      const title = card?.querySelector('.node-title, .qnode-title')?.textContent?.trim()
                 || card?.textContent?.trim().slice(0, 24)
                 || `Chapter ${i + 1}`;
      const dateEl = card?.querySelector('.node-date, .qnode-date');
      const date = dateEl?.textContent?.trim() || '';
      const cat = (n.dataset.cat || card?.dataset?.cat || '').toLowerCase();
      const icon = dot?.textContent?.trim() || '◆';
      return { title, icon, cat: cat || 'default', date, current: dot?.classList.contains('cur') || false };
    });
  }

  // Build the new map UI
  function paint(host) {
    const events = extractEvents(host);
    host.classList.add('d4');

    // Position pins along a meandering trail from bottom-left → top-right
    const W = 700, H = 380;
    const pad = 50;
    const points = events.map((_, i) => {
      const t = events.length === 1 ? 0.5 : i / (events.length - 1);
      const x = pad + t * (W - pad * 2);
      // gentle sine wander + overall upward slope
      const y = H - pad - t * (H - pad * 2) + Math.sin(t * Math.PI * 2.5) * 30;
      return { x, y };
    });

    const trailPath = points.length > 1
      ? 'M ' + points.map((p, i) => {
          if (i === 0) return `${p.x} ${p.y}`;
          const prev = points[i - 1];
          const cx = (p.x + prev.x) / 2;
          return `Q ${cx} ${prev.y} ${p.x} ${p.y}`;
        }).join(' ')
      : '';

    const pinsSvg = events.map((ev, i) => {
      const p = points[i];
      const c = CAT_COLOR[ev.cat] || CAT_COLOR.default;
      const big = ev.current || i === 0 || i === events.length - 1;
      const sz = big ? 7 : 5;
      const pulse = ev.current ? `
        <circle cx="${p.x}" cy="${p.y}" r="14" fill="none" stroke="${c}" stroke-width="1" opacity="0.5">
          <animate attributeName="r" from="12" to="22" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
        </circle>` : '';
      return `
        <g class="d4-pin" data-i="${i}">
          ${pulse}
          <rect x="${p.x - sz}" y="${p.y - sz}" width="${sz * 2}" height="${sz * 2}"
                fill="${c}" stroke="${COLORS.bg}" stroke-width="2"
                transform="rotate(45 ${p.x} ${p.y})" class="d4-pin-glyph"/>
          <text x="${p.x}" y="${p.y - 14}" text-anchor="middle" font-size="14">${ev.icon}</text>
          ${ev.date ? `<text x="${p.x}" y="${p.y + 22}" text-anchor="middle"
                font-family="'Press Start 2P', monospace" font-size="6"
                fill="${COLORS.gold}" letter-spacing="1">${ev.date}</text>` : ''}
        </g>`;
    }).join('');

    const cats = ['All', 'Travel', 'Work', 'Growth', 'Achieve'];
    const chipsHtml = cats.map((c, i) => `
      <span class="d4-chip${i === 0 ? ' on' : ''}" data-cat="${c.toLowerCase()}">${c}</span>
    `).join('');

    // Move existing qnodes to a hidden holder so we don't lose data
    const existing = host.querySelectorAll('.qnode');
    let stash = host.querySelector('.d4-stash');
    if (!stash) {
      stash = document.createElement('div');
      stash.className = 'd4-stash';
      stash.style.display = 'none';
      host.appendChild(stash);
    }
    existing.forEach(n => stash.appendChild(n));

    // Inject new UI
    let frame = host.querySelector('.d4-frame-root');
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'd4-frame-root';
      host.insertBefore(frame, stash);
    }
    frame.innerHTML = `
      <div class="d4-chips">${chipsHtml}</div>
      <div class="d4-map-frame">
        <svg class="d4-map-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="d4grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="${COLORS.line}" stroke-width="0.5" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="${W}" height="${H}" fill="url(#d4grid)"/>
          ${trailPath ? `<path d="${trailPath}" fill="none" stroke="${COLORS.gold}"
                  stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>` : ''}
          ${pinsSvg}
          <rect x="${W - 90}" y="0" width="90" height="50" fill="${COLORS.bg}" opacity="0.85"/>
          <text x="${W - 45}" y="30" text-anchor="middle"
                font-family="'Press Start 2P', monospace" font-size="6"
                fill="${COLORS.dim}" letter-spacing="1">??? FUTURE</text>
        </svg>
        <div class="d4-zoom">
          <span data-z="+">+</span><span data-z="-">−</span><span data-z="r">⌂</span>
        </div>
      </div>
      <div class="d4-detail" id="d4-detail">
        <div class="d4-detail-empty">▸ TAP A PIN TO SEE THE CHAPTER</div>
      </div>
    `;

    // Pin click → show detail
    frame.querySelectorAll('.d4-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const i = +pin.dataset.i;
        const ev = events[i];
        const detail = frame.querySelector('#d4-detail');
        detail.innerHTML = `
          <div class="d4-detail-cat">▸ CHAPTER ${i + 1} · ${(ev.cat || 'life').toUpperCase()}</div>
          <div class="d4-detail-title">${ev.icon} ${ev.title}</div>
          <div class="d4-detail-meta">
            ${ev.date ? `<span>📅 ${ev.date}</span>` : ''}
            ${ev.current ? `<span style="color:${COLORS.gold}">⭐ Current</span>` : ''}
          </div>
        `;
      });
    });

    // Chip filter (visual-only)
    frame.querySelectorAll('.d4-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        frame.querySelectorAll('.d4-chip').forEach(c => c.classList.remove('on'));
        chip.classList.add('on');
        const cat = chip.dataset.cat;
        frame.querySelectorAll('.d4-pin').forEach(pin => {
          const i = +pin.dataset.i;
          const ev = events[i];
          pin.style.opacity = (cat === 'all' || ev.cat === cat) ? '1' : '0.2';
        });
      });
    });
  }

  // Watch for the quest map being populated (presentation.js renders into it)
  function init() {
    const host = document.getElementById(QUEST_ID);
    if (!host) return;

    // Initial paint
    paint(host);

    // Re-paint whenever the original render replaces children
    const obs = new MutationObserver(muts => {
      const realChange = muts.some(m =>
        Array.from(m.addedNodes).some(n => n.nodeType === 1 && n.classList?.contains('qnode'))
      );
      if (realChange) {
        // debounce
        clearTimeout(host._d4Timer);
        host._d4Timer = setTimeout(() => paint(host), 30);
      }
    });
    obs.observe(host, { childList: true, subtree: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();
