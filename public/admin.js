// admin.js — Full CRUD for Clinch Glow

async function loadProducts() {
    const res = await fetch("/api/products");
    const products = await res.json();

    const list = document.getElementById("admin-product-list");
    list.innerHTML = "";

    products.forEach(p => {
        list.innerHTML += `
            <div class="admin-item" style="padding:14px;border-bottom:1px solid #ddd;margin-bottom:12px;">
                <b>${p.name}</b> — R${Number(p.price).toFixed(2)}
                <br>
                <img src="${p.image}" style="width:70px;border-radius:8px;margin:6px 0;">
                <br>
                <i>${p.category || "No Category"}</i>
                <br><br>
                <button onclick="startEdit(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image.replace(/'/g, "\\'")}', '${(p.category || "").replace(/'/g, "\\'")}')" class="admin-btn-edit">Edit</button>
                <button onclick="deleteProduct(${p.id})" class="admin-btn-del">Delete</button>
            </div>
        `;
    });
}

function startEdit(id, name, price, image, category) {
    document.getElementById("edit-id").value = id;
    document.getElementById("p-name").value = name;
    document.getElementById("p-price").value = price;
    document.getElementById("p-image").value = image;
    document.getElementById("p-category").value = category;

    alert("Editing " + name);
}

async function saveProduct() {
    const id = document.getElementById("edit-id").value;
    const name = document.getElementById("p-name").value;
    const price = document.getElementById("p-price").value;
    const image = document.getElementById("p-image").value;
    const category = document.getElementById("p-category").value;

    if (!name || !price) {
        alert("Name and price are required.");
        return;
    }

    const body = { name, price, image, category };

    let res;

    if (id) {
        // Update existing product
        res = await fetch("/api/products/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert("Product updated!");
        } else {
            alert("Failed to update.");
        }
    } else {
        // Add new product
        res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert("Product added!");
        } else {
            alert("Failed to add.");
        }
    }

    // Clear form
    document.getElementById("edit-id").value = "";
    document.getElementById("p-name").value = "";
    document.getElementById("p-price").value = "";
    document.getElementById("p-image").value = "";
    document.getElementById("p-category").value = "";

    loadProducts();
}

async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch("/api/products/" + id, { method: "DELETE" });

    if (res.ok) {
        alert("Deleted!");
        loadProducts();
    } else {
        alert("Error deleting.");
    }
}

loadProducts();
