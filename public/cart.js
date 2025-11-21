let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
    let container = document.getElementById("cart-items");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("total-price").innerText = "0.00";
        return;
    }

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" style="width:90px;border-radius:10px;">
                <h3>${item.name}</h3>
                <p>R${Number(item.price).toFixed(2)}</p>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    const total = cart.reduce((a, b) => a + Number(b.price), 0);
    document.getElementById("total-price").innerText = total.toFixed(2);
}

function removeItem(i) {
    cart.splice(i, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function checkout() {
    if (cart.length < 1) return alert("Cart is empty!");

    const total = cart.reduce((a, b) => a + Number(b.price), 0).toFixed(2);

    // Clear cart before redirect
    localStorage.removeItem("cart");

    window.location.href =
        "https://sandbox.payfast.co.za/eng/process?" +
        "merchant_id=10043743&merchant_key=7t8eg1prjfj0m" +
        "&amount=" + total +
        "&item_name=ClinchGlow%20Order" +
        "&return_url=" + encodeURIComponent(window.location.origin + "/success.html") +
        "&cancel_url=" + encodeURIComponent(window.location.origin + "/store.html");
}

renderCart();
