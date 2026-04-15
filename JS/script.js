/* ============================================================
   PharmaPlus — Complete Application Logic
   Modules: Auth, Data, POS, Cart, Orders, Tracking,
            Inventory, Reports, Mobile, Notifications, Dark Mode
============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   1. SEED DATA — Default medications & users
────────────────────────────────────────────── */

const DEFAULT_MEDICATIONS = [
  { id: 1, name: 'Panadol Extra', category: 'Pain Relief', price: 25, stock: 150, minStock: 20, img: 'imgs/med01.png', description: 'Fast-acting paracetamol + caffeine for headaches & fever.', barcode: 'MED001' },
  { id: 2, name: 'Brufen 400mg', category: 'Anti-inflammatory', price: 35, stock: 80, minStock: 15, img: 'imgs/med02.png', description: 'Ibuprofen tablets for pain, inflammation, and fever.', barcode: 'MED002' },
  { id: 3, name: 'Augmentin 625mg', category: 'Antibiotics', price: 120, stock: 45, minStock: 10, img: 'imgs/med03.png', description: 'Broad-spectrum antibiotic (amoxicillin/clavulanate).', barcode: 'MED003' },
  { id: 4, name: 'Glucophage 500mg', category: 'Diabetes', price: 28, stock: 200, minStock: 30, img: 'imgs/med08.png', description: 'Metformin for type-2 diabetes blood sugar control.', barcode: 'MED004' },
  { id: 5, name: 'Lipitor 20mg', category: 'Cardiovascular', price: 95, stock: 60, minStock: 12, img: 'imgs/med14.png', description: 'Atorvastatin for lowering bad cholesterol.', barcode: 'MED005' },
  { id: 6, name: 'Ventolin Inhaler', category: 'Respiratory', price: 85, stock: 30, minStock: 8, img: 'imgs/med09.png', description: 'Salbutamol bronchodilator for asthma & COPD relief.', barcode: 'MED006' },
  { id: 7, name: 'Nexium 40mg', category: 'Gastro', price: 75, stock: 90, minStock: 15, img: 'imgs/med12.png', description: 'Esomeprazole for acid reflux and stomach ulcers.', barcode: 'MED007' },
  { id: 8, name: 'Allegra 180mg', category: 'Allergy', price: 55, stock: 110, minStock: 20, img: 'imgs/med13.png', description: 'Fexofenadine non-drowsy antihistamine.', barcode: 'MED008' },
  { id: 9, name: 'Cataflam 50mg', category: 'Pain Relief', price: 30, stock: 8, minStock: 15, img: 'imgs/med06.png', description: 'Diclofenac for acute pain and inflammation.', barcode: 'MED009' },
  { id: 10, name: 'Vitamin C 1000mg', category: 'Vitamins', price: 40, stock: 250, minStock: 30, img: 'imgs/med05.png', description: 'Immune-boosting ascorbic acid effervescent tablets.', barcode: 'MED010' },
  { id: 11, name: 'Omega-3 Fish Oil', category: 'Vitamins', price: 65, stock: 4, minStock: 10, img: 'imgs/med15.png', description: 'High-potency omega-3 for heart and brain health.', barcode: 'MED011' },
  { id: 12, name: 'Zyrtec 10mg', category: 'Allergy', price: 48, stock: 75, minStock: 15, img: 'imgs/med11.png', description: 'Cetirizine for allergic rhinitis and urticaria.', barcode: 'MED012' },
  { id: 13, name: 'Amoxil 500mg', category: 'Antibiotics', price: 45, stock: 0, minStock: 10, img: 'imgs/med17.png', description: 'Amoxicillin for bacterial infections.', barcode: 'MED013' },
  { id: 14, name: 'Concor 5mg', category: 'Cardiovascular', price: 55, stock: 55, minStock: 10, img: 'imgs/med14.png', description: 'Bisoprolol for hypertension and heart failure.', barcode: 'MED014' },
  { id: 15, name: 'Flagyl 500mg', category: 'Antibiotics', price: 22, stock: 120, minStock: 20, img: 'imgs/med03.png', description: 'Metronidazole antibiotic for bacterial & parasitic infections.', barcode: 'MED015' },
  { id: 16, name: 'Zantac 150mg', category: 'Gastro', price: 35, stock: 65, minStock: 10, img: 'imgs/med10.png', description: 'Ranitidine for heartburn and acid indigestion.', barcode: 'MED016' },
];
const DEFAULT_USERS = [
  { id: 'u1', username: 'admin',    password: 'admin123', role: 'staff',    name: 'Dr. Ahmed Hassan' },
  { id: 'u2', username: 'staff1',   password: 'staff123', role: 'staff',    name: 'Sara Mohamed' },
  { id: 'u3', username: 'user',     password: 'user123',  role: 'customer', name: 'Khaled Ibrahim' },
  { id: 'u4', username: 'customer1',password: 'pass123',  role: 'customer', name: 'Nour Ali' },
];

/* ──────────────────────────────────────────────
   2. APPLICATION STATE
────────────────────────────────────────────── */
const state = {
  currentUser:        null,
  currentRole:        'staff',      // 'staff' | 'customer'
  loginTab:           'staff',
  darkMode:           false,
  cart:               [],           // Desktop POS cart
  mobileCart:         [],           // Mobile customer cart
  selectedCategory:   'All',
  mobileCategory:     'All',
  inventoryEditId:    null,
  trackingFilter:     'all',
  notifications:      [],
  currentDetailId:    null,         // product detail on mobile
  currentOrderId:     null,         // order detail on mobile
  prevMobilePage:     'home',
  detailQty:          1,
  trackingTimers:     {},           // timerId per orderId
};

/* ──────────────────────────────────────────────
   3. STORAGE HELPERS
────────────────────────────────────────────── */
const Store = {
  get:    (key, fallback = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set:    (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.warn('Storage error', e); } },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },

  getMedications: () => Store.get('pharma_medications', DEFAULT_MEDICATIONS),
  setMedications: (v) => Store.set('pharma_medications', v),

  getOrders:    () => Store.get('pharma_orders', []),
  setOrders:    (v) => Store.set('pharma_orders', v),

  getUsers:     () => Store.get('pharma_users', DEFAULT_USERS),

  getCurrentUser: () => Store.get('pharma_current_user', null),
  setCurrentUser: (v) => Store.set('pharma_current_user', v),
};

