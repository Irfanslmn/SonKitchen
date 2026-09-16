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

const menuState = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultMenu;

const loginBox = document.getElementById('loginBox');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const menuEditor = document.getElementById('menuEditor');
const saveMenuBtn = document.getElementById('saveMenuBtn');
const logoutBtn = document.getElementById('logoutBtn');

function showPanel() {
  loginBox.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

function showLogin() {
  loginBox.classList.remove('hidden');
  adminPanel.classList.add('hidden');
}

function persistMenu(menu) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
  localStorage.setItem('sonlokitchen_menu', JSON.stringify(menu));
}

function renderEditor() {
  menuEditor.innerHTML = '';

  menuState.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'editor-item';
    card.innerHTML = `
      <div class="editor-row">
        <label>
          <span>Nama Menu</span>
          <input type="text" data-index="${index}" data-field="name" value="${item.name}" />
        </label>
        <label>
          <span>Kategori</span>
          <input type="text" data-index="${index}" data-field="category" value="${item.category}" />
        </label>
      </div>
      <div class="editor-row">
        <label>
          <span>Harga</span>
          <input type="number" data-index="${index}" data-field="price" value="${item.price}" />
        </label>
        <label>
          <span>Gambar</span>
          <input type="text" data-index="${index}" data-field="image" value="${item.image}" />
        </label>
      </div>
      <label>
        <span>Deskripsi</span>
        <textarea rows="3" data-index="${index}" data-field="desc">${item.desc}</textarea>
      </label>
    `;
    menuEditor.appendChild(card);
  });

  menuEditor.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', (event) => {
      const { index, field: fieldName } = event.target.dataset;
      menuState[index][fieldName] = event.target.value;
    });
  });
}

function loginAdmin(event) {
  event.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const pin = document.getElementById('adminPin').value.trim();

  if (username === ADMIN_USER && pin === ADMIN_PIN) {
    loginError.textContent = '';
    showPanel();
    renderEditor();
  } else {
    loginError.textContent = 'Username atau PIN salah.';
  }
}

function saveMenu() {
  persistMenu(menuState);
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', loginAdmin);
logoutBtn.addEventListener('click', () => {
  showLogin();
  loginForm.reset();
});
saveMenuBtn.addEventListener('click', saveMenu);

if (localStorage.getItem('sonlokitchen_admin_logged_in') === 'true') {
  showPanel();
  renderEditor();
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const pin = document.getElementById('adminPin').value.trim();

  if (username === ADMIN_USER && pin === ADMIN_PIN) {
    localStorage.setItem('sonlokitchen_admin_logged_in', 'true');
    showPanel();
    renderEditor();
  } else {
    loginError.textContent = 'Username atau PIN salah.';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('sonlokitchen_admin_logged_in');
  showLogin();
  loginForm.reset();
});
