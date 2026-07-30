# GeekTechReview.com — Agent Instructions

## Project
GeekTechReview: AI-era hardware review site with Amazon Associates monetization.
Tech: Astro 6 + Tailwind CSS v4 + MDX + Cloudflare Pages.

## Auto-Pilot Rules

### Decision Authority
- **L1 (自主决定)**: 配色、CSS 值、组件结构、文件命名、文案措辞、图片选择、内链结构
- **L2 (做完通知)**: 新增依赖、新增页面路由、修改 URL 结构、修改 Content Schema
- **L3 (需确认)**: 放弃某个功能、改变项目方向、涉及付费服务、删除已有内容

### Verification Protocol
After completing each Phase, run:
```bash
bash scripts/verify.sh [phase-number]
```
- All checks pass → proceed to next Phase automatically
- Any check fails → fix the issue, re-run verify
- 3 consecutive failures → block task, send Telegram notification

### Build Rules
- `npm run build` must exit 0 before any commit
- No `console.log` in production code
- All images must have alt text
- All Amazon links must have `rel="sponsored nofollow"`
- All pages must have JSON-LD schema markup
- Lighthouse mobile performance target: 90+, desktop: 95+

### Content Rules
- Reviews must include: title, description, category, rating (0-10), pros, cons, verdict
- Best-of pages must include: ranked list, FAQ section, "how we tested" section
- Amazon ASIN must be included in frontmatter when available
- Images should use Astro `<Picture>` component for optimization

### Git Rules
- Commit after each completed task
- Format: `feat/fix/docs/refactor: description`
- Never commit broken builds

### File Structure
See REBUILD_PLAN.md for the complete architecture.
Key paths:
- Reviews: `src/content/reviews/`
- Components: `src/components/`
- Layouts: `src/layouts/`
- Styles: `src/styles/global.css`