/* ──────────────────────────────────────────────
   4. UTILITIES
────────────────────────────────────────────── */
const fmt   = (n) => `EGP ${parseFloat(n).toFixed(2)}`;
const genId = () => 'ORD-' + Date.now().toString(36).toUpperCase();
const today = () => new Date().toLocaleDateString('en-EG', { year:'numeric', month:'short', day:'numeric' });
const timeStr = () => new Date().toLocaleTimeString('en-EG', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

function getStatusLabel(s) {
  const map = { ordered:'Ordered', preparing:'Preparing', out_for_delivery:'Out for Delivery', delivered:'Delivered', pending:'Pending', cancelled:'Cancelled' };
  return map[s] || s;
}

/* ──────────────────────────────────────────────
   5. TOAST NOTIFICATION SYSTEM
────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  const imgs = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${imgs[type] || imgs.info}"></i><span>${message}</span><i class="fa-solid fa-xmark toast-close" onclick="this.parentElement.remove()"></i>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, duration);
}

/* Push to notification panel */
function pushNotification(message, img = 'fa-bell') {
  state.notifications.unshift({ message, img, time: timeStr() });
  const count = state.notifications.length;
  const el = document.getElementById('notif-count');
  if (el) { el.textContent = count; el.style.display = count > 0 ? '' : 'none'; }
  renderNotificationList();
}

function renderNotificationList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (state.notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">No notifications</div>';
    return;
  }
  list.innerHTML = state.notifications.slice(0, 20).map(n => `
    <div class="notif-item">
      <i class="fa-solid ${n.img}"></i>
      <div><div>${n.message}</div><div style="font-size:.72rem;color:var(--text-muted);margin-top:.15rem">${n.time}</div></div>
    </div>`).join('');
}

function toggleNotifications() {
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('hidden');
}

function clearNotifications() {
  state.notifications = [];
  document.getElementById('notif-count').textContent = '0';
  renderNotificationList();
}

/* Close notif panel when clicking outside */
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  const bell  = document.querySelector('.notification-bell');
  if (panel && !panel.classList.contains('hidden') && !panel.contains(e.target) && bell && !bell.contains(e.target)) {
    panel.classList.add('hidden');
  }
});


