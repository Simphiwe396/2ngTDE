function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cartItems");

    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        total += item.price;

        container.innerHTML += `
            <div class="cart-card">
                <img src="${item.image}">
                <div>
                    <h3>${item.name}</h3>
                    <p>R ${item.price}</p>
                    <button onclick="removeItem('${item._id}')">Remove</button>
                </div>
            </div>
        `;
    });

    document.getElementById("cartTotal").innerText = "Total: R " + total;
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(i => i._id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

function checkout() {
    window.location.href = "/checkout.html";
}

loadCart();
