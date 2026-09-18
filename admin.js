const ADMIN_USER = 'admin';
const ADMIN_PIN = '1234';
const STORAGE_KEY = 'sonlokitchen_menu_admin';
const SETTINGS_KEY = 'sonlokitchen_settings';

const defaultSettings = {
  storeName: 'SonloKitchen',
  logoUrl: 'images/logo-sonlokitchen.webp',
  openTime: '09:00',
  closeTime: '20:00',
  aboutImg: 'images/Dewi.jpeg',
  aboutStory: 'Berdiri sejak tahun 2020, SonloKitchen bermula dari usaha rumahan kecil yang berkomitmen menyediakan masakan rumahan yang lezat dan higienis. Dengan resep turun-temurun dan bahan-bahan pilihan, kami kini melayani pesanan.',
  requestImg: 'images/Dewi.jpeg',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.208045664922!2d110.45098259999999!3d-7.767749499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5a4072ea3637%3A0x6dac61e093655510!2sJl.%20Mawar%2C%20Purwomartani%2C%20Kec.%20Kalasan%2C%20Kabupaten%20Sleman%2C%20Daerah%20Istimewa%20Yogyakarta%2055571!5e0!3m2!1sen!2sid!4v1768652708181!5m2!1sen!2sid',
  mapsLink: 'https://maps.app.goo.gl/tS2TLrZFGtr9ucUD9',
  mapsLabel: 'SonloKitchen Kalasan\nKalasan, Kab. Sleman, D.I. Yogyakarta'
};

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

const menuState = (() => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (Array.isArray(saved) && saved.length) return saved;

  const fallback = JSON.parse(localStorage.getItem('sonlokitchen_menu') || 'null');
  if (Array.isArray(fallback) && fallback.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMenu));
  localStorage.setItem('sonlokitchen_menu', JSON.stringify(defaultMenu));
  return defaultMenu;
})();

let activeEditIndex = null;
let uploadedImage = '';

const loginBox = document.getElementById('loginBox');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const menuEditor = document.getElementById('menuEditor');
const saveMenuBtn = document.getElementById('saveMenuBtn');
const logoutBtn = document.getElementById('logoutBtn');
const newItemBtn = document.getElementById('newItemBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const menuForm = document.getElementById('menuForm');
const formTitle = document.getElementById('formTitle');
const deleteActiveBtn = document.getElementById('deleteActiveBtn');
const menuCount = document.getElementById('menuCount');
const categoryCount = document.getElementById('categoryCount');
const lastSavedLabel = document.getElementById('lastSavedLabel');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const previewMenuBtn = document.getElementById('previewMenuBtn');
const imageDropzone = document.getElementById('imageDropzone');
const imageInput = document.getElementById('imageInput');
const menuImageUrl = document.getElementById('menuImageUrl');
const imagePreview = document.getElementById('imagePreview');

function persistMenu(menu) {
  const finalMenu = Array.isArray(menu) ? menu : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMenu));
  localStorage.setItem('sonlokitchen_menu', JSON.stringify(finalMenu));
  localStorage.setItem('sonlokitchen_menu_sync', String(Date.now()));
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (lastSavedLabel) {
    lastSavedLabel.textContent = timestamp;
  }
  localStorage.setItem('sonlokitchen_last_saved', timestamp);
}

function notifyAndGoToMenu(title, text, icon = 'success') {
  Swal.fire({
    icon,
    title,
    text,
    timer: 1500,
    showConfirmButton: false,
    allowOutsideClick: false,
    timerProgressBar: true
  }).then(() => {
    window.location.href = 'menu.html';
  });
}

function updateStats() {
  const categories = new Set(menuState.map((item) => item.category).filter(Boolean));
  menuCount.textContent = String(menuState.length);
  categoryCount.textContent = String(categories.size);

  const saved = localStorage.getItem('sonlokitchen_last_saved');
  if (saved) {
    lastSavedLabel.textContent = saved;
  }
}

function showPanel() {
  loginBox.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  document.body.classList.add('panel-visible');
}

function showLogin() {
  loginBox.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  document.body.classList.remove('panel-visible');
}

function resetForm() {
  activeEditIndex = null;
  uploadedImage = '';
  menuForm.reset();
  menuImageUrl.value = '';
  imagePreview.src = '';
  imagePreview.classList.add('hidden');
  formTitle.textContent = 'Tambah Menu Baru';
  deleteActiveBtn.classList.add('hidden');
}