/* ──────────────────────────────────────────────
   6. DARK MODE
────────────────────────────────────────────── */
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  Store.set('pharma_dark_mode', state.darkMode);
  document.querySelectorAll('#dark-icon, #mobile-dark-icon').forEach(el => {
    el.className = state.darkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
}

function loadDarkMode() {
  state.darkMode = Store.get('pharma_dark_mode', false);
  if (state.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelectorAll('#dark-icon, #mobile-dark-icon').forEach(el => el.className = 'fa-solid fa-sun');
  }
}


/* ──────────────────────────────────────────────
   7. AUTH
────────────────────────────────────────────── */
function switchLoginTab(tab) {
  state.loginTab = tab;
  document.querySelectorAll('.login-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.role === tab));
  const hint = document.getElementById('login-hint');
  hint.textContent = tab === 'staff'
    ? 'Staff: admin / admin123 | staff1 / staff123'
    : 'Customer: user / user123 | customer1 / pass123';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const users    = Store.getUsers();
  const user     = users.find(u => u.username === username && u.password === password && u.role === state.loginTab);

  if (!user) {
    showToast('Invalid credentials. Please try again.', 'error');
    return;
  }
  state.currentUser = user;
  Store.setCurrentUser(user);

  document.getElementById('login-screen').classList.add('hidden');

  if (user.role === 'staff') {
    launchDesktopApp(user);
  } else {
    launchMobileApp(user);
  }
}

function logout() {
  Store.remove('pharma_current_user');
  state.currentUser = null;
  /* Stop all tracking timers */
  Object.values(state.trackingTimers).forEach(clearInterval);
  state.trackingTimers = {};
  /* Reset UI */
  document.getElementById('desktop-app').classList.add('hidden');
  document.getElementById('mobile-app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}


/* ──────────────────────────────────────────────
   8. DESKTOP APP BOOTSTRAP
────────────────────────────────────────────── */
function launchDesktopApp(user) {
  document.getElementById('desktop-app').classList.remove('hidden');
  document.getElementById('desktop-username').textContent = user.name.split(' ')[0];

  startClock();
  renderPOSProducts();
  renderOrders();
  renderTracking();
  renderInventory();
  renderReports();
  updateLowStockBadge();
  updateOrdersBadge();
  showSection('pos', document.querySelector('[data-section="pos"]'));
}

/* Live clock */
function startClock() {
  const el = document.getElementById('header-time');
  if (!el) return;
  const tick = () => el.textContent = timeStr();
  tick();
  setInterval(tick, 1000);
}

/* Sidebar toggle */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

/* Section navigation */
function showSection(name, linkEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = { pos:'Point of Sale', orders:'Orders Management', tracking:'Delivery Tracking', inventory:'Inventory', reports:'Reports & Analytics' };
  const titleEl = document.getElementById('section-title');
  if (titleEl) titleEl.textContent = titles[name] || '';

  /* Refresh data when switching sections */
  if (name === 'orders')    renderOrders();
  if (name === 'tracking')  renderTracking();
  if (name === 'inventory') renderInventory();
  if (name === 'reports')   renderReports();
}


/* ──────────────────────────────────────────────
   9. POS — Product Display & Cart
────────────────────────────────────────────── */

/* Build category filter buttons */
function buildCategoryFilters() {
  const meds = Store.getMedications();
  const cats = ['All', ...new Set(meds.map(m => m.category))];
  const container = document.getElementById('pos-category-filters');
  if (!container) return;
  container.innerHTML = cats.map(c => `
    <button class="cat-btn ${c === state.selectedCategory ? 'active' : ''}"
            onclick="setCategory('${c}')">${c}</button>`).join('');
}

function setCategory(cat) {
  state.selectedCategory = cat;
  buildCategoryFilters();
  renderPOSProducts();
}

function renderPOSProducts() {
  buildCategoryFilters();
  const meds    = Store.getMedications();
  const query   = (document.getElementById('pos-search')?.value || '').toLowerCase();
  const grid    = document.getElementById('pos-products-grid');
  if (!grid) return;

  const filtered = meds.filter(m => {
    const matchCat   = state.selectedCategory === 'All' || m.category === state.selectedCategory;
    const matchQuery = !query || m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)"><i class="fa-solid fa-box-open" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.5rem"></i>No medications found</div>';
    return;
  }

  grid.innerHTML = filtered.map(m => {
    const stockCls = m.stock === 0 ? 'out-of-stock' : '';
    const stockTxt = m.stock === 0 ? '<span class="stock-out">Out of stock</span>' :
                     m.stock <= m.minStock ? `<span class="stock-low">Low: ${m.stock}</span>` :
                     `<span>Stock: ${m.stock}</span>`;
    return `
    <div class="product-card ${stockCls}" onclick="addToCart(${m.id})">
    <div class="product-icon">
    <img src="${m.img}"  />
  </div>
      <div class="product-name">${m.name}</div>
      <div class="product-category">${m.category}</div>
      <div class="product-price">${fmt(m.price)}</div>
      <div class="product-stock text-muted" style="font-size:.72rem">${stockTxt}</div>
      <button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart(${m.id})" ${m.stock===0?'disabled':''}>
        <i class="fa-solid fa-plus"></i> Add to Cart
      </button>
    </div>`;

  }


  ).join('');
}


function filterPOSProducts() { renderPOSProducts(); }

/* ── Cart ── */
function addToCart(medId) {
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === medId);
  if (!med || med.stock === 0) { showToast('Item out of stock', 'warning'); return; }

  const existing = state.cart.find(i => i.id === medId);
  if (existing) {
    if (existing.qty >= med.stock) { showToast(`Only ${med.stock} in stock`, 'warning'); return; }
    existing.qty++;
  } else {
    state.cart.push({ id: medId, name: med.name, price: med.price, qty: 1, img: med.img });
  }
  renderCart();
  showToast(`${med.name} added to cart`, 'success', 1500);
}

function removeFromCart(medId) {
  state.cart = state.cart.filter(i => i.id !== medId);
  renderCart();
}

function changeQty(medId, delta) {
  const item = state.cart.find(i => i.id === medId);
  if (!item) return;
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === medId);
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(medId); return; }
  if (med && item.qty > med.stock) { item.qty = med.stock; showToast(`Max stock: ${med.stock}`, 'warning'); }
  renderCart();
}

function renderCart() {
  const cartEl     = document.getElementById('cart-items');
  const emptyEl    = document.getElementById('cart-empty');
  const checkBtn   = document.getElementById('checkout-btn');

  if (!cartEl) return;

  if (state.cart.length === 0) {
    emptyEl.style.display = 'flex';
    cartEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    updateCartTotals(0);
    if (checkBtn) checkBtn.disabled = true;
    return;
  }
  emptyEl.style.display = 'none';
  if (checkBtn) checkBtn.disabled = false;

  /* Rebuild cart items */
  const existing = cartEl.querySelectorAll('.cart-item');
  existing.forEach(el => el.remove());

  let subtotal = 0;
  state.cart.forEach(item => {
    subtotal += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
    <img src="${item.img}" style="width:40px;height:40px;object-fit:contain;flex-shrink:0" />
    <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} × ${item.qty} = ${fmt(item.price * item.qty)}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>`;
    cartEl.appendChild(div);
  });

  updateCartTotals(subtotal);
}

function updateCartTotals(subtotal) {
  const tax   = subtotal * 0.14;
  const total = subtotal + tax;
  const set   = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fmt(v); };
  set('cart-subtotal', subtotal);
  set('cart-tax', tax);
  set('cart-total', total);
}

function clearCart() {
  if (state.cart.length === 0) return;
  state.cart = [];
  renderCart();
  showToast('Cart cleared', 'info', 1500);
}

/* ── Checkout ── */
function checkout() {
  if (state.cart.length === 0) return;
  const meds    = Store.getMedications();
  const orders  = Store.getOrders();
  const payment = document.getElementById('payment-method')?.value || 'cash';

  /* Deduct stock */
  let stockOk = true;
  state.cart.forEach(item => {
    const med = meds.find(m => m.id === item.id);
    if (!med || med.stock < item.qty) { showToast(`Insufficient stock for ${item.name}`, 'error'); stockOk = false; }
  });
  if (!stockOk) return;

  state.cart.forEach(item => {
    const med = meds.find(m => m.id === item.id);
    if (med) med.stock -= item.qty;
  });
  Store.setMedications(meds);

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.14;
  const total    = subtotal + tax;

  const order = {
    id:          genId(),
    customer:    state.currentUser?.name || 'Walk-in Customer',
    customerId:  state.currentUser?.id || 'walk-in',
    items:       [...state.cart],
    subtotal,
    tax,
    total,
    payment,
    status:      'ordered',
    trackStatus: 'pending',
    address:     'In-Store',
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    notes:       '',
  };

  orders.push(order);
  Store.setOrders(orders);
  state.cart = [];
  renderCart();
  renderOrders();
  renderTracking();
  updateOrdersBadge();
  updateLowStockBadge();
  renderPOSProducts();

  showToast(`Order ${order.id} placed! Total: ${fmt(total)}`, 'success', 4000);
  pushNotification(`New order: ${order.id} — ${fmt(total)}`, 'fa-receipt');

  /* Start auto-tracking simulation for this order */
  startTrackingTimer(order.id);
}


/* ──────────────────────────────────────────────
   10. ORDERS MANAGEMENT (Kanban Board)
────────────────────────────────────────────── */
function renderOrders() {
  const orders = Store.getOrders();
  const cols   = { ordered: [], preparing: [], delivered: [] };

  orders.forEach(o => {
    if (o.status === 'ordered')   cols.ordered.push(o);
    else if (o.status === 'preparing' || o.status === 'out_for_delivery') cols.preparing.push(o);
    else if (o.status === 'delivered') cols.delivered.push(o);
  });

  const renderCol = (colId, items) => {
    const el = document.getElementById(`kanban-${colId}`);
    if (!el) return;
    el.innerHTML = items.length === 0
      ? '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:.82rem">No orders</div>'
      : items.map(o => `
        <div class="kanban-card" draggable="true" id="kcard-${o.id}"
             ondragstart="dragOrder(event,'${o.id}')" onclick="openOrderDetail('${o.id}')">
          <div class="kanban-card-id">${o.id}</div>
          <div class="kanban-card-customer">${o.customer}</div>
          <div class="kanban-card-items">${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</div>
          <div class="kanban-card-meta">
            <span class="kanban-card-price">${fmt(o.total)}</span>
            <span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span>
          </div>
          <div class="kanban-card-actions">
            ${colId === 'ordered'   ? `<button class="kanban-action-btn" onclick="event.stopPropagation();advanceOrder('${o.id}','preparing')"><i class="fa-solid fa-flask"></i> Prepare</button>` : ''}
            ${colId === 'preparing' ? `<button class="kanban-action-btn" onclick="event.stopPropagation();advanceOrder('${o.id}','delivered')"><i class="fa-solid fa-truck-fast"></i> Dispatch</button>` : ''}
          </div>
        </div>`).join('');
    const countEl = document.getElementById(`col-count-${colId}`);
    if (countEl) countEl.textContent = items.length;
  };

  renderCol('ordered',   cols.ordered);
  renderCol('preparing', [...cols.preparing]);
  renderCol('delivered', cols.delivered);

  renderOrdersStats(orders);
  updateOrdersBadge();
}

function renderOrdersStats(orders) {
  const bar = document.getElementById('orders-stats-bar');
  if (!bar) return;
  const total    = orders.length;
  const active   = orders.filter(o => o.status !== 'delivered').length;
  const revenue  = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);
  bar.innerHTML = `
    <div class="stat-chip"><i class="fa-solid fa-clipboard-list"></i> Total Orders <span class="chip-val">${total}</span></div>
    <div class="stat-chip"><i class="fa-solid fa-spinner"></i> Active <span class="chip-val">${active}</span></div>
    <div class="stat-chip"><i class="fa-solid fa-circle-check"></i> Delivered <span class="chip-val">${total - active}</span></div>
    <div class="stat-chip"><i class="fa-solid fa-coins"></i> Delivered Revenue <span class="chip-val" style="font-size:.9rem">${fmt(revenue)}</span></div>`;
}

function advanceOrder(orderId, newStatus) {
  const orders = Store.getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status    = newStatus;
  order.updatedAt = new Date().toISOString();
  if (newStatus === 'delivered') { order.trackStatus = 'delivered'; }
  else if (newStatus === 'preparing') { order.trackStatus = 'out_for_delivery'; }
  Store.setOrders(orders);
  renderOrders();
  renderTracking();
  showToast(`Order ${orderId} moved to ${getStatusLabel(newStatus)}`, 'success', 2000);
  pushNotification(`Order ${orderId} → ${getStatusLabel(newStatus)}`, 'fa-truck-fast');
}

function updateOrdersBadge() {
  const orders = Store.getOrders();
  const active = orders.filter(o => o.status !== 'delivered').length;
  const el = document.getElementById('orders-badge');
  if (el) { el.textContent = active; el.style.display = active > 0 ? '' : 'none'; }
}

/* Drag-and-Drop */
let draggedOrderId = null;
function dragOrder(event, orderId) { draggedOrderId = orderId; }
function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}
function dropOrder(event, targetStatus) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  if (draggedOrderId) {
    advanceOrder(draggedOrderId, targetStatus);
    draggedOrderId = null;
  }
}

/* Order Detail Modal */
function openOrderDetail(orderId) {
  const orders = Store.getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;
  const content = document.getElementById('order-detail-content');
  content.innerHTML = `
    <div class="od-row"><span class="od-label">Order ID</span><span class="od-val">${order.id}</span></div>
    <div class="od-row"><span class="od-label">Customer</span><span class="od-val">${order.customer}</span></div>
    <div class="od-row"><span class="od-label">Status</span><span class="od-val"><span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span></span></div>
    <div class="od-row"><span class="od-label">Payment</span><span class="od-val">${order.payment}</span></div>
    <div class="od-row"><span class="od-label">Date</span><span class="od-val">${new Date(order.createdAt).toLocaleString()}</span></div>
    <div class="od-items">
      <div style="font-weight:700;font-size:.82rem;color:var(--text-muted);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.5px">Items</div>
      ${order.items.map(i=>`<div class="od-item"><span>${i.img} ${i.name} ×${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
      <div class="od-item" style="font-weight:700;border-top:1.5px solid var(--border);margin-top:.3rem;padding-top:.4rem"><span>Total (incl. 14% tax)</span><span>${fmt(order.total)}</span></div>
    </div>`;
  openModal('order-detail-modal');
}


/* ──────────────────────────────────────────────
   11. DELIVERY TRACKING
────────────────────────────────────────────── */
const TRACK_STEPS = [
  { key: 'pending',           label: 'Order Placed',       img: 'fa-receipt' },
  { key: 'out_for_delivery',  label: 'Out for Delivery',   img: 'fa-truck' },
  { key: 'delivered',         label: 'Delivered',          img: 'fa-circle-check' },
];
const TRACK_IDX = { pending: 0, out_for_delivery: 1, delivered: 2 };

function renderTracking() {
  const orders = Store.getOrders();
  const grid   = document.getElementById('tracking-grid');
  if (!grid) return;

  const filtered = state.trackingFilter === 'all'
    ? orders
    : orders.filter(o => o.trackStatus === state.trackingFilter || o.status === state.trackingFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)"><i class="fa-solid fa-truck" style="font-size:2.5rem;opacity:.2;display:block;margin-bottom:.7rem"></i>No orders to track</div>';
    return;
  }

  grid.innerHTML = filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => {
    const idx  = TRACK_IDX[o.trackStatus] ?? 0;
    const pct  = idx === 0 ? 0 : idx === 1 ? 50 : 100;
    const eta  = o.trackStatus === 'delivered' ? 'Delivered' : o.trackStatus === 'out_for_delivery' ? 'ETA: ~15 min' : 'Awaiting dispatch';
    return `
    <div class="tracking-card" id="tcard-${o.id}">
      <div class="tracking-card-header">
        <div>
          <div class="tracking-order-id">${o.id}</div>
          <div class="tracking-customer">${o.customer}</div>
          <div class="tracking-address"><i class="fa-solid fa-location-dot" style="color:var(--primary)"></i> ${o.address}</div>
        </div>
        <span class="status-badge ${o.trackStatus}">${getStatusLabel(o.trackStatus)}</span>
      </div>
      <div class="tracking-progress">
        <div class="progress-steps">
          ${TRACK_STEPS.map((step, i) => `
            <div class="progress-step">
              <div class="step-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}">
                <i class="fa-solid ${i <= idx ? 'fa-check' : 'fa-circle'}" style="font-size:.6rem"></i>
              </div>
              <div class="step-label ${i === idx ? 'active' : ''}">${step.label}</div>
            </div>`).join('')}
          <div class="progress-line" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="tracking-eta"><i class="fa-regular fa-clock"></i> ${eta}</div>
      <div style="display:flex;gap:.5rem;margin-top:.7rem;flex-wrap:wrap">
        ${o.trackStatus !== 'delivered' ? `<button class="kanban-action-btn" onclick="advanceTracking('${o.id}')"><i class="fa-solid fa-forward"></i> Advance Status</button>` : ''}
        <button class="kanban-action-btn" onclick="openOrderDetail('${o.id}')"><i class="fa-solid fa-eye"></i> Details</button>
      </div>
    </div>`;
  }).join('');
}

function advanceTracking(orderId) {
  const orders = Store.getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order || order.trackStatus === 'delivered') return;

  const nextMap = { pending: 'out_for_delivery', out_for_delivery: 'delivered' };
  const statusMap = { pending: 'ordered', out_for_delivery: 'preparing', delivered: 'delivered' };
  order.trackStatus = nextMap[order.trackStatus];
  order.status      = order.trackStatus === 'delivered' ? 'delivered' : statusMap[order.trackStatus] || order.status;
  order.updatedAt   = new Date().toISOString();
  Store.setOrders(orders);
  renderTracking();
  renderOrders();
  showToast(`Order ${orderId} → ${getStatusLabel(order.trackStatus)}`, 'success', 2500);
  pushNotification(`Order ${orderId} is now: ${getStatusLabel(order.trackStatus)}`, 'fa-truck-fast');
}

function filterTracking(filter, btn) {
  state.trackingFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTracking();
}

/* Auto-tracking simulation timer (advances status every ~30s for demo) */
function startTrackingTimer(orderId) {
  if (state.trackingTimers[orderId]) return;

  let step = 0;
  const steps = ['pending', 'out_for_delivery', 'delivered'];

  state.trackingTimers[orderId] = setInterval(() => {
    step++;
    if (step >= steps.length) {
      clearInterval(state.trackingTimers[orderId]);
      delete state.trackingTimers[orderId];
      return;
    }
    const orders = Store.getOrders();
    const order  = orders.find(o => o.id === orderId);
    if (!order) { clearInterval(state.trackingTimers[orderId]); return; }
    order.trackStatus = steps[step];
    order.status      = steps[step] === 'delivered' ? 'delivered' : steps[step] === 'out_for_delivery' ? 'preparing' : order.status;
    order.updatedAt   = new Date().toISOString();
    Store.setOrders(orders);
    renderTracking();
    renderOrders();
    pushNotification(`Order ${orderId} is now: ${getStatusLabel(steps[step])}`, 'fa-truck-fast');
    showToast(`📦 Order ${orderId}: ${getStatusLabel(steps[step])}`, 'info', 3000);
    /* Also update mobile UI */
    if (document.getElementById('mobile-app') && !document.getElementById('mobile-app').classList.contains('hidden')) {
      renderMobileOrders();
    }
  }, 30000); /* 30 seconds between steps for realism */
}


/* ──────────────────────────────────────────────
   12. INVENTORY MANAGEMENT
────────────────────────────────────────────── */
function renderInventory() {
  const meds  = Store.getMedications();
  const query = (document.getElementById('inv-search')?.value || '').toLowerCase();
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  const filtered = meds.filter(m => !query || m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query));

  tbody.innerHTML = filtered.map(m => {
    const stockStatus = m.stock === 0 ? 'out' : m.stock <= m.minStock ? 'low' : 'ok';
    const stockLabel  = m.stock === 0 ? 'Out of Stock' : m.stock <= m.minStock ? 'Low Stock' : 'In Stock';
    return `
    <tr>
      <td><img src="${m.img}" 
      style="width:35px;height:35px;object-fit:contain;border-radius:6px;" /> <strong>${m.name}</strong><div style="font-size:.72rem;color:var(--text-muted)">${m.barcode || ''}</div></td>
      <td>${m.category}</td>
      <td><strong>${fmt(m.price)}</strong></td>
      <td><strong>${m.stock}</strong> <span style="font-size:.72rem;color:var(--text-muted)">/ min ${m.minStock}</span></td>
      <td><span class="stock-indicator"><span class="stock-dot ${stockStatus}"></span>${stockLabel}</span></td>
      <td class="table-actions">
        <button class="btn-edit" onclick="openInventoryModal(${m.id})"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn-delete" onclick="deleteMedication(${m.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No medications found</td></tr>';

  renderInventoryStats(meds);
  updateLowStockBadge();
}

function renderInventoryStats(meds) {
  const el    = document.getElementById('inventory-stats');
  if (!el) return;
  const total = meds.length;
  const low   = meds.filter(m => m.stock > 0 && m.stock <= m.minStock).length;
  const out   = meds.filter(m => m.stock === 0).length;
  const val   = meds.reduce((s, m) => s + m.price * m.stock, 0);
  el.innerHTML = `
    <div class="stat-chip"><i class="fa-solid fa-boxes-stacked"></i> Total SKUs <span class="chip-val">${total}</span></div>
    <div class="stat-chip" style="border-color:var(--warning)"><i class="fa-solid fa-triangle-exclamation" style="color:var(--warning)"></i> Low Stock <span class="chip-val" style="color:var(--warning)">${low}</span></div>
    <div class="stat-chip" style="border-color:var(--danger)"><i class="fa-solid fa-xmark" style="color:var(--danger)"></i> Out of Stock <span class="chip-val" style="color:var(--danger)">${out}</span></div>
    <div class="stat-chip"><i class="fa-solid fa-coins"></i> Stock Value <span class="chip-val" style="font-size:.85rem">${fmt(val)}</span></div>`;
}

function updateLowStockBadge() {
  const meds = Store.getMedications();
  const low  = meds.filter(m => m.stock <= m.minStock).length;
  const el   = document.getElementById('low-stock-badge');
  if (el) { el.textContent = low; el.style.display = low > 0 ? '' : 'none'; }
}

function filterInventory() { renderInventory(); }

/* Open modal for add or edit */
function openInventoryModal(medId = null) {
  state.inventoryEditId = medId;
  const meds = Store.getMedications();

  /* Populate category datalist */
  const cats = [...new Set(meds.map(m => m.category))];
  const dl = document.getElementById('categories-list');
  if (dl) dl.innerHTML = cats.map(c => `<option value="${c}">`).join('');

  if (medId) {
    const med = meds.find(m => m.id === medId);
    if (!med) return;
    document.getElementById('modal-title').textContent = 'Edit Medication';
    document.getElementById('med-id').value        = med.id;
    document.getElementById('med-name').value      = med.name;
    document.getElementById('med-category').value  = med.category;
    document.getElementById('med-price').value     = med.price;
    document.getElementById('med-stock').value     = med.stock;
    document.getElementById('med-min-stock').value = med.minStock;
    document.getElementById('med-barcode').value   = med.barcode || '';
    document.getElementById('med-desc').value      = med.description || '';
  } else {
    document.getElementById('modal-title').textContent = 'Add Medication';
    document.getElementById('inventory-form').reset();
    document.getElementById('med-id').value = '';
  }
  openModal('inventory-modal');
}

function saveMedication(e) {
  e.preventDefault();

  const meds = Store.getMedications();
  const editId = parseInt(document.getElementById('med-id').value) || null;

  const existingMed = meds.find(m => m.id === editId);

  const medData = {
    name: document.getElementById('med-name').value.trim(),
    category: document.getElementById('med-category').value.trim(),
    price: parseFloat(document.getElementById('med-price').value),
    stock: parseInt(document.getElementById('med-stock').value),
    minStock: parseInt(document.getElementById('med-min-stock').value) || 10,
    barcode: document.getElementById('med-barcode').value.trim(),
    description: document.getElementById('med-desc').value.trim(),

    img: existingMed?.img || 'imgs/default.jpg'
  };

  if (editId) {
    const idx = meds.findIndex(m => m.id === editId);
    if (idx >= 0) meds[idx] = { ...meds[idx], ...medData };
    showToast(`${medData.name} updated`, 'success');
  } else {
    const newId = Math.max(0, ...meds.map(m => m.id)) + 1;
    meds.push({ id: newId, ...medData });
    showToast(`${medData.name} added to inventory`, 'success');
    pushNotification(`New medication added: ${medData.name}`, 'fa-pills');
  }

  Store.setMedications(meds);
  closeModal('inventory-modal');
  renderInventory();
  renderPOSProducts();
  updateLowStockBadge();
}

/* ──────────────────────────────────────────────
   13. REPORTS & ANALYTICS
────────────────────────────────────────────── */
function renderReports() {
  const orders = Store.getOrders();
  const meds   = Store.getMedications();

  /* KPIs */
  const totalRevenue  = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total, 0);
  const totalOrders   = orders.length;
  const deliveredOrders = orders.filter(o=>o.status==='delivered').length;
  const avgOrder      = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
  const lowStock      = meds.filter(m=>m.stock<=m.minStock).length;

  const kpisEl = document.getElementById('reports-kpis');
  if (kpisEl) kpisEl.innerHTML = `
    <div class="kpi-card"><div class="kpi-icon"><i class="fa-solid fa-coins"></i></div><div><div class="kpi-label">Total Revenue</div><div class="kpi-value">${fmt(totalRevenue)}</div><div class="kpi-change up"><i class="fa-solid fa-arrow-trend-up"></i> Delivered orders</div></div></div>
    <div class="kpi-card"><div class="kpi-icon"><i class="fa-solid fa-receipt"></i></div><div><div class="kpi-label">Total Orders</div><div class="kpi-value">${totalOrders}</div><div class="kpi-change up">${deliveredOrders} delivered</div></div></div>
    <div class="kpi-card"><div class="kpi-icon"><i class="fa-solid fa-chart-bar"></i></div><div><div class="kpi-label">Avg. Order Value</div><div class="kpi-value">${fmt(avgOrder)}</div></div></div>
    <div class="kpi-card"><div class="kpi-icon" style="background:var(--warning-light)"><i class="fa-solid fa-triangle-exclamation" style="color:var(--warning)"></i></div><div><div class="kpi-label">Low Stock Items</div><div class="kpi-value" style="color:var(--warning)">${lowStock}</div><div class="kpi-change down">Needs restocking</div></div></div>`;

  /* Category Sales Chart */
  renderCategoryChart(orders);

  /* Daily Sales Chart */
  renderDailyChart(orders);

  /* Recent Transactions */
  renderTransactions(orders);
}

function renderCategoryChart(orders) {
  const el = document.getElementById('chart-category');
  if (!el) return;

  const catSales = {};
  orders.forEach(o => {
    if (o.status !== 'delivered') return;
    o.items.forEach(item => {
      const meds = Store.getMedications();
      const med  = meds.find(m => m.id === item.id);
      const cat  = med ? med.category : 'Other';
      catSales[cat] = (catSales[cat] || 0) + item.price * item.qty;
    });
  });

  const sorted = Object.entries(catSales).sort((a,b)=>b[1]-a[1]).slice(0, 8);
  const max    = sorted.length > 0 ? sorted[0][1] : 1;

  el.innerHTML = sorted.length === 0
    ? '<p style="color:var(--text-muted);font-size:.83rem">No sales data yet. Complete some orders to see stats.</p>'
    : sorted.map(([cat, val]) => `
      <div class="bar-row">
        <div class="bar-label">${cat}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(val/max*100).toFixed(1)}%">
            <span class="bar-fill-val">${Math.round(val/max*100)}%</span>
          </div>
        </div>
        <div class="bar-amount">${fmt(val)}</div>
      </div>`).join('');
}

function renderDailyChart(orders) {
  const el = document.getElementById('chart-daily');
  if (!el) return;

  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-EG', { month:'short', day:'numeric' });
    days[key] = 0;
  }

  orders.filter(o=>o.status==='delivered').forEach(o => {
    const key = new Date(o.createdAt).toLocaleDateString('en-EG', { month:'short', day:'numeric' });
    if (key in days) days[key] += o.total;
  });

  const max = Math.max(...Object.values(days), 1);
  el.innerHTML = Object.entries(days).map(([day, val]) => `
    <div class="bar-row">
      <div class="bar-label">${day}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(val/max*100).toFixed(1)}%">
          ${val > 0 ? `<span class="bar-fill-val">${fmt(val)}</span>` : ''}
        </div>
      </div>
      <div class="bar-amount">${fmt(val)}</div>
    </div>`).join('');
}

function renderTransactions(orders) {
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;
  const recent = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,20);
  tbody.innerHTML = recent.length === 0
    ? '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No transactions yet</td></tr>'
    : recent.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ').substring(0,50)}${o.items.length > 2 ? '…' : ''}</td>
        <td><strong>${fmt(o.total)}</strong></td>
        <td>${o.payment}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge ${o.status}">${getStatusLabel(o.status)}</span></td>
      </tr>`).join('');
}


