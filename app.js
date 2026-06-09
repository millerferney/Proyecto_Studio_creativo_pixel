// Utilities and shared logic

// Format COP
const formatCOP = (n) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(n);

// Common variables
const CART_KEY = 'scp_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    highlightActiveNav();
    updateCartBadge(cart.reduce((n, i) => n + i.qty, 0));
    checkAuthState();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 20) {
                nav.style.background = 'rgba(8,11,20,0.95)';
                nav.style.borderBottomColor = 'rgba(0,229,255,0.12)';
            } else {
                nav.style.background = 'rgba(8,11,20,0.88)';
                nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
            }
        }
    });

    // Initialize page-specific scripts
    const path = window.location.pathname;
    if (path.includes('catalogo.html')) initCatalog();
    if (path.includes('checkout.html')) initCheckout();
    if (path.includes('personalizar.html')) initPersonalizar();
});

// Highlight Active Nav based on current HTML file
function highlightActiveNav() {
    const p = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (p.includes(href) || (p.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
            link.style.color = '#00E5FF';
            link.style.background = 'rgba(0,229,255,0.08)';
            link.style.boxShadow = 'inset 0 -2px 0 #00E5FF';
        }
    });
}

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('menu-btn');
    const open = !menu.hidden;
    menu.hidden = open;
    menu.setAttribute('aria-hidden', open);
    btn.setAttribute('aria-expanded', !open);
}
function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.hidden = true;
}

// Sidebar Drawer (Cart)
function openCart() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderCart();
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-open');
    setTimeout(() => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }, 310);
}

function updateCartBadge(count) {
    const badge = document.getElementById('cart-badge');
    const btn = document.getElementById('cart-btn');
    if (!badge || !btn) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    btn.setAttribute('aria-label', `Carrito de compras, ${count} ítem${count !== 1 ? 's' : ''}`);
    if (count > 0) badge.style.animation = 'pop 0.3s ease';
}

function renderCart() {
    const itemsEl = document.getElementById('cart-items-container');
    const emptyEl = document.getElementById('cart-empty-state');
    const footerEl = document.getElementById('cart-footer');
    const countLbl = document.getElementById('cart-count-label');

    if (!itemsEl) return;

    // Check if empty
    if (cart.length === 0) {
        itemsEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = '';
        if (footerEl) footerEl.style.display = 'none';
        if (countLbl) countLbl.textContent = '0 ítems';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = '';

    let total = 0;

    // Render items mock (in a real app, populate from real cart)
    itemsEl.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
        <div style="display:flex;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);align-items:flex-start;">
            <div style="width:72px;height:72px;border-radius:10px;background:linear-gradient(135deg,#161A2E,#1C2038);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i data-lucide="package" style="width:24px;height:24px;color:rgba(0,229,255,0.3)"></i>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <h4 style="font-family:'Space Grotesk',sans-serif;font-size:14px;color:#FFFFFF;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${item.name}">${item.name}</h4>
                    <button onclick="removeCartItem(${item.id})" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:2px;margin-left:8px;flex-shrink:0;"
                            onmouseover="this.style.color='#FF4D6A'" onmouseout="this.style.color='#94A3B8'">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                    <div style="display:flex;align-items:center;background:#161A2E;border:1px solid rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
                        <button onclick="updateCartQty(${item.id}, -1)" style="width:28px;height:28px;background:none;border:none;color:#D1D9E6;cursor:pointer;display:flex;align-items:center;justify-content:center;"
                                onmouseover="this.style.color='#FFFFFF'" onmouseout="this.style.color='#D1D9E6'">
                           <i data-lucide="minus" style="width:12px;height:12px;"></i>
                        </button>
                        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;width:20px;text-align:center;color:white;">${item.qty}</span>
                        <button onclick="updateCartQty(${item.id}, 1)" style="width:28px;height:28px;background:none;border:none;color:#D1D9E6;cursor:pointer;display:flex;align-items:center;justify-content:center;"
                                onmouseover="this.style.color='#FFFFFF'" onmouseout="this.style.color='#D1D9E6'">
                           <i data-lucide="plus" style="width:12px;height:12px;"></i>
                        </button>
                    </div>
                    <span style="font-family:'JetBrains Mono',monospace;color:#00E5FF;font-size:13px;font-weight:bold;">${formatCOP(itemTotal)}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');

    lucide.createIcons();

    const count = cart.reduce((n, i) => n + i.qty, 0);
    if (countLbl) countLbl.textContent = `${count} ítem${count !== 1 ? 's' : ''}`;

    const discount = Math.round(total * 0.05);
    const iva = Math.round((total - discount) * 0.19);
    const grand = total - discount + iva;

    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const ivaEl = document.getElementById('cart-iva');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = formatCOP(total);
    if (discountEl) discountEl.textContent = `-${formatCOP(discount)}`;
    if (ivaEl) ivaEl.textContent = formatCOP(iva);
    if (totalEl) totalEl.textContent = formatCOP(grand);
}

window.addToCart = function (id, name, price, qty = 1) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
        const newQty = existing.qty + qty;
        if (newQty <= 10) existing.qty = newQty;
        else { existing.qty = 10; showToast('info', 'Límite máximo de 10 unidades por producto alcanzado.'); }
    } else {
        cart.push({ id, name, price, qty: Math.min(qty, 10) });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge(cart.reduce((n, i) => n + i.qty, 0));
    openCart();
};

