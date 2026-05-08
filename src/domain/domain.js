'use strict';

/* ============================================================
  DOMAIN: STATIC DATA
  ============================================================ */
const CLASS_DB = {
  explorer: { name:'探险家', emoji:'🌍', color:'#44ff88', stats:{str:6,int:7,dex:8,wis:6,cha:7,lck:8} },
  scholar:  { name:'学者',   emoji:'📚', color:'#4488ff', stats:{str:4,int:10,dex:5,wis:9,cha:6,lck:5} },
  creator:  { name:'创造者', emoji:'🎨', color:'#aa44ff', stats:{str:5,int:8,dex:7,wis:7,cha:9,lck:6} },
  warrior:  { name:'战士',   emoji:'⚔️', color:'#ff6644', stats:{str:9,int:5,dex:6,wis:5,cha:6,lck:5} },
  athlete:  { name:'运动员', emoji:'🏃', color:'#ffdd00', stats:{str:8,int:5,dex:10,wis:5,cha:7,lck:7} },
  merchant: { name:'创业者', emoji:'💼', color:'#ffd700', stats:{str:5,int:7,dex:6,wis:8,cha:9,lck:8} },
};

const CAT_DB = {
  life:        { icon:'🏠', label:'人生节点' },
  travel:      { icon:'✈️', label:'旅行冒险' },
  education:   { icon:'🎓', label:'学习成长' },
  work:        { icon:'💼', label:'事业发展' },
  achievement: { icon:'🏆', label:'重要成就' },
  personal:    { icon:'❤️', label:'情感记录' },
};

const MOOD_DB = {
  excited:'😄', happy:'😊', calm:'😌',
  proud:'🏆', nervous:'😰', sad:'😢',
};
const MOOD_LBL = {
  excited:'兴奋', happy:'开心', calm:'平静',
  proud:'自豪', nervous:'紧张', sad:'难过',
};

const SCENE_DB = {
  '苏州':['🏯','江南水乡 · 园林古城'],'上海':['🌆','东方明珠 · 魔幻都市'],
  '北京':['🏛️','故宫长城 · 千年古都'],'广州':['🌸','花城 · 岭南风情'],
  '成都':['🐼','天府之国 · 熊猫故乡'],'杭州':['🌊','西湖 · 人间天堂'],
  'toronto':['🍁','CN Tower · 枫叶之都'],'多伦多':['🍁','CN Tower · 枫叶之都'],
  'vancouver':['🏔️','山海之城 · 太平洋之滨'],'温哥华':['🏔️','山海之城 · 太平洋之滨'],
  'montreal':['🗼','老港 · 法语文化之城'],'蒙特利尔':['🗼','老港 · 法语文化之城'],
  'new york':['🗽','自由女神 · 时代广场'],'纽约':['🗽','自由女神 · 时代广场'],
  'miami':['🏖️','阳光海滩 · 棕榈树林'],'迈阿密':['🏖️','阳光海滩 · 棕榈树林'],
  'tokyo':['🗼','东京铁塔 · 樱花城市'],'东京':['🗼','东京铁塔 · 樱花城市'],
  'paris':['🗼','埃菲尔铁塔 · 浪漫之都'],'巴黎':['🗼','埃菲尔铁塔 · 浪漫之都'],
  'london':['💂','大本钟 · 雾都伦敦'],'伦敦':['💂','大本钟 · 雾都伦敦'],
  'seoul':['🏙️','首尔塔 · 汉江之滨'],'首尔':['🏙️','首尔塔 · 汉江之滨'],
};

