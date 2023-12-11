document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
  
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const spinner = document.getElementById('spinner');

      // Show the spinner
      spinner.classList.remove('d-none');
  
      const formData = new FormData(form);
  
      fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(formData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
            spinner.classList.add('d-none');
          if (response.ok) {
            // If the form submission is successful, show a SweetAlert
            Swal.fire({
              icon: 'success',
              title: 'Message Sent!',
              text: 'We will get back to you soon.',
            });
  
            // Clear the form
            form.reset();
          } else {
            throw new Error('Failed to send message');
          }
        })
        .catch((error) => {
            spinner.classList.add('d-none');
          console.error('Error:', error);
          // Handle error if needed
        });
    });
  });
  