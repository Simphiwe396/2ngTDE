function loadProducts() {
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    let list = document.getElementById("admin-product-list");
    list.innerHTML = "";

    products.forEach((p, i) => {
        let images = p.image.split(",").map(url => url.trim());

        list.innerHTML += `
        <div class="admin-product-card">
            <h3>${p.name}</h3>
            <p><strong>R${p.price}</strong></p>

            <div class="product-images">
                ${images.map(img => `<img src="${img}">`).join("")}
            </div>

            <div class="admin-action-btns">
                <button class="edit-btn" onclick="editProduct(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${i})">Delete</button>
            </div>
        </div>`;
    });
}

function saveProduct() {
    let name = document.getElementById("p-name").value;
    let price = document.getElementById("p-price").value;
    let images = document.getElementById("p-image").value;
    let category = document.getElementById("p-category").value;

    let products = JSON.parse(localStorage.getItem("products") || "[]");

    let editId = document.getElementById("edit-id").value;

    if (editId) {
        products[editId] = { name, price, image: images, category };
    } else {
        products.push({ name, price, image: images, category });
    }

    localStorage.setItem("products", JSON.stringify(products));

    document.getElementById("edit-id").value = "";
    document.getElementById("p-name").value = "";
    document.getElementById("p-price").value = "";
    document.getElementById("p-image").value = "";
    document.getElementById("p-category").value = "";

    loadProducts();
}

function editProduct(id) {
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    let p = products[id];

    document.getElementById("edit-id").value = id;
    document.getElementById("p-name").value = p.name;
    document.getElementById("p-price").value = p.price;
    document.getElementById("p-image").value = p.image;
    document.getElementById("p-category").value = p.category;
}

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    products.splice(id, 1);
    localStorage.setItem("products", JSON.stringify(products));
    loadProducts();
}

loadProducts();
