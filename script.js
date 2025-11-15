let cart = [];

const products = [
    { id: 1, name: "Midnight Rose", price: 89.99, description: "Luxurious floral fragrance" },
    { id: 2, name: "Ocean Breeze", price: 75.50, description: "Fresh aquatic scent" },
    { id: 3, name: "Vanilla Dream", price: 82.00, description: "Warm vanilla fragrance" },
    { id: 4, name: "Citrus Zest", price: 65.00, description: "Energetic citrus scent" },
    { id: 5, name: "Silk Dress", price: 149.99, description: "Elegant silk dress" },
    { id: 6, name: "Cashmere Blazer", price: 199.99, description: "Premium cashmere blazer" }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartCount();
    
    // Cart link
    document.querySelector('.cart-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });
});

function displayProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <div class="product-image">${product.name}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <div>$${item.price} × ${item.quantity}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    Remove
                </button>
            </div>
        `;
        cartItems.innerHTML += cartItem;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

function openCart() {
    updateCartDisplay();
    document.getElementById('cart').classList.add('active');
}

function closeCart() {
    document.getElementById('cart').classList.remove('active');
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    
    orderItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        orderItems.innerHTML += `
            <div>${item.name} (${item.quantity}) - $${itemTotal.toFixed(2)}</div>
        `;
    });
    
    orderTotal.textContent = total.toFixed(2);
    document.getElementById('checkout-modal').style.display = 'flex';
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 1003;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle checkout form
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderData = {
        items: cart,
        total: document.getElementById('order-total').textContent,
        customer: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        phone: this.querySelector('input[type="tel"]').value,
        address: this.querySelector('textarea').value,
        date: new Date().toLocaleString()
    };
    
    // Save order to localStorage (in real app, send to server)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        ...orderData,
        id: Date.now(),
        status: 'pending'
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert('Order placed successfully! Order ID: #' + Date.now());
    
    // Clear cart and close modals
    cart = [];
    updateCartCount();
    closeCart();
    document.getElementById('checkout-modal').style.display = 'none';
    this.reset();
});