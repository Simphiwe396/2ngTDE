// REAL PAYMENTS - PAYFAST
let cart = JSON.parse(localStorage.getItem('clinchCart')) || [];

function renderCart() {
    const container = document.getElementById("cart-items");
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
    
    const total = cart.reduce((a, b) => a + Number(b.price * (b.quantity || 1)), 0);
    document.getElementById("total-price").innerText = total.toFixed(2);
}

function removeItem(i) {
    cart.splice(i, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// REAL PAYFAST CHECKOUT - WORKS NOW
function checkout() {
    if (cart.length < 1) return alert("Cart is empty!");
    
    const total = cart.reduce((a, b) => a + Number(b.price * (b.quantity || 1)), 0).toFixed(2);
    
    // LIVE PAYFAST CREDENTIALS
    const merchant_id = "33080383";
    const merchant_key = "9jj65x9fkmy34"
    
    // LIVE PAYFAST URL
    const base = "https://www.payfast.co.za/eng/process";
    
    // Build PayFast parameters
    const params = new URLSearchParams({
        merchant_id: merchant_id,
        merchant_key: merchant_key,
        amount: total,
        item_name: `Clinch Glow Order - ${cart.length} items`,
        return_url: window.location.origin + "/success.html",
        cancel_url: window.location.origin + "/cart.html",
        email_address: "", // Customer will enter on PayFast
        cell_number: "" // Customer will enter on PayFast
    });
    
    // Save order info before redirecting
    localStorage.setItem('lastOrderTotal', total);
    localStorage.removeItem("cart"); // Clear cart
    
    // Redirect to REAL PayFast
    window.location.href = `${base}?${params.toString()}`;
}

renderCart();