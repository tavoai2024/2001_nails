document.addEventListener('DOMContentLoaded', () => {
  // Cash vs Credit Price Switcher Logic
  const switcher = document.getElementById('price-toggle');
  const priceElements = document.querySelectorAll('.service-price');
  
  if (switcher && priceElements.length > 0) {
    function updatePrices() {
      const mode = switcher.checked ? 'credit' : 'cash';
      
      // Update toggle labels active state
      const cashLabel = document.querySelector('.toggle-label.cash');
      const creditLabel = document.querySelector('.toggle-label.credit');
      
      if (mode === 'credit') {
        cashLabel.classList.remove('active');
        creditLabel.classList.add('active');
      } else {
        cashLabel.classList.add('active');
        creditLabel.classList.remove('active');
      }

      priceElements.forEach(el => {
        const newPrice = el.getAttribute(`data-${mode}`);
        if (newPrice) {
          el.textContent = newPrice;
        }
      });
    }

    // Set initial state
    updatePrices();

    // Trigger update on toggle change
    switcher.addEventListener('change', updatePrices);
  }

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
