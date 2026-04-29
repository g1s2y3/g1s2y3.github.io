# Purple Dark Theme

一个基于 Hexo 的深色简约主题，采用亮紫色和黑色的科技风格设计。

## 特性

- 🌙 深色主题设计，保护眼睛
- 🎨 亮紫色配色方案，现代科技感
- 📱 完全响应式布局，适配各种设备
- 🔍 内置搜索功能
- 📚 文章目录导航
- 🏷️ 标签云和分类导航
- 💬 社交分享按钮
- 🚀 优雅的动画效果
- 📄 打印优化

## 安装

1. 下载主题文件到 `themes/purple-dark` 目录
2. 在 Hexo 配置文件 `_config.yml` 中设置：
   ```yaml
   theme: purple-dark
   ```
3. 重新生成并部署：
   ```bash
   hexo generate
   hexo deploy
   ```

## 配置

在 `themes/purple-dark/_config.yml` 中可以自定义：

### 颜色设置
```yaml
accent_color: '#9c27b0'    # 主色调
secondary_color: '#e91e63'  # 辅助色
```

### 功能开关
```yaml
enable_search: true   # 启用搜索
enable_toc: true     # 启用目录
enable_comments: true # 启用评论
enable_tags: true     # 启用标签
enable_categories: true # 启用分类
```

### 布局设置
```yaml
layout: left  # 布局方式：left, right, both
```

### 社交链接
```yaml
social_links:
  github: your-github
  twitter: your-twitter
  linkedin: your-linkedin
```

### 文章设置
```yaml
post:
  show_share: true    # 显示分享按钮
  show_related: true   # 显示相关文章
  read_time: true      # 显示阅读时间
```

## 自定义

### 自定义样式
在 `_config.yml` 中可以添加自定义 CSS：
```yaml
custom_css: |
  .custom-class {
    color: var(--accent-color);
  }
```

### 自定义脚本
在 `_config.yml` 中可以添加自定义 JavaScript：
```yaml
custom_js: |
  console.log('Custom script loaded');
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的深色主题设计
- 响应式布局
- 基础功能实现

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

- Created by Claude Code
- Based on Purple Dark design concept