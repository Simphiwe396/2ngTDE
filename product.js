// Product detail page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetail();
});

function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = 'collections.html';
        return;
    }
    
    const container = document.getElementById('product-detail-content');
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <div class="product-image-large">
                    <i class="fas fa-wine-bottle"></i>
                </div>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h1>${product.name}</h1>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <p class="product-description">${product.description}</p>
            
            <div class="product-features">
                <h3>Features</h3>
                <div class="features-list">
                    ${product.features.map(feature => `
                        <div class="feature-item">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="product-actions">
                <button class="add-to-cart-large" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart
                </button>
                <button class="wishlist-btn">
                    <i class="far fa-heart"></i>
                    Add to Wishlist
                </button>
            </div>
            
            <div class="product-details">
                <h3>Product Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Category:</strong>
                        <span>${product.category}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Size:</strong>
                        <span>100ml Eau de Parfum</span>
                    </div>
                    <div class="detail-item">
                        <strong>Longevity:</strong>
                        <span>8-12 hours</span>
                    </div>
                    <div class="detail-item">
                        <strong>Season:</strong>
                        <span>All Seasons</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Update page title
    document.title = `${product.name} - CLINCH Luxury Fragrances`;
}