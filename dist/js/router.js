/* ═══════════════════════════════════════
   Hash 路由
═══════════════════════════════════════ */
(function () {

  const views = {
    dashboard: window.dashboardView,
    compose:   window.composeView,
    inbox:     window.inboxView,
    sent:      window.sentView,
    trash:     window.trashView,
    contacts:  window.contactsView,
    settings:  window.settingsView
  };

  const pageTitles = {
    dashboard: '仪表盘',
    compose:   '写信',
    inbox:     '收件箱',
    sent:      '已发送',
    trash:     '回收站',
    contacts:  '地址簿',
    settings:  '设置'
  };

  const container = document.getElementById('viewContainer');
  let _currentView = null;

  // 只改 opacity/transform，不动其他属性
  function setFade(el, opacity, y) {
    el.style.opacity = opacity;
    el.style.transform = y !== 0 ? 'translateY(' + y + 'px)' : '';
  }

  function go(viewName) {
    const name = views[viewName] ? viewName : 'dashboard';
    window.location.hash = name;
  }

  function render(hash) {
    const name = (hash || '').replace('#', '') || 'dashboard';
    const viewName = views[name] ? name : 'dashboard';

    if (viewName === _currentView) return;
    _currentView = viewName;

    // 更新侧边栏高亮
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    // 标题淡入
    const titleEl = document.getElementById('pageTitle');
    titleEl.style.transition = 'none';
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(-3px)';
    setTimeout(() => {
      titleEl.textContent = pageTitles[viewName] || viewName;
      titleEl.style.transition = 'opacity .18s ease, transform .18s ease';
      titleEl.style.opacity = '1';
      titleEl.style.transform = '';
    }, 50);

    // 内容淡出
    container.style.transition = 'opacity .1s ease, transform .1s ease';
    setFade(container, 0, 6);

    setTimeout(() => {
      const view = views[viewName];
      if (view) {
        container.innerHTML = view.render();
        view.init && view.init();
      }
      store.setState({ currentView: viewName });

      // 双 rAF 确保 DOM 绘制后再淡入
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.style.transition = 'opacity .2s ease, transform .2s ease';
          setFade(container, 1, 0);
        });
      });
    }, 105);
  }

  window.addEventListener('hashchange', () => {
    _currentView = null;
    render(location.hash);
  });
  render(location.hash);

  window.router = { go };

})();
