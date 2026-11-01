(() => {
  // Authentication is disabled: clear old local accounts and keep the prompt closed.
  try {
    localStorage.removeItem('translator-local-account');
    localStorage.removeItem('translator-account-session');
    localStorage.removeItem('translator-guest-counter');
  } catch {
    // Ignore unavailable browser storage.
  }

  const emailPrompt = document.getElementById('emailPrompt');
  if (emailPrompt) {
    emailPrompt.hidden = true;
    new MutationObserver(() => {
      if (!emailPrompt.hidden) emailPrompt.hidden = true;
    }).observe(emailPrompt, { attributes: true, attributeFilter: ['hidden'] });
  }

  document.getElementById('accountLogout')?.setAttribute('hidden', '');
  document.getElementById('accountSidebarTitle')?.removeAttribute('data-i18n');
  if (document.getElementById('accountSidebarTitle')) {
    document.getElementById('accountSidebarTitle').textContent = 'Herramientas';
  }

  document.getElementById('downloadCustomAlphabet')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = document.getElementById('customAlphabetStatus');
    try {
      const data = getCustomAlphabetData();
      const contents = customAlphabetFileContents(data);
      const fileName = (data.name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'mi-alfabeto') + '.cnv';
      const url = URL.createObjectURL(new Blob([contents], { type: 'application/octet-stream' }));
      const download = document.createElement('a');
      download.href = url;
      download.download = fileName;
      document.body.append(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = `Archivo ${fileName} descargado.`;
      status.classList.add('success');
    } catch (error) {
      status.textContent = error.message;
      status.classList.remove('success');
    }
  }, true);

  const action = document.getElementById('modBlockAction');
  const target = document.getElementById('modBlockTarget');
  const value = document.getElementById('modBlockValue');
  const color = document.getElementById('modBlockColor');
  const status = document.getElementById('modBlockStatus');
  const codeEditor = document.getElementById('modCode');

  function addCreatedZoneTab(name, html) {
    const nav = document.querySelector('.main-tabs');
    if (!nav) return;
    const zoneId = `modZonePanel${Date.now()}${Math.random().toString(36).slice(2)}`;
    const tab = document.createElement('button');
    const panel = document.createElement('section');
    const frame = document.createElement('iframe');
    const bodyStyle = getComputedStyle(document.body);
    const cardStyle = getComputedStyle(document.querySelector('.card'));
    const safeCss = (value) => value.replace(/</g, '');
    const zoneDocument = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{padding:24px 16px 36px;background-color:${safeCss(bodyStyle.backgroundColor)};background-image:${safeCss(bodyStyle.backgroundImage)};font-family:${safeCss(bodyStyle.fontFamily)};color:${safeCss(cardStyle.color)}}.zone-shell{position:relative;max-width:880px;min-height:calc(100vh - 60px);margin:0 auto;padding:clamp(20px,5vw,32px);border:1px solid ${safeCss(cardStyle.borderColor)};border-radius:20px;background:${safeCss(cardStyle.backgroundColor)};box-shadow:0 12px 30px #25558a18}.created-watermark{position:fixed;z-index:9999;top:7px;right:10px;color:${safeCss(bodyStyle.color)};font-size:10px;line-height:1.2;opacity:.75;pointer-events:none}
      </style></head><body><main class="zone-shell">${html}</main><span class="created-watermark">Creado en la página</span></body></html>`;
    tab.id = `${zoneId}Tab`;
    tab.type = 'button';
    tab.className = 'main-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-controls', zoneId);
    tab.textContent = name;
    panel.id = zoneId;
    panel.className = 'card main-tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = true;
    frame.className = 'mod-zone-frame';
    frame.title = name;
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.srcdoc = zoneDocument;
    panel.append(frame);
    nav.append(tab);
    nav.after(panel);
    tab.click();
  }

  window.addEventListener('message', (event) => {
    const runner = document.getElementById('modRunnerFrame');
    const data = event.data;
    if (!runner || event.source !== runner.contentWindow || !data || data.type !== 'translator-create-mod-zone') return;
    if (typeof data.html !== 'string' || data.html.length > 500_000) return;
    addCreatedZoneTab('Zona nueva', data.html);
  });

  document.addEventListener('click', (event) => {
    const selectedTab = event.target.closest('.main-tabs [role="tab"]');
    if (!selectedTab) return;
    document.querySelectorAll('.main-tabs [role="tab"]').forEach((tab) => {
      const selected = tab === selectedTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  }, true);

  document.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const currentTab = event.target.closest('.main-tabs [role="tab"]');
    if (!currentTab) return;
    const tabs = Array.from(document.querySelectorAll('.main-tabs [role="tab"]'));
    const index = tabs.indexOf(currentTab);
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    event.preventDefault();
    event.stopImmediatePropagation();
    tabs[nextIndex].click();
    tabs[nextIndex].focus();
  }, true);

  document.getElementById('addModBlock')?.addEventListener('click', () => {
    const blockAction = action.value;
    const selector = target.value;
    const blockValue = value.value.trim();
    let blockCode = '';

    if (blockAction === 'text' && !blockValue) {
      status.textContent = 'Escribe el texto que usará este bloque.';
      return;
    }
    if (blockAction === 'banner' && !blockValue) {
      status.textContent = 'Escribe el texto del anuncio.';
      return;
    }

    if (blockAction === 'text') {
      blockCode = `(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (element) element.textContent = ${JSON.stringify(blockValue)}; })();`;
    } else if (blockAction === 'color') {
      blockCode = `(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (element) element.style.color = ${JSON.stringify(color.value)}; })();`;
    } else if (blockAction === 'hide') {
      blockCode = `(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (element) element.hidden = true; })();`;
    } else {
      blockCode = `(() => { const banner = document.createElement('aside'); banner.textContent = ${JSON.stringify(blockValue)}; banner.setAttribute('role', 'note'); banner.style.cssText = 'margin:16px 0;padding:16px;border-radius:12px;background:${color.value};color:#fff;font-weight:700;text-align:center'; document.querySelector('.page')?.prepend(banner); })();`;
    }

    codeEditor.value = [codeEditor.value.trim(), blockCode].filter(Boolean).join('\n');
    status.textContent = 'Bloque añadido al código del mod. Puedes agregar más bloques o editar el código generado.';
    document.getElementById('modCodeTab').click();
    codeEditor.focus();
  });

  document.getElementById('newModBlock')?.addEventListener('click', () => {
    action.value = 'text';
    target.value = 'h1.title';
    value.value = '';
    color.value = '#1765ad';
    status.textContent = 'Bloque nuevo listo.';
    value.focus();
  });

  document.getElementById('createModZone')?.addEventListener('click', () => {
    const zoneStatus = document.getElementById('modZoneStatus');
    const zoneHtml = document.getElementById('modZoneHtml').value.trim();
    if (!zoneHtml) {
      zoneStatus.textContent = 'Escribe el código HTML antes de crear la pestaña.';
      return;
    }

    if (!document.querySelector('.main-tabs')) {
      zoneStatus.textContent = 'No se encontró la navegación principal.';
      return;
    }

    const safeHtml = JSON.stringify(zoneHtml).replace(/</g, '\\u003c');
    const generatedCode = `window.parent.postMessage({ type: 'translator-create-mod-zone', html: ${safeHtml} }, '*');`;
    codeEditor.value = [codeEditor.value.trim(), generatedCode].filter(Boolean).join('\n');
    addCreatedZoneTab('Zona nueva', zoneHtml);
    zoneStatus.textContent = 'Pestaña creada con el diseño actual del traductor. El HTML también se añadió al editor para guardar la zona como mod.';
    document.getElementById('modCodeTab').click();
    codeEditor.focus();
  });
})();

(() => {
  const tabs = Array.from(document.querySelectorAll('.main-tabs [role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  function selectMainTab(tab) {
    tabs.forEach((item, index) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
    tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      selectMainTab(tab);
    }, true);
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      selectMainTab(tabs[nextIndex]);
    }, true);
  });

  const games = {
    9: 'halloweenGame',
    10: 'dayOfTheDeadGame',
    11: 'christmasGame',
    0: 'newYearGame'
  };

  function updateSeasonalGame() {
    const selectedGame = games[new Date().getMonth()];
    Object.values(games).forEach((id) => {
      document.getElementById(id).hidden = id !== selectedGame;
    });
    document.getElementById('seasonalGameUnavailable').hidden = Boolean(selectedGame);
  }

  let candy = 0;
  document.getElementById('trickOrTreatButton').addEventListener('click', () => {
    const treats = ['🍬', '🍫', '🍭', '🍪'];
    candy += 1;
    document.getElementById('candyCount').textContent = `Dulces: ${candy} ${treats[Math.floor(Math.random() * treats.length)]}`;
  });

  const altar = document.getElementById('altarItems');
  let altarHasItems = false;
  document.getElementById('addAltarItem').addEventListener('click', () => {
    if (!altarHasItems) {
      altar.replaceChildren();
      altarHasItems = true;
    }
    const item = document.createElement('li');
    item.textContent = document.getElementById('altarItem').value;
    altar.append(item);
  });

  const gifts = ['Un deseo lleno de alegría ✨', 'Un abrazo para compartir 💝', '¡Un año de buenos momentos 🌟', 'Un regalo sorpresa 🎉'];
  document.getElementById('openGiftButton').addEventListener('click', () => {
    const gift = gifts[Math.floor(Math.random() * gifts.length)];
    document.getElementById('giftMessage').textContent = `¡Sorpresa! ${gift}`;
  });

  let celebrations = 0;
  document.getElementById('celebrateButton').addEventListener('click', () => {
    celebrations += 1;
    document.getElementById('celebrationMessage').textContent = `🎆 ¡Festejos: ${celebrations}! 🎉`;
  });

  function refreshSeasonalState() {
    updateTheme();
    updateSeasonalEvent();
    updateSeasonalGame();
  }

  refreshSeasonalState();
  window.addEventListener('focus', refreshSeasonalState);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshSeasonalState();
  });
  window.setInterval(refreshSeasonalState, 60_000);
})();
