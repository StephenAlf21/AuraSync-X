// Lightweight modal toggling shared across pages
(function () {
  function $(id) { return document.getElementById(id); }
  function safeOn(el, evt, fn) { if (el) el.addEventListener(evt, fn); }

  function openModal() {
    var modal = $('sitesModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    var card = modal.querySelector('.modal-card');
    if (card) {
      card.classList.remove('animate-pop-out');
      // force reflow to restart animation if needed
      void card.offsetWidth;
      card.classList.add('animate-pop-in');
    }
    modal.focus && modal.focus();
  }

  function closeModal() {
    var modal = $('sitesModal');
    if (!modal) return;
    var card = modal.querySelector('.modal-card');
    if (card) {
      card.classList.remove('animate-pop-in');
      card.classList.add('animate-pop-out');
      card.addEventListener('animationend', function handler() {
        card.removeEventListener('animationend', handler);
        modal.classList.add('hidden');
        card.classList.remove('animate-pop-out');
      }, { once: true });
    } else {
      modal.classList.add('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var openTop = $('openSitesTop');
    var openFooter = $('openSitesFooter');
    var closeBtn = $('closeSites');
    var modal = $('sitesModal');

    safeOn(openTop, 'click', openModal);
    safeOn(openFooter, 'click', openModal);
    safeOn(closeBtn, 'click', closeModal);
    safeOn(modal, 'click', function (e) { if (e.target === modal) closeModal(); });
    safeOn(document, 'keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    // Mouse glow for site cards
    document.querySelectorAll('.site-card').forEach(function(card){
      card.addEventListener('mousemove', function(ev){
        var rect = card.getBoundingClientRect();
        var x = ((ev.clientX - rect.left) / rect.width) * 100;
        var y = ((ev.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  });
})();
