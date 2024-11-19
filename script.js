// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBqSojtBrm6y7chI3399QQuYbwP6qTFi0s",
    authDomain: "mi-foro-peru.firebaseapp.com",
    databaseURL: "https://mi-foro-peru-default-rtdb.firebaseio.com/",
    projectId: "mi-foro-peru",
    storageBucket: "mi-foro-peru.firebasestorage.app",
    messagingSenderId: "544806448309",
    appId: "1:544806448309:web:ce80b2e855d46264b5a2fc",
    measurementId: "G-DKBGP9LFZX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a elementos del DOM
const loginPage = document.getElementById('loginPage');
const forumPage = document.getElementById('forumPage');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const postContent = document.getElementById('postContent');
const postButton = document.getElementById('postButton');
const postsContainer = document.getElementById('posts');

let currentUser = null;

// Función para iniciar sesión
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showWelcomeMessage(username);
        showForumPage();
    }
});

// Función para cerrar sesión
logoutButton.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
});

// Función para mostrar mensaje de bienvenida
function showWelcomeMessage(username) {
    welcomeMessage.textContent = `Bienvenido, ${username}!`;
    setTimeout(() => {
        welcomeMessage.textContent = '';
    }, 3000);
}

// Función para mostrar la página de inicio de sesión
function showLoginPage() {
    loginPage.classList.remove('hidden');
    forumPage.classList.add('hidden');
}

// Función para mostrar la página del foro
function showForumPage() {
    loginPage.classList.add('hidden');
    forumPage.classList.remove('hidden');
}

// Función para publicar contenido
postButton.addEventListener('click', () => {
    const content = postContent.value.trim();
    if (content && currentUser) {
        const post = {
            author: currentUser,
            content: content,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        firebase.database().ref('posts').push(post);
        postContent.value = '';
    }
});

// Función para cargar y mostrar publicaciones en tiempo real
function loadPosts() {
    const postsRef = firebase.database().ref('posts');
    postsRef.on('value', (snapshot) => {
        postsContainer.innerHTML = '';
        const posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        posts.reverse().forEach(createPostElement);
    });
}

// Función para crear elemento de publicación
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    
    const date = new Date(post.timestamp);
    
    postElement.innerHTML = `
        <div class="post-header">
            <span class="post-author">${post.author}</span>
            <span class="post-date">${date.toLocaleString()}</span>
        </div>
        <p class="post-content">${post.content}</p>
        <div class="comments"></div>
        <form class="comment-form">
            <input type="text" placeholder="Añade un comentario..." required>
            <button type="submit">Comentar</button>
        </form>
    `;

    const commentForm = postElement.querySelector('.comment-form');
    const commentsContainer = postElement.querySelector('.comments');

    // Cargar comentarios existentes
    loadComments(post.id, commentsContainer);

    // Manejar nuevos comentarios
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = commentForm.querySelector('input');
        const commentContent = commentInput.value.trim();
        if (commentContent && currentUser) {
            const comment = {
                author: currentUser,
                content: commentContent,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            firebase.database().ref(`comments/${post.id}`).push(comment);
            commentInput.value = '';
        }
    });

    postsContainer.appendChild(postElement);
}

// Función para cargar comentarios en tiempo real
function loadComments(postId, container) {
    const commentsRef = firebase.database().ref(`comments/${postId}`);
    commentsRef.on('child_added', (snapshot) => {
        const comment = snapshot.val();
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <strong>${comment.author}:</strong> ${comment.content}
        `;
        container.appendChild(commentElement);
    });
}

// Verificar si hay un usuario guardado en localStorage al cargar la página
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showWelcomeMessage(savedUser);
        showForumPage();
    } else {
        showLoginPage();
    }
    loadPosts();
});