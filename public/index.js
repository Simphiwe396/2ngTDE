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
    console.warn('API failed, using localStorage backup', error);
    
    // Try localStorage backup
    try {
      const localProducts = JSON.parse(localStorage.getItem('clinchProducts')) || [];
      if (localProducts.length > 0) {
        allProducts = localProducts;
        return localProducts;
      }
    } catch (e) {
      console.log('Local storage empty');
    }
    
    // Try default products.json
    try {
      const response = await fetch('products.json');
      const defaultProducts = await response.json();
      allProducts = defaultProducts;
      return defaultProducts;
    } catch (err) {
      console.error('Failed to load products', err);
      return [];
    }
  }
}

// Create filter buttons
function createFilterButtons(categories) {
  const filterWrap = document.getElementById('filter-wrap');
  filterWrap.innerHTML = '';

  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';

  // All button
  const allButton = document.createElement('button');
  allButton.className = 'filter-btn active';
  allButton.textContent = 'All';
  allButton.onclick = () => filterProducts('All');
  filterBar.appendChild(allButton);

  // Category buttons
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.textContent = category;
    button.onclick = () => filterProducts(category);
    filterBar.appendChild(button);
  });

  filterWrap.appendChild(filterBar);
}

// Filter products
function filterProducts(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const grid = document.getElementById('product-grid');
  
  if (category === 'All') {
    displayProducts(allProducts);
  } else {
    const filtered = allProducts.filter(product => 
      product.category === category
    );
    displayProducts(filtered);
  }
}

// Display products
function displayProducts(products) {
  const grid = document.getElementById('product-grid');
  
  if (products.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No products found in this category.</p></div>';
    return;
  }

  grid.innerHTML = '';
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Format price
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2);
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.src='img/placeholder.jpg'">
        ${product.brand ? `<span class="product-brand">${product.brand}</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-category">${product.category || 'General'}</p>
        <p class="product-price">R ${price}</p>
      </div>
      <div class="product-actions">
        <button class="add-to-cart" data-id="${product.id || product.name}">Add to Cart</button>
        <button class="buy-now" data-id="${product.id || product.name}">Buy Now</button>
      </div>
    `;
    
    // Add event listeners
    const addToCartBtn = card.querySelector('.add-to-cart');
    const buyNowBtn = card.querySelector('.buy-now');
    
    addToCartBtn.addEventListener('click', () => addToCart(product));
    buyNowBtn.addEventListener('click', () => buyNow(product));
    
    grid.appendChild(card);
  });
}

// Add to cart
function addToCart(product) {
  const existingItem = cart.find(item => 
    item.id === product.id || item.name === product.name
  );
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id || Date.now(),
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      category: product.category,
      brand: product.brand,
      quantity: 1
    });
  }
  
  localStorage.setItem('clinchCart', JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.name} added to cart!`);
}

// Buy now
function buyNow(product) {
  addToCart(product);
  window.location.href = 'cart.html';
}

// Show notification
function showNotification(message) {
  const toast = document.getElementById('site-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize store
async function initStore() {
  try {
    const products = await fetchProducts();
    
    // Get unique categories
    const categories = [...new Set(products.map(p => p.category || 'General'))];
    
    // Create filter buttons
    createFilterButtons(categories);
    
    // Display all products
    displayProducts(products);
    
    // Update cart count
    updateCartCount();
    
  } catch (error) {
    console.error('Error initializing store:', error);
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<div class="empty-state"><p>Error loading products. Please try again later.</p></div>';
  }
}

// Start the store
document.addEventListener('DOMContentLoaded', initStore);