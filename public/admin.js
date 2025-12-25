// Admin Panel - PostgreSQL Integration
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

// Load products from PostgreSQL
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load products');
    
    const products = await response.json();
    renderProductList(products);
  } catch (error) {
    console.error('Error loading products:', error);
    renderProductList([]);
    alert('Error loading products from database');
  }
}

// Render product list
function renderProductList(products) {
  const listContainer = document.getElementById('admin-product-list');
  listContainer.innerHTML = '';
  
  if (products.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-message" style="text-align: center; padding: 40px; color: #666;">
        <h3>No products yet</h3>
        <p>Add your first product using the form!</p>
      </div>
    `;
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    card.innerHTML = `
      <div class="product-header" style="display: flex; gap: 15px; margin-bottom: 15px;">
        <img src="${product.image || 'img/placeholder.jpg'}" 
             alt="${product.name}"
             style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
        <div class="product-info" style="flex: 1;">
          <h3 style="margin: 0 0 10px 0;">${product.name}</h3>
          <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">R${product.price.toFixed(2)}</p>
          <p class="category-badge" style="display: inline-block; background: #f0f7ff; color: #0066cc; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 5px 5px 0 0;">
            ${product.category || 'Other'}
          </p>
          ${product.brand ? `<p class="brand-badge" style="display: inline-block; background: #f0fff0; color: #006600; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 5px 0 0 0;">${product.brand}</p>` : ''}
        </div>
      </div>
      <div class="admin-action-btns" style="display: flex; gap: 10px;">
        <button class="edit-btn" onclick="editProduct('${product.id}')" style="flex: 1; padding: 8px; background: #f5d27b; color: #000; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${product.id}')" style="flex: 1; padding: 8px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Delete</button>
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
  
  return 'Other';
}

// Save product to PostgreSQL
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save product');
    }
    
    // Clear form
    clearForm();
    
    // Reload products
    loadProducts();
    
    alert('Product saved successfully to database!');
    
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error: ' + error.message);
  }
}

// Edit product
async function editProduct(productId) {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load products');
    
    const products = await response.json();
    const product = products.find(p => p.id == productId);
    
    if (product) {
      editingProductId = productId;
      
      document.getElementById('edit-id').value = productId;
      document.getElementById('p-name').value = product.name || '';
      document.getElementById('p-price').value = product.price || '';
      document.getElementById('p-image').value = product.image || '';
      document.getElementById('p-category').value = product.category || '';
      document.getElementById('p-brand').value = product.brand || '';
      
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete product');
    }
    
    alert('Product deleted successfully!');
    loadProducts();
    
    // If we were editing this product, clear the form
    if (editingProductId === productId) {
      clearForm();
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error: ' + error.message);
  }
}

// Clear form
function clearForm() {
  editingProductId = null;
  document.getElementById('edit-id').value = '';
  document.getElementById('p-name').value = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-image').value = '';
  document.getElementById('p-category').value = '';
  document.getElementById('p-brand').value = '';
}

// Brand selection
function selectBrand(brand) {
  document.getElementById('p-brand').value = brand;
  document.querySelectorAll('.brand-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Auto-set category based on brand
  if (brand === 'Inuka') {
    document.getElementById('p-category').value = 'Perfume';
  } else if (brand === 'Clinch Glow') {
    document.getElementById('p-category').value = 'Lotion';
  }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', loadProducts);