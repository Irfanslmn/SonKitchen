const defaultMenu = [
  {
    id: 'nasi-box-ayam-bakar',
    name: 'Nasi Box Ayam Bakar',
    price: 25000,
    category: 'Nasi Box',
    image: 'images/nasi-box-ayam-bakar.webp',
    desc: 'Nasi hangat dengan ayam bakar, lalapan, dan sambal khas.'
  },
  {
    id: 'nasi-box-rica-rica',
    name: 'Nasi Box Rica-Rica',
    price: 27000,
    category: 'Nasi Box',
    image: 'images/rica-rica.webp',
    desc: 'Cocok untuk pecinta rasa pedas dan gurih yang kuat.'
  },
  {
    id: 'mangut-ikan',
    name: 'Mangut Ikan',
    price: 30000,
    category: 'Hidangan Utama',
    image: 'images/mangut-ikan.webp',
    desc: 'Mangut ikan dengan kuah santan gurih dan rempah kaya aroma.'
  },
  {
    id: 'catering-harian',
    name: 'Catering Harian',
    price: 45000,
    category: 'Paket',
    image: 'images/catering-harian.webp',
    desc: 'Paket makanan harian untuk keluarga, kantor, atau acara kecil.'
  },
  {
    id: 'snack-box',
    name: 'Snack Box',
    price: 18000,
    category: 'Snack',
    image: 'images/image 2.webp',
    desc: 'Pilihan camilan untuk acara kantor, ulang tahun, dan rapat.'
  },
  {
    id: 'tumpeng-mini',
    name: 'Tumpeng Mini',
    price: 65000,
    category: 'Acara',
    image: 'images/image 3.webp',
    desc: 'Tumpeng mini cocok untuk syukuran kecil dan acara keluarga.'
  }
];

let menuItems = [];

const getMenuItems = () => {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('sonlokitchen_menu') || 'null');
  } catch (e) {}

  if (!Array.isArray(saved) || !saved.length) {
    try {
      saved = JSON.parse(localStorage.getItem('sonlokitchen_menu_admin') || 'null');
    } catch (e) {}
  }

  const source = Array.isArray(saved) && saved.length ? saved : defaultMenu;

  if (!Array.isArray(saved) || !saved.length) {
    localStorage.setItem('sonlokitchen_menu', JSON.stringify(defaultMenu));
    localStorage.setItem('sonlokitchen_menu_admin', JSON.stringify(defaultMenu));
  }

  menuItems = source;
  return menuItems;
};

const storageKey = 'sonlokitchen_cart';
let cart = [];

const loadCart = () => {
  try {
    cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    cart = [];
  }
  return cart;
};
loadCart();
getMenuItems();

const saveCart = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch (e) {}
};

const getProductById = (id) => getMenuItems().find((item) => item.id === id);

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
};

const sanitizeCart = () => {
  loadCart();
  const activeItems = getMenuItems();
  const validCart = cart.filter((entry) => {
    return entry && entry.id && activeItems.some(p => p.id === entry.id) && Number(entry.qty) > 0;
  });
  if (validCart.length !== cart.length) {
    cart = validCart;
    saveCart();
  }
  return cart;
};

// Segera bersihkan keranjang dari item invalid saat file dimuat
sanitizeCart();

const updateCartBadge = () => {
  const cartCountEl = document.getElementById('cartCount');
  if (!cartCountEl) return;
  sanitizeCart();
  const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  if (count > 0) {
    cartCountEl.textContent = String(count);
    cartCountEl.style.display = 'flex';
  } else {
    cartCountEl.textContent = '0';
    cartCountEl.style.display = 'none';
  }
};

const renderMenu = () => {
  const menuList = document.getElementById('menuList');
  if (!menuList) return;

  const activeMenu = getMenuItems();

  if (!activeMenu || !activeMenu.length) {
    menuList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">Belum ada menu yang tersedia.</p>';
    return;
  }

  menuList.innerHTML = activeMenu.map((item) => `
    <article class="menu-card">
      <img src="${item.image || 'images/nasi-box-ayam-bakar.webp'}" alt="${item.name}" class="menu-image" onerror="this.onerror=null;this.src='images/nasi-box-ayam-bakar.webp'">
      <div class="menu-info">
        <div class="menu-top">
          <span class="menu-category">${item.category || 'Menu'}</span>
          <h4>${item.name}</h4>
        </div>
        <p>${item.desc || ''}</p>
        <div class="menu-bottom">
          <strong>${formatRupiah(item.price || 0)}</strong>
          <button class="add-btn" data-id="${item.id}">Tambah</button>
        </div>
      </div>
    </article>
  `).join('');

  menuList.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.id);
    });
  });
};

