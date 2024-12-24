document.addEventListener('DOMContentLoaded', () => {
    // Menú de hamburguesa
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle nav
        nav.classList.toggle('nav-active');

        // Animar enlaces
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Animación del burger
        burger.classList.toggle('toggle');
    });

    // Estrellas fugaces
    const starsContainer = document.getElementById('stars-container');
    const numberOfStars = 20;

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);

        setTimeout(() => {
            star.remove();
            createStar();
        }, 3000);
    }

    for (let i = 0; i < numberOfStars; i++) {
        setTimeout(createStar, Math.random() * 3000);
    }

    // Modal de imagen
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("img01");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".close");

    if (modal && modalImg && captionText) {
        document.querySelectorAll('.project-card img').forEach(img => {
            img.onclick = function() {
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
            }
        });

        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
});
