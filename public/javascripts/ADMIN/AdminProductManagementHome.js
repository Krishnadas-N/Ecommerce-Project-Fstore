

  
    document.addEventListener('DOMContentLoaded', function() {
    //To PREVIEW THE IMAGE

    const singleOutput = document.getElementsByClassName('output');
    const singleImageInput = document.getElementById('image');
    let singleImage = []
    singleImageInput.addEventListener("change",() => {
        const singleImage = singleImageInput.files[0];
      
        displaysingleImage();
    })
    function displaysingleImage() {
        let images = "";
        singleImage.forEach((image, index) => {
            images += `<div class='image'>
                <img src="${URL.createObjectURL(image)}" alt="image">
                <span onclick="deleteImage(${index})">&times;</span>
             </div>`;
        });
        singleOutput.innerHTML=images
        if (singleImage.length > 0) {
            output.style.display = "flex";
        } 
      }
      


    const output = document.querySelector("output");
    const input = document.getElementById('images');
    let imagesArray = [];
    
    input.addEventListener("change", () => {
        const files = input.files;
        for (let i = 0; i < files.length; i++) {
            imagesArray.push(files[i]);
        }
        displayImages(); // Call the correct function here
    });
    
    function displayImages() { // Change the function name to displayImages
        let images = "";
        imagesArray.forEach((image, index) => {
            images += `<div class='image'>
                <img src="${URL.createObjectURL(image)}" alt="image">
                <span onclick="deleteImage(${index})">&times;</span>
             </div>`;
        });
        output.innerHTML = images;
         // Show the output element if there are images
    if (imagesArray.length > 0) {
        output.style.display = "flex";
    } 
    }
    
    function deleteImage(index) {
        imagesArray.splice(index, 1);
        displayImages();
    }
    




  })





    



//To get Category list


const AddproductCategorySelect = document.getElementById('productCategoryAdd')


// Fetch the categories from the database
async function fetchCategories() {
  try {
    const response = await fetch('/admin/product-management/getCategories');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return an empty array to handle errors gracefully
  }
}


// Append the categories to the select element
async function appendCategoriesToSelect(selectElement) {
  const categories = await fetchCategories();

    console.log(categories)

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category._id;
    option.textContent = category.name;

   // console.log(option.value)

    selectElement.appendChild(option);
  });
}

// Call appendCategoriesToSelect for both select boxes when the page loads
appendCategoriesToSelect(AddproductCategorySelect);


//To GEt SUBCATEGORIES?///////////////////
// Function to populate subcategory checkboxes based on the selected category
// Add an event listener to the change event of the category checkbox.
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



// Function to handle the Publish button click event
function handlePublishButtonClick(productId, isFeatured) {
    const newIsFeatured = !isFeatured; // Toggle the isFeatured value
    const requestData = {
        isFeatured: newIsFeatured
    };

    // Make an AJAX request to update the isFeatured status
    $.ajax({
        url: `product-management/updateProduct/${productId}`, // Adjust the URL as needed
        method: 'PUT',
        data: requestData,
        success: function (response) {
            // Update the button text
            const buttonText = newIsFeatured ? 'Unpublish' : 'Publish';
            $(`button[data-product-id="${productId}"]`).text(buttonText);

            // Update the data-is-featured attribute
            $(`button[data-product-id="${productId}"]`).data('is-featured', newIsFeatured);

            // Handle any other UI updates or notifications
            window.location.reload();
        },
        error: function (error) {
            // Handle error
            console.error(error);
            // Display an error message or take appropriate action
            // ...
        }
    });
}