window.updateCartQty = function (id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        let newQty = item.qty + change;
        if (newQty > 5) { showToast('info', 'Límite máximo de 5 unidades por producto alcanzado.'); newQty = 5; }
        if (newQty <= 0) {
            cart = cart.filter(i => i.id !== id);
        } else {
            item.qty = newQty;
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge(cart.reduce((n, i) => n + i.qty, 0));
        renderCart();
    }
};

window.removeCartItem = function (id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge(cart.reduce((n, i) => n + i.qty, 0));
    renderCart();
};

// ── Auth Modal helpers ──────────────────────────────────────────
window.openAuth = function (tab = 'login') {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    authSwitchTab(tab);
    lucide.createIcons();
};

window.closeAuth = function () {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
};

window.authSwitchTab = function (tab) {
    const isLogin = tab === 'login';

    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');
    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    // Tab styles
    tabLogin.style.color = isLogin ? '#00E5FF' : '#94A3B8';
    tabLogin.style.borderBottomColor = isLogin ? '#00E5FF' : 'transparent';
    tabRegister.style.color = isLogin ? '#94A3B8' : '#00E5FF';
    tabRegister.style.borderBottomColor = isLogin ? 'transparent' : '#00E5FF';

    // Panel visibility — use display, NOT hidden attr (avoids Tailwind override issues)
    formLogin.style.display = isLogin ? 'block' : 'none';
    formRegister.style.display = isLogin ? 'none' : 'block';
};

// Close auth if clicking the overlay backdrop
document.addEventListener('click', function (e) {
    const overlay = document.getElementById('auth-overlay');
    if (overlay && e.target === overlay) closeAuth();
});

// Close auth on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAuth();
        closeCart();
    }
});

// Generic modal fallback (for other pages)
window.openModal = function (id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
};
window.closeModal = function (id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('is-open'); document.body.style.overflow = ''; }
};

// ── Toast Notification System ──────────────────────────────────
(function createToastContainer() {
    if (document.getElementById('toast-container')) return;
    const style = document.createElement('style');
    style.textContent = `
        #toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .toast-item {
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 12px;
            background: #0F1221;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.6);
            font-family: 'Outfit', sans-serif;
            font-size: 13px;
            color: #D1D9E6;
            min-width: 260px;
            max-width: 360px;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.3s ease;
        }
        .toast-item.toast-in {
            transform: translateX(0);
            opacity: 1;
        }
        .toast-item.toast-out {
            transform: translateX(120%);
            opacity: 0;
        }
        .toast-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 16px;
        }
        .toast-success .toast-icon { background: rgba(0,255,136,0.12); color: #00FF88; border: 1px solid rgba(0,255,136,0.2); }
        .toast-error   .toast-icon { background: rgba(255,45,120,0.12);  color: #FF2D78; border: 1px solid rgba(255,45,120,0.2); }
        .toast-info    .toast-icon { background: rgba(0,229,255,0.10);   color: #00E5FF; border: 1px solid rgba(0,229,255,0.2); }
        .toast-success { border-left: 3px solid #00FF88; }
        .toast-error   { border-left: 3px solid #FF2D78; }
        .toast-info    { border-left: 3px solid #00E5FF; }
        .toast-bar {
            position: absolute;
            bottom: 0; left: 0;
            height: 2px;
            border-radius: 0 0 12px 12px;
            animation: toastBar 3.5s linear forwards;
        }
        @keyframes toastBar { from { width: 100%; } to { width: 0%; } }
        .toast-success .toast-bar { background: #00FF88; }
        .toast-error   .toast-bar { background: #FF2D78; }
        .toast-info    .toast-bar { background: #00E5FF; }
    `;
    document.head.appendChild(style);
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
})();