const updateCartUI = () => {
  sanitizeCart();
  updateCartBadge();

  const cartItemsEl = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');

  if (!cartItemsEl || !totalPriceEl) return;

  const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  if (count === 0 || cart.length === 0) {
    cartItemsEl.innerHTML = '<li class="empty-cart">Keranjang masih kosong.</li>';
    totalPriceEl.textContent = '0';
    return;
  }

  const details = cart.map((entry) => {
    const product = getProductById(entry.id);
    if (!product) return '';

    return `
      <li class="cart-item">
        <div class="item-info">
          <span class="item-name">${product.name}</span>
          <span class="item-price">${formatRupiah(product.price)} / pcs</span>
        </div>

        <div class="cart-item-actions">
          <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-id="${entry.id}" aria-label="Kurangi qty">-</button>
            <span class="qty-val">${entry.qty}</span>
            <button class="qty-btn" data-action="increase" data-id="${entry.id}" aria-label="Tambah qty">+</button>
          </div>
          <button class="delete-item-btn" data-id="${entry.id}" aria-label="Hapus item dari keranjang">
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </li>
    `;
  }).filter(Boolean).join('');

  const total = cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);

  cartItemsEl.innerHTML = details;
  totalPriceEl.textContent = total.toLocaleString('id-ID');

  cartItemsEl.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const { id, action } = button.dataset;
      const target = cart.find((item) => item.id === id);
      if (!target) return;

      if (action === 'increase') {
        target.qty += 1;
      } else {
        target.qty -= 1;
        if (target.qty <= 0) {
          cart = cart.filter((item) => item.id !== id);
        }
      }

      saveCart();
      updateCartUI();
    });
  });

  cartItemsEl.querySelectorAll('.delete-item-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const { id } = button.dataset;
      cart = cart.filter((item) => item.id !== id);
      saveCart();
      updateCartUI();
    });
  });
};

const addToCart = (id) => {
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart();
  updateCartUI();

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'success',
      title: 'Ditambahkan',
      text: 'Menu berhasil ditambahkan ke keranjang.',
      timer: 1000,
      showConfirmButton: false
    });
  }
};

const toggleCart = () => {
  const cartEl = document.getElementById('cart');
  const overlay = document.getElementById('overlay');
  if (!cartEl) return;

  cartEl.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
};

const debounce = (fn, wait = 150) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const refreshMenuFromStorage = debounce(() => {
  try {
    getMenuItems();
    renderMenu();
    updateCartUI();
  } catch (e) {
    console.warn('Failed to refresh menu from storage', e);
  }
}, 120);

window.addEventListener('storage', (event) => {
  if (!event || !event.key) return;
  if (event.key === 'sonlokitchen_menu' || event.key === 'sonlokitchen_menu_sync') {
    refreshMenuFromStorage();
  }
  if (event.key === storageKey) {
    loadCart();
    updateCartUI();
  }
});

// When user focuses or switches back to the tab, refresh to pick up changes
window.addEventListener('focus', refreshMenuFromStorage);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshMenuFromStorage();
});

