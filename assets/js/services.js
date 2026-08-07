document.addEventListener('DOMContentLoaded', () => {
  // Header scroll class toggle
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('overlay');

  if (burgerBtn && mobileNav && overlay) {
    function toggleMobileNav() {
      mobileNav.classList.toggle('open');
      overlay.classList.toggle('active');
      burgerBtn.classList.toggle('active');
    }

    burgerBtn.addEventListener('click', toggleMobileNav);
    overlay.addEventListener('click', toggleMobileNav);
  }
});
