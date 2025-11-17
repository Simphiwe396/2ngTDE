async function getKey(){ const k = prompt('Enter admin key'); if(!k) throw new Error('no key'); return k; }

async function loadProducts(){
  try{
    const key = await getKey();
    const res = await fetch('/api/products', { headers: { 'x-admin-key': key } });
    const list = await res.json();
    const el = document.getElementById('productList');
    el.innerHTML = list.map(p=>`<div style="padding:8px;border-bottom:1px solid #eee"><img src="${p.image}" style="height:48px;width:48px;object-fit:cover;margin-right:8px"/><strong>${p.name}</strong> — R ${p.price}<button style="margin-left:8px" onclick="deleteProduct('${p._id}')">Delete</button></div>`).join('');
  }catch(e){ document.getElementById('productList').innerText = 'Error loading products: ' + e.message; }
}

async function loadOrders(){
  try{
    const key = await getKey();
    const res = await fetch('/api/orders', { headers: { 'x-admin-key': key } });
    const list = await res.json();
    const el = document.getElementById('orderList');
    el.innerHTML = list.map(o=>`<div style="padding:10px;border:1px solid #ddd;margin-bottom:8px"><strong>Order ${o._id}</strong><div>Status: ${o.payment_status}</div><div>Amount: R ${o.amount}</div><div>Phone: ${o.phone||'—'}</div></div>`).join('');
  }catch(e){ document.getElementById('orderList').innerText = 'Error loading orders: ' + e.message; }
}

async function deleteProduct(id){
  try{
    const key = await getKey();
    await fetch('/api/products/' + id, { method: 'DELETE', headers: { 'x-admin-key': key } });
    alert('Deleted'); location.reload();
  }catch(e){ alert('Error'); }
}

window.addEventListener('DOMContentLoaded', ()=>{ loadProducts().catch(()=>{}); loadOrders().catch(()=>{}); });