window.showToast = function (type, message) {
    const icons = { success: '✓', error: '✕', info: 'i' };
    const container = document.getElementById('toast-container');
    if (!container) { console.log('[Toast]', type, message); return; }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'i'}</div>
        <span style="flex:1;line-height:1.4">${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#4A5568;cursor:pointer;padding:4px;line-height:1;font-size:16px;flex-shrink:0" onmouseover="this.style.color='#D1D9E6'" onmouseout="this.style.color='#4A5568'">&times;</button>
        <div class="toast-bar"></div>
    `;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('toast-in'));
    });

    // Auto remove after 3.5s
    setTimeout(() => {
        toast.classList.remove('toast-in');
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};

// ── Global Product Data ──
window.prods = [
    { id: 1, name: 'Taza Esmerilada', badge: 'OFERTA', price: 25000, img: 'Taza Esmerilada.jpg', sizes: ['11oz', '15oz'], materials: ['Esmerilado', 'Brillante', 'Mate'], category: 'Tazas' },
    { id: 2, name: 'Gorra Snapback', badge: '', price: 35000, img: 'Gorra Snapback.png', sizes: ['S/M', 'L/XL'], materials: ['Algodón 100%', 'Poliéster', 'Gabardina'], category: 'Accesorios' },
    { id: 3, name: 'Taza Pixel-Glow', badge: '', price: 38000, img: 'Taza Pixel-Glow.jpg', sizes: ['11oz', '15oz', '20oz'], materials: ['Glow UV', 'Esmerilado', 'Brillante'], category: 'Tazas' },
    { id: 4, name: 'Hoodie Tech-Spec', badge: 'NUEVO', price: 95000, img: 'Hoodie Tech-Spec.webp', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], materials: ['Fleece', 'French Terry', 'Oversize'], category: 'Ropa' },
    { id: 5, name: 'Carcasa iPhone 14', badge: '', price: 42000, img: 'Carcasa iPhone 14.jpg', sizes: ['iPhone 14', 'iPhone 14 Pro', 'iPhone 14 Plus'], materials: ['Silicona', 'Acrílico', 'TPU'], category: 'Accesorios' },
    { id: 6, name: 'Vaso Stanley Custom', badge: 'PRO', price: 120000, img: 'Vaso Stanley Custom.jpg', sizes: ['20oz', '30oz', '40oz'], materials: ['Acero Inox', 'Matte', 'Chrome'], category: 'Tazas' },
    { id: 7, name: 'Llavero Acrílico', badge: '', price: 8000, img: 'Llavero Acrílico.jpg', sizes: ['5cm', '7cm', '10cm'], materials: ['Acrílico Claro', 'Acrílico Blanco', 'Espejo'], category: 'Accesorios' },
    { id: 8, name: 'Botella Aluminio', badge: '', price: 28000, img: 'Botella Aluminio.jpg', sizes: ['500ml', '750ml', '1L'], materials: ['Aluminio', 'Mate', 'Anodizado'], category: 'Accesorios' }
];

// ── Authentication State & User Dropdown ──
let selectedOrderIdx = 1; // Default to 'Enviado' order

// Inject user dropdown styles
(function injectDropdownStyles() {
    if (document.getElementById('user-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'user-dropdown-styles';
    style.textContent = `
        #user-dropdown {
            position: absolute;
            width: 320px;
            background: rgba(15, 18, 33, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.85), 0 0 20px rgba(0,229,255,0.05);
            z-index: 10000;
            display: none;
            overflow: hidden;
            animation: dropFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dropFade {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .order-card-hover {
            transition: all 0.2s ease;
        }
        .order-card-hover:hover {
            background: rgba(255,255,255,0.04) !important;
            border-color: rgba(0, 229, 255, 0.2) !important;
        }
    `;
    document.head.appendChild(style);
})();

window.checkAuthState = function () {
    const isLoggedIn = localStorage.getItem('scp_logged_in') === 'true';
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        if (isLoggedIn) {
            userBtn.innerHTML = '<i data-lucide="user-check" class="w-[18px] h-[18px] text-px-cyan"></i>';
            userBtn.onclick = (e) => {
                e.stopPropagation();
                window.toggleUserDropdown();
            };
            userBtn.setAttribute('aria-label', 'Ver perfil y pedidos');
        } else {
            userBtn.innerHTML = '<i data-lucide="user" class="w-[18px] h-[18px]"></i>';
            userBtn.onclick = () => window.openAuth('login');
            userBtn.setAttribute('aria-label', 'Iniciar sesión');
            // Hide dropdown if open
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
        if (window.lucide) lucide.createIcons();
    }
};

window.loginUser = function () {
    localStorage.setItem('scp_logged_in', 'true');
    window.closeAuth();
    window.showToast('success', 'Sesión iniciada correctamente');
    window.checkAuthState();
};

window.logoutUser = function () {
    localStorage.setItem('scp_logged_in', 'false');
    window.showToast('info', 'Sesión cerrada');
    window.checkAuthState();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.style.display = 'none';
};

window.toggleUserDropdown = function () {
    let dropdown = document.getElementById('user-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'user-dropdown';
        document.body.appendChild(dropdown);
    }

    const isVisible = dropdown.style.display === 'block';

    if (isVisible) {
        dropdown.style.display = 'none';
    } else {
        closeMobileMenu();
        closeCart();

        dropdown.innerHTML = getDropdownHTML();
        dropdown.style.display = 'block';

        window.positionDropdown();
        if (window.lucide) lucide.createIcons();
    }
};

window.positionDropdown = function () {
    const dropdown = document.getElementById('user-dropdown');
    const btn = document.getElementById('user-btn');
    if (!dropdown || !btn || dropdown.style.display !== 'block') return;

    const rect = btn.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth || 320;

    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.left = `${rect.right - dropdownWidth + window.scrollX}px`;
};

window.selectOrder = function (idx, event) {
    if (event) event.stopPropagation();
    selectedOrderIdx = idx;
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.innerHTML = getDropdownHTML();
        if (window.lucide) lucide.createIcons();
    }
};

function renderCalendarHTML(arrivalDateStr, statusColor) {
    const arrivalDate = new Date(arrivalDateStr + 'T00:00:00');
    const arrivalDay = arrivalDate.getDate();
    const todayDay = 9; // Today is June 9, 2026

    let html = `
    <div style="font-family:'Space Grotesk',sans-serif;font-size:12px;color:white;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;padding:0 4px;">
        <span style="font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Junio 2026</span>
        <span style="font-size:10px;color:#94A3B8;font-family:'Outfit',sans-serif;">Entrega: <span style="color:${statusColor};font-weight:bold;">${arrivalDay} Jun</span></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-family:'Outfit',sans-serif;font-size:11px;">
    `;

    const headers = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
    headers.forEach(h => {
        html += `<div style="color:#636E81;font-weight:bold;font-size:9px;text-transform:uppercase;">${h}</div>`;
    });

    for (let day = 1; day <= 30; day++) {
        let style = "padding:4px 0;border-radius:6px;position:relative;cursor:default;";
        let isToday = day === todayDay;
        let isArrival = day === arrivalDay;

        if (isArrival) {
            style += `background:${statusColor}22;color:${statusColor};font-weight:bold;border:1px solid ${statusColor};box-shadow:0 0 10px ${statusColor}44;`;
        } else if (isToday) {
            style += `background:rgba(255,255,255,0.08);color:#FFFFFF;border:1px dashed rgba(255,255,255,0.4);`;
        } else {
            style += "color:#D1D9E6;";
        }

        html += `<div style="${style}" title="${isArrival ? 'Fecha de llegada estimada' : isToday ? 'Hoy' : ''}">
            ${day}
            ${isToday ? `<span style="position:absolute;bottom:1px;left:50%;transform:translateX(-50%);width:3px;height:3px;background:#00E5FF;border-radius:50%;"></span>` : ''}
        </div>`;
    }

    html += `</div>`;
    return html;
}

