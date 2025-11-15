// Main JavaScript for CLINCH Perfume Store
let cart = JSON.parse(localStorage.getItem('clinch_cart')) || [];

// Navigation
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

// Product Management
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayFeaturedProducts(products);
        displayNewArrivals(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featured = products.slice(0, 4);
    container.innerHTML = featured.map(product => `
        <div class="pro" onclick="window.location.href='sproduct?id=${product.id}'">
            <img src="${product.image || 'images/perfume1.jpg'}" alt="${product.name}">
            <div class="des">
                <span>${product.category}</span>
                <h5>${product.name}</h5>
                <div class="star">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <h4>R${product.price.toFixed(2)}</h4>
            </div>
            <a href="#" class="cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
            </a>
        </div>
    `).join('');
}

function displayNewArrivals(products) {
    const container = document.getElementById('new-arrivals');
    if (!container) return;
    
    const newArrivals = products.slice(2, 6);
    container.innerHTML = newArrivals.map(product => `
        <div class="pro" onclick="window.location.href='sproduct?id=${product.id}'">
            <img src="${product.image || 'images/perfume1.jpg'}" alt="${product.name}">
            <div class="des">
                <span>${product.category}</span>
                <h5>${product.name}</h5>
                <div class="star">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <h4>R${product.price.toFixed(2)}</h4>
            </div>
            <a href="#" class="cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
            </a>
        </div>
    `).join('');
}

// Cart Management
function addToCart(productId) {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            if (product) {
                const existingItem = cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        ...product,
                        quantity: 1
                    });
                }
                
                updateCartStorage();
                showNotification(`${product.name} added to cart!`);
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
        });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartStorage();
    updateCartDisplay();
}

function updateCartStorage() {
    localStorage.setItem('clinch_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.querySelectorAll('.cart-count');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCount.forEach(element => {
        element.textContent = count;
    });
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>R${item.price} × ${item.quantity}</p>
                </div>
                <div>
                    <span>R${itemTotal.toFixed(2)}</span>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
        }
    }
}

// Checkout and Payment
async function processPayment() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const phoneNumber = document.getElementById('payshap-phone').value;
    
    if (!phoneNumber) {
        alert('Please enter your phone number for PayShap payment.');
        return;
    }
    
    // Create order
    const orderData = {
        customer_name: document.getElementById('customer-name').value,
        email: document.getElementById('email').value,
        phone: phoneNumber,
        address: document.getElementById('address').value,
        items: cart,
        total_amount: total,
        payment_method: 'payshap'
    };
    
    try {
        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
            // Process PayShap payment
            const paymentResponse = await fetch('/api/payment/payshap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: orderResult.order_id,
                    amount: total,
                    phone_number: phoneNumber
                })
            });
            
            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.success) {
                alert(`Payment successful! Order ID: ${orderResult.order_id}`);
                // Clear cart
                cart = [];
                updateCartStorage();
                window.location.href = '/';
            } else {
                alert('Payment failed: ' + paymentResult.error);
            }
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('An error occurred during payment. Please try again.');
    }
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #088178;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    
    // Initialize cart display if on cart page
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
    
    // Initialize checkout button if exists
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processPayment);
    }
});