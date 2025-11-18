// public/admin.js
async function loadOrders() {
  try {
    const res = await fetch('/orders.json', { cache: 'no-store' });
    if (!res.ok) {
      document.getElementById('orders').innerText = 'No orders found.';
      return;
    }
    const arr = await res.json();
    if (!Array.isArray(arr)) {
      document.getElementById('orders').innerText = 'Orders not available.';
      return;
    }
    renderOrders(arr);
  } catch (e) {
    document.getElementById('orders').innerText = 'Error loading orders: ' + e.message;
  }
}

function renderOrders(list) {
  const container = document.getElementById('orders');
  container.innerHTML = '';
  if (list.length === 0) { container.innerText = 'No orders yet.'; return; }
  list.reverse().forEach(o => {
    const el = document.createElement('div');
    el.className = 'order-card';
    el.innerHTML = `<h3>${o.id} — ${o.status || 'pending'}</h3>
      <div><strong>Customer:</strong> ${o.customer?.name || ''} ${o.customer?.phone ? (' / ' + o.customer.phone) : ''}</div>
      <div><strong>Amount:</strong> R ${o.amount}</div>
      <div><strong>Created:</strong> ${o.created_at}</div>
      <details><summary>Items</summary><pre>${JSON.stringify(o.cart || o.items || [], null, 2)}</pre></details>
    `;
    container.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', loadOrders);
