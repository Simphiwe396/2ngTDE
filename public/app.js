let products = [];
let filteredProducts = [];

async function loadProducts() {
    try {
        const res = await fetch("/products");  // FIXED
        products = await res.json();
        filteredProducts = products;
        displayProducts(products);
    } catch (err) {
        console.error("Failed to load products", err);
    }
}

function displayProducts(list) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = "<p>No products found.</p>";
        return;
    }

    list.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="price">R ${p.price}.00</p>

                <button onclick="addToCart('${p._id}')">Add to cart</button>
                <button onclick="viewItem('${p._id}')">View</button>
            </div>
        `;
    });
}

function filterProducts(category) {
    if (category === "All") {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === category);
    }

    displayProducts(filteredProducts);
}

function searchProducts() {
    const q = document.getElementById("searchInput").value.toLowerCase();

    const results = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(q)
    );

    displayProducts(results);
}

function viewItem(id) {
    window.location.href = `/product.html?id=${id}`;
}

function addToCart(id) {
    alert("Added to cart: " + id);
}

window.onload = loadProducts;
