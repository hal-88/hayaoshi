// 記録の保存場所
// ・js/firebase-config.js が入っていれば Firebase（Realtime Database＋匿名ログイン）
// ・まだ空っぽなら「テストモード」（この端末の localStorage だけ）
// どちらでも、同じ使い方（Store.〇〇）で読み書きできる。
(function () {
  const SDK = '10.14.1';
  const SDK_FILES = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-database-compat.js'];
  const SUBJECT_KEYS = ['kokugo', 'sansu', 'shakai', 'rika', 'all'];

  let mode = null; // 'firebase' | 'test'
  let db = null;
  let uid = null;

  function hasConfig() {
    const c = window.FIREBASE_CONFIG || {};
    return !!(c.apiKey && c.databaseURL && c.projectId);
  }

  // ---------- 名前 → キー ----------
  // 前後の空白を消して、全角・半角をそろえる（NFKC）
  function normalizeName(name) {
    return String(name || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  }
  // Firebase のキーに使えない文字（. # $ [ ] /）と見えない文字をのぞく
  function nameKey(name) {
    const k = normalizeName(name).replace(/[.#$[\]/\u0000-\u001f\u007f]/g, '');
    return k || null;
  }

  // ---------- Firebase の読みこみ ----------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('読みこめませんでした: ' + src));
      document.head.appendChild(s);
    });
  }

  function withTimeout(p, ms, msg) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);
  }

  async function initFirebase() {
    for (const f of SDK_FILES) {
      if (f === 'firebase-app-compat.js' && window.firebase) continue;
      await loadScript(`https://www.gstatic.com/firebasejs/${SDK}/${f}`);
    }
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    const auth = firebase.auth();
    const user = await withTimeout(new Promise((resolve, reject) => {
      const off = auth.onAuthStateChanged((u) => {
        if (u) { off(); resolve(u); }
      }, reject);
      if (!auth.currentUser) auth.signInAnonymously().catch(reject);
    }), 15000, 'ログインに時間がかかっています');
    uid = user.uid;
    db = firebase.database();
  }

  async function init() {
    if (mode) return mode;
    if (hasConfig()) {
      await initFirebase();
      mode = 'firebase';
    } else {
      uid = 'test-device';
      mode = 'test';
    }
    return mode;
  }

  // ---------- テストモード用（この端末だけの小さなデータベース） ----------
  const TEST_KEY = 'hayaoshi.testdb';
  function testRead() {
    try { return JSON.parse(localStorage.getItem(TEST_KEY)) || {}; } catch (e) { return {}; }
  }
  function testWrite(data) {
    try { localStorage.setItem(TEST_KEY, JSON.stringify(data)); } catch (e) { /* 何もしない */ }
  }
  function testGet(path) {
    let cur = testRead();
    for (const p of path.split('/')) {
      if (cur == null) return null;
      cur = cur[p];
    }
    return cur === undefined ? null : JSON.parse(JSON.stringify(cur));
  }
  function testSet(path, value) {
    const data = testRead();
    const parts = path.split('/');
    let cur = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    const last = parts[parts.length - 1];
    if (value === null) delete cur[last]; else cur[last] = value;
    testWrite(data);
  }

  // ---------- 共通の読み書き ----------
  async function get(path) {
    if (mode === 'test') return testGet(path);
    const snap = await db.ref(path).get();
    return snap.exists() ? snap.val() : null;
  }
  async function update(path, values) {
    if (mode === 'test') {
      const cur = testGet(path) || {};
      testSet(path, Object.assign(cur, values));
      return;
    }
    await db.ref(path).update(values);
  }
  // fn(いまの値) → 新しい値（undefined を返すと書かない）
  async function transaction(path, fn) {
    if (mode === 'test') {
      const next = fn(testGet(path));
      if (next !== undefined) testSet(path, next);
      return testGet(path);
    }
    const res = await db.ref(path).transaction(fn);
    return res.snapshot.val();
  }

  // ---------- プレイヤー ----------
  function getPlayer(key) { return get('players/' + key); }

  function savePlayer(key, values) {
    return update('players/' + key, Object.assign({}, values, { updatedAt: Date.now() }));
  }

  // 累計点数をふやす（同じ名前の人が2台で同時に遊んでも、点数が消えないようにする）
  async function addPoints(key, name, delta) {
    const v = await transaction('players/' + key + '/totalPoints', (cur) => (Number(cur) || 0) + delta);
    const total = Number(v) || 0;
    const acc = {};
    Avatar.ownedAccessories(total).forEach((x) => { acc[x.id] = true; });
    await savePlayer(key, { name, accessories: acc });
    return total;
  }

  // ---------- ランキング ----------
  // ベスト記録のときだけ書きかえる
  async function submitScore(subject, key, name, avatar, score) {
    let isNewBest = false;
    const v = await transaction('rankings/' + subject + '/' + key, (cur) => {
      if (cur && Number(cur.best) >= score) { isNewBest = false; return undefined; }
      isNewBest = true;
      return { name, best: score, avatar, updatedAt: Date.now() };
    });
    const best = v ? Number(v.best) || 0 : score;
    return { best, isNewBest };
  }

  async function getBest(subject, key) {
    const v = await get('rankings/' + subject + '/' + key + '/best');
    return Number(v) || 0;
  }

  async function getAllBest(key) {
    const out = {};
    await Promise.all(SUBJECT_KEYS.map(async (s) => { out[s] = await getBest(s, key); }));
    return out;
  }

  function toList(obj) {
    return Object.keys(obj || {}).map((k) => Object.assign({ key: k }, obj[k]))
      .filter((x) => typeof x.best === 'number');
  }
  function sortRank(list) {
    return list.sort((a, b) => b.best - a.best || (a.updatedAt || 0) - (b.updatedAt || 0));
  }

  // 上位10人
  async function getRanking(subject) {
    if (mode === 'test') return sortRank(toList(testGet('rankings/' + subject))).slice(0, 10);
    const snap = await db.ref('rankings/' + subject).orderByChild('best').limitToLast(10).get();
    return sortRank(toList(snap.val()));
  }

  // 自分より点が高い人の数 ＋ 1 ＝ 自分の順位
  async function getRank(subject, best) {
    if (!best) return null;
    if (mode === 'test') {
      return toList(testGet('rankings/' + subject)).filter((x) => x.best > best).length + 1;
    }
    const snap = await db.ref('rankings/' + subject).orderByChild('best').startAt(best + 1).get();
    return snap.numChildren() + 1;
  }

  // キャラを作りなおしたら、ランキングのキャラも新しくする
  async function updateRankingProfile(key, name, avatar) {
    await Promise.all(SUBJECT_KEYS.map(async (s) => {
      const cur = await get('rankings/' + s + '/' + key + '/best');
      if (cur != null) await update('rankings/' + s + '/' + key, { name, avatar });
    }));
  }

  window.Store = {
    SUBJECT_KEYS, init, hasConfig, normalizeName, nameKey,
    getPlayer, savePlayer, addPoints,
    submitScore, getBest, getAllBest, getRanking, getRank, updateRankingProfile,
    mode: () => mode, uid: () => uid, db: () => db,
  };
})();
