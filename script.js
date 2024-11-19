// Elementos del DOM
const homePage = document.getElementById('homePage');
const adminLoginPage = document.getElementById('adminLoginPage');
const userLoginPage = document.getElementById('userLoginPage');
const forumPage = document.getElementById('forumPage');
const adminControls = document.getElementById('adminControls');
const welcomeMessage = document.getElementById('welcomeMessage');
const postsContainer = document.getElementById('posts');

// Botones
const adminButton = document.getElementById('adminButton');
const userButton = document.getElementById('userButton');
const adminLoginButton = document.getElementById('adminLoginButton');
const userLoginButton = document.getElementById('userLoginButton');
const logoutButton = document.getElementById('logoutButton');
const postButton = document.getElementById('postButton');

// Inputs
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const userUsername = document.getElementById('userUsername');
const postContent = document.getElementById('postContent');

let currentUser = null;
let isAdmin = false;

// Eventos de los botones
adminButton.addEventListener('click', () => showPage(adminLoginPage));
userButton.addEventListener('click', () => showPage(userLoginPage));
adminLoginButton.addEventListener('click', handleAdminLogin);
userLoginButton.addEventListener('click', handleUserLogin);
logoutButton.addEventListener('click', handleLogout);
postButton.addEventListener('click', handlePost);

// Verificar sesión al cargar la página
window.addEventListener('load', checkSession);

// Funciones de manejo de páginas
function showPage(page) {
    [homePage, adminLoginPage, userLoginPage, forumPage].forEach(p => p.classList.add('hidden'));
    page.classList.remove('hidden');
}

function handleAdminLogin() {
    const username = adminUsername.value.trim();
    const password = adminPassword.value;
    if (username === 'admin' && password === 'password') {
        currentUser = username;
        isAdmin = true;
        saveSession();
        showForumPage();
    } else {
        alert('Credenciales incorrectas');
    }
}

function handleUserLogin() {
    const username = userUsername.value.trim();
    if (username) {
        currentUser = username;
        isAdmin = false;
        saveSession();
        showForumPage();
    } else {
        alert('Por favor, ingrese un nombre de usuario');
    }
}

function showForumPage() {
    showPage(forumPage);
    welcomeMessage.textContent = `Bienvenido, ${currentUser}`;
    adminControls.classList.toggle('hidden', !isAdmin);
    loadPosts();
}

function handleLogout() {
    currentUser = null;
    isAdmin = false;
    clearSession();
    showPage(homePage);
}

// Funciones de manejo de sesión
function saveSession() {
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('isAdmin', isAdmin);
}

function clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
}

function checkSession() {
    currentUser = localStorage.getItem('currentUser');
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (currentUser) {
        showForumPage();
    }
}

// Funciones de manejo de posts
async function handlePost() {
    const content = postContent.value.trim();
    if (content && isAdmin) {
        try {
            const postsRef = window.databaseRef(window.database, 'posts');
            await window.databasePush(postsRef, {
                author: currentUser,
                content: content,
                timestamp: Date.now(),
                likes: 0
            });
            postContent.value = '';
            console.log('Post publicado exitosamente');
        } catch (error) {
            console.error('Error al publicar:', error);
            alert('Error al publicar el contenido. Por favor, intente nuevamente.');
        }
    }
}

function loadPosts() {
    const postsRef = window.databaseRef(window.database, 'posts');
    window.databaseOnValue(postsRef, (snapshot) => {
        postsContainer.innerHTML = '';
        const posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        posts.sort((a, b) => b.timestamp - a.timestamp);

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    });
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const date = new Date(post.timestamp);

    postElement.innerHTML = `
        <div class="post-header">
            <span class="post-author">${post.author}</span>
            <span class="post-date">${date.toLocaleString('es-PE')}</span>
        </div>
        <p class="post-content">${post.content}</p>
        <div class="post-actions">
            <button class="btn btn-like" data-post-id="${post.id}">
                <i class="fas fa-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
            </button>
        </div>
        <div class="comments"></div>
        <form class="comment-form">
            <input type="text" placeholder="Añade un comentario..." required>
            <button type="submit" class="btn btn-primary">Comentar</button>
        </form>
    `;

    const likeButton = postElement.querySelector('.btn-like');
    likeButton.addEventListener('click', () => handleLike(post.id));

    const commentForm = postElement.querySelector('.comment-form');
    const commentsContainer = postElement.querySelector('.comments');

    loadComments(post.id, commentsContainer);

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = commentForm.querySelector('input');
        const commentContent = commentInput.value.trim();
        if (commentContent && currentUser) {
            handleComment(post.id, commentContent);
            commentInput.value = '';
        }
    });

    return postElement;
}

async function handleLike(postId) {
    if (currentUser) {
        const postRef = window.databaseRef(window.database, `posts/${postId}`);
        try {
            const snapshot = await window.databaseGet(postRef);
            const post = snapshot.val();
            const newLikes = (post.likes || 0) + 1;
            await window.databaseUpdate(postRef, { likes: newLikes });
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    }
}

async function handleComment(postId, content) {
    if (currentUser) {
        try {
            const commentsRef = window.databaseRef(window.database, `comments/${postId}`);
            await window.databasePush(commentsRef, {
                author: currentUser,
                content: content,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error al comentar:', error);
            alert('Error al publicar el comentario. Por favor, intente nuevamente.');
        }
    }
}

function loadComments(postId, container) {
    const commentsRef = window.databaseRef(window.database, `comments/${postId}`);
    window.databaseOnValue(commentsRef, (snapshot) => {
        container.innerHTML = '';
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push(childSnapshot.val());
        });

        comments.sort((a, b) => a.timestamp - b.timestamp);

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <strong class="comment-author">${comment.author}:</strong>
                <span class="comment-content">${comment.content}</span>
                <span class="comment-date">${new Date(comment.timestamp).toLocaleString('es-PE')}</span>
            `;
            container.appendChild(commentElement);
        });
    });
}