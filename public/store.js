// Clinch Glow Store - Main Store Functionality
let cart = JSON.parse(localStorage.getItem("clinchCart")) || [];
let allProducts = [];

// Update cart count
function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartElements = document.querySelectorAll('#cart-count');
  cartElements.forEach(el => {
    if (el) el.textContent = cartCount;
  });
}

// Fetch products from server API
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('API error');
    const products = await response.json();
    allProducts = products;
    return products;
  } catch (error) {
    console.warn('API failed, using backup', error);
    try {
      const response = await fetch('products.json');
      const defaultProducts = await response.json();
      allProducts = defaultProducts;
      return defaultProducts;
    } catch (err) {
      return [];
    }
  }
}

function createFilterButtons(categories) {
  const filterWrap = document.getElementById('filter-wrap');
  filterWrap.innerHTML = '';
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';

  const allButton = document.createElement('button');
  allButton.className = 'filter-btn active';
  allButton.textContent = 'All';
  allButton.onclick = (e) => {
    filterProducts('All');
    updateActiveBtn(e.target);
  };
  filterBar.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.textContent = category;
    button.onclick = (e) => {
      filterProducts(category);
      updateActiveBtn(e.target);
    };
    filterBar.appendChild(button);
  });
  filterWrap.appendChild(filterBar);
}

function updateActiveBtn(target) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  target.classList.add('active');
}

function filterProducts(category) {
  const grid = document.getElementById('product-grid');
  if (category === 'All') {
    displayProducts(allProducts);
  } else {
    const filtered = allProducts.filter(product => product.category === category);
    displayProducts(filtered);
  }
}

function displayProducts(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.length === 0 ? '<p>No products found.</p>' : '';
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const price = parseFloat(product.price || 0).toFixed(2);
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='img/logo.jpg'">
        ${product.brand ? `<span class="product-brand">${product.brand}</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-category">${product.category || 'General'}</p>
        <p class="product-price">R ${price}</p>
      </div>
      <div class="product-actions">
        <button class="add-to-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addToCart(product) {
  const existing = cart.find(item => item.name === product.name);
  if (existing) { existing.quantity++; } 
  else { cart.push({...product, quantity: 1}); }
  localStorage.setItem('clinchCart', JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.name} added!`);
}

function showNotification(message) {
  const toast = document.getElementById('site-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// SECURITY: Hidden Admin Access logic
function checkAdminAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('admin');
  // Matches your ADMIN_KEY on Render
  if (key === 'MySuperSecretAdmin123') {
    const actions = document.getElementById('header-actions');
    const adminBtn = document.createElement('a');
    adminBtn.href = `admin.html?admin=${key}`;
    adminBtn.className = 'cart-link';
    adminBtn.style.background = '#ff4757';
    adminBtn.style.marginLeft = '10px';
    adminBtn.textContent = '⚙️ Admin';
    actions.appendChild(adminBtn);
  }
}

async function initStore() {
  const products = await fetchProducts();
  const categories = [...new Set(products.map(p => p.category || 'General'))];
  createFilterButtons(categories);
  displayProducts(products);
  updateCartCount();
  checkAdminAccess(); // Run the security check
}

document.addEventListener('DOMContentLoaded', initStore);
