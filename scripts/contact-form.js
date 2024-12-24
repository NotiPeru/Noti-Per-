document.addEventListener('DOMContentLoaded', function() {
    // Inicializa EmailJS con tu clave pública
    emailjs.init("jD1Hs7P5wwDsHzM2m");

    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Asegúrate de que estos IDs sean correctos y coincidan con tu cuenta de EmailJS
            emailjs.send("service_gts1f5z", "template_9m9lo6q", templateParams)
                .then(function(response) {
                    console.log('Correo enviado con éxito:', response);
                    alert('¡Mensaje enviado con éxito!');
                    contactForm.reset();
                }, function(error) {
                    console.error('Error al enviar el correo:', error);
                    alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
                })
                .finally(function() {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    }
});
