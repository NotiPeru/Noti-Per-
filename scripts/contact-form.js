document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Crear el mensaje para WhatsApp
            const whatsappMessage = `Nuevo mensaje de contacto:%0A%0A` +
                                    `Nombre: ${name}%0A` +
                                    `Email: ${email}%0A` +
                                    `Asunto: ${subject}%0A` +
                                    `Mensaje: ${message}`;

            // Crear el enlace de WhatsApp
            const whatsappLink = `https://wa.me/51934498803?text=${whatsappMessage}`;

            // Abrir WhatsApp en una nueva ventana
            window.open(whatsappLink, '_blank');

            // Resetear el formulario y el botón
            contactForm.reset();
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;

            // Mostrar mensaje de éxito
            alert('¡Gracias! Se abrirá WhatsApp para enviar tu mensaje.');
        });
    }
});