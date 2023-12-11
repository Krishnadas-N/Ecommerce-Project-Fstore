
//Banner Creation
const CreateBanner = document.getElementById("createBannerForm");

//Validation 
    const titleInput = document.getElementById('bannerTitle');
    const imageInput = document.getElementById('bannerImage');
    const descriptionInput = document.getElementById('bannerDescription');
    const linkInput = document.getElementById('bannerLink');
    const titleValidationMessage = document.getElementById('titleValidationMessage');
    const imageValidationMessage = document.getElementById('imageValidationMessage');
    const descriptionValidationMessage = document.getElementById('descriptionValidationMessage');
    const linkValidationMessage = document.getElementById('linkValidationMessage');

CreateBanner.addEventListener('submit',(e)=>{
    e.preventDefault();

     // Custom validation logic
     let isValid = true;
    // Validate title length (minimum 5 characters)
    if (titleInput.value.length < 5) {
        titleValidationMessage.textContent = 'Title must be at least 5 characters';
        isValid = false;
    } else {
        titleValidationMessage.textContent = '';
    }

    // Validate description presence
    if (!descriptionInput.value.trim()) {
        descriptionValidationMessage.textContent = 'Description is required';
        isValid = false;
    } else {
        descriptionValidationMessage.textContent = '';
    }

    // Validate image format
    
    const allowedImageFormats = ['.jpg', '.jpeg', '.png', '.gif','.webp'];
    const imageFileName = imageInput.value.toLowerCase();
    if (!allowedImageFormats.some(format => imageFileName.endsWith(format))) {
        imageValidationMessage.textContent = 'Invalid image format. Supported formats: JPG, PNG, GIF';
        isValid = false;
    } else {
        imageValidationMessage.textContent = '';
    }

    // Validate URL format (optional)
    const linkRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (linkInput.value && !linkRegex.test(linkInput.value)) {
        linkValidationMessage.textContent = 'Invalid URL format';
        isValid = false;
    } else {
        linkValidationMessage.textContent = '';
    }

    if(isValid){
        // Create banner object and send to the server
    const formData = new FormData(CreateBanner);

    fetch('/admin/banner-management/create',{
        method:'POST',
        body :formData
    })
    .then(response => response.json())
        
        .then(data => {
            if (data.status === 201) {
                // Show a success message with SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success',
                }).then(() => {
                    // Close the modal
                    $('#createBannerModal').modal('hide');
                    window.location.reload()
                    // Reload or update the banner list on the page
                });
            } else {
                // Show an error message with SweetAlert
                Swal.fire({
                    title: 'Error!',
                    text: data.message,
                    icon: 'error',
                });
            }
        })
        .catch(error => {
            console.error('Error creating banner:', error);
            // Handle the error (e.g., show an error message)
            console.error('Error creating banner:', error);
            // Show an error message with SweetAlert
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while creating the banner.',
                icon: 'error',
            });
        });
    }
})


//Edit Banners
//Edit Banners

let selectedItemId = null;
const editButton = document.querySelectorAll('.edit-button');

for (const button of editButton) {
    button.addEventListener('click', () => {
      selectedItemId = button.getAttribute('data-id');
      console.log(selectedItemId+'ggggg');
    });
  }
  
  
// Access form elements here using `selectedItemId`

function onclickForm(selectedItemId) {
    const EdittitleInput = document.getElementById('EditbannerTitle_' + selectedItemId);
    const EditimageInput = document.getElementById('EditbannerImage_' + selectedItemId);
    const EditdescriptionInput = document.getElementById('EditbannerDescription_' + selectedItemId);
    const EditlinkInput = document.getElementById('EditbannerLink_' + selectedItemId);
    const Position = document.getElementById('EditbannerPosition_' + selectedItemId);
    const submit = document.getElementById('editSubmitButton');

    // Implement your form validation logic here.
    let isValid = validateForm(EdittitleInput, EditdescriptionInput, EditlinkInput, Position);

    if (isValid) {
        const formData = new FormData();
        formData.append('title', EdittitleInput.value);
        formData.append('description', EditdescriptionInput.value);
        formData.append('image', EditimageInput.files[0]);
        formData.append('link', EditlinkInput.value);
        formData.append('position', Position.value);
        console.log(formData);
        fetch('/admin/banner-management/edit/' + selectedItemId, {
            method: 'PUT',
            body: formData, // Send the FormData object
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 201) {
                    // Show success message
                    Swal.fire({
                        title: 'Success!',
                        text: 'Banner Edit Successfully',
                        icon: 'success',
                    }).then(() => {
                        // Close the modal
                        $('#createBannerModal').modal('hide');
                        // Reload the banner list on the page
                        selectedItemId = null;
                        window.location.reload();
                    });
                } else {
                    // Show an error message
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || 'An error occurred while editing the banner.',
                        icon: 'error',
                    });
                }
            })
            .catch(error => {
                console.error('Error editing banner:', error);
                // Show a more specific error message
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while editing the banner.',
                    icon: 'error',
                });
            });
    } else {
        console.log('Form validation failed.');
    }
}