function setActiveForm(item) {
  activeEditIndex = menuState.findIndex((menuItem) => menuItem.id === item.id);
  formTitle.textContent = 'Edit Menu';
  deleteActiveBtn.classList.remove('hidden');
  document.getElementById('menuName').value = item.name || '';
  document.getElementById('menuCategory').value = item.category || '';
  document.getElementById('menuPrice').value = item.price || 0;
  document.getElementById('menuDesc').value = item.desc || '';
  menuImageUrl.value = item.image || '';
  uploadedImage = item.image || '';
  if (item.image) {
    imagePreview.src = item.image;
    imagePreview.classList.remove('hidden');
  } else {
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
  }
}

function populateCategoryFilter() {
  if (!categoryFilter) return;

  const categories = [...new Set(menuState.map((item) => item.category).filter(Boolean))];
  const selected = categoryFilter.value || 'all';
  const previous = categoryFilter.value;

  categoryFilter.innerHTML = '<option value="all">Semua kategori</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join('');

  if (categories.includes(previous)) {
    categoryFilter.value = previous;
  } else {
    categoryFilter.value = selected;
  }
}

function renderEditor() {
  menuEditor.innerHTML = '';
  populateCategoryFilter();

  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filteredMenu = menuState.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword);
    return matchesCategory && matchesKeyword;
  });

  if (!filteredMenu.length) {
    menuEditor.innerHTML = '<div class="empty-state">Belum ada menu yang sesuai dengan pencarian atau kategori ini.</div>';
    return;
  }

  filteredMenu.forEach((item, originalIndex) => {
    const index = menuState.findIndex((menuItem) => menuItem.id === item.id);
    const card = document.createElement('div');
    card.className = 'editor-item';
    if (activeEditIndex === index) card.classList.add('is-selected');
    card.innerHTML = `
      <div class="editor-thumb-wrap">
        <img src="${item.image || 'images/placeholder-food.webp'}" alt="${item.name}" class="editor-thumb" onerror="this.src='images/placeholder-food.webp'" />
      </div>
      <div class="editor-content">
        <div class="editor-header-row">
          <div>
            <h4>${item.name}</h4>
            <span>${item.category}</span>
          </div>
          <strong>Rp ${Number(item.price).toLocaleString('id-ID')}</strong>
        </div>
        <p>${item.desc}</p>
        <div class="editor-action-row">
          <button type="button" class="mini-btn edit-btn" data-index="${index}">Edit</button>
          <button type="button" class="danger-btn delete-btn" data-index="${index}">Hapus</button>
        </div>
      </div>
    `;

    menuEditor.appendChild(card);
  });

  menuEditor.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      setActiveForm(menuState[index]);
      renderEditor();
    });
  });

  menuEditor.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      const target = menuState[index];
      if (!target) return;

      const confirmed = window.confirm(`Hapus menu "${target.name}"?`);
      if (!confirmed) return;

      menuState.splice(index, 1);
      resetForm();
      saveCurrentMenu({
        notify: true,
        title: 'Berhasil dihapus',
        text: 'Menu telah berhasil dihapus dari daftar utama.',
        redirect: true
      });
    });
  });
}

function handleFileSelection(file) {
  if (!file || !file.type.startsWith('image/')) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    menuImageUrl.value = uploadedImage;
    imagePreview.src = uploadedImage;
    imagePreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function saveCurrentMenu(options = {}) {
  const { notify = false, title = 'Berhasil disimpan', text = 'Perubahan menu telah diperbarui di daftar utama.', redirect = false } = options;

  persistMenu(menuState);
  updateStats();
  renderEditor();

  if (notify) {
    if (redirect) {
      notifyAndGoToMenu(title, text, 'success');
    } else {
      Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
        timerProgressBar: true
      });
    }
  }
}