function getDropdownHTML() {
    const mockOrders = [
        { id: '1002', item: 'Vaso Stanley Custom', price: 120000, status: 'recibido', statusLabel: 'Recibido', date: '2026-06-05', color: '#00FF88' },
        { id: '1005', item: 'Taza Esmerilada', price: 25000, status: 'enviado', statusLabel: 'Enviado', date: '2026-06-12', color: '#00E5FF' },
        { id: '1008', item: 'Hoodie Tech-Spec', price: 95000, status: 'pendiente', statusLabel: 'Pendiente', date: '2026-06-15', color: '#7C3AED' }
    ];

    const activeOrder = mockOrders[selectedOrderIdx];

    let ordersListHTML = mockOrders.map((o, idx) => {
        const isActive = idx === selectedOrderIdx;
        const activeBorder = isActive ? `border-color:${o.color};background:rgba(255,255,255,0.04);` : 'border-color:rgba(255,255,255,0.05);background:transparent;';
        return `
        <div onclick="window.selectOrder(${idx}, event)" style="padding:10px 12px;border:1px solid;border-radius:10px;cursor:pointer;margin-bottom:8px;${activeBorder}" class="order-card-hover">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#94A3B8;">#PEDIDO-${o.id}</span>
                <span style="font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:bold;color:${o.color};background:${o.color}15;padding:1px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">${o.statusLabel}</span>
            </div>
            <div style="font-family:'Outfit',sans-serif;font-size:13px;color:white;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o.item}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:11px;color:#94A3B8;">
                <span>Total: <span style="font-family:'JetBrains Mono',monospace;color:#FFFFFF;font-weight:bold;">$${o.price.toLocaleString('es-CO')}</span></span>
                <span style="font-size:10px;"><i data-lucide="calendar" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i>${o.date}</span>
            </div>
        </div>
        `;
    }).join('');

    return `
    <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:bold;color:white;">Miller Ferney</div>
                <div style="font-family:'Outfit',sans-serif;font-size:11px;color:#00E5FF;">Cliente VIP</div>
            </div>
            <button onclick="window.logoutUser()" style="background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;color:#FF2D78;display:flex;align-items:center;justify-content:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,45,120,0.1)'" onmouseout="this.style.background='none'" title="Cerrar sesión">
                <i data-lucide="log-out" style="width:16px;height:16px;"></i>
            </button>
        </div>
    </div>
    
    <div style="padding:16px 16px 8px;max-height:220px;overflow-y:auto;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:bold;color:#636E81;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Historial de Compras</div>
        ${ordersListHTML}
    </div>
    
    <div style="padding:16px;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:bold;color:#636E81;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Fecha de Llegada</div>
        ${renderCalendarHTML(activeOrder.date, activeOrder.color)}
        <div style="margin-top:12px;font-size:10px;color:#94A3B8;font-family:'Outfit',sans-serif;text-align:center;line-height:1.4;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${activeOrder.color};margin-right:4px;"></span>
            Llegada estimada para el pedido #PEDIDO-${activeOrder.id}: <br><strong style="color:white;">${activeOrder.date}</strong>
        </div>
    </div>
    `;
}

