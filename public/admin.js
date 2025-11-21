async function loadProducts() {
    let res = await fetch("products.json");
    let products = await res.json();

    let container = document.getElementById("product-list");
    container.innerHTML = "";

    products.forEach((p, i) => {
        container.innerHTML += `
        <div class="admin-item">
            <h3>${p.name}</h3>
            <p>R${p.price}</p>
            <p>${p.category}</p>
            <button onclick="deleteProduct(${i})">Delete</button>
        </div>`;
    });
}

function addProduct() {
    alert("Because products.json is static in this package, adding products requires a backend. If you want, I can upgrade you to a backend (Node.js + DB) to make this live.");
}

function deleteProduct(id) {
    alert("Deleting requires backend support. I can implement a backend if you want full CRUD.");
}

loadProducts();
