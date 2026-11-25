// ランキングの画面（教科ごとに上位10人）
(function () {
  const $ = (id) => document.getElementById(id);
  let currentSubject = 'kokugo';
  let loadId = 0;

  function buildTabs() {
    const wrap = $('rank-tabs');
    wrap.innerHTML = '';
    const list = Questions.SUBJECTS.filter((s) => !s.battleOnly);
    // 歴史イベントの間は、最後に「歴史チャレンジ」のランキング（イベント画面のランキングと同じもの）
    if (HistoryEvent.isOpen()) {
      const ev = Questions.getSubject(HistoryEvent.EVENT.subject);
      list.push(Object.assign({}, ev, { label: '歴史チャレンジ', isEvent: true }));
    }
    list.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'rank-tab' + (s.isEvent ? ' rank-tab-event' : '');
      b.style.setProperty('--c', s.color);
      b.textContent = s.label;
      if (s.isEvent) {
        const tag = document.createElement('span');
        tag.className = 'rank-tab-tag';
        tag.textContent = '期間限定';
        b.appendChild(tag);
      }
      b.dataset.key = s.key;
      b.addEventListener('click', () => {
        Sound.play('tap');
        show(s.key);
      });
      wrap.appendChild(b);
    });
  }

  async function show(subjectKey) {
    currentSubject = subjectKey || currentSubject;
    const myId = ++loadId;
    $('rank-tabs').querySelectorAll('.rank-tab').forEach((b) => b.classList.toggle('active', b.dataset.key === currentSubject));
    const list = $('rank-list');
    list.innerHTML = '<li class="rank-loading">読みこみ中…</li>';
    $('rank-empty').hidden = true;
    $('rank-me').textContent = '';

    let rows, myRank;
    const myBest = Profile.best(currentSubject);
    try {
      [rows, myRank] = await Promise.all([
        Store.getRanking(currentSubject),
        Store.getRank(currentSubject, myBest),
      ]);
    } catch (e) {
      if (myId !== loadId) return;
      list.innerHTML = '<li class="rank-loading">読みこめませんでした。インターネットを たしかめてね</li>';
      return;
    }
    if (myId !== loadId) return; // べつのタブをおした

    renderRows(list, rows);
    $('rank-empty').hidden = rows.length > 0;

    $('rank-me').textContent = myBest
      ? 'あなたの ベスト記録：' + myBest + '点（' + myRank + '位）'
      : currentSubject === HistoryEvent.EVENT.subject
        ? 'あなたは まだ 歴史チャレンジの 記録がないよ'
        : 'あなたは まだ この教科の 記録がないよ';
  }

  // 上位10人を ならべる（歴史イベントのランキングでも使う）
  function renderRows(list, rows) {
    list.innerHTML = '';
    let rank = 0;
    let prevBest = null;
    rows.forEach((r, i) => {
      // 同じ点なら同じ順位
      if (r.best !== prevBest) rank = i + 1;
      prevBest = r.best;
      const li = document.createElement('li');
      li.className = 'rank-row' + (rank <= 3 ? ' top' + rank : '') + (r.key === Profile.key() ? ' me' : '');
      li.innerHTML = '<span class="rank-no"></span><span class="avatar-badge rank-avatar"></span><span class="rank-name"></span><span class="rank-score"></span>';
      li.querySelector('.rank-no').textContent = rank;
      li.querySelector('.rank-avatar').innerHTML = Avatar.render(r.avatar || Avatar.DEFAULT);
      li.querySelector('.rank-name').textContent = r.name || '？';
      li.querySelector('.rank-score').textContent = r.best + '点';
      list.appendChild(li);
    });
  }

  function open() {
    // イベントが始まった・終わったときに タブを作りなおす
    const hasEvent = !!$('rank-tabs').querySelector('.rank-tab-event');
    if (!$('rank-tabs').children.length || hasEvent !== HistoryEvent.isOpen()) buildTabs();
    if (!$('rank-tabs').querySelector('[data-key="' + currentSubject + '"]')) currentSubject = 'kokugo';
    show(currentSubject);
  }

  window.Ranking = { open, show, renderRows };
})();