// Position on scroll and resize
window.addEventListener('resize', window.positionDropdown);
window.addEventListener('scroll', window.positionDropdown);

// Close dropdown on click outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('user-dropdown');
    const btn = document.getElementById('user-btn');
    if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// Replace all button clicks inside auth modals to use loginUser
document.addEventListener('DOMContentLoaded', () => {
    const loginBtns = document.querySelectorAll('#auth-form-login .btn-success, #auth-form-register .btn-primary');
    loginBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            window.loginUser();
        };
    });
});

// ── Catalog Logic ──
window.renderProducts = function () {
    const sortSelect = document.getElementById('sort-select');
    const sortVal = sortSelect ? sortSelect.value : 'none';
    const catSelect = document.getElementById('category-select');
    const catVal = catSelect ? catSelect.value : 'all';

    let filtered = [...window.prods];

    // Apply category filter
    if (catVal !== 'all') {
        filtered = filtered.filter(p => p.category === catVal);
    }

    // Apply sorting
    if (sortVal === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    }

    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = filtered.map(p => `
    <div class="card bg-px-surface group flex flex-col items-start border border-white border-opacity-[0.06] hover:border-px-purple hover:border-opacity-30 p-4 rounded-[12px] relative overflow-hidden">
        ${p.badge ? `<div class="absolute top-4 right-4 bg-px-purple text-white px-2 py-0.5 text-[9px] font-mono font-bold z-10 rounded">${p.badge}</div>` : ''}
        <div class="w-full bg-px-base border border-white border-opacity-[0.06] rounded-lg mb-4 h-[160px] flex items-center justify-center overflow-hidden">
            <img src="Assets/${p.img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
        </div>
        <h3 class="font-display font-bold text-base text-white group-hover:text-px-purple transition w-full truncate">${p.name}</h3>
        <span class="font-mono font-bold text-[13px] text-px-green mb-4">${formatCOP(p.price)}</span>
        <a href="personalizar.html?pid=${p.id}" class="w-full py-2 mb-2 flex items-center justify-center gap-1.5 bg-transparent border border-px-cyan border-opacity-40 text-px-cyan font-display font-bold text-xs hover:bg-px-cyan hover:text-px-base hover:border-opacity-100 transition tracking-wide text-center rounded-lg" style="text-decoration:none">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            PERSONALIZAR
        </a>
        <button class="w-full py-2 bg-px-elevated border border-white border-opacity-[0.06] text-px-muted font-display font-bold text-xs hover:bg-px-purple hover:text-white hover:border-px-purple transition tracking-wide text-center rounded-lg" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">AÑADIR</button>
    </div>
    `).join('');

    if (window.lucide) { lucide.createIcons(); }
};

window.initCatalog = function () {
    window.renderProducts();
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', window.renderProducts);
    }
    const catSelect = document.getElementById('category-select');
    if (catSelect) {
        catSelect.addEventListener('change', window.renderProducts);
    }

    // Handle mini-checkout toggle if present in catalogo (legacy)
    if (window.location.hash === '#procesar') {
        toggleCheckout(true);
    }
};

window.toggleCheckout = function (show) {
    const secCatalogo = document.getElementById('sec-catalogo');
    const secCheckout = document.getElementById('sec-checkout');
    if (show && secCatalogo && secCheckout) {
        secCatalogo.hidden = true;
        secCheckout.hidden = false;
        renderCheckout();
        window.scrollTo(0, 0);
    } else if (secCatalogo && secCheckout) {
        secCatalogo.hidden = false;
        secCheckout.hidden = true;
    }
};

