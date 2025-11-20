// public/cart.js
function loadCart() {
    let cart = localStorage.getItem("cart");
    try {
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Cart parse error:", e);
        return [];
    }
}
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}
function renderCart() {
    const cart = loadCart();
    const container = document.getElementById("cartItems");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p>Your cart is empty.</p>`;
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }

    if (checkoutBtn) checkoutBtn.style.display = "inline-block";

    cart.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-thumb" onerror="this.src='/assets/logo.jpg'">
            <div class="cart-info">
                <h3>${item.name}</h3>
                <p>R ${item.price} × ${item.qty}</p>
            </div>
            <button class="remove-btn">Remove</button>
        `;
        el.querySelector('.remove-btn').addEventListener('click', () => {
            removeItem(index);
        });
        container.appendChild(el);
    });
}
function removeItem(i) {
    let cart = loadCart();
    cart.splice(i, 1);
    saveCart(cart);
    renderCart();
}
function goToCheckout() {
    window.location.href = "/checkout.html";
}
document.addEventListener("DOMContentLoaded", renderCart);
