// store.js — improved layout-friendly version
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.length;
}

// Safe product object for cart (only fields we need)
function cartProduct(p) {
  return {
    id: p.id ?? null,
    name: p.name ?? "",
    price: Number(p.price || 0),
    image: p.image || "img/placeholder.jpg",
    category: p.category || "Other"
  };
}

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn("API failed, falling back to local products.json", e);
    try {
      const local = await fetch("products.json");
      return await local.json();
    } catch (err) {
      console.error("Failed to load products", err);
      return [];
    }
  }
}

function renderFilterBar(categories) {
  const wrap = document.getElementById("filter-wrap");
  wrap.innerHTML = '';
  const frag = document.createElement('div');
  frag.className = 'filter-bar';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.innerText = cat;
    btn.dataset.cat = cat;
    btn.onclick = () => loadProducts(cat);
    frag.appendChild(btn);
  });
  wrap.appendChild(frag);
}

async function loadProducts(filter = "All") {
  const products = await fetchProducts();
  const cats = ["All", ...Array.from(new Set(products.map(p => p.category || "Other")))];

  renderFilterBar(cats);

  const grid = document.getElementById("product-grid");
  grid.innerHTML = '';

  let list = products;
  if (filter && filter !== "All") {
    list = products.filter(p => (p.category || "") === filter);
  }

  if (!list || list.length === 0) {
    grid.innerHTML = `<p class="empty-msg">No products found.</p>`;
    updateCartCount();
    return;
  }

  list.forEach(p => {
    const prod = {
      id: p.id ?? null,
      name: p.name,
      price: Number(p.price),
      image: p.image || "img/placeholder.jpg",
      category: p.category || ""
    };

    const card = document.createElement('article');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-media">
        <img src="${prod.image}" alt="${escapeHtml(prod.name)}" onerror="this.src='img/placeholder.jpg'">
      </div>
      <div class="product-body">
        <h3>${escapeHtml(prod.name)}</h3>
        <p class="category">${escapeHtml(prod.category)}</p>
        <p class="price">R${prod.price.toFixed(2)}</p>
      </div>
      <div class="product-actions">
        <button class="order-btn">Add to Cart</button>
        <button class="buy-btn">Buy Now</button>
      </div>
    `;

    // attach behaviors
    card.querySelector('.order-btn').addEventListener('click', () => {
      const cp = cartProduct(prod);
      cart.push(cp);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      showToast(`${prod.name} added to cart`);
    });

    card.querySelector('.buy-btn').addEventListener('click', () => {
      buyNow(encodeURIComponent(prod.name), prod.price);
    });

    grid.appendChild(card);
  });

  updateCartCount();
}

// Escape helper to avoid breaking HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg) {
  // simple transient toast
  let t = document.getElementById('site-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'site-toast';
    t.className = 'site-toast';
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.classList.add('visible');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('visible'), 2200);
}

function buyNow(nameEncoded, price) {
  const amount = Number(price).toFixed(2);
  const merchant_id = "10043743";
  const merchant_key = "7t8eg1prjfj0m";
  const base = (window.location.protocol === 'https:') ? 'https://sandbox.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process';
  const url = `${base}?merchant_id=${merchant_id}&merchant_key=${merchant_key}&amount=${amount}&item_name=${nameEncoded}&return_url=${encodeURIComponent(window.location.origin + '/success.html')}&cancel_url=${encodeURIComponent(window.location.origin + '/store.html')}`;
  // clear local cart (user intent was to buy single item)
  localStorage.removeItem('cart');
  window.location.href = url;
}

// initialize
loadProducts();
updateCartCount();