const orderNow = async () => {
  sanitizeCart();
  if (!cart.length) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Keranjang Kosong',
        text: 'Silakan pilih menu terlebih dahulu sebelum melakukan pemesanan.',
        confirmButtonColor: '#ff5e14'
      });
    } else {
      alert('Keranjang kosong. Silakan pilih menu terlebih dahulu.');
    }
    return;
  }

  const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
  const ewalletNumber = savedSettings.ewalletNumber || '087847712990';
  const waNumber = (savedSettings.waNumber || '6285927326555').replace(/[^0-9]/g, '');
  const storeName = savedSettings.storeName || 'SonloKitchen';

  const orderLines = cart.map((entry) => {
    const product = getProductById(entry.id);
    const name = product ? product.name : 'Menu';
    const price = product ? product.price : 0;
    const subtotal = price * entry.qty;
    return `• ${name} x${entry.qty} (${formatRupiah(subtotal)})`;
  });

  const total = cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);

  // Ambil data pemesan yang tersimpan sebelumnya (jika ada)
  let savedCustomer = {};
  try {
    savedCustomer = JSON.parse(localStorage.getItem('sonlokitchen_customer') || '{}');
  } catch (e) {}

  const defaultName = savedCustomer.name || '';
  const defaultAddress = savedCustomer.address || '';

  let buyerName = '';
  let buyerAddress = '';
  let buyerNote = '';

  if (typeof Swal !== 'undefined') {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: 'Konfirmasi Pesanan',
      html: `
        <div class="swal-order-modal" style="text-align: left; font-size: 0.92rem;">
          <div class="swal-payment-box" style="background: rgba(255, 94, 20, 0.08); border-left: 4px solid #ff5e14; padding: 12px 14px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; font-weight: 600; color: #ff5e14; font-size: 0.88rem;">💳 Pembayaran Transfer / E-Wallet:</p>
            <p class="swal-ewallet-number" style="margin: 4px 0 0; font-size: 1.08rem; font-weight: 800; letter-spacing: 0.5px;">
              ${ewalletNumber}
            </p>
            <p class="swal-ewallet-sub" style="margin: 2px 0 0; font-size: 0.78rem;">(DANA / OVO / GoPay / ShopeePay / Transfer Bank)</p>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem;">Nama Pembeli <span style="color: #ef4444;">*</span></label>
            <input id="swalBuyerName" class="swal2-input" style="width: 100%; margin: 0; padding: 10px 14px; font-size: 0.92rem; box-sizing: border-box; border-radius: 10px;" placeholder="Nama lengkap Anda" value="${defaultName.replace(/"/g, '&quot;')}" />
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem;">Alamat Lengkap Pembeli <span style="color: #ef4444;">*</span></label>
            <textarea id="swalBuyerAddress" class="swal2-textarea" style="width: 100%; height: 80px; margin: 0; padding: 10px 14px; font-size: 0.92rem; box-sizing: border-box; border-radius: 10px;" placeholder="Contoh: Jl. Mawar No. 12, RT 02/05, Purwomartani, Kalasan, Sleman">${defaultAddress}</textarea>
          </div>

          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.88rem;">Catatan Khusus (Opsional)</label>
            <input id="swalBuyerNote" class="swal2-input" style="width: 100%; margin: 0; padding: 10px 14px; font-size: 0.92rem; box-sizing: border-box; border-radius: 10px;" placeholder="Contoh: Sambal dipisah, minta sendok dll." />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Kirim ke WhatsApp 📱',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ff5e14',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const name = (document.getElementById('swalBuyerName')?.value || '').trim();
        const address = (document.getElementById('swalBuyerAddress')?.value || '').trim();
        const note = (document.getElementById('swalBuyerNote')?.value || '').trim();

        if (!name) {
          Swal.showValidationMessage('Mohon isi Nama Pembeli.');
          return false;
        }
        if (!address) {
          Swal.showValidationMessage('Mohon isi Alamat Lengkap Pembeli.');
          return false;
        }

        return { name, address, note };
      }
    });

    if (!isConfirmed || !formValues) return;

    buyerName = formValues.name;
    buyerAddress = formValues.address;
    buyerNote = formValues.note;

    try {
      localStorage.setItem('sonlokitchen_customer', JSON.stringify({ name: buyerName, address: buyerAddress }));
    } catch (e) {}
  } else {
    buyerName = prompt('Nama Pembeli:') || '';
    if (!buyerName) return;
    buyerAddress = prompt('Alamat Lengkap Pengiriman:') || '';
    if (!buyerAddress) return;
    buyerNote = prompt('Catatan Tambahan (opsional):') || '';
  }

  const waLines = [
    `*PESANAN BARU - ${storeName.toUpperCase()}*`,
    `================================`,
    `*Detail Pesanan:*`,
    orderLines.join('\n'),
    `--------------------------------`,
    `*Total Belanja:* ${formatRupiah(total)}`,
    ``,
    `*Data Pembeli:*`,
    `• *Nama:* ${buyerName}`,
    `• *Alamat Pengiriman:* ${buyerAddress}`,
    buyerNote ? `• *Catatan:* ${buyerNote}` : null,
    ``,
    `*Metode Pembayaran (E-Wallet / Rekening):*`,
    `• *No. E-Wallet / Rekening:* ${ewalletNumber}`,
    `  (DANA / OVO / GoPay / ShopeePay / Bank)`,
    ``,
    `Halo ${storeName}, tolong konfirmasi pesanan saya dan estimasi waktu/ongkirnya ya. Bukti transfer akan saya kirimkan ke sini. Terima kasih! 🙏`
  ].filter((line) => line !== null);

  const fullText = waLines.join('\n');
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(fullText)}`, '_blank');
};

