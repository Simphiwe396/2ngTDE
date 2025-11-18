// public/app.js
let products = [];
let filteredProducts = [];

async function loadProducts() {
  try {
    const res = await fetch('/products');
    products = await res.json();
    filteredProducts = products || [];
    initCategories();
    displayProducts(filteredProducts);
  } catch (err) {
    console.error('Failed to load products', err);
    document.getElementById('productGrid').innerHTML = '<p>No products found.</p>';
  }
}

function initCategories() {
  const cats = Array.from(new Set((products || []).map(p => p.category))).filter(Boolean);
  const container = document.getElementById('categories');
  if (!container) return;
  container.innerHTML = '<div class="cat" onclick="filterByAll()">All</div>' +
    cats.map(c => `<div class="cat" onclick="filterByCategory('${c}')">${c}</div>`).join('');
}

function filterByAll() {
  filteredProducts = products;
  displayProducts(filteredProducts);
}
function filterByCategory(c) {
  filteredProducts = products.filter(p => p.category === c);
  displayProducts(filteredProducts);
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const results = filteredProducts.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  displayProducts(results);
}

function displayProducts(list) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    grid.innerHTML = '<p>No products found.</p>';
    return;
  }
  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='/assets/logo.png'">
      <h3>${p.name}</h3>
      <p class="price">R ${p.price}</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button onclick="addToCart('${p.id}')">Add to cart</button>
        <button onclick="viewProduct('${p.id}')">View</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (!item) return alert('Item not found');
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart');
}

function viewProduct(id) {
  window.location.href = '/product.html?id=' + encodeURIComponent(id);
}

window.addEventListener('DOMContentLoaded', loadProducts);
