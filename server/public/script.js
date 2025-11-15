let cart = [];
let products = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            const filter = this.getAttribute('data-filter');
            filterProducts(filter);
        });
    });
    
    // Cart link
    document.querySelector('.cart-link').addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local products if API fails
        displayProducts([
            {
                id: 1,
                name: "Midnight Rose",
                description: "Luxurious floral fragrance",
                price: 89.99,
                image: "/images/perfume1.jpg",
                category: "perfume"
            },
            {
                id: 2,
                name: "Ocean Breeze",
                description: "Fresh aquatic scent",
                price: 75.50,
                image: "/images/perfume2.jpg", 
                category: "perfume"
            }
        ]);
    }
}

// Display products
function displayProducts(productsToShow) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Bag
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

// Filter products
function filterProducts(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        displayProducts(filtered);
    }
}

// Cart functions
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
    showNotification(`${product.name} added to bag!`);
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
    const totalAmount = document.querySelector('.total-amount');
    
    cartItems.innerHTML = '';
    let total = 0;
    
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
    
    totalAmount.textContent = total.toFixed(2);
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
        showNotification('Your bag is empty!');
        return;
    }
    
    const orderItems = document.getElementById('order-items');
    const finalTotal = document.getElementById('order-total');
    
    orderItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        orderItems.innerHTML += `
            <div class="order-item">
                <span>${item.name} (${item.quantity})</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    finalTotal.textContent = total.toFixed(2);
    document.getElementById('checkout-modal').style.display = 'flex';
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// Handle order submission
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        customer: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        items: cart,
        total: parseFloat(document.querySelector('.final-total').textContent)
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show confirmation
            document.getElementById('confirmed-order-id').textContent = '#' + result.orderId;
            document.getElementById('checkout-modal').style.display = 'none';
            document.getElementById('order-confirmation').style.display = 'flex';
            
            // Clear cart
            cart = [];
            updateCartCount();
            closeCart();
            
            // Reset form
            document.getElementById('checkout-form').reset();
        } else {
            showNotification('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error placing order. Please try again.');
    }
});

function closeConfirmation() {
    document.getElementById('order-confirmation').style.display = 'none';
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1003;
        box-shadow: var(--shadow);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);