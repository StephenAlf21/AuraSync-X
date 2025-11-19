// Home/landing page UI logic (navbar, dropdowns, modals, scroll behavior)
// Exposes small helpers used by inline HTML attributes on index.html.

(function () {
  function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    if (!menu) return;
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  }

  function showDropdown(id) {
    var menu = document.getElementById(id);
    if (!menu) return;
    menu.classList.remove('dropdown-enter');
    menu.classList.add('dropdown-active');
  }

  function hideDropdown(id) {
    var menu = document.getElementById(id);
    if (!menu) return;
    menu.classList.remove('dropdown-active');
    menu.classList.add('dropdown-enter');
  }

  function toggleModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;

    var content = modal.querySelector('div');
    if (!content) return;

    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      setTimeout(function () {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
      }, 10);
    } else {
      modal.classList.add('opacity-0', 'pointer-events-none');
      content.classList.remove('scale-100');
      content.classList.add('scale-95');
      setTimeout(function () {
        modal.classList.add('hidden');
      }, 300);
    }
  }

  function loadApp(url) {
    if (!url) return;
    window.location.href = url;
  }

  // Attach helpers to window so inline HTML can call them
  window.toggleMobileMenu = toggleMobileMenu;
  window.showDropdown = showDropdown;
  window.hideDropdown = hideDropdown;
  window.toggleModal = toggleModal;
  window.loadApp = loadApp;

  // Scroll-driven navbar + back-to-top behavior
  document.addEventListener('DOMContentLoaded', function () {
    var backToTopBtn = document.getElementById('backToTopBtn');
    var nav = document.getElementById('navbar');

    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset || 0;

      if (backToTopBtn) {
        if (y > 300) {
          backToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        } else {
          backToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
        }
      }

      if (nav) {
        nav.style.backgroundColor = y > 50
          ? 'rgba(5, 5, 10, 0.8)'
          : 'rgba(15, 23, 42, 0.6)';
      }
    });
  });
})();
