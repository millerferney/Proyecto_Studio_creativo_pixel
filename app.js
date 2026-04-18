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
    updateCartBadge(cart.reduce((n,i) => n + i.qty, 0));
    
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
    if(menu) menu.hidden = true;
}

// Sidebar Drawer (Cart)
function openCart() {
    const overlay = document.getElementById('cart-overlay');
    const drawer  = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderCart();
}

function closeCart() {
    const drawer  = document.getElementById('cart-drawer');
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
    if(cart.length === 0){
        itemsEl.innerHTML = '';
        if(emptyEl)  emptyEl.style.display  = '';
        if(footerEl) footerEl.style.display = 'none';
        if(countLbl) countLbl.textContent = '0 ítems';
        return;
    }
    
    if(emptyEl)  emptyEl.style.display  = 'none';
    if(footerEl) footerEl.style.display = '';
    
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
                    <h4 style="font-family:'Space Grotesk',sans-serif;font-size:14px;color:#E8EDF5;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${item.name}">${item.name}</h4>
                    <button onclick="removeCartItem(${item.id})" style="background:none;border:none;color:#4A5568;cursor:pointer;padding:2px;margin-left:8px;flex-shrink:0;">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                    <div style="display:flex;align-items:center;background:#161A2E;border:1px solid rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
                        <button onclick="updateCartQty(${item.id}, -1)" style="width:28px;height:28px;background:none;border:none;color:#8B97B3;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                           <i data-lucide="minus" style="width:12px;height:12px;"></i>
                        </button>
                        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;width:20px;text-align:center;color:white;">${item.qty}</span>
                        <button onclick="updateCartQty(${item.id}, 1)" style="width:28px;height:28px;background:none;border:none;color:#8B97B3;cursor:pointer;display:flex;align-items:center;justify-content:center;">
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
    
    const count = cart.reduce((n,i) => n + i.qty, 0);
    if(countLbl) countLbl.textContent = `${count} ítem${count !== 1 ? 's' : ''}`;
    
    const discount = Math.round(total * 0.05);
    const iva = Math.round((total - discount) * 0.19);
    const grand = total - discount + iva;
    
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const ivaEl = document.getElementById('cart-iva');
    const totalEl = document.getElementById('cart-total');
    
    if(subtotalEl) subtotalEl.textContent = formatCOP(total);
    if(discountEl) discountEl.textContent = `-${formatCOP(discount)}`;
    if(ivaEl) ivaEl.textContent = formatCOP(iva);
    if(totalEl) totalEl.textContent = formatCOP(grand);
}

window.addToCart = function(id, name, price) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
        if (existing.qty < 5) existing.qty++;
        else showToast('info', 'Límite máximo de 5 unidades por producto alcanzado.');
    } else { 
        cart.push({ id, name, price, qty: 1 }); 
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge(cart.reduce((n,i) => n + i.qty, 0));
    openCart();
};

window.updateCartQty = function(id, change) {
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
        updateCartBadge(cart.reduce((n,i) => n + i.qty, 0));
        renderCart();
    }
};

window.removeCartItem = function(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge(cart.reduce((n,i) => n + i.qty, 0));
    renderCart();
};

// ── Auth Modal helpers ──────────────────────────────────────────
window.openAuth = function(tab = 'login') {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    authSwitchTab(tab);
    lucide.createIcons();
};

window.closeAuth = function() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
};

window.authSwitchTab = function(tab) {
    const isLogin = tab === 'login';

    const tabLogin     = document.getElementById('auth-tab-login');
    const tabRegister  = document.getElementById('auth-tab-register');
    const formLogin    = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');
    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    // Tab styles
    tabLogin.style.color            = isLogin ? '#00E5FF' : '#4A5568';
    tabLogin.style.borderBottomColor= isLogin ? '#00E5FF' : 'transparent';
    tabRegister.style.color            = isLogin ? '#4A5568' : '#00E5FF';
    tabRegister.style.borderBottomColor= isLogin ? 'transparent' : '#00E5FF';

    // Panel visibility — use display, NOT hidden attr (avoids Tailwind override issues)
    formLogin.style.display    = isLogin ? 'block' : 'none';
    formRegister.style.display = isLogin ? 'none'  : 'block';
};

// Close auth if clicking the overlay backdrop
document.addEventListener('click', function(e) {
    const overlay = document.getElementById('auth-overlay');
    if (overlay && e.target === overlay) closeAuth();
});

// Close auth on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAuth();
        closeCart();
    }
});

// Generic modal fallback (for other pages)
window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
};
window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('is-open'); document.body.style.overflow = ''; }
};

// Simple Toasts
window.showToast = function(type, message) {
    alert(message); // fallback para la demo rápida
};
