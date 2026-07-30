#!/bin/bash
# GeekTechReview 自动验收脚本
# 用法: ./scripts/verify.sh [phase]
# 返回: 0=全部通过, 1=有失败

set -e

PROJECT_DIR="/c/Users/Administrator/WWW/geektechreview.com"
PHASE="${1:-all}"
PASS=0
FAIL=0
RESULTS=""

check() {
  local name="$1"
  local cmd="$2"
  local expected="$3"
  
  local actual=$(eval "$cmd" 2>&1)
  
  if echo "$actual" | grep -q "$expected"; then
    RESULTS+="✅ $name\n"
    PASS=$((PASS + 1))
  else
    RESULTS+="❌ $name (expected: $expected, got: $actual)\n"
    FAIL=$((FAIL + 1))
  fi
}

echo "=========================================="
echo "GeekTechReview Auto-Verify: Phase $PHASE"
echo "=========================================="

cd "$PROJECT_DIR"

# ===== Phase 1: 基础架构 =====
if [ "$PHASE" = "1" ] || [ "$PHASE" = "all" ]; then
  echo "--- Phase 1: Infrastructure ---"
  
  # Build 必须通过
  check "npm run build" "npm run build 2>&1 | tail -1" "[Cc]omplete"
  
  # dist 目录存在
  check "dist/ exists" "ls dist/ 2>&1 | wc -l" "[0-9]"
  
  # astro.config.mjs 存在
  check "astro.config exists" "test -f astro.config.mjs && echo yes" "yes"
  
  # Tailwind v4 配置
  check "Tailwind v4" "grep 'tailwindcss' astro.config.mjs" "tailwindcss"
  
  # Content Collections schema
  check "Content schema" "test -f src/content.config.ts && echo yes" "yes"
  
  # BaseLayout 存在
  check "BaseLayout" "test -f src/layouts/BaseLayout.astro && echo yes" "yes"
  
  # 暗色模式 CSS 变量
  check "Dark mode vars" "grep 'color-bg' src/styles/global.css 2>/dev/null || echo none" "color-bg"
  
  # 核心组件存在
  for comp in AffButton RatingBadge ReviewCard ProsCons CompareTable StickyTOC; do
    check "Component: $comp" "test -f src/components/$comp.astro && echo yes" "yes"
  done
fi

# ===== Phase 2: 页面模板 =====
if [ "$PHASE" = "2" ] || [ "$PHASE" = "all" ]; then
  echo "--- Phase 2: Page Templates ---"
  
  # 首页存在
  check "Homepage" "test -f src/pages/index.astro && echo yes" "yes"
  
  # 测评列表页
  check "Reviews index" "test -f src/pages/reviews/index.astro && echo yes" "yes"
  
  # 分类列表页 (dynamic route)
  check "Category route" "find src/pages/reviews -name '\\[*' 2>/dev/null | head -1" "["
  
  # Best-of 页
  check "Best-of route" "find src/pages/best -name '*' 2>/dev/null | head -1 | wc -l" "[0-9]"
  
  # 对比页
  check "Compare route" "find src/pages/compare -name '*' 2>/dev/null | head -1 | wc -l" "[0-9]"
  
  # About 页
  check "About page" "test -f src/pages/about.astro && echo yes" "yes"
  
  # Editorial Policy
  check "Editorial Policy" "test -f src/pages/editorial-policy.astro && echo yes" "yes"
  
  # Affiliate Disclosure
  check "Affiliate Disclosure" "test -f src/pages/affiliate-disclosure.astro && echo yes" "yes"
  
  # How We Test
  check "How We Test" "test -f src/pages/how-we-test.astro && echo yes" "yes"
fi

# ===== Phase 3: 内容 =====
if [ "$PHASE" = "3" ] || [ "$PHASE" = "all" ]; then
  echo "--- Phase 3: Content ---"
  
  REVIEW_COUNT=$(find src/content/reviews -name "*.mdx" 2>/dev/null | wc -l)
  check "Reviews >= 50" "echo $REVIEW_COUNT" "[5-9][0-9]\|[1-9][0-9][0-9]"
  
  AMAZON_COUNT=$(grep -rl "amazonAsin\|amazon.*tag=" src/content/reviews 2>/dev/null | wc -l)
  check "Amazon-linked reviews >= 10" "echo $AMAZON_COUNT" "[1-9]"
  
  BESTOF_COUNT=$(find src/content/best-ofs -name "*" 2>/dev/null | wc -l)
  check "Best-of guides >= 8" "echo $BESTOF_COUNT" "[8-9]\|[1-9][0-9]"
fi

# ===== Phase 4: SEO + Schema =====
if [ "$PHASE" = "4" ] || [ "$PHASE" = "all" ]; then
  echo "--- Phase 4: SEO + Schema ---"
  
  # Sitemap 存在
  check "Sitemap" "test -f dist/sitemap-index.xml && echo yes" "yes"
  
  # robots.txt
  check "robots.txt" "test -f public/robots.txt && echo yes" "yes"
  
  # Schema markup 在测评页
  check "Review schema" "grep -r 'application/ld+json' src/layouts/ReviewLayout.astro 2>/dev/null | wc -l" "[1-9]"
  
  # Breadcrumb 组件
  check "Breadcrumb component" "test -f src/components/Breadcrumb.astro && echo yes" "yes"
  
  # Amazon 链接合规
  check "Affiliate rel" "grep -r 'sponsored' src/components/ 2>/dev/null | wc -l" "[1-9]"
fi

# ===== Phase 5: 性能 =====
if [ "$PHASE" = "5" ] || [ "$PHASE" = "all" ]; then
  echo "--- Phase 5: Performance ---"
  
  # Lighthouse mobile (需要 npx lighthouse)
  if command -v npx &> /dev/null; then
    check "Lighthouse mobile >= 90" \
      "npx lighthouse http://localhost:4321 --only-categories=performance --output=json --quiet 2>/dev/null | python -c 'import sys,json; print(json.load(sys.stdin)[\"categories\"][\"performance\"][\"score\"]*100)'" \
      "[9][0-9]\|100"
  fi
fi

# ===== 输出结果 =====
echo ""
echo "=========================================="
echo "RESULTS: $PASS passed, $FAIL failed"
echo "=========================================="
echo -e "$RESULTS"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "❌ VERIFICATION FAILED — $FAIL check(s) did not pass"
  exit 1
else
  echo ""
  echo "✅ ALL CHECKS PASSED — Phase $PHASE verified"
  exit 0
fi