const ITEMS_DB = {
  sword:    {icon:'🗡️',name:'新手剑',    rar:'common',   slot:'weapon'},
  bow:      {icon:'🏹',name:'猎人弓',    rar:'rare',     slot:'weapon'},
  staff:    {icon:'🪄',name:'魔法杖',    rar:'epic',     slot:'weapon'},
  pen:      {icon:'✒️',name:'创意羽笔',  rar:'legendary',slot:'weapon'},
  camera:   {icon:'📷',name:'探险相机',  rar:'epic',     slot:'weapon'},
  leather:  {icon:'🧥',name:'皮革外套',  rar:'common',   slot:'armor'},
  robe:     {icon:'👘',name:'法师袍',    rar:'epic',     slot:'armor'},
  hoodie:   {icon:'🧶',name:'创客卫衣',  rar:'rare',     slot:'armor'},
  helmet1:  {icon:'⛑️',name:'探险帽',    rar:'common',   slot:'helmet'},
  crown:    {icon:'👑',name:'黄金王冠',  rar:'legendary',slot:'helmet'},
  wizardhat:{icon:'🎩',name:'魔术礼帽',  rar:'epic',     slot:'helmet'},
  boots1:   {icon:'👟',name:'运动跑鞋',  rar:'common',   slot:'boots'},
  hikeboots:{icon:'🥾',name:'探险登山靴',rar:'rare',     slot:'boots'},
  ring1:    {icon:'💍',name:'智慧戒指',  rar:'rare',     slot:'accessory'},
  watch:    {icon:'⌚',name:'时间手表',  rar:'epic',     slot:'accessory'},
  medal:    {icon:'🎖️',name:'荣誉勋章',  rar:'legendary',slot:'accessory'},
  horse:    {icon:'🐴',name:'骏马',      rar:'common',   slot:'mount'},
  dragon:   {icon:'🐉',name:'幻龙',      rar:'legendary',slot:'mount'},
  bike:     {icon:'🚴',name:'探险自行车',rar:'rare',     slot:'mount'},
  plane:    {icon:'✈️',name:'私人飞机',  rar:'epic',     slot:'mount'},
};

const SLOT_LABELS = {
  weapon:'武器', armor:'护甲', helmet:'头盔',
  boots:'靴子', accessory:'饰品', mount:'坐骑',
};
const SLOT_DEFAULT = {
  weapon:'⚔️', armor:'🛡️', helmet:'⛑️',
  boots:'👟', accessory:'💍', mount:'🐴',
};

const ACHIEVEMENTS_DB = [
  {id:'born',    icon:'👶', name:'人生起点', desc:'注册账号'},
  {id:'chapter1',icon:'📖', name:'第一章',   desc:'创建第一个关卡'},
  {id:'traveler',icon:'✈️', name:'旅行者',   desc:'记录旅行关卡'},
  {id:'student', icon:'🎓', name:'求知者',   desc:'记录学习关卡'},
  {id:'5chapters',icon:'🗺️',name:'探索者',  desc:'解锁5个关卡'},
  {id:'lv10',    icon:'⭐', name:'青年英雄', desc:'达到Lv.10'},
  {id:'lv20',    icon:'🌟', name:'成年冒险者',desc:'达到Lv.20'},
  {id:'builder', icon:'🏆', name:'成就猎人', desc:'解锁3项成就'},
];

const AVATAR_OPTIONS = [
  '🌍','📚','🎨','⚔️','🏃','💼',
  '🧙','🏹','🤺','🎭','🦸','🧑‍💻',
  '🧑‍🎤','🧑‍🚀','🧑‍🔬','🧑‍🎨','🧑‍🏫','🦊',
  '🐉','🦋','⭐','🔮','🗡️','🏆',
];

const SAMPLE_EXPLORERS = [
  {name:'YuWen',  cls:'scholar',  ava:'📚', lv:22, loc:'Tokyo, JP'},
  {name:'Alex_T', cls:'explorer', ava:'🌍', lv:25, loc:'Vancouver, CA'},
  {name:'MeiLin', cls:'creator',  ava:'🎨', lv:19, loc:'Shanghai, CN'},
  {name:'Raj',    cls:'merchant', ava:'💼', lv:28, loc:'New York, US'},
];