window.renderCheckout = function () {
    const wrapper = document.getElementById('checkout-items');
    if (!wrapper) return;

    wrapper.innerHTML = cart.map(i => `
        <div class="flex justify-between items-center py-2 border-b border-white border-opacity-5 last:border-0 text-sm">
            <div class="flex items-center gap-2">
            <span class="text-px-muted font-mono bg-px-elevated px-1.5 py-0.5 rounded text-[10px]">${i.qty}x</span>
            <span class="text-white font-body truncate w-[140px]" title="${i.name}">${i.name}</span>
            </div>
            <span class="text-px-cyan font-mono">${formatCOP(i.price * i.qty)}</span>
        </div>
    `).join('');

    let totalCost = cart.reduce((no, it) => no + (it.price * it.qty), 0);
    let discount = Math.round(totalCost * 0.05);
    let iva = Math.round((totalCost - discount) * 0.19);
    const subEl = document.getElementById('chk-sub');
    const discEl = document.getElementById('chk-disc');
    const ivaEl = document.getElementById('chk-iva');
    const totEl = document.getElementById('chk-total');
    if (subEl) subEl.textContent = formatCOP(totalCost);
    if (discEl) discEl.textContent = '-' + formatCOP(discount);
    if (ivaEl) ivaEl.textContent = formatCOP(iva);
    if (totEl) totEl.textContent = formatCOP(totalCost - discount + iva);
};

// ── Checkout Logic ──
window.selectPayment = function (id) {
    document.querySelectorAll('.payment-card').forEach(el => {
        el.classList.remove('active');
        const tit = el.querySelector('h3');
        if (tit) { tit.classList.remove('text-px-cyan'); tit.classList.add('text-white'); }
        const iCon = el.querySelector('i[data-lucide]:not(.text-black)');
        if (iCon) { iCon.classList.remove('text-px-cyan'); iCon.classList.add('text-white'); }
    });

    const target = document.getElementById('pay-' + id);
    if (target) {
        target.classList.add('active');
        const targetTitle = target.querySelector('h3');
        const targetIcon = target.querySelector('i[data-lucide]:not(.text-black)');
        if (targetTitle) { targetTitle.classList.remove('text-white'); targetTitle.classList.add('text-px-green'); }
        if (targetIcon) { targetIcon.classList.remove('text-white'); targetIcon.classList.add('text-px-green'); }
    }
};

window.processPayment = function () {
    if (cart.length === 0) {
        window.showToast('error', 'Agrega items al carrito primero');
        return;
    }
    window.showToast('success', 'Pago procesado con éxito.');
    cart = [];
    localStorage.removeItem(CART_KEY);
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
};

window.initCheckout = function () {
    const wrapper = document.getElementById('checkout-items-list');
    if (!wrapper) return;

    if (!cart || cart.length === 0) {
        wrapper.innerHTML = '<p class="font-mono text-[11px] text-px-muted uppercase tracking-widest text-center py-4">TU CARRITO ESTÁ VACÍO.</p>';
        return;
    }

    wrapper.innerHTML = cart.map(i => `
        <div>
        <div class="flex justify-between items-start mb-1">
            <h3 class="font-display font-bold text-[13px] uppercase tracking-wide text-white m-0 max-w-[200px] truncate" title="${i.name}">${i.name} <span class="text-px-faint ml-1">x${i.qty}</span></h3>
            <span class="font-mono text-[13px] font-bold text-px-cyan">${formatCOP(i.price * i.qty)}</span>
        </div>
        <p class="font-mono text-[10px] text-px-muted uppercase tracking-widest m-0">SKU-${i.id.toString().padStart(6, '0')} PIXEL ASSET</p>
        </div>
    `).join('');

    let totalCost = cart.reduce((no, it) => no + (it.price * it.qty), 0);
    let discount = Math.round(totalCost * 0.05);
    let iva = Math.round((totalCost - discount) * 0.19);

    const subEl = document.getElementById('chk-sub');
    const discEl = document.getElementById('chk-disc');
    const ivaEl = document.getElementById('chk-iva');
    const totEl = document.getElementById('chk-total');
    if (subEl) subEl.textContent = formatCOP(totalCost);
    if (discEl) discEl.textContent = '-' + formatCOP(discount);
    if (ivaEl) ivaEl.textContent = formatCOP(iva);
    if (totEl) totEl.textContent = formatCOP(totalCost - discount + iva);
};

// ── Personalizar Logic ──
// Global state
let currentProduct = null;
let selectedColor = '#FFFFFF';
let selectedDesign = null;
let selectedSize = null;
let selectedMaterial = null;
let uploadedFile = null;
let pQty = 1;

