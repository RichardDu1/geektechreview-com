import os
import glob
from bs4 import BeautifulSoup

dist_dir = r"C:\Users\Administrator\WWW\geektechreview.com\dist"

print("--- 1. JavaScript files shipped ---")
js_files = glob.glob(os.path.join(dist_dir, "**", "*.js"), recursive=True)
print(f"Total JS files: {len(js_files)}")
for js in js_files:
    rel = os.path.relpath(js, dist_dir)
    size = os.path.getsize(js)
    print(f"  - {rel}: {size} bytes")

print("\n--- 2. CSS files shipped ---")
css_files = glob.glob(os.path.join(dist_dir, "**", "*.css"), recursive=True)
print(f"Total CSS files: {len(css_files)}")
for css in css_files:
    rel = os.path.relpath(css, dist_dir)
    size = os.path.getsize(css)
    print(f"  - {rel}: {size} bytes ({size / 1024:.2f} KB)")

print("\n--- 3. Auditing HTML files ---")
html_files = glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True)
print(f"Total HTML files: {len(html_files)}")

missing_alt = []
missing_lazy = []
missing_aria_interactive = []
excessive_inline_styles = []
heading_issues = []

for hf in html_files:
    rel = os.path.relpath(hf, dist_dir)
    with open(hf, "r", encoding="utf-8") as f:
        content = f.read()
    
    soup = BeautifulSoup(content, "html.parser")
    
    # Check inline styles
    elements_with_style = soup.find_all(lambda tag: tag.has_attr("style"))
    if len(elements_with_style) > 5:
        excessive_inline_styles.append((rel, len(elements_with_style)))
        
    # Check images
    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src", "")
        alt = img.get("alt")
        loading = img.get("loading")
        
        if alt is None or alt.strip() == "":
            missing_alt.append((rel, src))
        if loading != "lazy" and loading != "eager":
            missing_lazy.append((rel, src))
            
    # Check interactive elements without accessible name
    buttons = soup.find_all("button")
    for btn in buttons:
        aria_label = btn.get("aria-label", "")
        text = btn.get_text(strip=True)
        if not text and not aria_label:
            missing_aria_interactive.append((rel, "button", str(btn)[:60]))
            
    links = soup.find_all("a")
    for a in links:
        aria_label = a.get("aria-label", "")
        text = a.get_text(strip=True)
        imgs_in_a = a.find_all("img")
        has_img_alt = any(i.get("alt") for i in imgs_in_a)
        if not text and not aria_label and not has_img_alt:
            missing_aria_interactive.append((rel, "a", str(a)[:60]))
            
    # Check heading hierarchy
    headings = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
    h_levels = [int(h.name[1]) for h in headings]
    
    h1_count = h_levels.count(1)
    if h1_count != 1:
        heading_issues.append((rel, f"H1 count: {h1_count}"))
        
    for i in range(len(h_levels) - 1):
        curr, next_h = h_levels[i], h_levels[i+1]
        if next_h > curr + 1:
            heading_issues.append((rel, f"Skipped level: H{curr} -> H{next_h}"))

print(f"\nMissing alt text count: {len(missing_alt)}")
for item in missing_alt[:10]:
    print(" ", item)
if len(missing_alt) > 10:
    print(f"  ... and {len(missing_alt) - 10} more")

print(f"\nMissing loading attribute count: {len(missing_lazy)}")
for item in missing_lazy[:10]:
    print(" ", item)

print(f"\nMissing interactive aria-label/text count: {len(missing_aria_interactive)}")
for item in missing_aria_interactive[:10]:
    print(" ", item)

print(f"\nExcessive inline styles count (pages with >5 tags): {len(excessive_inline_styles)}")
for item in excessive_inline_styles[:10]:
    print(" ", item)

print(f"\nHeading hierarchy issues count: {len(heading_issues)}")
for item in heading_issues[:15]:
    print(" ", item)
