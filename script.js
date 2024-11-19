import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const welcomeSection = document.getElementById('welcome');
    const contentSection = document.getElementById('content');
    const userInfo = document.getElementById('userInfo');
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const postsContainer = document.getElementById('posts');
    const mediaUpload = document.getElementById('mediaUpload');
    const mediaPreview = document.getElementById('mediaPreview');
    const mediaDescription = document.getElementById('mediaDescription');
    const logoutButton = document.getElementById('logoutButton');

    let currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        showContentSection();
    } else {
        showWelcomeSection();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        if (username) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            showContentSection();
        }
    });

    postButton.addEventListener('click', () => {
        const content = postContent.value.trim();
        const description = mediaDescription.value.trim();
        const mediaFile = mediaUpload.files[0];

        // Validación para verificar si hay contenido o un archivo multimedia
        if (!content && !mediaFile) {
            alert('Por favor, añade contenido o una imagen/video para publicar.');
            return;
        }

        createPost(content, mediaFile, description);
    });

    function updateMediaPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaPreview.style.display = 'block';
                if (file.type.startsWith('image/')) {
                    mediaPreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                } else if (file.type.startsWith('video/')) {
                    mediaPreview.innerHTML = `<video src="${e.target.result}" controls></video>`;
                }
                mediaDescription.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            mediaPreview.style.display = 'none';
            mediaPreview.innerHTML = '';
            mediaDescription.classList.add('hidden');
        }
    }

    mediaUpload.addEventListener('change', (e) => {
        updateMediaPreview(e.target.files[0]);
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showWelcomeSection();
    });

    function showWelcomeSection() {
        welcomeSection.classList.remove('hidden');
        contentSection.classList.add('hidden');
        logoutButton.classList.add('hidden');
        clearFormFields();
        userInfo.textContent = '';
    }

    function showContentSection() {
        userInfo.textContent = `Bienvenido, ${currentUser}`;
        welcomeSection.classList.add('hidden');
        contentSection.classList.remove('hidden');
        logoutButton.classList.remove('hidden');
        contentSection.classList.add('fade-in');
        loadPosts();
    }

    function createPost(content, mediaFile, description) {
        const post = {
            id: Date.now(),
            author: currentUser,
            content: content,
            description: description,
            date: new Date().toLocaleString('es-PE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            media: null,
            comments: []
        };

        if (mediaFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                post.media = {
                    type: mediaFile.type.startsWith('image/') ? 'image' : 'video',
                    data: e.target.result
                };
                finalizePosts(post);
            };
            reader.readAsDataURL(mediaFile);
        } else {
            finalizePosts(post);
        }
    }

    function finalizePosts(post) {
        push(ref(database, 'posts'), post);
        clearFormFields();
    }

    function clearFormFields() {
        postContent.value = '';
        mediaPreview.innerHTML = '';
        mediaUpload.value = '';
        mediaDescription.value = '';
        mediaDescription.classList.add('hidden');
        mediaPreview.style.display = 'none';
    }

    function loadPosts() {
        const postsRef = ref(database, 'posts');
        onValue(postsRef, (snapshot) => {
            const posts = [];
            snapshot.forEach((childSnapshot) => {
                posts.push({ ...childSnapshot.val(), key: childSnapshot.key });
            });
            renderPosts(posts.reverse());
        });
    }

    function renderPosts(posts) {
        console.log("Posts recibidos:", posts);
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);

            // Escuchar los comentarios en tiempo real
            const commentsRef = ref(database, `posts/${post.key}/comments`);
            onValue(commentsRef, (snapshot) => {
                const comments = snapshot.val() || [];
                renderComments(postElement.querySelector('.comment-list'), comments);
            });
        });
    }

    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post', 'fade-in');
        
        let mediaHTML = '';
        if (post.media) {
            if (post.description) {
                mediaHTML += `<p class="post-description">${post.description}</p>`;
            }
            if (post.media.type === 'image') {
                mediaHTML += `<img src="${post.media.data}" alt="Imagen publicada" class="post-media">`;
            } else if (post.media.type === 'video') {
                mediaHTML += `<video src="${post.media.data}" controls class="post-media"></video>`;
            }
        }

        postElement.innerHTML = `
            <div class="post-header">
                <span class="post-author">${post.author}</span>
                <span class="post-date">${post.date}</span>
            </div>
            ${post.content ? `<p class="post-content">${post.content}</p>` : ''}
            ${mediaHTML}
            <div class="comment-section">
                <form class="comment-form">
                    <input type="text" placeholder="Añade un comentario..." required>
                    <button type="submit">Comentar</button>
                </form>
                <div class="comment-list"></div>
                <button class="comment-toggle">Ver comentarios (${post.comments ? post.comments.length : 0})</button>
            </div>
        `;

        const commentForm = postElement.querySelector('.comment-form');
        const commentList = postElement.querySelector('.comment-list');
        const commentToggle = postElement.querySelector('.comment-toggle');

        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentInput = commentForm.querySelector('input');
            const commentContent = commentInput.value.trim();
            if (commentContent) {
                const comment = {
                    author: currentUser,
                    content: commentContent,
                    date: new Date().toLocaleString('es-PE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                };
                if (!post.comments) {
                    post.comments = [];
                }
                post.comments.push(comment);
                set(ref(database, `posts/${post.key}/comments`), post.comments);
                commentInput.value = '';
            }
        });

        commentToggle.addEventListener('click', () => {
            commentList.classList.toggle('hidden');
            commentToggle.textContent = commentList.classList.contains('hidden') 
                ? `Ver comentarios (${post.comments ? post.comments.length : 0})`
                : `Ocultar comentarios (${post.comments ? post.comments.length : 0})`;
        });

        return postElement;
    }

    function renderComments(commentList, comments) {
        commentList.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${comment.date}</span>
                <p class="comment-content">${comment.content}</p>
            `;
            commentList.appendChild(commentElement);
        });
    }
});
