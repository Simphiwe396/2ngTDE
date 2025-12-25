// Cart Management with PayFast Payments
let cart = JSON.parse(localStorage.getItem('clinchCart')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  updateTotal();
});

// Render cart items
function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>🛒 Your cart is empty</h3>
        <p>Add some amazing products from our store!</p>
        <a href="/" class="back-to-store">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="cart-item-category">${item.category || 'General'}</p>
        ${item.brand ? `<p class="cart-item-brand">${item.brand}</p>` : ''}
        <div class="cart-item-quantity">
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity || 1}</span>
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">
        <p>R ${(item.price * (item.quantity || 1)).toFixed(2)}</p>
        <button class="remove-item" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    container.appendChild(itemElement);
  });
}

// Update item quantity
function updateQuantity(index, change) {
  cart[index].quantity = (cart[index].quantity || 1) + change;
  
  if (cart[index].quantity < 1) {
    cart.splice(index, 1);
  }
  
  localStorage.setItem('clinchCart', JSON.stringify(cart));
  renderCart();
  updateTotal();
}

// Remove item from cart
function removeItem(index) {
  if (confirm('Remove this item from cart?')) {
    cart.splice(index, 1);
    localStorage.setItem('clinchCart', JSON.stringify(cart));
    renderCart();
    updateTotal();
  }
}

// Update total price
function updateTotal() {
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);
  
  // Calculate shipping (free over R500)
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = subtotal + shipping;
  
  document.getElementById('subtotal-price').textContent = subtotal.toFixed(2);
  document.getElementById('shipping-price').textContent = shipping.toFixed(2);
  document.getElementById('total-price').textContent = total.toFixed(2);
}

// REAL PAYFAST CHECKOUT
function checkout() {
  if (cart.length < 1) {
    alert('Your cart is empty!');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2);
  
  // PAYFAST CREDENTIALS - USE YOUR LIVE CREDENTIALS HERE
  const merchant_id = "10000100"; // TEST ID - REPLACE WITH YOUR LIVE MERCHANT ID
  const merchant_key = "46f0cd694581a"; // TEST KEY - REPLACE WITH YOUR LIVE MERCHANT KEY
  
  // Use sandbox for testing, switch to live for production
  const base = "https://sandbox.payfast.co.za/eng/process"; // TEST URL
  // const base = "https://www.payfast.co.za/eng/process"; // LIVE URL
  
  // Build PayFast parameters
  const params = new URLSearchParams({
    merchant_id: merchant_id,
    merchant_key: merchant_key,
    amount: total,
    item_name: `Clinch Glow Order - ${cart.length} items`,
    return_url: window.location.origin + "/success.html",
    cancel_url: window.location.origin + "/cart.html",
    email_address: "", // Customer will enter on PayFast
    cell_number: "" // Customer will enter on PayFast
  });
  
  // Save order info before redirecting
  localStorage.setItem('lastOrderTotal', total);
  localStorage.removeItem("cart"); // Clear cart
  
  // Redirect to PayFast
  window.location.href = `${base}?${params.toString()}`;
}