// 問題データの読みこみ
(function () {
  const SUBJECTS = [
    { key: 'kokugo', label: '国語', badge: '国', file: 'data/questions/kokugo.json', color: '#ff5c8d' },
    { key: 'sansu', label: '算数', badge: '算', file: 'data/questions/sansu.json', color: '#4d9dff' },
    { key: 'shakai', label: '社会', badge: '社', file: 'data/questions/shakai.json', color: '#ff8a3d' },
    { key: 'rika', label: '理科', badge: '理', file: 'data/questions/rika.json', color: '#2ec4a6' },
    // 歴史：社会の中の「歴史」の印がついた問題（歴史イベントと同じ問題）。対戦だけで使う（battleOnly）
    { key: 'rekishi', label: '歴史', badge: '歴', file: null, from: 'shakai', tag: 'history', color: '#c0702a', battleOnly: true },
    { key: 'all', label: 'オールジャンル', badge: '全', file: null, color: '#8c6bff' },
  ];

  // イベントだけで使う教科（ふつうの教科えらび・ランキング・対戦には出さない）
  // tag の問題を from の教科から集める。イベントの点とイベントのランキングになる
  const EXTRA = [
    { key: 'history', label: '歴史', adminLabel: '歴史イベント', badge: '歴', from: 'shakai', tag: 'history', color: '#c0702a' },
  ];

  const cache = {};

  async function loadOne(subject) {
    if (cache[subject.key]) return cache[subject.key];
    const res = await fetch(subject.file, { cache: 'no-cache' });
    if (!res.ok) throw new Error(subject.label + 'の問題を読みこめませんでした');
    const list = await res.json();
    cache[subject.key] = list;
    return list;
  }

  // key: 'shakai' | 'rika' | 'kokugo' | 'sansu' | 'rekishi' | 'all' | 'history'（イベント）
  async function load(key) {
    const tagged = getSubject(key);
    if (tagged && tagged.tag) {
      const list = await loadOne(getSubject(tagged.from));
      return list.filter((q) => (q.tags || []).includes(tagged.tag));
    }
    if (key === 'all') {
      const lists = await Promise.all(SUBJECTS.filter((s) => s.file).map(loadOne));
      return [].concat(...lists);
    }
    return loadOne(getSubject(key));
  }

  function getSubject(key) {
    return SUBJECTS.find((s) => s.key === key) || EXTRA.find((s) => s.key === key);
  }

  // ---- いっしょに出さない組み合わせ ----
  // ・答えが同じ問題（聞き方を変えた「言いかえ」問題など）
  // ・問題文に、もう一方の問題の答えが書いてある組（例：「織田信長と徳川家康の軍が…」と、答えが「織田信長」の問題）
  // 答えの形は、漢字をふくむなら2文字以上、ひらがな・数字だけなら3文字以上のものを使う（短いと関係ない文にも入ってしまうため）
  const KANJI = /[々㐀-鿿]/;
  const prepCache = new WeakMap();
  function prep(q) {
    let p = prepCache.get(q);
    if (!p) {
      const norm = window.Judge ? Judge.normalizeAnswer : (s) => String(s || '');
      const forms = [];
      [q.answer].concat(q.alt || []).forEach((a) => {
        const f = norm(a);
        if ((KANJI.test(f) && f.length >= 2) || f.length >= 3) forms.push(f);
      });
      p = { key: norm(q.answer), forms, text: norm(q.question) };
      prepCache.set(q, p);
    }
    return p;
  }
  function clash(a, b) {
    const x = prep(a);
    const y = prep(b);
    return x.key === y.key || x.forms.some((f) => y.text.includes(f)) || y.forms.some((f) => x.text.includes(f));
  }

  // 同じ問題が出ないように、まぜてから n 問とり出す（いっしょに出さない組み合わせは後ろへ回す）
  const CHECK_MAX = 40; // 対戦ではぜんぶの問題をならべるので、調べるのは最初の40問まで
  function pick(list, n) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    const first = [];
    const rest = [];
    const later = [];
    a.forEach((q) => {
      if (first.length >= CHECK_MAX) rest.push(q);
      else if (first.some((p) => clash(p, q))) later.push(q);
      else first.push(q);
    });
    return first.concat(rest, later).slice(0, n);
  }

  window.Questions = { SUBJECTS, EXTRA, load, pick, getSubject };
})();