const HOT_ZONES = [
  {icon:'🍁', name:'Toronto, Canada',    players:12, type:'留学生聚集地'},
  {icon:'🗽', name:'New York, USA',       players:8,  type:'创业者聚集地'},
  {icon:'🗼', name:'Tokyo, Japan',        players:6,  type:'旅行者聚集地'},
  {icon:'🏛️', name:'Beijing, China',     players:15, type:'求知者聚集地'},
  {icon:'🏖️', name:'Miami, USA',         players:4,  type:'度假胜地'},
];

const SKILL_ICONS = [
  '💻','📱','🎨','📷','🎬','🎵','🎤','📝','📊','📈',
  '🔬','⚗️','🧮','🌍','✈️','🚴','🏃','🎾','⛳','🏊',
  '🧘','🍳','🌱','🎭','🤝','💬','🗣️','📖','🧠','🚀',
  '⚽','🏀','🎸','🎹','🎯','🏋️','🤺','🧗','🎲','💡',
];
const SKILL_LV_LABELS = ['', '初学', '基础', '进阶', '熟练', '精通'];

/* ============================================================
  DOMAIN: PURE HELPERS
  ============================================================ */
function calcLv(birthday) {
  const ms = Date.now() - new Date(birthday).getTime();
  const totalDays = Math.floor(ms / 86400000);
  const level = Math.floor(totalDays / 365.25);
  const daysIn = totalDays - Math.floor(level * 365.25);
  const toNext = Math.ceil(365.25 - daysIn);
  return { level, totalDays, daysIn, toNext, pct: (daysIn / 365.25) * 100 };
}

function defaultTags(cls) {
  return {
    explorer: ['🌍 探险家','✈️ 旅行者','🗺️ 地图收集者'],
    scholar:  ['📚 学者','🎓 求知者','💡 思考者'],
    creator:  ['🎨 创造者','💡 创新者','✨ 艺术家'],
    warrior:  ['⚔️ 战士','💪 强者','🛡️ 守护者'],
    athlete:  ['🏃 运动员','🏆 竞技者','💨 速度之神'],
    merchant: ['💼 创业者','💰 商人','📈 成长黑客'],
  }[cls] || [];
}

function defaultSkills(cls) {
  return {
    explorer: [{icon:'✈️',name:'旅行规划',lv:4},{icon:'📷',name:'摄影',lv:3},{icon:'🌍',name:'跨文化沟通',lv:3}],
    scholar:  [{icon:'📖',name:'文献研究',lv:5},{icon:'✍️',name:'学术写作',lv:4},{icon:'🧠',name:'批判性思维',lv:4}],
    creator:  [{icon:'🎨',name:'视觉设计',lv:5},{icon:'💡',name:'创意策划',lv:4},{icon:'🎬',name:'视频制作',lv:3}],
    warrior:  [{icon:'🎯',name:'目标管理',lv:4},{icon:'💪',name:'健身训练',lv:4},{icon:'🗣️',name:'团队领导',lv:3}],
    athlete:  [{icon:'🏃',name:'耐力训练',lv:5},{icon:'🏋️',name:'力量训练',lv:4},{icon:'🧘',name:'运动恢复',lv:3}],
    merchant: [{icon:'💼',name:'商业谈判',lv:5},{icon:'📈',name:'增长策略',lv:4},{icon:'🤝',name:'人脉拓展',lv:4}],
  }[cls] || [];
}

function defaultEvents(name, bday) {
  return [{
    id: 1, title: '人生起点', location: '地球',
    date: bday, cat: 'life',
    desc: `${name} 的冒险故事从这里开始。每一段伟大的旅程，都需要一个起点。`,
    mood: 'happy', exp: 0,
  }];
}

function rarLabel(r) {
  return {common:'普通',rare:'稀有',epic:'史诗',legendary:'传说'}[r] || r;
}
