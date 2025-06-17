// Sample product data
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
    },
    {
        id: 3,
        name: "Casual Sneakers",
        price: 799.99,
        image: "images/products/sneakers.jpg",
        rating: 4.7,
        badge: "Limited"
    },
    {
        id: 4,
        name: "Summer Dress",
        price: 449.99,
        image: "images/products/dress.jpg",
        rating: 4.3,
        badge: "Sale"
    },
    {
        id: 5,
        name: "Formal Shirt",
        price: 399.99,
        image: "images/products/shirt.jpg",
        rating: 4.1,
        badge: null
    },
    {
        id: 6,
        name: "Winter Jacket",
        price: 999.99,
        image: "images/products/jacket.jpg",
        rating: 4.8,
        badge: "Hot"
    },
    {
        id: 7,
        name: "Sport Shorts",
        price: 299.99,
        image: "images/products/shorts.jpg",
        rating: 4.0,
        badge: null
    },
    {
        id: 8,
        name: "Elegant Skirt",
        price: 349.99,
        image: "images/products/skirt.jpg",
        rating: 4.4,
        badge: "New"
    }
];

// Sample seller data
const sellers = [
    {
        id: 1,
        name: "Fashion Hub",
        rating: 4.7,
        products: 42
    },
    {
        id: 2,
        name: "Urban Styles",
        rating: 4.5,
        products: 35
    },
    {
        id: 3,
        name: "Trendy Threads",
        rating: 4.3,
        products: 28
    },
    {
        id: 4,
        name: "Elite Apparel",
        rating: 4.8,
        products: 56
    },
    {
        id: 5,
        name: "Classic Wear",
        rating: 4.2,
        products: 31
    },
    {
        id: 6,
        name: "Modern Outfits",
        rating: 4.6,
        products: 47
    }
];

// Admin users
const adminUsers = [
    { username: "simphiwe", password: "shareholder123", role: "shareholder", name: "Simphiwe Kubheka" },
    { username: "nqobile", password: "shareholder456", role: "shareholder", name: "Nqobile Kubheka" },
    { username: "themba", password: "founder789", role: "founder", name: "Themba Kubheka" },
    { username: "beauty", password: "ceo123", role: "ceo", name: "Beauty Kubheka" },
    { username: "lindiwe", password: "manager456", role: "manager", name: "Lindiwe Tshabalala" },
    { username: "silindile", password: "admin789", role: "admin", name: "Silindile Kubheka" }
];

// Chatbot responses
const chatbotResponses = {
    "hello": "Hello! How can I assist you with your shopping today?",
    "hi": "Hi there! Welcome to 2ngTDE. How can I help you?",
    "products": "We have a wide range of clothing products available. You can browse our collection in the Products section.",
    "price": "Our prices vary depending on the product. You can check the price of each item on its product card.",
    "delivery": "We offer delivery across South Africa. Delivery times vary between 2-5 business days depending on your location.",
    "return": "We have a 14-day return policy. If you're not satisfied with your purchase, you can return it for a refund or exchange.",
    "contact": "You can contact us via email at nqobile.kubheka15@gmail.com or through the contact form on our website.",
    "default": "I'm sorry, I didn't understand that. Could you please rephrase your question? I'm here to help with product information, orders, deliveries, and returns."
};

// DOM Elements
const productGrid = document.querySelector('.product-grid');
const sellerGrid = document.querySelector('.seller-grid');
const adminModal = document.getElementById('adminModal');
const adminBtn = document.querySelector('.admin-btn');
const closeModal = document.querySelector('.close');
const adminLoginForm = document.getElementById('adminLoginForm');
const chatbotContainer = document.querySelector('.chatbot-container');
const chatbotToggle = document.querySelector('.chatbot-toggle');
const closeChatbot = document.querySelector('.close-chatbot');
const chatbotMessages = document.querySelector('.chatbot-messages');
const chatbotInput = document.querySelector('.chatbot-input input');
const chatbotSendBtn = document.querySelector('.chatbot-input button');

// Display products
function displayProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const ratingStars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
        
        productGrid.innerHTML += `
            <div class="product-card">
                <div class="product-image">
                    ${product.badge ? <span class="product-badge">${product.badge}</span> : ''}
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">R${product.price.toFixed(2)}</div>
                    <div class="rating">${ratingStars} (${product.rating})</div>
                    <button class="btn">Add to Cart</button>
                </div>
            </div>
        `;
    });
}

// Display sellers
function displaySellers() {
    sellerGrid.innerHTML = '';
    sellers.forEach(seller => {
        const ratingStars = '★'.repeat(Math.floor(seller.rating)) + '☆'.repeat(5 - Math.floor(seller.rating));
        
        sellerGrid.innerHTML += `
            <div class="seller-card">
                <div class="seller-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=random" alt="${seller.name}">
                </div>
                <h3>${seller.name}</h3>
                <div class="seller-rating">${ratingStars} (${seller.rating})</div>
                <p>${seller.products} products</p>
                <button class="btn">Visit Store</button>
            </div>
        `;
    });
}

// Admin modal
adminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    adminModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
});

// Admin login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = adminLoginForm[0].value;
    const password = adminLoginForm[1].value;
    
    const user = adminUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        alert(Welcome, ${user.name}! You are logged in as ${user.role}.);
        adminModal.style.display = 'none';
        // Here you would typically redirect to an admin dashboard
    } else {
        alert('Invalid username or password. Please try again.');
    }
});

// Chatbot functionality
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.style.display = 'flex';
    chatbotToggle.style.display = 'none';
});

closeChatbot.addEventListener('click', () => {
    chatbotContainer.style.display = 'none';
    chatbotToggle.style.display = 'flex';
});

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bot-message');
    messageDiv.innerHTML = <p>${message}</p>;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('user-message');
    messageDiv.innerHTML = <p>${message}</p>;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function processUserInput(input) {
    addUserMessage(input);
    chatbotInput.value = '';
    
    // Simple response logic
    const lowerInput = input.toLowerCase();
    let response = chatbotResponses.default;
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = chatbotResponses.hello;
    } else if (lowerInput.includes('product')) {
        response = chatbotResponses.products;
    } else if (lowerInput.includes('price') || lowerInput.includes('cost')) {
        response = chatbotResponses.price;
    } else if (lowerInput.includes('deliver') || lowerInput.includes('ship')) {
        response = chatbotResponses.delivery;
    } else if (lowerInput.includes('return') || lowerInput.includes('exchange')) {
        response = chatbotResponses.return;
    } else if (lowerInput.includes('contact') || lowerInput.includes('email')) {
        response = chatbotResponses.contact;
    }
    
    // Simulate typing delay
    setTimeout(() => {
        addBotMessage(response);
    }, 500);
}

chatbotSendBtn.addEventListener('click', () => {
    if (chatbotInput.value.trim() !== '') {
        processUserInput(chatbotInput.value.trim());
    }
});

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatbotInput.value.trim() !== '') {
        processUserInput(chatbotInput.value.trim());
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    displaySellers();
    addBotMessage(chatbotResponses.hello);
});