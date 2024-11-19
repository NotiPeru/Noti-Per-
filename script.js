// Obtener elementos del DOM
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

// Iniciar sesión
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showWelcomeMessage(username);
        showForumPage();
    }
});

// Cerrar sesión
logoutButton.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
});

// Mostrar mensaje de bienvenida
function showWelcomeMessage(username) {
    welcomeMessage.textContent = `¡Bienvenido, ${username}!`;
    setTimeout(() => {
        welcomeMessage.textContent = '';
    }, 3000);
}

// Mostrar página de inicio de sesión
function showLoginPage() {
    loginPage.classList.remove('hidden');
    forumPage.classList.add('hidden');
}

// Mostrar página del foro
function showForumPage() {
    loginPage.classList.add('hidden');
    forumPage.classList.remove('hidden');
}

// Publicar contenido
postButton.addEventListener('click', async () => {
    const content = postContent.value.trim();
    if (content && currentUser) {
        try {
            const postsRef = window.database.ref('posts');
            await postsRef.push({
                author: currentUser,
                content: content,
                timestamp: Date.now()
            });
            postContent.value = '';
            console.log('Post publicado exitosamente');
        } catch (error) {
            console.error('Error al publicar:', error);
            alert('Error al publicar el contenido. Por favor, intente nuevamente.');
        }
    }
});

// Cargar publicaciones en tiempo real
function loadPosts() {
    const postsRef = window.database.ref('posts');
    postsRef.on('value', (snapshot) => {
        postsContainer.innerHTML = '';
        const posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Ordenar posts por timestamp (más recientes primero)
        posts.sort((a, b) => b.timestamp - a.timestamp);

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    });
}

// Crear elemento de publicación
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
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentInput = commentForm.querySelector('input');
        const commentContent = commentInput.value.trim();
        if (commentContent && currentUser) {
            try {
                const commentsRef = window.database.ref(`comments/${post.id}`);
                await commentsRef.push({
                    author: currentUser,
                    content: commentContent,
                    timestamp: Date.now()
                });
                commentInput.value = '';
            } catch (error) {
                console.error('Error al comentar:', error);
                alert('Error al publicar el comentario. Por favor, intente nuevamente.');
            }
        }
    });

    return postElement;
}

// Cargar comentarios en tiempo real
function loadComments(postId, container) {
    const commentsRef = window.database.ref(`comments/${postId}`);
    commentsRef.on('value', (snapshot) => {
        container.innerHTML = '';
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push(childSnapshot.val());
        });

        // Ordenar comentarios por timestamp
        comments.sort((a, b) => a.timestamp - b.timestamp);

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <strong>${comment.author}:</strong> ${comment.content}
                <span class="comment-date">${new Date(comment.timestamp).toLocaleString('es-PE')}</span>
            `;
            container.appendChild(commentElement);
        });
    });
}

// Verificar si hay un usuario guardado en localStorage al cargar la página
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    currentUser = savedUser;
    showWelcomeMessage(savedUser);
    showForumPage();
} else {
    showLoginPage();
}

// Iniciar la carga de posts
loadPosts();
