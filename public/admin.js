// Admin Panel - Product Management
let editingProductId = null;

// Auto-categorization rules
const categoryRules = {
  'Inuka': 'Perfume',
  'Clinch Glow': 'Lotion',
  'perfume': 'Perfume',
  'lotion': 'Lotion',
  'face wash': 'Face Wash',
  'body spray': 'Body Spray',
  'weave': 'Weave'
};

// Load products from database
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    renderProductList(products);
  } catch (error) {
    console.error('Error loading products:', error);
    renderProductList([]);
  }
}

// Render product list
function renderProductList(products) {
  const listContainer = document.getElementById('admin-product-list');
  listContainer.innerHTML = '';
  
  if (products.length === 0) {
    listContainer.innerHTML = '<p class="empty-message">No products yet. Add your first product!</p>';
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    
    card.innerHTML = `
      <div class="admin-card-image">
        <img src="${product.image || 'img/placeholder.jpg'}" 
             alt="${product.name}"
             onerror="this.src='img/placeholder.jpg'">
      </div>
      <div class="admin-card-info">
        <h3>${product.name}</h3>
        <p class="admin-card-price">R ${product.price.toFixed(2)}</p>
        <p class="admin-card-category"><strong>Category:</strong> ${product.category || 'Other'}</p>
        ${product.brand ? `<p class="admin-card-brand"><strong>Brand:</strong> ${product.brand}</p>` : ''}
      </div>
      <div class="admin-card-actions">
        <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
      </div>
    `;
    
    listContainer.appendChild(card);
  });
}

// Auto-determine category
function autoDetermineCategory(brand, name) {
  const lowerName = name.toLowerCase();
  const lowerBrand = (brand || '').toLowerCase();
  
  // Check brand first
  for (const [key, category] of Object.entries(categoryRules)) {
    if (lowerBrand.includes(key.toLowerCase())) {
      return category;
    }
  }
  
  // Check product name
  for (const [key, category] of Object.entries(categoryRules)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }
  
  return document.getElementById('p-category').value || 'Other';
}

// Save product
async function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const image = document.getElementById('p-image').value.trim();
  const brand = document.getElementById('p-brand').value;
  
  if (!name || isNaN(price) || price <= 0) {
    alert('Please enter valid product name and price');
    return;
  }
  
  // Auto-determine category
  const category = autoDetermineCategory(brand, name);
  
  const productData = {
    name,
    price,
    image: image || 'img/placeholder.jpg',
    category,
    brand: brand || ''
  };
  
  try {
    let response;
    
    if (editingProductId) {
      // Update existing product
      response = await fetch(`/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } else {
      // Add new product
      response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    }
    
    if (!response.ok) {
      throw new Error('Failed to save product');
    }
    
    // Clear form
    clearForm();
    
    // Reload products
    loadProducts();
    
    alert('Product saved successfully!');
    
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error saving product. Please try again.');
  }
}

// Edit product
async function editProduct(productId) {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    const product = products.find(p => p.id == productId);
    
    if (product) {
      editingProductId = productId;
      
      document.getElementById('p-name').value = product.name || '';
      document.getElementById('p-price').value = product.price || '';
      document.getElementById('p-image').value = product.image || '';
      document.getElementById('p-category').value = product.category || '';
      document.getElementById('p-brand').value = product.brand || '';
      
      // Update brand button active state
      document.querySelectorAll('.brand-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(product.brand || '')) {
          btn.classList.add('active');
        }
      });
      
      document.getElementById('p-name').focus();
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Error loading product details');
  }
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    alert('Product deleted successfully!');
    loadProducts();
    
    // If we were editing this product, clear the form
    if (editingProductId === productId) {
      clearForm();
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product. Please try again.');
  }
}

// Clear form
function clearForm() {
  editingProductId = null;
  document.getElementById('p-name').value = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-image').value = '';
  document.getElementById('p-category').value = '';
  document.getElementById('p-brand').value = 'Inuka';
  
  // Reset brand buttons
  document.querySelectorAll('.brand-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.includes('Inuka')) {
      btn.classList.add('active');
    }
  });
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', loadProducts);