/* ──────────────────────────────────────────────
   14. MOBILE APP — Customer Interface
────────────────────────────────────────────── */
function launchMobileApp(user) {
  document.getElementById('mobile-app').classList.remove('hidden');
  /* Set greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl  = document.getElementById('mobile-greeting');
  if (greetEl) greetEl.textContent = `${greeting}, ${user.name.split(' ')[0]} 👋`;

  renderMobileCategories();
  renderMobileFeatured();
  renderMobileOrders();
  updateMobileCartBadge();
  showMobilePage('home');
}

function showMobilePage(pageName) {
  const pages = document.querySelectorAll('.mobile-page');
  pages.forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`mobile-${pageName}`);
  if (page) page.classList.add('active');

  /* Update bottom nav */
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageName);
  });

  /* Update header title */
  const titles = { home:'PharmaPlus', search:'Search', cart:'My Cart', orders:'My Orders', 'product-detail':'', 'order-tracking':'' };
  const titleEl = document.getElementById('mobile-page-title');
  if (titleEl && titles[pageName] !== undefined) titleEl.textContent = titles[pageName];

  /* Refresh data for certain pages */
  if (pageName === 'cart')   renderMobileCart();
  if (pageName === 'orders') renderMobileOrders();
  if (pageName === 'search') renderMobileSearchResults();
}

