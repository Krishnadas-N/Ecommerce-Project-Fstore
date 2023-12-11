document.addEventListener('DOMContentLoaded', function () {
    const addProductButton = document.getElementById('addProduct');
    addProductButton.addEventListener('click', async () => {
        // Reset previous error messages
        document.getElementById('productnameerror').textContent = '';
        document.getElementById('categoryerror').textContent = '';
        document.getElementById('productpriceerror').textContent = '';
        document.getElementById('productdescrptionerror').textContent = '';
        document.getElementById('productbranderror').textContent = '';
        document.getElementById('productcounntinstockerror').textContent = '';
        document.getElementById('productsizeserror').textContent = '';
        document.getElementById('productimageerror').textContent = '';
        document.getElementById('productimageserror').textContent = '';

        const productId = document.getElementById('productid').value;
        const name = document.querySelector('input[name="name"]').value;
        const category = document.querySelector('select[name="category"]').value;
        const price = parseFloat(document.querySelector('input[name="price"]').value);
        const countInStock = parseInt(document.querySelector('input[name="countInStock"]').value);
        const description = document.querySelector('textarea[name="description"]').value;
        const brand = document.querySelector('input[name="brand"]').value;
        const image = document.querySelector('input[name="image"]').files[0];
        const images = document.querySelector('input[name="images"]').files
        // Validation checks
        let isValid = true;

        if (!name) {
            document.getElementById('productnameerror').textContent = 'Product name is required.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9 \-]+$/.test(name)) {
            document.getElementById('productnameerror').textContent = 'Product name can only contain alphabets, numbers, and hyphens.';
            isValid = false;
        }
        
        if (category === 'Select Product Category') {
            document.getElementById('categoryerror').textContent = 'Product category is required.';
            isValid = false;
        }
        if (isNaN(price) || price <= 0) {
            document.getElementById('productpriceerror').textContent = 'Please enter a valid price greater than 0.';
            isValid = false;
        }
        if(description){
        if (!description) {
            document.getElementById('productdescrptionerror').textContent = 'Product description is required.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9 \-]+$/.test(description)) {
            document.getElementById('productdescrptionerror').textContent = 'Description name can only contain alphabets, numbers, and hyphens.';
            isValid = false;
        }
    }
        if(isNaN(price) || price < 1){
            document.getElementById('productpriceerror').textContent = 'PRICE MUST BE GREATER THAN ZERO AND A NUMBER'  
        }
        if (!brand) {
            document.getElementById('productbranderror').textContent = 'Product brand is required.';
            isValid = false;
        }
        if (isNaN(countInStock) || countInStock < 1) {
            document.getElementById('productcounntinstockerror').textContent = 'Count in stock must be greater than or equal to 1.';
            isValid = false;
        }
        if(image){
        if ( !image.type.startsWith("image/")) {
            document.getElementById('productimageerror').textContent = 'Please select a valid cover image (jpg, jpeg, png, gif).';
            isValid = false;
        }
    }
        if(images){
        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            if (!file.type.startsWith("image/")) {
                
                document.getElementById('productimageserror').textContent = 'The images is upload only inn image format';

                isValid = false;
            }
        }
    }

        // Perform other validations, such as for sizes, if needed

        if (!isValid) {
            // Show error message using SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields and ensure valid values.',
            });
            return;
        }

        // If all inputs are valid, prepare the form data and submit using Fetch
        const formData = new FormData(document.getElementById('EditForm'));
        console.log(formData);
        fetch('/admin/product-management/editProduct/'+productId, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server
                // You can use SweetAlert to display success or error messages
                // Example:
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product added successfully!',
                });
            })
            .catch(error => {
                console.error('Error:', error);
                // Show error message using SweetAlert
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while adding the product.',
                });
            });
    });
});

$('#productCategoryAdd').change(async function() {

    const subCategorySelectOptions = document.getElementById('subCategoryOptions')
    // Get the ID of the selected category.
    var selectedCategoryId = $(this).val();
    console.log(selectedCategoryId)
    // Make an AJAX request to fetch the subcategories for the selected category.
    const response = await fetch(`/admin/category-management/subCategories/${selectedCategoryId}`, {
      method: 'GET'
    });
  
    // Parse the response and display the subcategories as checkboxes in the subCategoryOptions div.
    const responseData = await response.json();
    const subcategories = responseData.subcategories; // Access the subcategories array
  
  
    if (!Array.isArray(subcategories)) {
      console.error('Subcategories is not an array:', subcategories);
      return; // Exit the function if subcategories is not an array
    }
    
    subCategorySelectOptions.innerHTML = '';
    // Iterate over the subcategories array and generate a checkbox for each subcategory.
     subcategories.forEach((subcategory) => {
    // Create a checkbox element.
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'
    checkbox.value=subcategory._id;
    checkbox.name = 'subcategories[]'
  
    console.log(subcategory._id)
    // Add a label element for the checkbox.
    const label = document.createElement('label');
    label.textContent = subcategory.name;
  
    const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);
    // Append the checkbox and label elements to the HTML element you created in step 1.
    subCategoryOptions.appendChild(div);
  });
   
  });



  function removeImage(index,productId,event) {

    // Assuming you have the productId available
        event.preventDefault()
    fetch(`/admin/product-management/${productId}/images/${index}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(images => {
        // Update the preview with the new images array
        updatePreview(images);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}



function updatePreview(images) {
    console.log("hello")
    console.log(images)
    var previewContainer = document.querySelector('.preview-images');
    previewContainer.innerHTML = '';

    // Display existing images
    images.forEach(function (image, index) {
        var imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        var imgElement = document.createElement('img');
        imgElement.src = '/' + image; // Adjust the path if needed
        imgElement.alt = 'Image ' + index;
        imgElement.width = 90;
        imgElement.height = 90;

        var removeButton = document.createElement('button');
        removeButton.classList.add('remove-image');
        removeButton.style.width = '30px';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.onclick = function () {
            removeImage(index);
        };

        imageContainer.appendChild(imgElement);
        imageContainer.appendChild(removeButton);
        previewContainer.appendChild(imageContainer);
    });
}
 
  
  