// Attach a click event listener to the Publish buttons
$('.publish-button').click(function () {
    const productId = $(this).data('product-id');
    const isFeatured = $(this).data('is-featured');
    handlePublishButtonClick(productId, isFeatured);
});


 

    // Handle form submission (adding new product)
    const addNewProductForm = document.getElementById('addNewProduct');

    let cropper;
    function loadImage(id) {
        alert('vannu')
        const input = document.getElementById(id);
        console.log(`show${id}`)
        const canvas = document.getElementById(`show${id}`);
        canvas.style.display='block'
        console.log(canvas)
        const file = input.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                canvas.src = e.target.result;
                document.getElementById(`save${id}`).style.display = 'block'
                document.getElementById(`cancel${id}`).style.display = 'block'
                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(canvas, {
                    viewMode: 2,
                    zoomable: true,
                });
            };

            reader.readAsDataURL(file);
        } else {
            canvas.src = '';
            if (cropper) {
                cropper.destroy();
            }
        }
    }

    function uploadCroppedImage(id) {
    const canvas = cropper.getCroppedCanvas();
    if (canvas) {
        canvas.toBlob((blob) => {
            const fileName = 'cropped_image.jpg';
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const input = document.getElementById(id);

            // Check if the browser supports DataTransfer and FileList
            if (DataTransfer && FileList) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
            } else {
                // If DataTransfer and FileList are not supported, you can't directly set input.files
                // You may need to replace the input element with a new one or use a different approach.
                console.error('FileList and DataTransfer are not supported in this browser.');
            }

            // Update the displayed image
            const showImg = document.getElementById(`show${id}`);
          
            showImg.src = URL.createObjectURL(blob);

            // Hide the Cropper and save/cancel buttons
            cropper.destroy();
            document.getElementById(`save${id}`).style.display = 'none';
            document.getElementById(`cancel${id}`).style.display = 'none';
        });
    }
}

 
    // Rest of your code for form submission and validation
    
   
      
 
   
    function ValidateProduct() {
      const addProductname = document.getElementById('addproductname');
      addProductname.textContent = '';
      const addProductdescription = document.getElementById('addproductdescription');
      addProductdescription.textContent = '';
      const addproductimage = document.getElementById('addproductimage');
      addproductimage.textContent = '';
      const addproductimages = document.getElementById('addproductimages');
      addproductimages.textContent = '';
      const addProductBrand = document.getElementById('addproductbrand');
      addProductBrand.textContent = '';
      const addProductCountInStock = document.getElementById('addproductcount');
      addProductCountInStock.textContent = '';
      const addProductPrice = document.getElementById('addproductprice');
      addProductPrice.textContent = '';
      const productCategoryError = document.getElementById('addproductcategory');
    
      // Values
      const productName = document.getElementById("productName").value.trim();
      const productDescription = document.getElementById("productDescription").value.trim();
      const mainImageInput = document.getElementById("image");
      const mainImageFile = mainImageInput.files[0];
      const additionalImagesInput = document.getElementById("images");
      const additionalImagesFiles = additionalImagesInput.files;
      const countInStock = document.getElementById("productCountInStock").value.trim();
      const price = document.getElementById("productPrice").value.trim();
      const productCategory = document.getElementById('productCategoryAdd').value;
      const brand = document.getElementById('productBrand').value;
      const selectedSizes = Array.from(document.querySelectorAll('input[type="checkbox"][name="sizes"]:checked'));
      const selectedSizeValues = selectedSizes.map(size => size.value);
      const selectedSubcategories = Array.from(document.querySelectorAll('input[type="checkbox"][name="subcategories"]:checked'));
      const selectedSubcategoryValues = selectedSubcategories.map(subcategory => subcategory.value);
    
      // Reset all error messages
      addProductname.textContent = '';
      addProductdescription.textContent = '';
      addproductimage.textContent = '';
      addproductimages.textContent = '';
      addProductBrand.textContent = '';
      addProductCountInStock.textContent = '';
      addProductPrice.textContent = '';
      productCategoryError.textContent = '';
      console.log("helle validate")
      // Validation for Product Name
      if (productName === "") {
        console.log("productName")
        addProductname.textContent = 'Please enter a valid product name.';
        return false;
      }
    
      // Validation for Description
      if (productDescription === "") {
        console.log("productDescription")
        addProductdescription.textContent = "Please enter a Description";
        return false;
      }
    
      // Validation for Main Image
      if (!mainImageFile) {
        console.log("mainImageFile")
        addproductimage.textContent = 'Please select a valid image file.';
        return false;
      } else if (!mainImageFile.type.startsWith("image/")) {
        console.log("mainImageFilemainImageFile")
        addproductimage.textContent = 'Please select a valid image file.';
        return false;
      }
    
      // Validation for Additional Images
      for (let i = 0; i < additionalImagesFiles.length; i++) {
        const file = additionalImagesFiles[i];
        if (!file.type.startsWith("image/")) {
          console.log("additionalImagesFiles")
          addproductimages.textContent = 'Please select valid image files.';
          return false;
        }
      }
    
      if (brand === '') {
        console.log("brand")
        addProductBrand.textContent = 'Brand Name is required';
        return false;
      }
    
      if (productCategory === '') {
        console.log("productCategory")
        productCategoryError.textContent = 'Category is required';
        return false;
      }
    
      // Validation for Count in Stock
      if (countInStock === "" || isNaN(countInStock) || countInStock < 0) {
        console.log("countInStock")
        addProductCountInStock.textContent = 'Please enter a valid count in stock.';
        return false;
      }
    
      // Validation for Price
      if (price === "" || isNaN(price) || price <= 0) {
        console.log("price")
        addProductPrice.textContent = "Please enter a valid Price";
        return false;
      }
    
      // Validation for selected sizes
      if (selectedSizeValues.length === 0) {
        console.log("selectedSizeValues")
        // No size is selected, display an error message
        // You can replace the following line with an appropriate error message
        // addSizeError.textContent = 'Please select at least one size.';
        return false;
      }
    
      // Validation for selected subcategories
     // if (selectedSubcategoryValues.length === 0) {
      //  console.log("selectedSubcategoryValues")
        // No subcategory is selected, display an error message
        // You can replace the following line with an appropriate error message
        // addSubcategoryError.textContent = 'Please select at least one subcategory.';
       // return false;
//}
    console.log("true")
      // If all conditions are false, return true to allow the form submission
      return true;
    }
    
 

   
    function editProduct(selectedId) {
      // Initialize validation messages as empty
      const editProductname = document.getElementById('editProductname_' + selectedId);
      const editProductdescription = document.getElementById('editProductdescription_' + selectedId);
      const editProductimage = document.getElementById('editProductimage_' + selectedId);
      const editProductimages = document.getElementById('editProductimages_' + selectedId);
      const editProductprice = document.getElementById('editProductprice_' + selectedId);
      const editProductstock = document.getElementById('editProductstock_' + selectedId);
      const editProductbrand = document.getElementById('editProductbrand_' + selectedId);
  
      // Initialize validation messages as empty
      editProductname.textContent = '';
      editProductdescription.textContent = '';
      editProductimage.textContent = '';
      editProductimages.textContent = '';
      editProductprice.textContent = '';
      editProductstock.textContent = '';
      editProductbrand.textContent = '';
  
      // Validation for Product Name
      const productName = document.getElementById('editProductName_' + selectedId).value.trim();
  
      if (productName === "") {
          editProductname.textContent = 'Product Name Cannot be null';
          return false;
      }
  
      // Validation for Description
      const productDescription = document.getElementById('editProductDescription_' + selectedId).value.trim();
      if (productDescription === "") {
          editProductdescription.textContent = "Please enter a Description";
          return false;
      }
  
      // Validation for Main Image
      const mainImageInput = document.getElementById('editMainImage_' + selectedId);
      const mainImageFile = mainImageInput.files[0];
      if (!mainImageFile || !mainImageFile.type.startsWith("image/")) {
          editProductimage.textContent = "Please upload a Main Image";
          return false;
      }
  
      // Validation for Additional Images
      const additionalImagesInput = document.getElementById('editAdditionalImages_' + selectedId);
      const additionalImagesFiles = additionalImagesInput.files;
      for (let i = 0; i < additionalImagesFiles.length; i++) {
          const file = additionalImagesFiles[i];
          if (!file.type.startsWith("image/")) {
              editProductimages.textContent = "Additional Images must be in image format";
              return false;
          }
      }
  
      // Validation for Count in Stock
      const countInStock = document.getElementById('editProductCountInStock_' + selectedId).value.trim();
      if (countInStock === "" || isNaN(countInStock)) {
          editProductstock.textContent = "Please enter a valid Count in Stock";
          return false;
      }
  
      // Validation for Price
      const price = document.getElementById('editProductPrice_' + selectedId).value.trim();
      if (price === "" || isNaN(price)) {
          editProductprice.textContent = "Please enter a valid Price";
          return false;
      }
  
      // You can add more validations for other fields as needed
      return true;
  } 
 const successMessage = document.getElementById('successMessage');

  if (successMessage) {
      // Set a timeout to hide the message after 5 seconds (5000 milliseconds)
      setTimeout(function() {
          successMessage.style.display = 'none';
      }, 5000);
  }
  


 