function goBack() {
  showMobilePage(state.prevMobilePage || 'home');
}

/* Categories */
function renderMobileCategories() {
  const meds = Store.getMedications();
  const cats = ['All', ...new Set(meds.map(m => m.category))];
  const el   = document.getElementById('mobile-categories');
  if (!el) return;
  el.innerHTML = cats.map(c => `
    <div class="chip ${c === state.mobileCategory ? 'active' : ''}" onclick="setMobileCategory('${c}')">${c}</div>`).join('');
}

function setMobileCategory(cat) {
  state.mobileCategory = cat;
  renderMobileCategories();
  renderMobileFeatured();
}

/* Featured products */
function renderMobileFeatured() {
  const meds = Store.getMedications();
  const el   = document.getElementById('mobile-featured');
  if (!el) return;
  const filtered = state.mobileCategory === 'All' ? meds : meds.filter(m => m.category === state.mobileCategory);
  renderMobileProductGrid(el, filtered);
}

function renderMobileProductGrid(container, meds) {
  container.innerHTML = meds.map(m => `
    <div class="mobile-product-card" onclick="openProductDetail(${m.id})">

      <div class="mob-card-icon">
        <img src="${m.img}" 
             style="width:35px;height:35px;object-fit:contain;border-radius:6px;" />
      </div>

      <div class="mob-card-name">${m.name}</div>
      <div class="mob-card-category">${m.category}</div>
      <div class="mob-card-price">${fmt(m.price)}</div>

      <div class="mob-card-stock">
        ${m.stock === 0 
          ? '<span style="color:var(--danger)">Out of stock</span>' 
          : `Stock: ${m.stock}`}
      </div>

      <button class="mob-add-btn" 
              onclick="event.stopPropagation();addToMobileCart(${m.id})" 
              ${m.stock === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-cart-plus"></i> Add
      </button>

    </div>
  `).join('') || `
    <p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:1rem">
      No medications found
    </p>`;
}