function addOrUpdateMenu(event) {
  if (event) {
    event.preventDefault();
  }

  const name = document.getElementById('menuName').value.trim();
  const category = document.getElementById('menuCategory').value.trim();
  const price = Number(document.getElementById('menuPrice').value || 0);
  const desc = document.getElementById('menuDesc').value.trim();
  const imageValue = (menuImageUrl.value || uploadedImage || '').trim();

  if (!name || !category || !desc || !price) {
    Swal.fire({
      icon: 'warning',
      title: 'Data belum lengkap',
      text: 'Nama, kategori, harga, dan deskripsi harus diisi.'
    });
    return;
  }

  const product = {
    id: activeEditIndex !== null ? menuState[activeEditIndex].id : `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
    name,
    category,
    price,
    image: imageValue || 'images/placeholder-food.webp',
    desc
  };

  if (activeEditIndex !== null && menuState[activeEditIndex]) {
    menuState[activeEditIndex] = product;
  } else {
    menuState.unshift(product);
  }

  const actionText = activeEditIndex !== null ? 'Menu berhasil diperbarui.' : 'Menu baru berhasil ditambahkan.';
  const updatedIndex = menuState.findIndex((item) => item.id === product.id);

  if (updatedIndex >= 0) {
    menuState.splice(updatedIndex, 1, product);
  } else {
    menuState.unshift(product);
  }

  resetForm();
  saveCurrentMenu({ notify: true, title: 'Berhasil', text: actionText, redirect: false });
}

function loginAdmin(event) {
  event.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const pin = document.getElementById('adminPin').value.trim();

  if (username === ADMIN_USER && pin === ADMIN_PIN) {
    localStorage.setItem('sonlokitchen_admin_logged_in', 'true');
    loginError.textContent = '';
    showPanel();
    renderEditor();
    updateStats();
  } else {
    loginError.textContent = 'Username atau PIN salah.';
  }
}

loginForm.addEventListener('submit', loginAdmin);
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('sonlokitchen_admin_logged_in');
  showLogin();
  loginForm.reset();
  loginError.textContent = '';
});

newItemBtn.addEventListener('click', () => {
  resetForm();
  renderEditor();
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
  renderEditor();
});

categoryFilter.addEventListener('change', () => {
  renderEditor();
});

searchInput.addEventListener('input', () => {
  renderEditor();
});

previewMenuBtn.addEventListener('click', () => {
  window.location.href = 'menu.html';
});

saveMenuBtn.addEventListener('click', () => {
  const hasDraftValues = document.getElementById('menuName').value.trim() || document.getElementById('menuCategory').value.trim() || document.getElementById('menuDesc').value.trim() || document.getElementById('menuPrice').value;
  if (hasDraftValues) {
    addOrUpdateMenu();
    return;
  }

  saveCurrentMenu({
    notify: true,
    title: 'Berhasil disimpan',
    text: 'Perubahan menu telah diperbarui di daftar utama.',
    redirect: false
  });
});

menuForm.addEventListener('submit', addOrUpdateMenu);

deleteActiveBtn.addEventListener('click', () => {
  if (activeEditIndex === null) return;
  const target = menuState[activeEditIndex];
  if (!target) return;

  const confirmed = window.confirm(`Hapus menu "${target.name}"?`);
  if (!confirmed) return;

  menuState.splice(activeEditIndex, 1);
  resetForm();
  saveCurrentMenu({
    notify: true,
    title: 'Berhasil dihapus',
    text: 'Menu telah berhasil dihapus dari daftar utama.',
    redirect: false
  });
});

imageDropzone.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  handleFileSelection(file);
});

['dragenter', 'dragover'].forEach((eventName) => {
  imageDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageDropzone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  imageDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    imageDropzone.classList.remove('drag-over');
  });
});

imageDropzone.addEventListener('drop', (event) => {
  const file = event.dataTransfer?.files?.[0];
  handleFileSelection(file);
});

imageDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    imageInput.click();
  }
});

menuImageUrl.addEventListener('input', (event) => {
  const value = event.target.value.trim();
  uploadedImage = value;
  if (value) {
    imagePreview.src = value;
    imagePreview.classList.remove('hidden');
  } else if (!uploadedImage) {
    imagePreview.classList.add('hidden');
  }
});

if (localStorage.getItem('sonlokitchen_admin_logged_in') === 'true') {
  showPanel();
  renderEditor();
  updateStats();
}

resetForm();
updateStats();

/* ─────────────────────────────────────────────────────────
   SETTINGS MANAGEMENT
───────────────────────────────────────────────────────── */

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
  return Object.assign({}, defaultSettings, saved || {});
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem('sonlokitchen_settings_sync', String(Date.now()));
}

function convertMapsLinkToEmbed(link) {
  if (!link) return null;

  // Already an embed URL
  if (link.includes('google.com/maps/embed')) return link;

  // Short share link: https://maps.app.goo.gl/...
  // or https://goo.gl/maps/...
  // We'll store the share link and construct embed from it
  // Google Maps short links can't be directly embedded, but we can try
  // to get the place ID from URL or just return null to indicate we need full embed
  if (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps')) {
    // Return a flag that we need to use the share link as-is for the href button
    // but for embed we need the full URL
    return '__shortlink__';
  }

  // Full google maps URL: https://www.google.com/maps/place/...
  if (link.includes('google.com/maps')) {
    // Try to extract coordinates or place for embed
    const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1`;
    }
    // Convert /place/ URL to embed
    const placeMatch = link.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      const query = placeMatch[1];
      return `https://www.google.com/maps/embed/v1/place?key=&q=${query}`;
    }
  }

  return null;
}

