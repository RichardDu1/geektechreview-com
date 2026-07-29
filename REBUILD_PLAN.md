# GeekTechReview.com 重构方案

> **项目**: geektechreview.com — 数码产品聚合分析与搜索网站
> **目标**: 亚马逊联盟营销为核心，提供真实产品知识
> **技术栈**: Astro 6 + Tailwind CSS v4 + MDX + Cloudflare Pages
> **性能目标**: Lighthouse 移动端 90+ / 桌面端 95+
> **日期**: 2026-07-29

---

## 一、调研发现

### 1.1 竞品格局（15 站分析）

| 站点 | 流量级 | Schema 质量 | 暗色模式 | 对比工具 | 内容量 |
|---|---|---|---|---|---|
| **RTINGS.com** | Top 1K | ⭐⭐⭐⭐⭐ (Product+Review) | 否 | ✅ 最佳 | 4,769 测评 |
| **TechRadar** | Top 300 | ⭐⭐⭐⭐ | 否 | 无 | 30K+ |
| **Tom's Hardware** | Top 500 | ⭐⭐⭐⭐ | 否 | 无 | 20K+ |
| **Digital Trends** | Top 500 | ⭐⭐⭐ | 否 | 无 | 15K+ |
| **The Verge** | Top 200 | ⭐⭐⭐ | 否 | 无 | 15K+ |
| **Notebookcheck** | Top 1K | ⭐⭐ (仅 Article) | 是 | 无 | 20K+ |
| **CNET** | Top 300 | ⭐⭐⭐ | 否 | 无 | 20K+ |

### 1.2 竞争优势缺口（我们要利用的）

1. **页面速度** — 所有竞品都被广告拖慢。Astro + Cloudflare 可实现 <1s 加载
2. **结构化数据** — 只有 RTINGS 正确实现 Product + Review schema。我们能做全套
3. **暗色模式** — 只有 3 家提供。科技用户偏好暗色
4. **对比工具** — 只有 RTINGS 和 TechSpot 有交互式对比。我们可以做
5. **价格追踪** — 没有竞品提供价格历史图。这是蓝海
6. **AI 设备测评** — 大站把 AI 当新闻，不做产品测评。这是我们的定位缺口
7. **内容新鲜度信号** — 很少有站显示 "最后更新" 和测试方法版本

### 1.3 最佳实践学习

| 学自 | 做法 |
|---|---|
| **RTINGS** | "我们自购产品测评" 信任信号；多维度评分；sticky 侧边栏 TOC；测试方法版本化；changelog |
| **TechRadar** | Best-of 文章的跳转导航；"如何测试" 段落；多作者署名 |
| **Digital Trends** | 多零售商价格对比卡片；Pros/Cons 格式可扫描 |
| **Tom's Hardware** | 热门话题栏做内链；新闻→购买指南漏斗 |
| **The Verge** | 杂志式编辑布局；大 hero 图；分数叠加在产品图上 |
| **Notebookcheck** | 多语言支持（国际 SEO）；评测类型分级（旗舰/短评/快评） |

---

## 二、产品定位

### 2.1 一句话定位

**GeekTechReview 是一个以 AI 时代硬件为核心、以亚马逊联盟为商业模式、以实验室级测评方法为信任基础的产品推荐网站。**

### 2.2 差异化定位

不做 "什么都评" 的大站（干不过 TechRadar/CNET 的内容量），做 **"AI 时代硬件"** 的垂直权威：

- AI PC（Copilot+ PC、AI 加速笔记本）
- AI 手机（端侧 AI 芯片手机）
- AI 开发者硬件（Jetson、AI 加速卡、本地推理设备）
- AI 音频（AI 降噪耳机、AI 翻译设备）
- AI 智能家居（Matter/Thread 设备、AI 摄像头）
- AI 创作工具硬件（直播设备、采集卡、AI 麦克风）

**同时覆盖传统核心品类**：笔记本、手机、音频、显示器、游戏设备、PC 组件。

