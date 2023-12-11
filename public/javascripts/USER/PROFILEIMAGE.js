document.addEventListener('DOMContentLoaded', function () {
    const image = document.getElementById('profile-image');
    const input = document.getElementById('image-upload');
    const cropper = new Cropper(image, {
      aspectRatio: 1, // You can adjust the aspect ratio as needed
      viewMode: 2,
      background: false,
    });

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          image.src = event.target.result;
          cropper.replace(event.target.result);
        };

        reader.readAsDataURL(file);
      }
    });

    document.getElementById('crop-button').addEventListener('click', () => {
      // Show the modal or any other method to allow the user to crop
      $('#cropModal').modal('show');
    });

    // Example of sending cropped image to the server
    document.getElementById('upload-cropped-button').addEventListener('click', async () => {
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL(); // Convert to base64 data URL

      // You can send the `croppedImage` to the server using the Fetch API or another method
      try {
        const response = await fetch('/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: croppedImage }),
        });

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error uploading image:', error);
      }

      // Close the modal or take any other action after upload
      $('#cropModal').modal('hide');
    });
  });