function populateSettingsForm() {
  const s = loadSettings();

  const el = (id) => document.getElementById(id);

  if (el('set-storeName')) el('set-storeName').value = s.storeName || '';
  if (el('set-logoUrl')) el('set-logoUrl').value = s.logoUrl || '';
  if (el('set-logoPreview')) el('set-logoPreview').src = s.logoUrl || 'images/logo-sonlokitchen.webp';
  if (el('set-openTime')) el('set-openTime').value = s.openTime || '09:00';
  if (el('set-closeTime')) el('set-closeTime').value = s.closeTime || '20:00';
  if (el('set-aboutImg')) el('set-aboutImg').value = s.aboutImg || '';
  if (el('set-aboutImgPreview')) el('set-aboutImgPreview').src = s.aboutImg || 'images/Dewi.jpeg';
  if (el('set-aboutStory')) el('set-aboutStory').value = s.aboutStory || '';
  if (el('set-requestImg')) el('set-requestImg').value = s.requestImg || '';
  if (el('set-requestImgPreview')) el('set-requestImgPreview').src = s.requestImg || 'images/Dewi.jpeg';
  if (el('set-mapsLink')) el('set-mapsLink').value = s.mapsLink || '';
  if (el('set-mapsLabel')) el('set-mapsLabel').value = s.mapsLabel || '';
  updateHoursPreview(s.openTime || '09:00', s.closeTime || '20:00');
}

function updateHoursPreview(open, close) {
  const preview = document.getElementById('hours-preview-text');
  if (preview) preview.textContent = `${open} - ${close}`;
}

