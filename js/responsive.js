// Purple Dark Theme - Responsive JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Handle responsive navigation
  handleResponsiveNavigation();

  // Handle responsive images
  handleResponsiveImages();

  // Handle responsive tables
  handleResponsiveTables();

  // Initialize touch gestures
  initializeTouchGestures();

  // Handle viewport meta tag updates
  handleViewport();
});

// Handle Responsive Navigation
function handleResponsiveNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (!menuToggle || !navMenu) return;

  // Check if we need to show mobile menu
  function checkMobileMenu() {
    if (window.innerWidth <= 768 && !navMenu.classList.contains('active')) {
      menuToggle.style.display = 'block';
    } else {
      menuToggle.style.display = 'none';
      if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
      }
    }
  }

  // Initialize
  checkMobileMenu();

  // Add resize listener
  window.addEventListener('resize', checkMobileMenu);
}

// Handle Responsive Images
function handleResponsiveImages() {
  // Add responsive class to images
  document.querySelectorAll('img').forEach(img => {
    img.classList.add('responsive-img');
  });

  // Handle image zoom on mobile
  if (window.innerWidth <= 768) {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', function() {
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        overlay.style.backgroundImage = `url(${this.src})`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-overlay';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';

        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        closeBtn.addEventListener('click', function() {
          overlay.remove();
        });

        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
            overlay.remove();
          }
        });
      });
    });
  }
}

// Handle Responsive Tables
function handleResponsiveTables() {
  const tables = document.querySelectorAll('table');

  tables.forEach(table => {
    // Wrap table in a responsive container
    if (table.scrollWidth > table.parentElement.offsetWidth) {
      const wrapper = document.createElement('div');
      wrapper.className = 'responsive-table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

    // Add sticky headers for desktop
    if (window.innerWidth > 1024) {
      const thead = table.querySelector('thead');
      if (thead) {
        thead.style.position = 'sticky';
        thead.style.top = '0';
        thead.style.background = 'var(--bg-card)';
        thead.style.zIndex = '10';
      }
    }
  });
}

// Initialize Touch Gestures
function initializeTouchGestures() {
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    // Swipe left (show menu)
    if (diff > swipeThreshold && window.innerWidth <= 768) {
      document.getElementById('navMenu')?.classList.add('active');
    }
    // Swipe right (hide menu)
    else if (diff < -swipeThreshold && window.innerWidth <= 768) {
      document.getElementById('navMenu')?.classList.remove('active');
    }
  }
}

// Handle Viewport
function handleViewport() {
  // Adjust viewport based on device
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    const isMobile = window.innerWidth <= 768;
    viewport.content = isMobile
      ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      : 'width=device-width, initial-scale=1.0';
  }

  // Handle iOS device dimensions
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.classList.add('ios-device');
  }

  // Handle Android device dimensions
  if (/Android/.test(navigator.userAgent)) {
    document.body.classList.add('android-device');
  }
}

// Add CSS for responsive features
const responsiveStyle = document.createElement('style');
responsiveStyle.textContent = `
  .responsive-img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .responsive-img:hover {
    cursor: pointer;
    opacity: 0.9;
  }

  .responsive-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 1rem 0;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .responsive-table-wrapper::-webkit-scrollbar {
    height: 8px;
  }

  .responsive-table-wrapper::-webkit-scrollbar-track {
    background: var(--bg-code);
  }

  .responsive-table-wrapper::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 4px;
  }

  .responsive-table-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--accent-secondary);
  }

  .image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .close-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .close-overlay:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .ios-device {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .android-device {
    -webkit-user-select: text;
    user-select: text;
  }

  /* Print styles for responsive */
  @media print {
    .responsive-table-wrapper {
      overflow: visible;
    }
  }
`;
document.head.appendChild(responsiveStyle);

// Log responsive initialization
console.log('Purple Dark Theme Responsive initialized successfully');