const colorPalette = [
    { hex: '#FFFFFF', name: 'Blanco' }, { hex: '#000000', name: 'Negro' },
    { hex: '#FF2D78', name: 'Rosa Neon' }, { hex: '#00E5FF', name: 'Cyan' },
    { hex: '#00FF00', name: 'Verde Neon' }, { hex: '#7C3AED', name: 'Púrpura' },
    { hex: '#FF6B00', name: 'Naranja' }, { hex: '#FFD700', name: 'Dorado' },
    { hex: '#FF0000', name: 'Rojo' }, { hex: '#1A237E', name: 'Azul Marino' },
    { hex: '#004D40', name: 'Verde Oscuro' }, { hex: '#37474F', name: 'Gris Acero' },
];

const designs = [
    { id: 'minimal', label: 'Minimalista', icon: '◻', desc: 'Limpio y simple' },
    { id: 'gradient', label: 'Degradado', icon: '🌈', desc: 'Colores en transición' },
    { id: 'geometric', label: 'Geométrico', icon: '◆', desc: 'Formas y patrones' },
    { id: 'neon', label: 'Neon Glow', icon: '✦', desc: 'Brillos neón' },
    { id: 'retro', label: 'Retro', icon: '◉', desc: 'Estilo vintage' },
    { id: 'custom', label: 'Tu archivo', icon: '📁', desc: 'Diseño propio' },
];

window.initPersonalizar = function () {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('pid') || '1');
    currentProduct = window.prods.find(p => p.id === productId) || window.prods[0];

    const bc = document.getElementById('breadcrumb-name');
    const pt = document.getElementById('product-title');
    if (bc) bc.textContent = currentProduct.name;
    if (pt) pt.textContent = currentProduct.name;

    window.updatePriceDisplay();

    const heroImg = document.getElementById('product-hero-img');
    if (heroImg) {
        heroImg.src = `Assets/${currentProduct.img}`;
        heroImg.alt = currentProduct.name;
    }

    window.renderColorSwatches();
    window.renderDesignCards();
    window.renderSizes();
    window.renderMaterials();
    window.updateSummary();
    window.initScrollAnimations();
};

window.renderColorSwatches = function () {
    const container = document.getElementById('color-swatches');
    if (!container) return;
    container.innerHTML = colorPalette.map(c => `
        <button
        class="color-swatch ${selectedColor === c.hex ? 'selected' : ''}"
        style="background:${c.hex}"
        title="${c.name}"
        onclick="selectColor('${c.hex}', this)"
        aria-label="${c.name}">
        </button>
    `).join('');
};

window.selectColor = function (hex, el) {
    selectedColor = hex;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    if (el) el.classList.add('selected');
    const picker = document.getElementById('custom-color-picker');
    const label = document.getElementById('custom-color-label');
    if (picker) picker.value = hex;
    if (label) label.textContent = hex + ' · Haz clic para cambiar';
    window.updateSummary();
};

window.selectCustomColor = function (hex) {
    selectedColor = hex;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    const label = document.getElementById('custom-color-label');
    if (label) label.textContent = hex + ' · Color personalizado';
    window.updateSummary();
};

window.renderDesignCards = function () {
    const container = document.getElementById('design-cards');
    if (!container) return;
    container.innerHTML = designs.map(d => `
        <div class="design-card ${selectedDesign === d.id ? 'selected' : ''}"
            onclick="selectDesign('${d.id}', this)" id="design-${d.id}">
        <div class="design-preview">${d.icon}</div>
        <p class="font-display font-bold text-xs text-white m-0">${d.label}</p>
        <p class="font-mono text-[9px] text-px-faint m-0 mt-1 uppercase">${d.desc}</p>
        </div>
    `).join('');
};

window.selectDesign = function (id, el) {
    selectedDesign = id;
    document.querySelectorAll('.design-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');
    window.updateSummary();
};

window.renderSizes = function () {
    const container = document.getElementById('size-options');
    if (!container || !currentProduct || !currentProduct.sizes) return;
    container.innerHTML = currentProduct.sizes.map((s, i) => `
        <button class="size-pill ${i === 0 ? 'selected' : ''}" onclick="selectSize('${s}', this)">${s}</button>
    `).join('');
    selectedSize = currentProduct.sizes[0];
};

window.selectSize = function (size, el) {
    selectedSize = size;
    document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
    if (el) el.classList.add('selected');
    window.updateSummary();
};

const materialIcons = { default: 'layers', Algodón: 'shirt', Fleece: 'shirt', Poliéster: 'shirt', Silicona: 'circle', Acrílico: 'sparkles', Aluminio: 'zap', 'Acero Inox': 'shield', Mate: 'moon', Chrome: 'sun', Brillante: 'sun', Esmerilado: 'droplets', Glow: 'sun' };
function getMaterialIcon(mat) {
    for (const key of Object.keys(materialIcons)) { if (mat.includes(key)) return materialIcons[key]; }
    return 'layers';
}

