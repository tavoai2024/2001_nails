document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success-message');
  const formError = document.getElementById('form-error-message');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Reset status messages
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
      
      // Get field values
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();
      
      // Basic Validation
      if (!name || !email || !message) {
        formError.textContent = 'Please fill out all required fields.';
        formError.style.display = 'block';
        return;
      }
      
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formError.textContent = 'Please enter a valid email address.';
        formError.style.display = 'block';
        return;
      }
      
      // Mock loading state
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      // Mock network response (1 second timeout)
      setTimeout(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Show success and reset form
        formSuccess.textContent = 'Thank you! Your message has been sent successfully. We will get back to you shortly.';
        formSuccess.style.display = 'block';
        contactForm.reset();
        
        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });
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