/* Product Detail */
function openProductDetail(medId) {
  state.prevMobilePage = document.querySelector('.mobile-page.active')?.id.replace('mobile-','') || 'home';
  state.currentDetailId = medId;
  state.detailQty = 1;
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === medId);
  if (!med) return;

  const inCart   = state.mobileCart.find(i => i.id === medId);
  const stockBadge = med.stock === 0 ? 'out' : med.stock <= med.minStock ? 'low' : 'ok';
  const stockText  = med.stock === 0 ? 'Out of Stock' : med.stock <= med.minStock ? `Low Stock (${med.stock} left)` : `In Stock (${med.stock} available)`;

  document.getElementById('product-detail-content').innerHTML = `
    <div class="product-detail-card">
      <div class="detail-icon"><img src="${med.img}" style="width:100px;height:100px;object-fit:contain;border-radius:6px;" /> </div>
      <div class="detail-name">${med.name}</div>
      <div class="detail-category">${med.category}</div>
      <div class="detail-price">${fmt(med.price)}</div>
      <div class="detail-desc">${med.description || 'No description available.'}</div>
      <span class="detail-stock-badge ${stockBadge}">${stockText}</span>
      ${med.stock > 0 ? `
        <div class="detail-qty-control">
          <button class="detail-qty-btn" onclick="changeDetailQty(-1)">−</button>
          <span class="detail-qty-num" id="detail-qty-display">${state.detailQty}</span>
          <button class="detail-qty-btn" onclick="changeDetailQty(1)">+</button>
        </div>
        <button class="btn-checkout full-width" onclick="addToMobileCartWithQty(${medId})">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart (${state.detailQty})
        </button>` : ''}
    </div>`;

  showMobilePage('product-detail');
}