### 2.3 目标用户

- 科技爱好者（研究型购买决策者）
- 开发者/工程师（需要 AI 硬件做本地推理）
- 内容创作者（需要硬件做创作/直播）
- 普通消费者（需要可信赖的购买建议）

---

## 三、信息架构

### 3.1 URL 结构

```
/                          # 首页
/reviews/                  # 所有测评列表
/reviews/{category}/       # 分类列表 (e.g., /reviews/laptops/)
/reviews/{category}/{slug}/  # 单品测评 (e.g., /reviews/laptops/m4-max-macbook-pro-16/)
/best/{category}/          # Best-of 榜单 (e.g., /best/laptops/)
/best/{category}/for-{use-case}/  # 场景榜 (e.g., /best/laptops/for-programming/)
/compare/{a}-vs-{b}/      # 对比页 (e.g., /compare/macbook-pro-16-vs-zenbook-duo/)
/deals/                    # 优惠汇总
/deals/{category}/         # 分类优惠
/guides/                   # 购买指南 (非产品测评)
/guides/{slug}/            # e.g., /guides/how-to-choose-laptop-2026/
/about/                    # 关于我们
/editorial-policy/         # 编辑政策 (E-E-A-T)
/how-we-test/              # 测试方法 (E-E-A-T)
/affiliate-disclosure/     # 联盟披露 (合规)
/contact/                  # 联系我们
/sitemap.xml               # 站点地图
```

### 3.2 内容类型

| 类型 | URL 模式 | Schema | 目的 |
|---|---|---|---|
| **单品测评** | `/reviews/{cat}/{slug}/` | Product + Review + Rating | 长尾 SEO + Amazon 链接 |
| **Best-of 榜单** | `/best/{cat}/` | ItemList + FAQPage + BreadcrumbList | 高商业意图 SEO + 多 Amazon 链接 |
| **场景推荐** | `/best/{cat}/for-{use}/` | ItemList + FAQPage | 场景长尾 SEO |
| **产品对比** | `/compare/{a}-vs-{b}/` | Product × 2 + Rating | "A vs B" 搜索意图 |
| **购买指南** | `/guides/{slug}/` | HowTo + Article | 信息意图 SEO + 内链到测评 |
| **优惠汇总** | `/deals/` | ItemList | 时效性流量 + Amazon 链接 |

### 3.3 分类体系

**主分类**（6 个核心 + 2 个特色）：

1. **Laptops** — 笔记本电脑（含 AI PC）
2. **Phones** — 智能手机（含 AI 手机）
3. **Audio** — 音频设备（耳机、音箱、麦克风）
4. **Gaming** — 游戏设备（主机、显卡、显示器、外设）
5. **PC Components** — PC 组件（CPU、GPU、主板、内存、SSD）
6. **Smart Home** — 智能家居（Matter 设备、摄像头、智能锁）
7. **AI Devices** ⭐ — AI 专用硬件（开发板、AI 加速器、本地推理设备）
8. **Creator Gear** ⭐ — 创作者设备（采集卡、直播设备、相机）

---

## 四、技术架构

### 4.1 技术栈

| 层 | 技术 | 理由 |
|---|---|---|
| **框架** | Astro 6 | 零 JS 默认输出，最佳 Lighthouse 评分 |
| **样式** | Tailwind CSS v4 | CSS-first 配置，5x 构建速度，容器查询 |
| **内容** | MDX + Content Collections | 类型安全 frontmatter，Markdown + 组件 |
| **图片** | Astro `<Picture />` | 自动 AVIF/WebP 响应式 srcset |
| **搜索** | Pagefind | 静态站搜索，零运行时成本 |
| **部署** | Cloudflare Pages | 全球 CDN，边缘交付，免费 |
| **分析** | Cloudflare Web Analytics | 隐私优先，无 Cookie，免费 |

### 4.2 目录结构

