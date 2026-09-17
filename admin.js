const ADMIN_USER = 'admin';
const ADMIN_PIN = '1234';
const STORAGE_KEY = 'sonlokitchen_menu_admin';

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
}

function showLogin() {
  loginBox.classList.remove('hidden');
  adminPanel.classList.add('hidden');
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