function changeDetailQty(delta) {
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === state.currentDetailId);
  if (!med) return;
  state.detailQty = Math.max(1, Math.min(state.detailQty + delta, med.stock));
  const el = document.getElementById('detail-qty-display');
  if (el) el.textContent = state.detailQty;
  /* Update button text */
  const btn = document.querySelector('.product-detail-card .btn-checkout');
  if (btn) btn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Add to Cart (${state.detailQty})`;
}

function addToMobileCartWithQty(medId) {
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === medId);
  if (!med) return;
  for (let i = 0; i < state.detailQty; i++) addToMobileCart(medId, true);
  showToast(`${med.name} ×${state.detailQty} added to cart`, 'success');
  showMobilePage(state.prevMobilePage || 'home');
}

/* Mobile Cart */
function addToMobileCart(medId, silent = false) {
  const meds = Store.getMedications();
  const med  = meds.find(m => m.id === medId);
  if (!med || med.stock === 0) { showToast('Out of stock', 'warning'); return; }
  const existing = state.mobileCart.find(i => i.id === medId);
  if (existing) {
    if (existing.qty >= med.stock) { if (!silent) showToast(`Max stock reached`, 'warning'); return; }
    existing.qty++;
  } else {
    state.mobileCart.push({ id: medId, name: med.name, price: med.price, qty: 1, img: med.img });
  }
  updateMobileCartBadge();
  if (!silent) showToast(`${med.name} added to cart`, 'success', 1500);
}

function removeMobileCartItem(medId) {
  state.mobileCart = state.mobileCart.filter(i => i.id !== medId);
  updateMobileCartBadge();
  renderMobileCart();
}

function changeMobileQty(medId, delta) {
  const item = state.mobileCart.find(i => i.id === medId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeMobileCartItem(medId); return; }
  updateMobileCartBadge();
  renderMobileCart();
}

function updateMobileCartBadge() {
  const count = state.mobileCart.reduce((s, i) => s + i.qty, 0);
  const els   = [document.getElementById('mobile-cart-dot'), document.getElementById('bottom-cart-badge')];
  els.forEach(el => { if (el) { el.textContent = count; el.style.display = count > 0 ? '' : 'none'; } });
}

function renderMobileCart() {
  const itemsEl  = document.getElementById('mobile-cart-items');
  const emptyEl  = document.getElementById('mobile-cart-empty');
  const footerEl = document.getElementById('mobile-cart-footer');
  if (!itemsEl) return;

  if (state.mobileCart.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl?.classList.remove('hidden');
    footerEl?.classList.add('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');
  footerEl?.classList.remove('hidden');

  itemsEl.innerHTML = state.mobileCart.map(item => `
    <div class="mobile-cart-item">
          <div class="mob-item-info">
        <div class="mob-item-name">${item.name}</div>
        <div class="mob-item-price">${fmt(item.price)} × ${item.qty} = ${fmt(item.price * item.qty)}</div>
      </div>
      <div class="mob-item-actions">
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeMobileQty(${item.id},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeMobileQty(${item.id},1)">+</button>
        </div>
        <button class="mob-remove-btn" onclick="removeMobileCartItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');

  const subtotal = state.mobileCart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.14;
  const total    = subtotal + tax;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fmt(v); };
  set('mob-subtotal', subtotal);
  set('mob-tax', tax);
  set('mob-total', total);
}

/* Mobile Checkout */
function mobileCheckout() {
  if (state.mobileCart.length === 0) return;
  const address = document.getElementById('delivery-address')?.value.trim() || '';
  if (!address) { showToast('Please enter a delivery address', 'warning'); return; }

  const meds   = Store.getMedications();
  const orders = Store.getOrders();

  /* Deduct stock */
  let stockOk = true;
  state.mobileCart.forEach(item => {
    const med = meds.find(m => m.id === item.id);
    if (!med || med.stock < item.qty) { showToast(`Insufficient stock for ${item.name}`, 'error'); stockOk = false; }
  });
  if (!stockOk) return;
  state.mobileCart.forEach(item => {
    const med = meds.find(m => m.id === item.id);
    if (med) med.stock -= item.qty;
  });
  Store.setMedications(meds);

  const subtotal = state.mobileCart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.14;
  const total    = subtotal + tax;

  const order = {
    id:          genId(),
    customer:    state.currentUser?.name || 'Customer',
    customerId:  state.currentUser?.id   || 'unknown',
    items:       [...state.mobileCart],
    subtotal, tax, total,
    payment:     'online',
    status:      'ordered',
    trackStatus: 'pending',
    address,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };

  orders.push(order);
  Store.setOrders(orders);
  state.mobileCart = [];
  updateMobileCartBadge();
  renderMobileOrders();
  showToast(`Order placed! ${order.id}`, 'success', 4000);
  showMobilePage('orders');

  /* Start auto-tracking simulation */
  startTrackingTimer(order.id);
}

