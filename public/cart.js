let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
    let container = document.getElementById("cart-items");
    container.innerHTML = "";

    if(cart.length === 0){
        container.innerHTML = "<p style='padding:30px;text-align:center'>Your cart is empty.</p>";
    }

    cart.forEach((item, index) => {
        container.innerHTML += `
        <div class="cart-item">
            <h3>${item.name}</h3>
            <p>R${item.price}</p>
            <button onclick="removeItem(${index})">Remove</button>
        </div>`;
    });

    document.getElementById("total-price").innerText =
        cart.reduce((a, b) => a + Number(b.price), 0).toFixed(2);
}

function removeItem(i) {
    cart.splice(i, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function checkout() {
    if (cart.length < 1) {
        alert("Your cart is empty!");
        return;
    }

    let total = cart.reduce((a, b) => a + Number(b.price), 0).toFixed(2);

    // PayFast Redirect (update merchant_id/merchant_key/return_url/cancel_url for production)
    window.location.href = 
        `https://www.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=${total}&item_name=Clinch%20Glow%20Order&return_url=https://yourwebsite.com/success.html&cancel_url=https://yourwebsite.com/cancel.html`;
}

renderCart();