```
geektechreview.com/
├── src/
│   ├── components/
│   │   ├── AffButton.astro          # Amazon 联盟按钮 (带 rel="sponsored nofollow")
│   │   ├── AffCard.astro            # 产品价格卡片 (多零售商)
│   │   ├── ReviewCard.astro         # 测评卡片 (列表页用)
│   │   ├── RatingBadge.astro       # 评分徽章 (数字+颜色)
│   │   ├── RatingStars.astro       # 星级显示 (半星支持)
│   │   ├── ProsCons.astro           # 优缺点对比组件
│   │   ├── CompareTable.astro      # 产品对比表 (sticky 首列)
│   │   ├── ScoreBreakdown.astro    # 多维度评分 (场景评分)
│   │   ├── StickyTOC.astro         # 粘性目录 (长文导航)
│   │   ├── Breadcrumb.astro        # 面包屑导航
│   │   ├── TrendingBar.astro       # 热门话题栏
│   │   ├── PriceHistory.astro      # 价格历史图 (Canvas)
│   │   ├── SpecTable.astro         # 规格表
│   │   ├── Changelog.astro         # 测评更新日志
│   │   ├── FAQAccordion.astro      # FAQ 折叠面板
│   │   ├── ProductGallery.astro    # 产品图片画廊
│   │   └── Newsletter.astro        # 邮件订阅
│   ├── layouts/
│   │   ├── BaseLayout.astro        # 基础布局 (head, nav, footer)
│   │   ├── ReviewLayout.astro      # 测评页布局 (TOC + 内容 + 侧边栏)
│   │   └── ListLayout.astro         # 列表页布局 (筛选 + 网格)
│   ├── pages/
│   │   ├── index.astro             # 首页
│   │   ├── reviews/
│   │   │   ├── index.astro         # 测评总列表
│   │   │   └── [category]/
│   │   │       ├── index.astro     # 分类列表
│   │   │       └── [slug].astro     # 单品测评
│   │   ├── best/
│   │   │   └── [category]/
│   │   │       ├── index.astro     # Best-of 列表
│   │   │       └── [usecase].astro # 场景推荐
│   │   ├── compare/
│   │   │   └── [slug].astro         # 对比页
│   │   ├── deals/
│   │   │   ├── index.astro
│   │   │   └── [category].astro
│   │   ├── guides/
│   │   │   └── [slug].astro
│   │   ├── about.astro
│   │   ├── editorial-policy.astro
│   │   ├── how-we-test.astro
│   │   ├── affiliate-disclosure.astro
│   │   └── contact.astro
│   ├── content/
│   │   ├── reviews/                # MDX 测评文件
│   │   ├── best-ofs/               # Best-of 榜单数据
│   │   ├── comparisons/            # 对比数据
│   │   └── guides/                 # 购买指南
│   ├── styles/
│   │   ├── global.css              # 全局样式 + Tailwind @theme
│   │   ├── prose.css               # 文章排版 (阅读模式)
│   │   └── utilities.css           # 自定义工具类
│   └── utils/
│       ├── schema.ts               # JSON-LD schema 生成器
│       ├── aff.ts                  # Amazon 链接工具
│       └── format.ts               # 格式化工具
├── public/
│   ├── images/                     # 产品图片 (优化前)
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   └── generate-sitemap.ts         # 自定义 sitemap 生成
├── astro.config.mjs
├── tailwind.config.ts              # (Tailwind v4 不需要，用 @theme)
├── package.json
└── CLAUDE.md                       # 给 Claude Code 的项目指令
```

### 4.3 Content Schema（frontmatter 定义）