/* Mobile Orders List */
function renderMobileOrders() {
  const orders   = Store.getOrders();
  const userId   = state.currentUser?.id;
  const myOrders = orders.filter(o => o.customerId === userId).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  const listEl   = document.getElementById('mobile-orders-list');
  const emptyEl  = document.getElementById('mobile-orders-empty');
  if (!listEl) return;

  if (myOrders.length === 0) {
    listEl.innerHTML = '';
    emptyEl?.classList.remove('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');

  listEl.innerHTML = myOrders.map(o => `
    <div class="mobile-order-card" onclick="openOrderTracking('${o.id}')">
      <div class="mob-order-header">
        <span class="mob-order-id">${o.id}</span>
        <span class="status-badge ${o.trackStatus}">${getStatusLabel(o.trackStatus)}</span>
      </div>
      <div class="mob-order-items">${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</div>
      <div class="mob-order-footer">
        <span class="mob-order-date">${new Date(o.createdAt).toLocaleDateString()}</span>
        <span class="mob-order-total">${fmt(o.total)}</span>
      </div>
    </div>`).join('');
}

/* Order Tracking Detail (Mobile) */
function openOrderTracking(orderId) {
  state.prevMobilePage = 'orders';
  state.currentOrderId = orderId;
  const orders = Store.getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;

  const idx = TRACK_IDX[order.trackStatus] ?? 0;
  const pct = idx === 0 ? 0 : idx === 1 ? 50 : 100;

  document.getElementById('order-tracking-content').innerHTML = `
    <div class="order-tracking-card">
      <div class="mob-order-header">
        <span class="mob-order-id">${order.id}</span>
        <span class="status-badge ${order.trackStatus}">${getStatusLabel(order.trackStatus)}</span>
      </div>
      <div class="ot-address"><i class="fa-solid fa-location-dot" style="color:var(--primary)"></i> ${order.address}</div>
      <div class="tracking-progress" style="margin:1rem 0">
        <div class="progress-steps">
          ${TRACK_STEPS.map((step, i) => `
            <div class="progress-step">
              <div class="step-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}">
                <i class="fa-solid ${i <= idx ? 'fa-check' : 'fa-circle'}" style="font-size:.6rem"></i>
              </div>
              <div class="step-label ${i === idx ? 'active' : ''}">${step.label}</div>
            </div>`).join('')}
          <div class="progress-line" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="tracking-eta"><i class="fa-regular fa-clock"></i> ${order.trackStatus === 'delivered' ? 'Your order has been delivered!' : order.trackStatus === 'out_for_delivery' ? 'Driver is on the way — ETA ~15 min' : 'Your order is being prepared'}</div>
      <div class="ot-items" style="margin-top:1rem">
        <div style="font-weight:700;font-size:.8rem;color:var(--text-muted);margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.5px">Items</div>
        ${order.items.map(i => `<div class="ot-item-row"><span>${i.img} ${i.name} ×${i.qty}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
        <div class="ot-total">Total: ${fmt(order.total)}</div>
      </div>
    </div>`;

  showMobilePage('order-tracking');
}

/* Search */
function mobileSearch() {
  const q = document.getElementById('mobile-search-input')?.value;
  if (q && q.length > 0) showMobilePage('search');
}

function mobileSearchPage() {
  renderMobileSearchResults();
}

function renderMobileSearchResults() {
  const q    = (document.getElementById('mobile-search-input2')?.value || '').toLowerCase();
  const meds = Store.getMedications();
  const results = q ? meds.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || (m.description||'').toLowerCase().includes(q)) : meds;
  const el   = document.getElementById('mobile-search-results');
  const cntEl = document.getElementById('search-results-count');
  if (cntEl) cntEl.textContent = q ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"` : `All medications (${meds.length})`;
  if (el) renderMobileProductGrid(el, results);
}


/* ──────────────────────────────────────────────
   15. MODAL HELPERS
────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/* Close modal on overlay click */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
  });
});


/* ──────────────────────────────────────────────
   16. DETECT DEVICE & ROUTE
────────────────────────────────────────────── */
function detectDeviceAndRoute() {
  const isMobile = window.innerWidth < 768;
  const user     = Store.getCurrentUser();

  if (!user) {
    /* Show login — force role tab based on device */
    document.getElementById('login-screen').classList.remove('hidden');
    if (isMobile) switchLoginTab('customer');
    return;
  }

  /* Auto-login from stored session */
  state.currentUser = user;
  if (user.role === 'staff') {
    launchDesktopApp(user);
  } else {
    launchMobileApp(user);
  }
}


/* ──────────────────────────────────────────────
   17. SEED DEMO DATA (first-time run)
────────────────────────────────────────────── */
function seedDemoOrders() {
  const existing = Store.getOrders();
  if (existing.length > 0) return; /* Already seeded */

  const meds = Store.getMedications();
  const demo = [
    {
      id: 'ORD-DEMO001', customer: 'Khaled Ibrahim', customerId: 'u3',
      items: [{ id:1, name:'Panadol Extra', price:25, qty:2, img:'💊' }, { id:10, name:'Vitamin C 1000mg', price:40, qty:1, img:'🍊' }],
      subtotal: 90, tax: 12.6, total: 102.6, payment:'cash', status:'delivered', trackStatus:'delivered',
      address:'15 Tahrir Sq, Cairo', createdAt: new Date(Date.now()-3*86400000).toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'ORD-DEMO002', customer: 'Nour Ali', customerId: 'u4',
      items: [{ id:3, name:'Augmentin 625mg', price:120, qty:1, img:'💉' }, { id:2, name:'Brufen 400mg', price:35, qty:2, img:'💊' }],
      subtotal: 190, tax: 26.6, total: 216.6, payment:'card', status:'preparing', trackStatus:'out_for_delivery',
      address:'22 Zamalek St, Cairo', createdAt: new Date(Date.now()-1*86400000).toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'ORD-DEMO003', customer: 'Walk-in Customer', customerId: 'walk-in',
      items: [{ id:8, name:'Allegra 180mg', price:55, qty:1, img:'💊' }],
      subtotal: 55, tax: 7.7, total: 62.7, payment:'cash', status:'ordered', trackStatus:'pending',
      address:'In-Store', createdAt: new Date(Date.now()-2*3600000).toISOString(), updatedAt: new Date().toISOString(),
    },
  ];
  Store.setOrders(demo);
}


/* ──────────────────────────────────────────────
   18. KEYBOARD SHORTCUTS (Desktop)
────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (document.getElementById('desktop-app').classList.contains('hidden')) return;
  /* ESC closes modals */
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
    document.getElementById('notif-panel')?.classList.add('hidden');
  }
  /* Ctrl+K focuses POS search */
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    const el = document.getElementById('pos-search');
    if (el) { el.focus(); el.select(); }
  }
});


/* ──────────────────────────────────────────────
   19. APP INITIALIZATION
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Ensure default medications are stored */
  if (!localStorage.getItem('pharma_medications')) {
    Store.setMedications(DEFAULT_MEDICATIONS);
  }
  /* Ensure default users are stored */
  if (!localStorage.getItem('pharma_users')) {
    Store.set('pharma_users', DEFAULT_USERS);
  }

  loadDarkMode();
  seedDemoOrders();
  detectDeviceAndRoute();

  /* Re-route on window resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const desktopApp = document.getElementById('desktop-app');
      const mobileApp  = document.getElementById('mobile-app');
      /* CSS handles this via media queries, JS just syncs state if user switches */
      if (isMobile && !desktopApp.classList.contains('hidden') && state.currentUser?.role === 'staff') {
        /* staff on mobile: keep desktop but let CSS handle it */
      }
    }, 200);
  });
});

/* ──────────────────────────────────────────────
   20. QUICK DEMO HELPER (console)
   Usage: pharmaDemo() in browser console to auto-fill demo data
────────────────────────────────────────────── */
window.pharmaDemo = function() {
  Store.remove('pharma_orders');
  seedDemoOrders();
  console.log('PharmaPlus: Demo data reloaded!');
  showToast('Demo data reloaded!', 'success');
};
