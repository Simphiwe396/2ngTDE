// public/app.js (client-side ES module)
// keep the rest of your code as-is; this snippet shows the improved open/close behavior

export const Cart = (() => {
  const KEY = 'clinchglow_cart_v1';
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
  return {
    get() { const raw = load(); const prods = window.__CG_PRODUCTS || []; return raw.map(i => ({ qty: i.qty, product: prods.find(p => p.id === i.id) })).filter(Boolean); },
    add(product, qty = 1) { const items = load(); const idx = items.findIndex(i => i.id === product.id); if (idx >= 0) items[idx].qty += qty; else items.push({ id: product.id, qty }); save(items); },
    update(id, qty) { const items = load(); const idx = items.findIndex(i => i.id === id); if (idx < 0) return; items[idx].qty = qty; if (items[idx].qty <= 0) items.splice(idx, 1); save(items); },
    remove(id) { const items = load(); save(items.filter(i => i.id !== id)); },
    clear() { save([]); }
  };
})();

let _productsCache = null;
async function fetchProducts() {
  if (_productsCache) return _productsCache;
  try {
    const resp = await fetch('/products.json');
    if (!resp.ok) throw new Error('Failed to load products');
    const json = await resp.json();
    _productsCache = json.products;
    window.__CG_PRODUCTS = _productsCache;
    window.allProducts = _productsCache;
    return _productsCache;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function showToast(text, timeout = 2000) {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), timeout);
}

async function init() {
  const products = await fetchProducts();
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  renderCategories(categories);
  renderProducts('All', products);
  updateCartCount();
}

function renderCategories(categories) {
  const el = document.getElementById('categoryTabs');
  el.innerHTML = '';
  categories.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === 0 ? ' active' : '');
    btn.textContent = c;
    btn.dataset.cat = c;
    btn.onclick = () => { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderProducts(c); };
    el.appendChild(btn);
  });
}

async function renderProducts(category, productsArg) {
  const products = productsArg || await fetchProducts();
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  const filtered = (typeof category === 'string') ? products.filter(p => category === 'All' || p.category === category) : category;
  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card product-card';
    card.innerHTML = `
      <img loading="lazy" src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">R ${p.price.toFixed(2)}</div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary">Add to cart</button>
        <button class="btn btn-ghost">View</button>
      </div>
    `;
    card.querySelector('.btn-primary').onclick = () => { Cart.add(p, 1); updateCartCount(); showToast('Added to cart'); renderCartPanel(); };
    grid.appendChild(card);
  });
  renderPagination(filtered.length);
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  const items = JSON.parse(localStorage.getItem('clinchglow_cart_v1') || '[]');
  const qty = items.reduce((s, i) => s + (i.qty || 0), 0);
  if (countEl) countEl.textContent = qty;
}

function renderCartPanel() {
  const panel = document.getElementById('cart-panel');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const itemsRaw = JSON.parse(localStorage.getItem('clinchglow_cart_v1') || '[]');
  const products = window.__CG_PRODUCTS || [];
  itemsEl.innerHTML = '';
  let total = 0;
  itemsRaw.forEach(it => {
    const p = products.find(x => x.id === it.id);
    if (!p) return;
    const line = p.price * it.qty;
    total += line;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div style="flex:1">
        <div>${p.name}</div>
        <div style="font-size:13px;color:var(--muted)">R ${p.price.toFixed(2)}</div>
      </div>
      <div style="text-align:right">
        <input class="qty" type="number" min="1" value="${it.qty}" aria-label="Quantity for ${p.name}">
        <div style="margin-top:6px">
          <button class="btn btn-ghost small">Remove</button>
        </div>
      </div>
    `;
    const input = div.querySelector('input');
    input.onchange = (e) => { Cart.update(p.id, parseInt(e.target.value)); renderCartPanel(); updateCartCount(); };
    div.querySelector('.btn-ghost').onclick = () => { Cart.remove(p.id); renderCartPanel(); updateCartCount(); };
    itemsEl.appendChild(div);
  });
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

// pagination (simple)
let currentPage = 1;
let pageSize = 8;
function renderPagination(totalCount) {
  const pages = Math.max(1, Math.ceil(totalCount / pageSize));
  let container = document.getElementById('pagination');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pagination';
    container.style.marginTop = '16px';
    document.getElementById('productGrid').after(container);
  }
  container.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'tab-btn';
    if (i === currentPage) btn.style.fontWeight = '700';
    btn.onclick = () => { currentPage = i; renderProducts(document.querySelector('.tab-btn.active').dataset.cat); };
    container.appendChild(btn);
  }
}

// search
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'searchBox') {
    const q = e.target.value.trim();
    if (q === '') renderProducts(document.querySelector('.tab-btn.active').dataset.cat);
    else searchProducts(q);
  }
});
function searchProducts(query) {
  query = query.toLowerCase();
  const filtered = window.allProducts.filter(p => p.name.toLowerCase().includes(query));
  currentPage = 1;
  renderProducts(filtered);
}

// hero slider
let heroIndex = 0;
const heroSlides = ['/assets/inuka2.jpg', '/assets/inuka3.jpg', '/assets/inuka4.jpg'];
function rotateHero() {
  heroIndex = (heroIndex + 1) % heroSlides.length;
  const el = document.getElementById('hero-img');
  if (el) el.src = heroSlides[heroIndex];
}
setInterval(rotateHero, 4000);

// Cart panel open/close — improved accessibility
document.addEventListener('DOMContentLoaded', () => {
  init();
  const cartToggle = document.getElementById('cartToggle');
  const panel = document.getElementById('cart-panel');
  const closeBtn = document.getElementById('closeCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCart() {
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    // move focus to close button for keyboard users
    if (closeBtn) closeBtn.focus();
    renderCartPanel();
  }

  function closeCart() {
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    // hide from layout to avoid being focusable
    panel.classList.add('hidden');
    // return focus to cart toggle
    if (cartToggle) cartToggle.focus();
  }

  if (cartToggle) {
    cartToggle.onclick = () => {
      const open = panel && panel.classList.contains('open');
      if (open) closeCart();
      else openCart();
      cartToggle.setAttribute('aria-expanded', String(!open));
    };
  }
  if (closeBtn) closeBtn.onclick = closeCart;
  if (checkoutBtn) checkoutBtn.onclick = () => {
    const itemsRaw = JSON.parse(localStorage.getItem('clinchglow_cart_v1') || '[]');
    const products = window.__CG_PRODUCTS || [];
    const normalized = itemsRaw.map(i => {
      const p = products.find(x => x.id === i.id);
      return p ? { id: p.id, qty: i.qty, name: p.name, price: p.price } : null;
    }).filter(Boolean);
    localStorage.setItem('clinchglow_checkout', JSON.stringify(normalized));
    window.location.href = '/checkout.html';
  };
});
