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
    let posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Asegurarse de que todos los posts tengan un array de comentarios
    posts = posts.map(post => ({
        ...post,
        comments: Array.isArray(post.comments) ? post.comments : []
    }));

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
        window.location.reload(); // Asegura una limpieza completa
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
        renderPosts();
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
        posts.unshift(post);
        localStorage.setItem('posts', JSON.stringify(posts));
        renderPosts();
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

    function renderPosts() {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
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

        // Asegurarse de que comments existe y es un array
        const comments = Array.isArray(post.comments) ? post.comments : [];

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
                <button class="comment-toggle">Ver comentarios (${comments.length})</button>
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
                if (!Array.isArray(post.comments)) {
                    post.comments = [];
                }
                post.comments.push(comment);
                localStorage.setItem('posts', JSON.stringify(posts));
                renderComments(commentList, post.comments);
                commentInput.value = '';
                commentToggle.textContent = `Ver comentarios (${post.comments.length})`;
            }
        });

        commentToggle.addEventListener('click', () => {
            commentList.classList.toggle('hidden');
            commentToggle.textContent = commentList.classList.contains('hidden') 
                ? `Ver comentarios (${comments.length})`
                : 'Ocultar comentarios';
        });

        renderComments(commentList, comments);
        return postElement;
    }

    function renderComments(commentList, comments) {
        if (!Array.isArray(comments)) {
            comments = [];
        }
        commentList.innerHTML = comments.map(comment => `
            <div class="comment">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${comment.date}</span>
                <p class="comment-content">${comment.content}</p>
            </div>
        `).join('');
    }
});