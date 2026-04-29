// Purple Dark Theme - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }

  // Scroll to Top Button
  const scrollTopBtn = document.querySelector('.scroll-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Search Functionality
  if (typeof hexoSearch !== 'undefined') {
    initializeSearch();
  }

  // Initialize tooltips
  initializeTooltips();

  // Initialize smooth scroll for anchor links
  initializeSmoothScroll();

  // Add loading animation to images
  initializeLazyLoading();
});

// Search Functionality
function initializeSearch() {
  const searchToggle = document.getElementById('searchToggle');
  const searchModal = document.getElementById('searchModal');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!searchModal) return;

  searchToggle.addEventListener('click', function(e) {
    e.preventDefault();
    searchModal.style.display = 'block';
    searchInput.focus();
  });

  closeSearch.addEventListener('click', function() {
    searchModal.style.display = 'none';
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  // Close modal on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchModal.style.display === 'block') {
      searchModal.style.display = 'none';
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });

  // Search input handler
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(function() {
      performSearch(query);
    }, 300);
  });

  // Perform search
  function performSearch(query) {
    searchResults.innerHTML = '<div class="loading">搜索中...</div>';

    // Simulate search results (in real implementation, this would fetch from server)
    setTimeout(function() {
      const mockResults = [
        { title: '文章标题 1', url: '/post-1', excerpt: '这是文章摘要...' },
        { title: '文章标题 2', url: '/post-2', excerpt: '另一篇文章摘要...' },
        { title: '技术分享', url: '/tech-share', excerpt: '技术相关文章...' }
      ];

      if (mockResults.length === 0) {
        searchResults.innerHTML = '<div class="no-results">没有找到相关文章</div>';
        return;
      }

      const resultsHTML = mockResults.map(result => `
        <div class="search-result">
          <h3><a href="${result.url}">${highlightText(result.title, query)}</a></h3>
          <p class="search-excerpt">${highlightText(result.excerpt, query)}</p>
        </div>
      `).join('');

      searchResults.innerHTML = resultsHTML;
    }, 500);
  }

  // Highlight search text
  function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

// Tooltips
function initializeTooltips() {
  const tooltips = document.querySelectorAll('[title]');

  tooltips.forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = e.target.getAttribute('title');
  document.body.appendChild(tooltip);

  const rect = e.target.getBoundingClientRect();
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
  tooltip.style.top = rect.bottom + 10 + 'px';

  e.target.removeAttribute('title');
}

function hideTooltip(e) {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
  if (e.target.getAttribute('title')) {
    e.target.setAttribute('title', e.target.getAttribute('data-original-title'));
  }
}

// Smooth Scroll
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Lazy Loading
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Add CSS for tooltip
const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
  .tooltip {
    position: fixed;
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    z-index: 10000;
    pointer-events: none;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: var(--text-muted);
  }

  .no-results {
    text-align: center;
    padding: 20px;
    color: var(--text-muted);
  }

  .search-result {
    padding: 15px 0;
    border-bottom: 1px solid var(--border-color);
  }

  .search-result:last-child {
    border-bottom: none;
  }

  .search-result h3 {
    font-size: 1.125rem;
    margin: 0 0 8px 0;
  }

  .search-excerpt {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .search-excerpt mark {
    background: rgba(156, 39, 176, 0.2);
    color: var(--accent-primary);
    padding: 2px 4px;
    border-radius: 3px;
  }
`;
document.head.appendChild(tooltipStyle);

// Theme initialization
console.log('Purple Dark Theme initialized successfully');