const openReviewForm = async () => {
  let review = '';
  if (typeof Swal !== 'undefined') {
    const res = await Swal.fire({
      title: 'Tulis Ulasan',
      input: 'textarea',
      inputLabel: 'Masukkan ulasan Anda',
      inputPlaceholder: 'Contoh: Makanannya enak dan pengirimannya cepat.',
      showCancelButton: true,
      confirmButtonText: 'Kirim ke WhatsApp',
      cancelButtonText: 'Batal'
    });
    review = res.value;
  } else {
    review = prompt('Masukkan ulasan Anda:');
  }

  if (review) {
    const text = `Halo SonloKitchen, saya ingin memberi ulasan: ${review}`;
    window.open(`https://wa.me/6285927326555?text=${encodeURIComponent(text)}`, '_blank');
  }
};

const openTestimonialsModal = () => {
  const testimonialHtml = `
    <div style="text-align:left;">
      <p>“Makanannya enak banget, bumbunya meresap sampai ke tulang! Recommended buat acara kantor.”</p>
      <p>“Pesan tumpeng mini buat ultah anak, hiasannya cantik dan rasanya juara.”</p>
      <p>“Pelayanan ramah dan pengiriman selalu tepat waktu.”</p>
    </div>
  `;

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Testimoni Pelanggan',
      html: testimonialHtml,
      confirmButtonText: 'Tutup'
    });
  } else {
    alert('Testimoni Pelanggan:\n- Budi: Makanannya enak banget!\n- Siti: Tumpeng mini juara!\n- Rina: Pelayanan ramah & on-time.');
  }
};

const initNavigation = () => {
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');
  const themeToggle = document.getElementById('themeToggle');
  const sidebar = document.getElementById('sidebar');

  const openNav = () => {
    if (sidebar) {
      sidebar.classList.add('active');
      sidebar.style.left = '';
    }
    if (overlay) overlay.classList.add('active');
  };

  const closeNav = () => {
    if (sidebar) {
      sidebar.classList.remove('active');
      sidebar.style.left = '';
    }
    if (overlay) overlay.classList.remove('active');
    const cart = document.getElementById('cart');
    if (cart) cart.classList.remove('active');
  };

  if (menuToggle) menuToggle.addEventListener('click', openNav);
  if (closeSidebar) closeSidebar.addEventListener('click', closeNav);
  if (overlay) overlay.addEventListener('click', closeNav);

  if (themeToggle) {
    const applyTheme = (darkMode) => {
      document.body.classList.toggle('dark-mode', darkMode);
      themeToggle.textContent = darkMode ? '☀️' : '🌙';
      localStorage.setItem('sonlokitchen_theme', darkMode ? 'dark' : 'light');
    };

    const savedTheme = localStorage.getItem('sonlokitchen_theme');
    if (savedTheme === 'dark') applyTheme(true);

    themeToggle.addEventListener('click', () => {
      applyTheme(!document.body.classList.contains('dark-mode'));
    });
  }
};

window.toggleCart = toggleCart;
window.orderNow = orderNow;
window.openReviewForm = openReviewForm;
window.openTestimonialsModal = openTestimonialsModal;
window.addToCart = addToCart;
window.renderMenu = renderMenu;
window.updateCartUI = updateCartUI;
window.updateCartBadge = updateCartBadge;
window.applyGlobalSettings = applyGlobalSettings;

