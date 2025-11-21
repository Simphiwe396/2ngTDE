let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart counter
function updateCartCount() {
    const el = document.getElementById("cart-count");
    if(el) el.innerText = cart.length;
}

// Add item to cart
function addToCart(product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(product.name + " has been added to your cart!");
}

// Load products from JSON
async function loadProducts() {
    let res = await fetch("products.json");
    if(!res.ok){
        document.getElementById("product-grid").innerHTML = "<p style='padding:40px'>Failed to load products.json</p>";
        return;
    }
    let products = await res.json();

    let grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    products.forEach(p => {
        grid.innerHTML += `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="category">${p.category}</p>
            <p class="price">R${p.price}</p>

            <button class="order-btn" onclick='addToCart(${JSON.stringify(p)})'>
                Add to Cart
            </button>

            <button class="buy-btn" onclick="buyNow('${p.name}', ${p.price})">
                Buy Now
            </button>
        </div>
        `;
    });
}

// PayFast direct checkout (Buy Now button)
function buyNow(name, price) {
    let amount = Number(price).toFixed(2);

    // Replace these with your real PayFast credentials
    let merchant_id = "10043743";
    let merchant_key = "7t8eg1prjfj0m";

    let transaction_id = "ORDER-" + Date.now();

    let url = "https://www.payfast.co.za/eng/process?" +
        "merchant_id=" + merchant_id +
        "&merchant_key=" + merchant_key +
        "&return_url=" + encodeURIComponent("https://yourwebsite.com/success.html") +
        "&cancel_url=" + encodeURIComponent("https://yourwebsite.com/cancel.html") +
        "&m_payment_id=" + transaction_id +
        "&amount=" + amount +
        "&item_name=" + encodeURIComponent(name);

    window.location.href = url;
}

loadProducts();
updateCartCount();