window.renderMaterials = function () {
    const container = document.getElementById('material-options');
    if (!container || !currentProduct || !currentProduct.materials) return;
    container.innerHTML = currentProduct.materials.map((m, i) => `
        <button class="material-pill ${i === 0 ? 'selected' : ''}" onclick="selectMaterial('${m}', this)">
        <i data-lucide="${getMaterialIcon(m)}" class="w-4 h-4"></i> ${m}
        </button>
    `).join('');
    selectedMaterial = currentProduct.materials[0];
    if (window.lucide) lucide.createIcons();
};

window.selectMaterial = function (mat, el) {
    selectedMaterial = mat;
    document.querySelectorAll('.material-pill').forEach(p => p.classList.remove('selected'));
    if (el) el.classList.add('selected');
    window.updateSummary();
};

window.changeQty = function (delta) {
    pQty = Math.max(1, Math.min(10, pQty + delta));
    const qd = document.getElementById('qty-display');
    if (qd) qd.textContent = pQty;
    window.updatePriceDisplay();
    window.updateSummary();
};

window.updatePriceDisplay = function () {
    if (!currentProduct) return;
    const pp = document.getElementById('product-price');
    if (pp) pp.textContent = formatCOP(currentProduct.price * pQty);
};

window.updateSummary = function () {
    if (!currentProduct) return;
    const sColorSwatch = document.getElementById('summary-color-swatch');
    const sColor = document.getElementById('summary-color');
    if (sColorSwatch) sColorSwatch.style.background = selectedColor;
    if (sColor) sColor.textContent = selectedColor;

    const sDesign = document.getElementById('summary-design');
    if (sDesign) sDesign.textContent = selectedDesign ? designs.find(d => d.id === selectedDesign).label : 'Sin selección';

    const sSize = document.getElementById('summary-size');
    if (sSize) sSize.textContent = selectedSize || '—';

    const sMat = document.getElementById('summary-material');
    if (sMat) sMat.textContent = selectedMaterial || '—';

    const sQty = document.getElementById('summary-qty');
    if (sQty) sQty.textContent = pQty;

    const sFile = document.getElementById('summary-file');
    if (sFile) {
        if (uploadedFile) {
            sFile.textContent = uploadedFile.name;
            sFile.classList.remove('text-px-cyan');
            sFile.classList.add('text-px-green');
        } else {
            sFile.textContent = 'No adjunto';
            sFile.classList.add('text-px-cyan');
            sFile.classList.remove('text-px-green');
        }
    }

    const sTotal = document.getElementById('summary-total');
    if (sTotal) sTotal.textContent = formatCOP(currentProduct.price * pQty);
};

window.handleFileUpload = function (input) {
    if (input.files && input.files[0]) {
        uploadedFile = input.files[0];
        const ph = document.getElementById('upload-placeholder');
        const up = document.getElementById('upload-preview');
        if (ph) ph.style.display = 'none';
        if (up) up.style.display = 'flex';

        const fn = document.getElementById('upload-filename');
        const fs = document.getElementById('upload-filesize');
        if (fn) fn.textContent = uploadedFile.name;
        if (fs) fs.textContent = (uploadedFile.size / 1024).toFixed(1) + ' KB';
        window.updateSummary();
    }
};

window.clearUpload = function () {
    uploadedFile = null;
    const fu = document.getElementById('file-upload');
    if (fu) fu.value = '';

    const ph = document.getElementById('upload-placeholder');
    const up = document.getElementById('upload-preview');
    if (ph) ph.style.display = 'block';
    if (up) up.style.display = 'none';
    window.updateSummary();
};

window.addToCartCustom = function () {
    if (!currentProduct) return;
    const name = `${currentProduct.name} (${selectedSize}, ${selectedMaterial})`;
    window.addToCart(currentProduct.id, name, currentProduct.price, pQty);
    window.showToast('success', 'Producto personalizado añadido al carrito');
};

window.buyNow = function () {
    window.addToCartCustom();
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 500);
};

window.initScrollAnimations = function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
};

window.showToast = function (type, message) {
    const icons = { success: '✓', error: '✕', info: 'i' };
    const container = document.getElementById('toast-container');
    if (!container) { console.log('[Toast]', type, message); return; }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'i'}</div>
        <span style="flex:1;line-height:1.4">${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#4A5568;cursor:pointer;padding:4px;line-height:1;font-size:16px;flex-shrink:0" onmouseover="this.style.color='#D1D9E6'" onmouseout="this.style.color='#4A5568'">&times;</button>
        <div class="toast-bar"></div>
    `;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('toast-in'));
    });

    // Auto remove after 3.5s
    setTimeout(() => {
        toast.classList.remove('toast-in');
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};
