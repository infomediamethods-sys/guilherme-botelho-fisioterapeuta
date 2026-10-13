/* movimento.js — movimento DESTE site, reproduzido de agilityosteopathy.com.au (Kit de Design, seção "Movimento").
   - Herói: fadeUp escalonado (CSS, [data-entra]); entradas ao rolar: .revelar do base.css com 26px e a curva da referência.
   - Mapa do corpo (pontos + chips + painel), cartões de caso que abrem para 2 colunas, acordeão, horário de HOJE,
     menu do celular (hambúrguer vira ×, rolagem trava), barra fixa visível desde o início.
   main.js e base.css não se editam. Animações e transformações somem com prefers-reduced-motion (CSS);
   os comportamentos (abrir, trocar painel) continuam funcionando. */
(function () {
  'use strict';
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Barra fixa (Ligar / WhatsApp): visível desde a primeira tela, como na referência */
  var barra = document.querySelector('.barra-fixa');
  if (barra) {
    barra.dataset.visivel = 'true'; /* o CSS (.whatsapp-fixo.barra-fixa { transform: none }) já a mantém no lugar */
  }

  /* Rolagem suave mais responsiva: o Lenis do template (main.js, lerp 0.1) parecia "travado" para o Armin;
     0.15 segue a rolagem mais de perto, sem perder a suavidade (13/10/2026). main.js continua sem edição. */
  if (window.__lenis) window.__lenis.options.lerp = 0.15;

  /* Menu do celular: o hambúrguer também fecha (vira ×) e a rolagem suave para enquanto aberto */
  var botaoMenu = document.querySelector('[data-abrir-menu]');
  var menu = document.querySelector('.menu-celular');
  if (botaoMenu && menu) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-abrir-menu]') && menu.dataset.aberto === 'true') {
        e.stopPropagation();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    }, true);
    menu.setAttribute('data-lenis-prevent', '');
    new MutationObserver(function () {
      var aberto = menu.dataset.aberto === 'true';
      var cab = document.querySelector('[data-header]');
      if (aberto && cab) menu.style.setProperty('--menu-topo', Math.max(0, cab.getBoundingClientRect().bottom) + 'px');
      botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      if (window.__lenis) { if (aberto) window.__lenis.stop(); else window.__lenis.start(); }
    }).observe(menu, { attributes: true, attributeFilter: ['data-aberto'] });
  }

  /* Entradas ao rolar (.revelar): terminada a entrada, o elemento sai do .revelar para que a transição e o atraso
     escalonado não fiquem gravados nele e os hovers (cartões, botões) voltem às durações da referência */
  document.querySelectorAll('.revelar').forEach(function (el) {
    el.addEventListener('transitionend', function fim(e) {
      if (e.target !== el || !el.classList.contains('visivel')) return;
      el.removeEventListener('transitionend', fim);
      el.style.transitionDelay = '';
      el.classList.remove('revelar', 'visivel');
    });
  });

  /* Mapa do corpo: ponto ou chip troca o painel (fade 0,25s) e marca o par */
  var mapa = document.querySelector('[data-mapa]');
  if (mapa) {
    var botoes = mapa.querySelectorAll('[data-regiao]');
    var paineis = mapa.querySelectorAll('[data-painel]');
    var ativar = function (id) {
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.regiao === id ? 'true' : 'false'); });
      paineis.forEach(function (p) {
        var ativo = p.dataset.painel === id;
        if (ativo && p.hidden) {
          p.hidden = false;
          if (!reduzir) { p.classList.remove('entrando'); void p.offsetWidth; p.classList.add('entrando'); }
        } else if (!ativo) { p.hidden = true; }
      });
    };
    botoes.forEach(function (b) { b.addEventListener('click', function () { ativar(b.dataset.regiao); }); });
  }

  /* Cartões de caso: abrem para 2 colunas com o texto completo */
  document.querySelectorAll('[data-caso]').forEach(function (caso) {
    var botao = caso.querySelector('.caso__abrir');
    var rotulo = caso.querySelector('.caso__rotulo');
    if (!botao) return;
    botao.addEventListener('click', function () {
      var abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      caso.dataset.aberto = abrir ? 'true' : 'false';
      if (rotulo) rotulo.textContent = abrir ? 'Fechar' : 'Ler mais';
    });
  });

  /* Acordeão das dúvidas */
  document.querySelectorAll('.faq__botao').forEach(function (b) {
    var resp = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var abrir = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      if (resp) resp.dataset.aberto = abrir ? 'true' : 'false';
    });
  });

  /* Cartão de horários: pílula HOJE no dia de hoje (fuso de Florianópolis) */
  var horarios = document.querySelector('[data-horarios]');
  if (horarios) {
    var dia;
    try {
      var nome = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date());
      dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(nome);
    } catch (e) { dia = new Date().getDay(); }
    horarios.querySelectorAll('[data-dias]').forEach(function (li) {
      if (li.dataset.dias.split(',').indexOf(String(dia)) === -1) return;
      var pilula = document.createElement('span');
      pilula.className = 'hoje';
      pilula.textContent = 'HOJE';
      li.querySelector('.horarios__dia').appendChild(pilula);
    });
  }
})();
