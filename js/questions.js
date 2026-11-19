// 問題データの読みこみ
(function () {
  const SUBJECTS = [
    { key: 'kokugo', label: '国語', badge: '国', file: 'data/questions/kokugo.json', color: '#ff5c8d' },
    { key: 'sansu', label: '算数', badge: '算', file: 'data/questions/sansu.json', color: '#4d9dff' },
    { key: 'shakai', label: '社会', badge: '社', file: 'data/questions/shakai.json', color: '#ff8a3d' },
    { key: 'rika', label: '理科', badge: '理', file: 'data/questions/rika.json', color: '#2ec4a6' },
    { key: 'all', label: 'オールジャンル', badge: '全', file: null, color: '#8c6bff' },
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

  // key: 'shakai' | 'rika' | 'kokugo' | 'sansu' | 'all'
  async function load(key) {
    if (key === 'all') {
      const lists = await Promise.all(SUBJECTS.filter((s) => s.file).map(loadOne));
      return [].concat(...lists);
    }
    return loadOne(getSubject(key));
  }

  function getSubject(key) {
    return SUBJECTS.find((s) => s.key === key);
  }

  // 同じ問題が出ないように、まぜてから n 問とり出す
  function pick(list, n) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  window.Questions = { SUBJECTS, load, pick, getSubject };
})();