```typescript
// 测评 schema
const reviewSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['laptops', 'phones', 'audio', 'gaming', 'pc-components', 'smart-home', 'ai-devices', 'creator-gear']),
  brand: z.string(),
  model: z.string(),
  price: z.number().optional(),
  priceCurrency: z.string().default('USD'),
  amazonAsin: z.string().optional(),      // Amazon ASIN
  amazonUrl: z.string().optional(),       // Amazon 联盟链接
  rating: z.number().min(0).max(10),      // 总评分 0-10
  subscores: z.object({                   // 多维度评分
    performance: z.number(),
    value: z.number(),
    design: z.number(),
    features: z.number(),
    battery: z.number().optional(),
  }).optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  verdict: z.string(),                    // 一句话结论
  verdictLabel: z.enum(['buy', 'wait', 'skip']),  // 购买建议
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  testedBy: z.string().default('Alex Chen'),
  testMethodology: z.string().default('v1.0'),
  featured: z.boolean().default(false),
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  })).default([]),
});
```

### 4.4 Schema Markup 策略

| 页面类型 | JSON-LD Schema |
|---|---|
| 首页 | WebSite + SearchAction + Organization |
| 测评页 | Product + Review + AggregateRating + BreadcrumbList |
| Best-of 榜单 | ItemList + FAQPage + BreadcrumbList |
| 对比页 | Product × N + Review × N + BreadcrumbList |
| 购买指南 | HowTo + Article + BreadcrumbList |
| 关于页 | Organization + Person |

### 4.5 Amazon 联盟集成

**链接策略**：
- 所有 Amazon 链接加 `rel="sponsored nofollow"`（Google 合规）
- 使用 `AffButton` 组件统一管理（带价格、库存状态）
- 每篇测评 1-3 个 Amazon 链接（不堆砌）
- Best-of 榜单每项 1 个 Amazon 链接

**合规页面**：
- `/affiliate-disclosure/` — 联盟披露页面
- 每页 footer 链接到披露页
- 首次 Amazon 链接旁有 "We may earn a commission" 提示

---

## 五、设计系统

### 5.1 色彩系统

**暗色模式（默认）**：
```css
--color-bg: #0a0a0b;          /* 背景 */
--color-surface: #141416;     /* 卡片背景 */
--color-border: #232328;     /* 边框 */
--color-text: #e8e8ed;       /* 主文本 */
--color-muted: #8b8b94;     /* 次要文本 */
--color-primary: #3b82f6;    /* 链接/强调 (蓝) */
--color-accent: #8b5cf6;     /* 辅助强调 (紫) */
--color-success: #22c55e;    /* 正面/Pros */
--color-warning: #f59e0b;    /* 中性 */
--color-danger: #ef4444;     /* 负面/Cons */
```

**亮色模式（可切换）**：
```css
--color-bg: #ffffff;
--color-surface: #f8f9fa;
--color-border: #e5e7eb;
--color-text: #111827;
--color-muted: #6b7280;
--color-primary: #2563eb;
--color-accent: #7c3aed;
```

### 5.2 评分色彩映射

