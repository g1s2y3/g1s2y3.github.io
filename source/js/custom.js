// 自定义JavaScript

// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
  // 淡入动画
  const elements = document.querySelectorAll('.post-container, .tag-cloud, .category-list');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 100);
  });
});

// 返回顶部按钮
const backToTop = document.createElement('button');
backToTop.innerHTML = '↑';
backToTop.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #2196F3;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
`;

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

backToTop.addEventListener('mouseover', () => {
  backToTop.style.background = '#1976D2';
  backToTop.style.transform = 'scale(1.1)';
});

backToTop.addEventListener('mouseout', () => {
  backToTop.style.background = '#2196F3';
  backToTop.style.transform = 'scale(1)';
});

// 显示/隐藏返回顶部按钮
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.style.display = 'block';
  } else {
    backToTop.style.display = 'none';
  }
});

document.body.appendChild(backToTop);

// 阅读进度条
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: #2196F3;
  z-index: 1000;
  transition: width 0.3s ease;
`;

document.body.appendChild(progressBar);

// 更新阅读进度
function updateReadingProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateReadingProgress);

// 平滑滚动
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