function validateForm(EdittitleInput,  EditdescriptionInput, EditlinkInput, Position) {
    const EdittitleValidationMessage = document.getElementById('EdittitleValidationMessage');
    const EditimageValidationMessage = document.getElementById('EditimageValidationMessage');
    const EditdescriptionValidationMessage = document.getElementById('EditdescriptionValidationMessage');
    const EditlinkValidationMessage = document.getElementById('EditlinkValidationMessage');

    // Initialize validation messages as empty
    EdittitleValidationMessage.textContent = '';
    EditimageValidationMessage.textContent = '';
    EditdescriptionValidationMessage.textContent = '';
    EditlinkValidationMessage.textContent = '';

    // You can check if the inputs are not empty or if the file input contains a valid image.
    // Return true if valid, false otherwise.
    let isValid = true;

    // Validate title length
    if (EdittitleInput.value.length < 5) {
        EdittitleValidationMessage.textContent = 'Title must be at least 5 characters';
        isValid = false;
    }

    // Validate description presence
    if (!EditdescriptionInput.value.trim()) {
        EditdescriptionValidationMessage.textContent = 'Description is required';
        isValid = false;
    }

    // Validate image format (if EditimageInput is present)
    

    // Validate URL format (optional)
    const linkRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (EditlinkInput.value && !linkRegex.test(EditlinkInput.value)) {
        EditlinkValidationMessage.textContent = 'Invalid URL format';
        isValid = false;
    }

    return isValid;
}

  //DELETE PRODUCTS
  function deleteBanner(bannerId) {
    console.log("Delete product Called")
      Swal.fire({
          title: 'Confirmation',
          text: 'Are you sure you want to delete this Banner?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel',
      }).then((result) => {
          if (result.isConfirmed) {
              // User confirmed, proceed with deletion
              confirmDeleteBanner(bannerId);
          }
      });
  }

function  confirmDeleteBanner(bannerId){
    fetch('/admin/banner-management/delete/'+bannerId,{
        method:"DELETE",

    }).then((response)=>  response.json())
    .then(data => {
        if (data.status === 201) {
            // Show a success message with SweetAlert
            Swal.fire({
                title: 'Success!',
                text: 'Banner Deleted Sucessfully',
                icon: 'success',
            }).then(() => {
                // Close the modal
                $('#createBannerModal').modal('hide');
                window.location.reload()
                // Reload or update the banner list on the page
            });
        } else {
            // Show an error message with SweetAlert
            Swal.fire({
                title: 'Error!',
                text: data.message,
                icon: 'error',
            });
        }
    })
    .catch(error => {
        console.error('Error creating banner:', error);
        // Handle the error (e.g., show an error message)
        console.error('Error creating banner:', error);
        // Show an error message with SweetAlert
        Swal.fire({
            title: 'Error!',
            text: 'An error occurred while creating the banner.',
            icon: 'error',
        });
    });
}

function toggleBanner(bannerId, status) {
    console.log(bannerId, status);

    fetch(`/admin/banner-management/change-status/${bannerId}?status=${status}`, {
        method: 'PUT',
    }).then((response) => {
        return response.json();
    }).then((res) => {
        const toggleIcon = document.getElementById('toggleIcon' + bannerId);

        if (res.bannerStatus) {
            toggleIcon.classList.remove('fa-toggle-off', 'inactive');
            toggleIcon.classList.add('fa-toggle-on', 'active');
        } else {
            toggleIcon.classList.remove('fa-toggle-on', 'active');
            toggleIcon.classList.add('fa-toggle-off', 'inactive');
        }
    }).catch(() => {
        Swal.fire({
            title: "Failed to change status",
            text: "Please try again later.",
            icon: "warning"
        });
    });
}