| 分数范围 | 颜色 | 标签 |
|---|---|---|
| 9.0 - 10.0 | 绿色 (#22c55e) | Editor's Choice |
| 8.0 - 8.9 | 蓝色 (#3b82f6) | Recommended |
| 7.0 - 7.9 | 黄色 (#f59e0b) | Good |
| 6.0 - 6.9 | 橙色 (#f97316) | Fair |
| < 6.0 | 红色 (#ef4444) | Skip |

### 5.3 字体系统

```css
--font-display: 'Space Grotesk', sans-serif;   /* 标题 */
--font-body: 'Inter', sans-serif;               /* 正文 */
--font-mono: 'JetBrains Mono', monospace;       /* 代码/规格 */

/* 流体类型 */
h1: clamp(2rem, 5vw, 4rem);
h2: clamp(1.5rem, 3vw, 2.5rem);
h3: clamp(1.25rem, 2vw, 1.75rem);
body: clamp(1rem, 1.2vw, 1.125rem);
```

### 5.4 组件设计

**RatingBadge** — 评分徽章：大数字 + 色彩 + 星级
**ReviewCard** — 测评卡片：产品图 + 标题 + 评分 + Pros/Cons + 价格
**CompareTable** — 对比表：sticky 首列 + 规格分组 + 评分对比
**AffButton** — Amazon 按钮：价格 + "View on Amazon" + 联盟标识
**StickyTOC** — 粘性目录：滚动跟随 + 当前段落高亮

---

## 六、性能预算

### 6.1 Lighthouse 目标

| 指标 | 移动端 | 桌面端 |
|---|---|---|
| Performance | 90+ | 95+ |
| Accessibility | 95+ | 95+ |
| Best Practices | 95+ | 95+ |
| SEO | 100 | 100 |

### 6.2 优化策略

1. **零 JS 默认** — Astro 静态输出，交互组件用 Islands 架构
2. **图片优化** — Astro `<Picture>` 自动 AVIF/WebP + 响应式 srcset + lazy load
3. **字体优化** — `font-display: swap` + 预加载 + 子集化
4. **CSS 优化** — Tailwind v4 自动 purge，<20KB CSS
5. **无动画 blob** — 移除当前版本的 blur blob 动画（影响渲染性能）
6. **CDN** — Cloudflare Pages 全球边缘交付
7. **预加载** — 关键页面用 `prefetch` 预加载
8. **无重型广告** — 初期不放广告，专注联盟收入

---

## 七、实施计划

### Phase 1: 基础架构（1-2 天）
- [ ] 备份现有代码
- [ ] 清理项目结构，删除旧文件
- [ ] 配置 Astro 6 + Tailwind v4 + MDX
- [ ] 搭建 BaseLayout（暗色/亮色切换）
- [ ] 实现核心组件（RatingBadge, ReviewCard, AffButton）
- [ ] 配置 Content Collections（新 schema）
- [ ] 生成 sitemap.xml + robots.txt

### Phase 2: 页面模板（2-3 天）
- [ ] 首页（杂志式布局 + 热门话题栏 + 最新测评）
- [ ] 测评列表页（/reviews/ + /reviews/{category}/）
- [ ] 单品测评页（ReviewLayout: TOC + 内容 + 侧边栏 + Amazon 卡片）
- [ ] Best-of 榜单页（编号排名 + 跳转导航 + FAQ）
- [ ] 对比页（CompareTable 组件）
- [ ] About + Editorial Policy + How We Test + Affiliate Disclosure

### Phase 3: 内容迁移 + 新内容（3-5 天）
- [ ] 迁移现有 110 篇测评到新 schema
- [ ] 为每篇测评补充 Amazon ASIN/链接
- [ ] 为每篇测评补充产品图片
- [ ] 创建 8 个 Best-of 榜单（每分类 1 个）
- [ ] 创建 10+ 个对比页
- [ ] 创建 5+ 个购买指南

### Phase 4: SEO + Schema（1-2 天）
- [ ] 所有页面 JSON-LD schema 实现
- [ ] BreadcrumbList 全站覆盖
- [ ] FAQPage 在 Best-of 页
- [ ] Product + Review 在测评页
- [ ] 内链策略实施（相关测评 + 热门话题栏）
- [ ] 生成完整 sitemap

### Phase 5: 性能 + 测试（1 天）
- [ ] Lighthouse 移动端 90+ 验证
- [ ] Lighthouse 桌面端 95+ 验证
- [ ] WCAG 2.1 AA 可访问性检查
- [ ] 移动端响应式验证
- [ ] Cloudflare Pages 部署验证

### Phase 6: 上线（1 天）
- [ ] DNS 配置
- [ ] Cloudflare Pages 部署
- [ ] Google Search Console 提交
- [ ] 最终验收

---

## 八、可追溯性

所有开发步骤通过以下方式确保可追溯、可验证：

1. **Git 提交** — 每个 Phase 独立分支，每个 Task 独立提交
2. **STATE.md** — 记录每步进度
3. **Lighthouse 报告** — 每个 Phase 结束跑一次，记录分数
4. **Build 验证** — 每次提交前 `npm run build` 必须通过
5. **Schema 验证** — 用 Google Rich Results Test 验证结构化数据
6. **本方案文档** — 作为项目合同，验收依据