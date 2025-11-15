// Collections page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
    setupFilters();
});

function loadAllProducts() {
    const grid = document.getElementById('all-products-grid');
    
    products.forEach(product => {
        const productCard = `
            <div class="product-card fade-in" data-category="${product.category.toLowerCase()}">
                <div class="product-image">
                    <i class="fas fa-wine-bottle"></i>
                </div>
                <div class="product-card-content">
                    <div class="product-category">${product.category}</div>
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-features">
                        ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
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

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProducts(filter);
        });
    });
}

function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}