// Interaksi pergerakan cahaya ambient mengikuti mouse
window.addEventListener('mousemove', (e) => {
  const x = Math.round((e.clientX / window.innerWidth) * 100);
  const y = Math.round((e.clientY / window.innerHeight) * 100);
  document.documentElement.style.setProperty('--mouse-x', `${x}%`);
  document.documentElement.style.setProperty('--mouse-y', `${y}%`);
}, { passive: true });

// Efek header saat scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 20) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }
}, { passive: true });

/* ─────────────────────────────────────────────────────────
   APPLY GLOBAL SETTINGS FROM ADMIN
   Reads sonlokitchen_settings and updates all pages
───────────────────────────────────────────────────────── */

const SETTINGS_STORAGE_KEY = 'sonlokitchen_settings';

function applyGlobalSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null');
  if (!saved) return;

  const {
    storeName,
    logoUrl,
    openTime,
    closeTime,
    aboutImg,
    aboutStory,
    requestImg,
    mapsEmbed,
    mapsLink,
    mapsLabel
  } = saved;

  // ── Nama Toko ──
  if (storeName) {
    document.querySelectorAll('.logo a span').forEach((el) => {
      el.textContent = storeName;
    });
    const titleMap = {
      'menu.html': `Menu - ${storeName}`,
      'about.html': `Tentang Kami - ${storeName}`,
      'contact.html': `Request - ${storeName}`,
      'home.html': storeName,
      'index.html': storeName
    };
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (titleMap[page]) document.title = titleMap[page];
  }

  // ── Logo ──
  if (logoUrl) {
    document.querySelectorAll('img.logo-img').forEach((img) => {
      img.src = logoUrl;
    });
  }

  // ── Jam Buka / Tutup ──
  if (openTime || closeTime) {
    const open = openTime || '09:00';
    const close = closeTime || '20:00';
    const hoursText = `${open} - ${close}`;
    document.querySelectorAll('.opening-hours').forEach((el) => {
      el.innerHTML = `<i class="bx bx-time"></i> ${hoursText}`;
    });
    document.querySelectorAll('.sidebar-info-item span').forEach((el) => {
      el.textContent = hoursText;
    });
  }

  // ── Foto Tentang Kami (about.html) ──
  const aboutImgEl = document.getElementById('about-img');
  if (aboutImgEl && aboutImg) aboutImgEl.src = aboutImg;

  // ── Keterangan Cerita (about.html) ──
  const aboutStoryEl = document.getElementById('about-story');
  if (aboutStoryEl && aboutStory) aboutStoryEl.textContent = aboutStory;

  // ── Foto Request (contact.html) ──
  const requestImgEl = document.getElementById('request-img');
  if (requestImgEl && requestImg) requestImgEl.src = requestImg;

  // ── Google Maps Embed (about.html) ──
  const mapIframe = document.getElementById('about-map');
  if (mapIframe && mapsEmbed && mapsEmbed.includes('google.com/maps')) {
    mapIframe.src = mapsEmbed;
  }

  // ── Map Link / Petunjuk Arah (about.html) ──
  const mapLinkEl = document.getElementById('about-map-link');
  if (mapLinkEl && mapsLink) mapLinkEl.href = mapsLink;

  // ── Map Label / Alamat (about.html) ──
  const mapLabelEl = document.getElementById('about-map-label');
  if (mapLabelEl && mapsLabel) {
    const iconEl = mapLabelEl.querySelector('i');
    const iconHTML = iconEl ? iconEl.outerHTML : '';
    mapLabelEl.innerHTML = `${iconHTML}<br>${mapsLabel.replace(/\n/g, '<br>')}`;
  }
}

// Re-apply saat settings diubah di tab lain (admin panel)
window.addEventListener('storage', (event) => {
  if (event && event.key === 'sonlokitchen_settings_sync') {
    applyGlobalSettings();
  }
});

/* ─── INISIALISASI HALAMAN ─── */
const initPage = () => {
  initNavigation();
  renderMenu();
  updateCartUI();
  applyGlobalSettings();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

