// ====================
// PRODUCT DATA & INIT
// ====================
const products = [
    {
        id: 1,
        name: "Premium T-Shirt",
        price: 249.99,
        image: "images/products/tshirt.jpg",
        rating: 4.5,
        badge: "Bestseller"
    },
    {
        id: 2,
        name: "Designer Jeans",
        price: 599.99,
        image: "images/products/jeans.jpg",
        rating: 4.2,
        badge: "New"
    }
];

let cart = [];

// ====================
// CART FUNCTIONALITY
// ====================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    cart.push(product);
    updateCartCount();
    showAlert(`${product.name} added to cart!`);  // Fixed: Added backticks
}

function updateCartCount() {
    const countElement = document.querySelector('.cart-count') || document.querySelector('.fa-shopping-cart');
    if (countElement) {
        countElement.textContent = cart.length;
        countElement.style.display = cart.length ? 'inline-block' : 'none';
    }
}

function showAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'cart-alert';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 2000);
}

// ====================
// CHATBOT FUNCTIONALITY
// ====================
document.querySelector('.chatbot-toggle')?.addEventListener('click', () => {
    document.querySelector('.chatbot-container').style.display = 'flex';
});

document.querySelector('.close-chatbot')?.addEventListener('click', () => {
    document.querySelector('.chatbot-container').style.display = 'none';
});

document.querySelector('.chatbot-input button')?.addEventListener('click', sendMessage);
document.querySelector('.chatbot-input input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addUserMessage(text) {
    const messagesDiv = document.querySelector('.chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `<p>${text}</p>`;  // Fixed: Added backticks
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addBotMessage(text) {
    const messagesDiv = document.querySelector('.chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message';
    messageDiv.innerHTML = `<p>${text}</p>`;  // Fixed: Added backticks
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const input = document.querySelector('.chatbot-input input');
    const message = input.value.trim();
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    setTimeout(() => {
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            addBotMessage("Hello! How can I help with your 2ngTDE order today?");
        } else if (message.toLowerCase().includes('price')) {
            addBotMessage("Our prices range from R249 to R999. Check each product for details!");
        } else {
            addBotMessage("Thank you for your message! Our team will respond within 24 hours.");
        }
    }, 800);
}

// ====================
// INITIAL SETUP
// ====================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        products.forEach(product => {
            const ratingStars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
            productGrid.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="price">R${product.price.toFixed(2)}</div>
                        <div class="rating">${ratingStars} (${product.rating})</div>
                        <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
                    </div>
                </div>
            `;
        });
    }

    setTimeout(() => {
        addBotMessage("Hello! I'm your 2ngTDE assistant. How can I help?");
    }, 1500);
});

// ====================  
// LUXURY ANIMATIONS  
// ====================  
// Fade-in products on scroll  
function animateProducts() {
  const productCards = document.querySelectorAll('.product-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  productCards.forEach(card => observer.observe(card));
}

// Gold button hover effects  
function initGoldHover() {
  document.querySelectorAll('.admin-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = 'none';
    });
  });
}

// Initialize when page loads  
document.addEventListener('DOMContentLoaded', () => {
  animateProducts();
  if (window.location.pathname.includes('/admin')) {
    initGoldHover();
  }
});

// ====================  
// 3D PRODUCT TILT  
// ====================  
function init3DEffect() {
  // Only load on desktop (optional)
  if (window.innerWidth > 768) {
    const tiltScript = document.createElement('script');
    tiltScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js';
    tiltScript.onload = () => {
      VanillaTilt.init(document.querySelectorAll(".product-card"), {
        max: 5,          // Tilt angle
        speed: 300,      // Animation speed
        glare: true,     // Adds light reflection
        "max-glare": 0.2 // Glare intensity
      });
    };
    document.body.appendChild(tiltScript);
  }
}

// Call it after page loads
window.addEventListener('load', init3DEffect);