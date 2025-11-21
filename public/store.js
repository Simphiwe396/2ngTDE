// store.js — improved fixed version
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.length;
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(product.name + " has been added to your cart!");
}

// SAFE product cloning for cart
function safeProduct(p) {
  return {
    name: p.name,
    price: Number(p.price),
    image: p.image,
    category: p.category
  };
}

async function fetchProductsSource() {
  try {
    const apiRes = await fetch('/api/products');
    if (apiRes.ok) return await apiRes.json();
  } catch (e) {}

  const res = await fetch("products.json");
  return await res.json();
}

async function loadProducts(filterCategory = "All") {
  let products = await fetchProductsSource();

  products = products.map(p => ({
    ...p,
    price: Number(p.price)
  }));

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const grid = document.getElementById("product-grid");
  grid.innerHTML = `
    <div class="filter-bar">
      ${categories.map(c => `<button class="filter-btn" onclick="filterCategory('${c}')">${c}</button>`).join('')}
    </div>
    <div id="product-list" class="product-grid-inner"></div>
  `;

  renderProductList(products, filterCategory);
}

function renderProductList(products, filterCategory) {
  const list = document.getElementById("product-list");

  let filtered = products;
  if (filterCategory !== "All") {
    filtered = products.filter(p => p.category === filterCategory);
  }

  list.innerHTML = "";

  filtered.forEach(p => {
    const safeP = safeProduct(p);

    list.innerHTML += `
      <div class="product-card">
        <img src="${safeP.image}" alt="${safeP.name}" onerror="this.src='img/placeholder.jpg'">
        <h3>${safeP.name}</h3>
        <p class="category">${safeP.category}</p>
        <p class="price">R${safeP.price.toFixed(2)}</p>

        <button class="order-btn" onclick='addToCart(${JSON.stringify(safeP)})'>
          Add to Cart
        </button>

        <button class="buy-btn" onclick="buyNow('${encodeURIComponent(safeP.name)}', ${safeP.price})">
          Buy Now
        </button>
      </div>
    `;
  });
}

function filterCategory(cat) {
  loadProducts(cat);
}

function buyNow(nameEncoded, price) {
  const amount = Number(price).toFixed(2);

  const merchant_id = "10043743";
  const merchant_key = "7t8eg1prjfj0m";

  const transaction_id = "ORDER-" + Date.now();

  const url =
    "https://sandbox.payfast.co.za/eng/process?" +
    "merchant_id=" + merchant_id +
    "&merchant_key=" + merchant_key +
    "&return_url=" + encodeURIComponent(window.location.origin + "/success.html") +
    "&cancel_url=" + encodeURIComponent(window.location.origin + "/store.html") +
    "&m_payment_id=" + transaction_id +
    "&amount=" + amount +
    "&item_name=" + nameEncoded;

  window.location.href = url;
}

loadProducts();
updateCartCount();