function initSettingsHandlers() {
  const el = (id) => document.getElementById(id);

  // Hours preview live update
  const openInput = el('set-openTime');
  const closeInput = el('set-closeTime');
  if (openInput) openInput.addEventListener('input', () => updateHoursPreview(openInput.value, closeInput?.value || ''));
  if (closeInput) closeInput.addEventListener('input', () => updateHoursPreview(openInput?.value || '', closeInput.value));

  // Logo upload
  const logoUploadBtn = el('set-logoUploadBtn');
  const logoInput = el('set-logoInput');
  const logoPreview = el('set-logoPreview');
  const logoUrlInput = el('set-logoUrl');
  if (logoUploadBtn && logoInput) {
    logoUploadBtn.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        if (logoPreview) logoPreview.src = result;
        if (logoUrlInput) logoUrlInput.value = result;
      };
      reader.readAsDataURL(file);
    });
  }
  if (logoUrlInput && logoPreview) {
    logoUrlInput.addEventListener('input', () => {
      if (logoUrlInput.value) logoPreview.src = logoUrlInput.value;
    });
  }

  // About image upload
  const aboutImgUploadBtn = el('set-aboutImgUploadBtn');
  const aboutImgInput = el('set-aboutImgInput');
  const aboutImgPreview = el('set-aboutImgPreview');
  const aboutImgUrl = el('set-aboutImg');
  if (aboutImgUploadBtn && aboutImgInput) {
    aboutImgUploadBtn.addEventListener('click', () => aboutImgInput.click());
    aboutImgInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        if (aboutImgPreview) aboutImgPreview.src = result;
        if (aboutImgUrl) aboutImgUrl.value = result;
      };
      reader.readAsDataURL(file);
    });
  }
  if (aboutImgUrl && aboutImgPreview) {
    aboutImgUrl.addEventListener('input', () => {
      if (aboutImgUrl.value) aboutImgPreview.src = aboutImgUrl.value;
    });
  }

  // Request image upload
  const requestImgUploadBtn = el('set-requestImgUploadBtn');
  const requestImgInput = el('set-requestImgInput');
  const requestImgPreview = el('set-requestImgPreview');
  const requestImgUrl = el('set-requestImg');
  if (requestImgUploadBtn && requestImgInput) {
    requestImgUploadBtn.addEventListener('click', () => requestImgInput.click());
    requestImgInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        if (requestImgPreview) requestImgPreview.src = result;
        if (requestImgUrl) requestImgUrl.value = result;
      };
      reader.readAsDataURL(file);
    });
  }
  if (requestImgUrl && requestImgPreview) {
    requestImgUrl.addEventListener('input', () => {
      if (requestImgUrl.value) requestImgPreview.src = requestImgUrl.value;
    });
  }

  // Maps link apply
  const mapsApplyBtn = el('set-mapsApplyBtn');
  const mapsLinkInput = el('set-mapsLink');
  const mapsStatus = el('maps-status');
  if (mapsApplyBtn && mapsLinkInput) {
    mapsApplyBtn.addEventListener('click', () => {
      const link = mapsLinkInput.value.trim();
      if (!link) return;
      const result = convertMapsLinkToEmbed(link);
      if (result === '__shortlink__') {
        if (mapsStatus) {
          mapsStatus.innerHTML = '✅ Link share Google Maps berhasil disimpan. <small>Catatan: Link share pendek (goo.gl) tidak bisa ditampilkan sebagai peta embed. Untuk peta embed, gunakan link "Embed a map" dari Google Maps.</small>';
          mapsStatus.className = 'maps-status maps-status-warn';
        }
      } else if (result) {
        if (mapsStatus) {
          mapsStatus.innerHTML = '✅ Link berhasil dikonversi ke format embed!';
          mapsStatus.className = 'maps-status maps-status-ok';
        }
        mapsLinkInput.value = result;
      } else {
        if (mapsStatus) {
          mapsStatus.innerHTML = '⚠️ Format link tidak dikenali. Gunakan link dari Google Maps → Bagikan → Sematkan Peta (embed).';
          mapsStatus.className = 'maps-status maps-status-error';
        }
      }
    });
  }

  // Save settings
  const saveSettingsBtn = el('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const rawMapsLink = el('set-mapsLink')?.value.trim() || '';
      const rawMapsLabel = el('set-mapsLabel')?.value.trim() || '';

      // Bedakan: jika link adalah embed URL → simpan sebagai mapsEmbed
      // jika link adalah share link (goo.gl) → simpan sebagai mapsLink saja
      let mapsEmbed = defaultSettings.mapsEmbed;
      let mapsLink = defaultSettings.mapsLink;

      if (rawMapsLink) {
        if (rawMapsLink.includes('google.com/maps/embed')) {
          // Ini sudah format embed, gunakan untuk iframe
          mapsEmbed = rawMapsLink;
          mapsLink = rawMapsLink; // juga bisa untuk link
        } else if (rawMapsLink.includes('maps.app.goo.gl') || rawMapsLink.includes('goo.gl/maps')) {
          // Ini share link, gunakan untuk tombol petunjuk arah saja
          mapsLink = rawMapsLink;
          // mapsEmbed tetap pakai yang sudah ada
          const prevSettings = loadSettings();
          mapsEmbed = prevSettings.mapsEmbed;
        } else if (rawMapsLink.includes('google.com/maps')) {
          // Full maps URL, coba ekstrak koordinat untuk embed
          const coordMatch = rawMapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            mapsEmbed = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1`;
          }
          mapsLink = rawMapsLink;
        }
      }

      const settings = {
        storeName: el('set-storeName')?.value.trim() || defaultSettings.storeName,
        logoUrl: el('set-logoUrl')?.value.trim() || defaultSettings.logoUrl,
        openTime: el('set-openTime')?.value || defaultSettings.openTime,
        closeTime: el('set-closeTime')?.value || defaultSettings.closeTime,
        aboutImg: el('set-aboutImg')?.value.trim() || defaultSettings.aboutImg,
        aboutStory: el('set-aboutStory')?.value.trim() || defaultSettings.aboutStory,
        requestImg: el('set-requestImg')?.value.trim() || defaultSettings.requestImg,
        mapsLink,
        mapsEmbed,
        mapsLabel: rawMapsLabel || defaultSettings.mapsLabel,
      };
      saveSettings(settings);
      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Disimpan!',
        text: 'Semua perubahan berhasil disimpan dan akan tampil di website.',
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true
      });
    });
  }
}

// Tab switching
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    const targetId = `tab-${tab.dataset.tab}`;
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.classList.add('active');
    if (tab.dataset.tab === 'settings') populateSettingsForm();
  });
});

initSettingsHandlers();
