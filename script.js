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

const menuItems = JSON.parse(localStorage.getItem('sonlokitchen_menu') || 'null') || defaultMenu;

const storageKey = 'sonlokitchen_cart';
let cart = JSON.parse(localStorage.getItem(storageKey) || '[]');

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
};

const saveCart = () => {
  localStorage.setItem(storageKey, JSON.stringify(cart));
};

const getProductById = (id) => menuItems.find((item) => item.id === id);

const renderMenu = () => {
  const menuList = document.getElementById('menuList');
  if (!menuList) return;

  menuList.innerHTML = menuItems.map((item) => `
    <article class="menu-card">
      <img src="${item.image}" alt="${item.name}" class="menu-image">
      <div class="menu-info">
        <div class="menu-top">
          <span class="menu-category">${item.category}</span>
          <h4>${item.name}</h4>
        </div>
        <p>${item.desc}</p>
        <div class="menu-bottom">
          <strong>${formatRupiah(item.price)}</strong>
          <button class="add-btn" data-id="${item.id}">Tambah</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.id);
    });
  });
};

const updateCartUI = () => {
  const cartItemsEl = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const cartCountEl = document.getElementById('cartCount');

  if (!cartItemsEl || !totalPriceEl || !cartCountEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<li class="empty-cart">Keranjang masih kosong.</li>';
    totalPriceEl.textContent = '0';
    cartCountEl.textContent = '0';
    return;
  }

  const details = cart.map((entry) => {
    const product = getProductById(entry.id);
    if (!product) return null;
    return `
      <li>
        <span>${product.name} x${entry.qty}</span>
        <span>${formatRupiah(product.price * entry.qty)}</span>
      </li>
    `;
  }).filter(Boolean).join('');

  const total = cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);

  cartItemsEl.innerHTML = details;
  totalPriceEl.textContent = total.toLocaleString('id-ID');
  cartCountEl.textContent = cart.reduce((count, item) => count + item.qty, 0);
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

  Swal.fire({
    icon: 'success',
    title: 'Ditambahkan',
    text: 'Menu berhasil ditambahkan ke keranjang.',
    timer: 1000,
    showConfirmButton: false
  });
};

const toggleCart = () => {
  const cartEl = document.getElementById('cart');
  const overlay = document.getElementById('overlay');
  if (!cartEl) return;

  cartEl.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
};

const orderNow = () => {
  if (!cart.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Keranjang kosong',
      text: 'Silakan pilih menu terlebih dahulu.'
    });
    return;
  }

  const message = cart.map((entry) => {
    const product = getProductById(entry.id);
    return `${product ? product.name : 'Menu'} x${entry.qty}`;
  }).join(', ');

  const total = cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);

  const text = `Halo SonloKitchen, saya mau pesan: ${message}. Total sekitar ${formatRupiah(total)}.`;
  window.open(`https://wa.me/6285927326555?text=${encodeURIComponent(text)}`, '_blank');
};

const openReviewForm = async () => {
  const { value: review } = await Swal.fire({
    title: 'Tulis Ulasan',
    input: 'textarea',
    inputLabel: 'Masukkan ulasan Anda',
    inputPlaceholder: 'Contoh: Makanannya enak dan pengirimannya cepat.',
    showCancelButton: true,
    confirmButtonText: 'Kirim ke WhatsApp',
    cancelButtonText: 'Batal'
  });

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

  Swal.fire({
    title: 'Testimoni Pelanggan',
    html: testimonialHtml,
    confirmButtonText: 'Tutup'
  });
};

const initNavigation = () => {
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');
  const themeToggle = document.getElementById('themeToggle');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.style.left = '0';
      if (overlay) overlay.classList.add('active');
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.style.left = '-260px';
      if (overlay) overlay.classList.remove('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.style.left = '-260px';
      overlay.classList.remove('active');
      const cart = document.getElementById('cart');
      if (cart) cart.classList.remove('active');
    });
  }

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

const initPage = () => {
  initNavigation();
  renderMenu();
  updateCartUI();
};

document.addEventListener('DOMContentLoaded', initPage);

window.toggleCart = toggleCart;
window.orderNow = orderNow;
window.openReviewForm = openReviewForm;
window.openTestimonialsModal = openTestimonialsModal;
