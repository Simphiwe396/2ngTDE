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
        if (document.getElementById('shop-products')) {
            displayShopProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to default products if API fails
        const fallbackProducts = [
            {
                id: 1,
                name: "Midnight Rose",
                price: 89.99,
                description: "Luxurious floral fragrance with notes of Bulgarian rose",
                category: "Floral",
                features: ["Long-lasting", "Evening wear", "Romantic"]
            },
            {
                id: 2,
                name: "Ocean Breeze",
                price: 75.50,
                description: "Fresh aquatic scent inspired by coastal waves",
                category: "Aquatic",
                features: ["Refreshing", "Day wear", "Summer scent"]
            },
            {
                id: 3,
                name: "Vanilla Dream",
                price: 82.00,
                description: "Warm vanilla fragrance with hints of amber",
                category: "Oriental",
                features: ["Warm", "Comforting", "All-season"]
            },
            {
                id: 4,
                name: "Citrus Zest",
                price: 65.00,
                description: "Energetic citrus scent with bergamot and lemon",
                category: "Citrus",
                features: ["Energizing", "Morning wear", "Unisex"]
            },
            {
                id: 5,
                name: "Noir Essence",
                price: 120.00,
                description: "Mysterious blend of oud, leather and smoky notes",
                category: "Woody",
                features: ["Mysterious", "Evening wear", "Luxury"]
            },
            {
                id: 6,
                name: "Royal Amber",
                price: 95.00,
                description: "Rich amber fragrance with spices and precious woods",
                category: "Oriental",
                features: ["Royal", "Winter scent", "Elegant"]
            }
        ];
        displayFeaturedProducts(fallbackProducts);
        displayNewArrivals(fallbackProducts);
        if (document.getElementById('shop-products')) {
            displayShopProducts(fallbackProducts);
        }
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featured = products.slice(0, 4);
    container.innerHTML = featured.map(product => `
        <div class="pro" onclick="window.location.href='sproduct?id=${product.id}'">
            <div class="product-image">
                <i class="fas fa-wine-bottle"></i>
            </div>
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
            <div class="product-image">
                <i class="fas fa-wine-bottle"></i>
            </div>
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

function displayShopProducts(products) {
    const container = document.getElementById('shop-products');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="pro" onclick="window.location.href='sproduct?id=${product.id}'">
            <div class="product-image">
                <i class="fas fa-wine-bottle"></i>
            </div>
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
            // Fallback: Use default products if API fails
            const fallbackProducts = [
                { id: 1, name: "Midnight Rose", price: 89.99, category: "Floral" },
                { id: 2, name: "Ocean Breeze", price: 75.50, category: "Aquatic" },
                { id: 3, name: "Vanilla Dream", price: 82.00, category: "Oriental" },
                { id: 4, name: "Citrus Zest", price: 65.00, category: "Citrus" },
                { id: 5, name: "Noir Essence", price: 120.00, category: "Woody" },
                { id: 6, name: "Royal Amber", price: 95.00, category: "Oriental" }
            ];
            const product = fallbackProducts.find(p => p.id === productId);
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
        });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartStorage();
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartStorage();
            updateCartDisplay();
        }
    }
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
    const emptyCart = document.getElementById('empty-cart');
    
    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartTotal) cartTotal.textContent = '0.00';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>R${item.price.toFixed(2)} × ${item.quantity}</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <button onclick="updateQuantity(${item.id}, -1)" style="padding: 2px 8px; border: 1px solid #ccc; background: white; border-radius: 3px;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" style="padding: 2px 8px; border: 1px solid #ccc; background: white; border-radius: 3px;">+</button>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold;">R${itemTotal.toFixed(2)}</span>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
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
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const customerName = document.getElementById('customer-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const payshapPhone = document.getElementById('payshap-phone');
    
    if (!customerName || !email || !phone || !address || !payshapPhone) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!payshapPhone.value) {
        showNotification('Please enter your phone number for PayShap payment.', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const orderData = {
        customer_name: customerName.value,
        email: email.value,
        phone: phone.value,
        address: address.value,
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
                    phone_number: payshapPhone.value
                })
            });
            
            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.success) {
                showNotification(`Payment successful! Order ID: ${orderResult.order_id}`, 'success');
                // Clear cart
                cart = [];
                updateCartStorage();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showNotification('Payment failed: ' + paymentResult.error, 'error');
            }
        } else {
            showNotification('Failed to create order. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('An error occurred during payment. Please try again.', 'error');
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : '#088178'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Newsletter Signup
function setupNewsletter() {
    const newsletterForm = document.querySelector('#newsletter .form');
    if (newsletterForm) {
        const input = newsletterForm.querySelector('input');
        const button = newsletterForm.querySelector('button');
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (input.value) {
                showNotification('Thank you for subscribing to our newsletter!');
                input.value = '';
            } else {
                showNotification('Please enter your email address.', 'error');
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                button.click();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupNewsletter();
    
    // Initialize cart display if on cart page
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
    
    // Initialize checkout button if exists
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processPayment);
    }
    
    // Initialize product page if on product page
    if (window.location.pathname.includes('sproduct')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            loadProductDetails(productId);
        }
    }
});

// Product Details Page
async function loadProductDetails(productId) {
    try {
        const response = await fetch(`/api/product/${productId}`);
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

function displayProductDetails(product) {
    const container = document.getElementById('product-details');
    if (!container) return;
    
    container.innerHTML = `
        <div class="product-detail">
            <div class="product-image large">
                <i class="fas fa-wine-bottle"></i>
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <h3>R${product.price.toFixed(2)}</h3>
                <p>${product.description}</p>
                <div class="features">
                    <h4>Features:</h4>
                    <ul>
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}