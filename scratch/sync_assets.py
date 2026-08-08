import re, os, shutil

src_html = r"C:\Users\PRAEMJITH P R\Downloads\purelane-homepage.html"
dst_html = r"c:\Users\PRAEMJITH P R\Downloads\Tropod\purelane-homepage.html"

# Copy original HTML
shutil.copyfile(src_html, dst_html)

content = open(dst_html, encoding='utf-8').read()

# Extract ALL CSS blocks
css_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
if css_blocks:
    full_css = "\n\n".join(css_blocks)
    
    # Append the custom GPU-acceleration and layout helpers
    custom_helpers = """

/* Prevent empty wrapper box space for sticky CTA section */
.purelane-sticky-wrapper {
  display: contents !important;
}

/* Promote caustics SVG animations to GPU layers to prevent CPU/render bottlenecks and fix laggy scrolling */
.wl {
  position: absolute;
  inset: 0;
  will-change: transform;
  transform: translate3d(var(--px, 0), var(--py, 0), 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.wl-a { mix-blend-mode: screen; opacity: .8; animation: drift-a 34s linear infinite; will-change: transform; }
.wl-b { mix-blend-mode: screen; opacity: .54; animation: drift-b 23s linear infinite; will-change: transform; }
.wl-c { mix-blend-mode: screen; opacity: .5; animation: shaft-sway 19s ease-in-out infinite; will-change: transform; }
.wl-s { mix-blend-mode: screen; opacity: .7; animation: surface 11s ease-in-out infinite; transform-origin: 50% 0; will-change: transform; }

/* Shopify Theme Editor Design Mode Overrides - Always Visible */
.shopify-design-mode .rv,
[data-shopify-editor-events-enabled] .rv,
body.shopify-design-mode .rv {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  transition: none !important;
}
"""
    with open(r'c:\Users\PRAEMJITH P R\Downloads\Tropod\assets\purelane-theme.css', 'w', encoding='utf-8') as f:
        f.write(full_css + custom_helpers)
    print("CSS synced perfectly with both stylesheets merged!")

# Extract JS
script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
if script_match:
    exact_js = script_match.group(1)
    cart_js = """

/* AJAX Cart Drawer Handler */
(function() {
  function initCartDrawer() {
    var drawer = document.getElementById('purelane-cart-drawer');
    var overlay = document.getElementById('purelane-cart-overlay');
    var closeBtn = document.getElementById('purelane-cart-close');
    var cartTriggers = document.querySelectorAll('a[href="/cart"], .cart-trigger, button.cart');

    function openCart() {
      if (drawer) drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    cartTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openCart();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
  }

  document.addEventListener('DOMContentLoaded', initCartDrawer);
  document.addEventListener('shopify:section:load', initCartDrawer);
})();
"""
    with open(r'c:\Users\PRAEMJITH P R\Downloads\Tropod\assets\purelane-theme.js', 'w', encoding='utf-8') as f:
        f.write(exact_js + cart_js)
    print("JS synced perfectly!")
