// Variables globales
let isAdmin = false;
const adminEmail = 'admin@informateperu.com';
const adminPassword = 'admin123';

// Elementos del DOM
const loginModal = document.getElementById('loginModal');
const editModal = document.getElementById('editModal');
const uploadModal = document.getElementById('uploadModal');
const loginForm = document.getElementById('loginForm');
const editForm = document.getElementById('editForm');
const uploadForm = document.getElementById('uploadForm');
const adminLink = document.getElementById('adminLink');
const welcomeMessage = document.getElementById('welcomeMessage');
const uploadButton = document.getElementById('uploadButton');

// Evento para detectar la tecla F2
document.addEventListener('keydown', function(event) {
    if (event.key === 'F2') {
        showLoginModal();
    }
});

// Función para mostrar el modal de login
function showLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

// Evento de envío del formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === adminPassword) {
            isAdmin = true;
            if (loginModal) {
                loginModal.style.display = 'none';
            }
            enableAdminMode();
        } else {
            alert('Contraseña incorrecta');
        }
    });
}

// Función para habilitar el modo administrador
function enableAdminMode() {
    const newsItems = document.querySelectorAll('.news-item');
    newsItems.forEach(item => {
        item.classList.add('editable');
        item.addEventListener('click', function() {
            if (isAdmin) {
                showEditModal(item);
            }
        });
    });

    if (uploadButton) {
        uploadButton.style.display = 'block';
    }

    if (adminLink) {
        adminLink.style.display = 'inline-block';
    }

    if (welcomeMessage) {
        welcomeMessage.textContent = '¡Bienvenido, Administrador!';
        welcomeMessage.style.display = 'block';
    }
}

// Función para mostrar el modal de edición
function showEditModal(item) {
    if (editModal) {
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        const imageUrl = item.querySelector('img').src;

        const editTitleInput = document.getElementById('editTitle');
        const editDescriptionInput = document.getElementById('editDescription');

        if (editTitleInput) editTitleInput.value = title;
        if (editDescriptionInput) editDescriptionInput.value = description;

        if (editForm) {
            editForm.onsubmit = function(e) {
                e.preventDefault();
                updateContent(item);
            };
        }

        editModal.style.display = 'block';
    }
}

// Función para actualizar el contenido
function updateContent(item) {
    const newTitle = document.getElementById('editTitle').value;
    const newDescription = document.getElementById('editDescription').value;
    const newImage = document.getElementById('editImage').files[0];

    item.querySelector('h3').textContent = newTitle;
    item.querySelector('p').textContent = newDescription;

    if (newImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            item.querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(newImage);
    }

    if (editModal) {
        editModal.style.display = 'none';
    }
}

// Función para mostrar el modal de subida de contenido
function showUploadModal() {
    if (uploadModal) {
        uploadModal.style.display = 'block';
    }
}

// Evento de envío del formulario de subida
if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('uploadTitle').value;
        const description = document.getElementById('uploadDescription').value;
        const image = document.getElementById('uploadImage').files[0];

        if (image) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addNewPost(title, description, e.target.result);
            };
            reader.readAsDataURL(image);
        } else {
            addNewPost(title, description, '/placeholder.svg?height=200&width=300');
        }

        if (uploadModal) {
            uploadModal.style.display = 'none';
        }
    });
}

// Función para añadir un nuevo post
function addNewPost(title, description, imageUrl) {
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
        const newPost = document.createElement('div');
        newPost.className = 'news-item';
        newPost.innerHTML = `
            <img src="${imageUrl}" alt="${title}">
            <h3>${title}</h3>
            <p>${description}</p>
        `;
        newsGrid.prepend(newPost);
    }
}

// Cerrar modales al hacer clic en la X
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Funcionalidad del slider de noticias
const slider = document.querySelector('.slider-container');
const prevBtn = document.querySelector('.slider-nav.prev');
const nextBtn = document.querySelector('.slider-nav.next');
let slideIndex = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.slider-container .news-item');
    const totalPairs = Math.ceil(slides.length / 2);
    
    if (slides.length > 0) {
        // Ensure index stays within bounds
        slideIndex = ((index % totalPairs) + totalPairs) % totalPairs;
        const offset = -slideIndex * 100;
        if (slider) {
            slider.style.transform = `translateX(${offset}%)`;
        }
    }
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(slideIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(slideIndex + 1));
}

// Cambiar slide automáticamente cada 5 segundos
setInterval(() => showSlide(slideIndex + 1), 5000);

// Actualizar la fecha actual
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('es-ES', options);
    }
}

updateCurrentDate();

// Evento para mostrar el modal de subida de contenido
if (uploadButton) {
    uploadButton.addEventListener('click', showUploadModal);
}

// Código para el cambio de tema
const themeToggle = document.querySelector('.theme-toggle');
let isDarkTheme = localStorage.getItem('theme') === 'dark';

function setTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    setTheme(isDarkTheme);
}

themeToggle.addEventListener('click', toggleTheme);




