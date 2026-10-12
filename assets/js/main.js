/* main.js — comportamento base da agência. Sem dependências.
   Nada aqui é necessário para o conteúdo aparecer: sem JS, o site funciona. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cabeçalho: marca rolagem e mede a altura (usada no scroll-margin das âncoras) */
  var header = document.querySelector('[data-header]');
  if (header) {
    var medir = function () { document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px'); };
    var rolar = function () { header.toggleAttribute('data-rolado', window.scrollY > 80); };
    medir(); rolar();
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', rolar, { passive: true });
  }

  /* Menu de celular: abre, fecha, Esc, foco */
  var menu = document.querySelector('.menu-celular');
  var abrir = document.querySelector('[data-abrir-menu]');
  var fechar = document.querySelectorAll('[data-fechar-menu]');
  function estado(aberto) {
    if (!menu) return;
    menu.dataset.aberto = aberto ? 'true' : 'false';
    menu.setAttribute('aria-hidden', aberto ? 'false' : 'true');
    document.body.dataset.menu = aberto ? 'true' : 'false';
    if (abrir) abrir.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    if (aberto) { var p = menu.querySelector('a, button'); if (p) p.focus(); } else if (abrir) abrir.focus();
  }
  if (abrir) abrir.addEventListener('click', function () { estado(true); });
  fechar.forEach(function (b) { b.addEventListener('click', function () { estado(false); }); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { estado(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.dataset.aberto === 'true') estado(false); });

  /* Entrada de seção: uma vez, a 15% de visibilidade, stagger de 70ms (máx. 6) */
  var itens = document.querySelectorAll('.revelar');
  if (reduzir || !('IntersectionObserver' in window)) {
    itens.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var irmaos = Array.prototype.filter.call(en.target.parentNode.children, function (c) { return c.classList.contains('revelar'); });
        var i = Math.min(irmaos.indexOf(en.target), 5);
        en.target.style.transitionDelay = (i > 0 ? i * 70 : 0) + 'ms';
        en.target.classList.add('visivel');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    itens.forEach(function (el) { obs.observe(el); });
  }

  /* Rolagem suave (Lenis, assets/js/lenis.min.js), no computador E no celular (decisão do Armin, 06/10/2026).
     Desligada com prefers-reduced-motion. Sem Lenis carregado, o site rola normal. */
  if (!reduzir && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.085, touchInertiaExponent: 1.7, anchors: { offset: -(header ? header.offsetHeight : 0) } });
    var quadro = function (t) { lenis.raf(t); requestAnimationFrame(quadro); };
    requestAnimationFrame(quadro);
    window.__lenis = lenis;
  }

  /* Botão fixo de WhatsApp (celular): aparece depois da primeira tela, em qualquer página */
  var fixo = document.querySelector('.whatsapp-fixo');
  if (fixo) {
    var alvo = document.querySelector('[data-heroi]') || document.querySelector('main > :first-child');
    var mostrar = function () {
      var limite = alvo ? alvo.getBoundingClientRect().bottom : window.innerHeight * 0.6;
      fixo.dataset.visivel = limite < 0 || window.scrollY > window.innerHeight * 0.6 ? 'true' : 'false';
    };
    mostrar();
    window.addEventListener('scroll', mostrar, { passive: true });
  }
})();
