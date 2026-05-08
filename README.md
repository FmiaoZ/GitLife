# ⚔️ LIFE RPG · 人生冒险

> 把你的人生做成一场 RPG 游戏 — 每段经历都是一个关卡

**Live Demo:** open `index.html` in any browser, or serve with `python3 -m http.server`

---

## 什么是 LIFE RPG？

LIFE RPG 是一个像素风格的个人成长记录平台。你的生日决定你的等级，你的技能、装备、成就构成你独一无二的角色档案。灵感来自 RPG 游戏 × LinkedIn × 个人日记。

---

## 功能

| 模块 | 说明 |
|------|------|
| 🧑‍🎮 角色系统 | 生日自动计算等级 / EXP，6种职业，头像自定义 |
| ⚔️ 装备栏 | 武器 / 护甲 / 头盔 / 靴子 / 饰品 / 坐骑 6个槽位 |
| 💡 技能系统 | LinkedIn 风格自定义技能，5级熟练度 + 进度条 |
| 🗺️ 冒险地图 | 人生事件可视化为关卡节点，支持添加/查看 |
| 🏆 成就系统 | 自动解锁成就徽章 |
| 🌍 世界探索 | 查看其他冒险者（Demo 数据） |
| 🎒 背包系统 | 物品收集 + 装备切换 |
| ☁️ 云端存档 | Supabase 多端同步，邮箱密码登录 |

---

## 技术栈

- **纯单文件 HTML/CSS/JS** — 无框架，无构建步骤，直接打开即用
- **Supabase** — Auth（邮箱+密码）+ PostgreSQL 云端存储
- **Press Start 2P + VT323** — 像素 RPG 字体
- **CRT 扫描线效果** — CSS repeating-linear-gradient

---

## 快速开始

### 本地运行（无后端）
```bash
open index.html
# 或
python3 -m http.server 7777
# 浏览器打开 http://localhost:7777
```
数据存在浏览器 localStorage，仅限本设备。

### 接入 Supabase 云端（推荐）

1. 在 [supabase.com](https://supabase.com) 创建项目
2. SQL Editor 运行：

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  bday text not null,
  bio text,
  cls text default 'explorer',
  avatar text default '🌍',
  equipment jsonb default '{}',
  tags jsonb default '[]',
  skills jsonb default '[]',
  achievements jsonb default '[]',
  inventory jsonb default '[]',
  events jsonb default '[]',
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "own_profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
```

3. Authentication → Settings → 关闭 **Enable email confirmations**
4. 在 `index.html` 顶部 `<script>` 中填入你的 URL 和 anon key：

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

---

## 项目结构

```
life-rpg/
└── index.html   # 完整应用（CSS + HTML + JS 单文件）
```

---

## 截图预览

- 开始界面：像素风 LOGO + PRESS START
- 角色页：等级 / EXP / 装备栏 / 技能 / 成就
- 冒险地图：人生事件关卡节点
- 登录/注册：弹窗式邮箱+密码表单

---

## License

MIT — 随意 fork 和魔改，做成你自己的人生游戏。
