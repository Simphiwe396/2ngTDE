let cart = [];
let products = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    
    // Cart link
    document.querySelector('.cart-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });
    
    // Close modal when clicking outside
    document.getElementById('checkout-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCheckout();
        }
    });
    
    // Close cart when clicking outside (on overlay)
    document.addEventListener('click', function(e) {
        const cart = document.getElementById('cart');
        const cartBtn = document.querySelector('.cart-btn');
        if (cart.classList.contains('active') && !cart.contains(e.target) && !cartBtn.contains(e.target)) {
            closeCart();
        }
    });
    
    // Add scroll animations
    initScrollAnimations();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayFeaturedProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local products
        products = [
            {
                id: 1,
                name: "Midnight Rose",
                price: 89.99,
                description: "Luxurious floral fragrance with notes of Bulgarian rose, jasmine, and vanilla",
                category: "Floral",
                images: ["midnight-rose-1.jpg", "midnight-rose-2.jpg"],
                features: ["Long-lasting", "Evening wear", "Romantic"]
            },
            {
                id: 2,
                name: "Ocean Breeze",
                price: 75.50,
                description: "Fresh aquatic scent inspired by coastal waves and sea salt",
                category: "Aquatic",
                images: ["ocean-breeze-1.jpg", "ocean-breeze-2.jpg"],
                features: ["Refreshing", "Day wear", "Summer scent"]
            },
            {
                id: 3,
                name: "Vanilla Dream",
                price: 82.00,
                description: "Warm vanilla fragrance with hints of amber and tonka bean",
                category: "Oriental",
                images: ["vanilla-dream-1.jpg", "vanilla-dream-2.jpg"],
                features: ["Warm", "Comforting", "All-season"]
            },
            {
                id: 4,
                name: "Citrus Zest",
                price: 65.00,
                description: "Energetic citrus scent with bergamot, lemon, and grapefruit",
                category: "Citrus",
                images: ["citrus-zest-1.jpg", "citrus-zest-2.jpg"],
                features: ["Energizing", "Morning wear", "Unisex"]
            }
        ];
        displayFeaturedProducts();
    }
}

function displayFeaturedProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    const featuredProducts = products.slice(0, 4); // Show first 4 as featured
    
    featuredProducts.forEach(product => {
        const productCard = `
            <div class="product-card fade-in">
                <div class="product-image">
                    <i class="fas fa-wine-bottle"></i>
                </div>
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-bag"></i>
                        Add to Cart
                    </button>
                </div>
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
    const emptyCart = document.getElementById('empty-cart');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
    } else {
        emptyCart.style.display = 'none';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </div>
            `;
            cartItems.innerHTML += cartItem;
        });
    }
    
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
        showNotification('Your cart is empty!', 'error');
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
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} (${item.quantity})</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    orderTotal.textContent = total.toFixed(2);
    document.getElementById('checkout-modal').style.display = 'flex';
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : 'var(--primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 1003;
        box-shadow: var(--shadow);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Handle checkout form
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const orderData = {
        items: cart,
        total: document.getElementById('order-total').textContent,
        customer: this.querySelector('input[type="text"]').value + ' ' + this.querySelectorAll('input[type="text"]')[1].value,
        email: this.querySelector('input[type="email"]').value,
        phone: this.querySelector('input[type="tel"]').value,
        address: this.querySelector('textarea').value + ', ' + 
                 this.querySelectorAll('input[type="text"]')[2].value + ', ' +
                 this.querySelectorAll('input[type="text"]')[3].value + ', ' +
                 this.querySelectorAll('input[type="text"]')[4].value,
        date: new Date().toLocaleString()
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Order placed successfully! Order ID: ${result.orderId}`);
            
            // Clear cart and close modals
            cart = [];
            updateCartCount();
            closeCart();
            closeCheckout();
            this.reset();
        } else {
            throw new Error('Order failed');
        }
    } catch (error) {
        console.error('Order submission error:', error);
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('clinch_orders') || '[]');
        orders.push({
            ...orderData,
            id: 'CLINCH-' + Date.now(),
            status: 'pending'
        });
        localStorage.setItem('clinch_orders', JSON.stringify(orders));
        
        showNotification('Order placed successfully! Order ID: CLINCH-' + Date.now());
        
        // Clear cart and close modals
        cart = [];
        updateCartCount();
        closeCart();
        closeCheckout();
        this.reset();
    }
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all product cards and collection cards
    document.querySelectorAll('.product-card, .collection-card, .feature').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Add CSS for slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);let cart = [];

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