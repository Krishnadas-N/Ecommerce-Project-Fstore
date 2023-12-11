function toggleOffer(categoryId) {
  // Fetch data and perform activation/deactivation here
  var icon = $(`#icon_${categoryId}`);

  // Simulating a fetch request
  // Replace this with your actual fetch logic
  fetch('/admin/toggleOffer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categoryId: categoryId,
      activated: !icon.hasClass('fa-toggle-on'), // Toggle activation state
    }),
  })
  .then(response => response.json())
  .then(data => {
    // Update UI based on the response
    if (data.success) {
      if (icon.hasClass('fa-toggle-on')) {
        icon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
      } else {
        icon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
      }
      // Handle other UI updates or notifications as needed
    } else {
      // Handle error response
      console.error('Error toggling offer:', data.error);
    }
  })
  .catch(error => {
    // Handle fetch error
    console.error('Fetch error:', error);
  });
}
 
 
 
 
 
 let subCategory = null; // Initialize subcategory as null
    //FETCH SUBCATEGORY
      function getSubCategories(categoryId) {
        // Fetch subcategories for the given category
        fetch('/admin/category-management/subCategories/'+categoryId)
          .then(response => response.json())
          .then(data => {

            console.log(data)
           
            const modal = document.querySelector(`#subCategory${categoryId}`);
            const categoryName = modal.querySelector("#categoryName");
            const subcategoryList = modal.querySelector("#subcategoryList");
      
            // Set the category name in the modal header
         //   categoryName.textContent = data.categoryName;
         subcategoryList.innerHTML = '';
            console.log(data)
            
            // Populate subcategories in the list
            for(const subcategory of data.subcategories){
                const li = document.createElement("li");
                li.classList.add("list-group-item","li" ,"d-flex", "justify-content-between", "align-items-center"); // Add Bootstrap list-group-item class

                const editButton = document.createElement("button");
                const deleteButton = document.createElement("button");
              
                // Set the text and attributes for the edit button
                editButton.textContent = "Edit";
                editButton.dataset.subcategoryId = subcategory._id; // Assuming _id is the unique identifier for the subcategory
                editButton.classList.add("btn", "btn-primary","ms-3"); // Add Bootstrap button classes

                // Set the text and attributes for the delete button
                deleteButton.textContent = "Delete";
                deleteButton.dataset.subcategoryId = subcategory._id; // Assuming _id is the unique identifier for the subcategory
                deleteButton.classList.add("btn", "btn-danger","ms-3"); // Add Bootstrap button classes
                // Add click event listeners for edit and delete actions and these openwhen we click edit button and the data from databse fetch and call the function mentioned here and rest of code will execute there
                
                
                     // Function to open the modal and populate form fields
                        function openEditModal(existingData) {
                            console.log(existingData)
                            // Populate the form fields with existing data
                            document.getElementById("editSubcategoryName").value = existingData.subCategoryDetails[0].name;
                            document.getElementById("editSubcategoryDescription").value=existingData.subCategoryDetails[0].description;
                            // Populate other form fields similarly
                        
                            // Show the modal
                            $("#editSubcategoryModal").modal("show");
                        }

                        editButton.addEventListener("click", () => {
                            fetch(`category-management/subCategoryDetail/${subcategory._id}`)
                            .then(res => res.json())
                            .then((data)=>{
                               
                                let existingData = data;
                                subCategory = data.subCategoryDetails[0];
                                console.log(existingData+"hello this me")
                                openEditModal(existingData);
                            })
                            .catch((error) => {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Failed to open Edit Subcategory',
                                    text: 'There was an error while opening the Edit subcategory.',
                                  });
                            });
                             });   
        

                             deleteButton.addEventListener("click", () => {
                                // Confirm with the user before deleting the subcategory
                                Swal.fire({
                                  title: 'Delete Subcategory',
                                  text: 'Are you sure you want to delete this subcategory?',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonText: 'Yes, delete it!',
                                  cancelButtonText: 'No, cancel',
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    // User confirmed the deletion, proceed with the deletion
                                    deleteSubcategory(subcategory._id);
                                  }
                                });
                              });
              
                // Append buttons to the list item
                li.textContent = subcategory.name;
                li.appendChild(editButton);
                li.appendChild(deleteButton);
              
                // Append the list item to the subcategory list
                subcategoryList.appendChild(li);
            }
      
            // Attach category ID to the modal for later use
            modal.dataset.categoryId = categoryId;
            // Show the modal
            $(modal).modal("show");
          })
          .catch(error => console.error(error));
      }


      function deleteSubcategory(subcategoryId) {
        fetch(`/admin/category-management/subCategories/delete/${subcategoryId}`, {
          method: 'DELETE',
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === 'Successfully Deleted') {
              // Subcategory was successfully deleted
              // You can perform any additional actions, such as removing the subcategory from the UI
              // Reload or update the subcategory list
              // ...
              Swal.fire({
                icon: 'success',
                title: 'Subcategory Deleted Successfully!',
                text: 'The subcategory has been deleted.',
              }).then(()=>{
                window.location.reload();
              })
            
                  // Show a success message
                
             
            } else {
              // Failed to delete subcategory
              Swal.fire({
                icon: 'error',
                title: 'Failed to Delete Subcategory',
                text: 'There was an error while deleting the subcategory.',
              });
            }
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to Delete Subcategory',
              text: 'There was an error while deleting the subcategory.',
            });
          });
      }
      


      // Event listener for form submission and this is for edit sub category Form
   document.getElementById("saveChangesButton").addEventListener("click", () => {
    if (subCategory) {
    // Get the updated data from the form
    const updatedData = {
      name: document.getElementById("editSubcategoryName").value,
      description: document.getElementById('editSubcategoryDescription').value
      // Get other form fields similarly
    };
  
    // Send the updated data to the server to update the subcategory (you can use fetch)
    
    fetch(`/admin/category-management/subCategories/${subCategory._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.message === "Subcategory successfully updated") {
          // The subcategory was updated successfully
          // You can close the modal or perform any other action
          $("#editSubcategoryModal").modal("hide");
         
          Swal.fire({
            icon: 'success',
            title: 'Subcategory updated Successfully!',
            text: 'You have successfully  updated the subcategory.',
          }).then(()=>{
            window.location.reload();
          });
        
        } else {
          console.error("Failed to update subcategory:", data.message);
          Swal.fire({
            icon: 'error',
            title: "Failed to update subcategory: "+ data.message,
            text: 'There was an error while updating the subcategory.',
          });
        }
      })
      .catch((error) => console.error(error));
    }else{
        console.error("Subcategory is not defined");
        Swal.fire({
            icon: 'error',
            title: "Failed to update subcategory: ",
            text: 'There was an error because Sub Category is not define.',
          });
    }
  });



      document.addEventListener("DOMContentLoaded", () => {
        const modal = document.querySelector(".modal");
      
        const addSubcategoryButton = document.querySelectorAll("#addNewSubcategoryButton");
        const editSubcategoryButton = modal.querySelector("#editSubcategoryButton");
        const deleteSubcategoryButton = modal.querySelector("#deleteSubcategoryButton");
      
        //addSubcategoryButton.addEventListener("click", () => {
       //   $('#addSubcategoryModal').modal('show');
         // ;
       // });

       addSubcategoryButton.forEach(button => {
        button.addEventListener("click", () => {
          // Show the submodal for adding a subcategory
          const categoryId = button.getAttribute("data-category-id");
          modal.categoryId = categoryId;
          console.log('categoryId:', categoryId);
          $('#addSubcategoryModal').modal('show');
         
            // Store the categoryId in a variable that's accessible within the saveSubcategoryButton event listener
            

        });
      });
      
      const saveSubcategoryButton = document.querySelector("#saveSubcategoryButton");

      saveSubcategoryButton.addEventListener("click", async () => {
        const subcategoryName = document.querySelector("#subcategoryName").value;
        const subcategoryDescription = document.querySelector("#subcategoryDescription").value;
        const categoryId = modal.categoryId;

        const data = {
            subcategoryName,
            subcategoryDescription,
            categoryId: categoryId, // Include the category ID in the data
          };

          try {
            const response = await fetch('/admin/category-management/subCategories/create', {
              method: 'POST', // Change to the appropriate HTTP method (POST, PUT, etc.)
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
      
            if (response.ok) {
              $('#addSubcategoryModal').modal('hide');
              Swal.fire({
                icon: 'success',
                title: 'Subcategory Created Successfully!',
                text: 'You have successfully created the subcategory.',
              }).then(()=>{
                window.location.reload();
              });
            ;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed to Create Subcategory',
                text: 'There was an error while creating the subcategory.',
              });
            }
          } catch (error) {
            console.error('An error occurred:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Create Subcategory',
                text: 'There was an error while creating the subcategory.'+error,
              });
          }
        });


      });





   
    

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("creatCattegoryForm");
        const Editform = document.getElementById("categoryEditForm");
    
        form.addEventListener("submit", function (event) {
            let valid = true;
    
            // Validation for Category Name
            const categoryName = document.getElementById("name").value.trim();
            if (categoryName === "") {
                valid = false;
                Swal.fire('Validation Error', 'Please enter a Category Name', 'error');
            }
    
            // Validation for Category Description
            const categoryDescription = document.getElementById("description").value.trim();
            if (categoryDescription === "") {
                valid = false;
                Swal.fire('Validation Error', 'Please enter a Category Description', 'error');
            }
            const categoryOffer = document.getElementById('categoryOffer').value.trim()
            if(isNaN(categoryOffer) || categoryOffer < 0 || categoryOffer > 100){
              valid = false;
              Swal.fire('Validation Error', 'The category Offer Must be an Number and range 0-100', 'error');
        
            }
            // Validation for Category Image
            const imageInput = document.getElementById("image");
            const uploadedFile = imageInput.files[0];
    
            if (!uploadedFile) {
                valid = false;
                Swal.fire('Validation Error', 'Please upload an image', 'error');
            } else {
                const allowedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
    
                if (allowedFormats.indexOf(uploadedFile.type) === -1) {
                    valid = false;
                    Swal.fire('Validation Error', 'Please upload a valid image file (JPEG, PNG, GIF,webp)', 'error');
                }
            }
    
            if (!valid) {
                event.preventDefault(); // Prevent form submission if validation fails
            }
        });
    
        Editform.addEventListener("submit", function (event) {
            let valid = true;
    
            // Validation for Category Name
            const categoryName = document.getElementById("name").value.trim();
            if (categoryName === "") {
                valid = false;
                Swal.fire('Validation Error', 'Please enter a Category Name', 'error');
            }
    
            // Validation for Category Description
            const categoryDescription = document.getElementById("description").value.trim();
            if (categoryDescription === "") {
                valid = false;
                Swal.fire('Validation Error', 'Please enter a Category Description', 'error');
            }
            const editcategoryOffer = document.querySelectorAll('#editcategoryOffer').value.trim()
            if(editcategoryOffer < 1 || isNaN(editcategoryOffer) ||editcategoryOffer>100 ){
              valid = false;
              Swal.fire('Validation Error', 'The category Offer Must be an Number and range 0-100', 'error');
        
            }
            if (!valid) {
                event.preventDefault(); // Prevent form submission if validation fails
            }
        });
    });
    

    //Category UNlisting
    function toggleCategoryStatus(categoryId, currentStatus) {
      let newStatus;
  
      Swal.fire({
          title: 'Are You Sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: `Yes ${newStatus === 'active' ? 'List' : 'Unlist'}`,
      }).then((result) => {
          if (!result.isConfirmed) {
              return;
          } else {
              fetch('/admin/category-management/update-status/' + categoryId, {
                  method: 'PATCH',
               
              })
                  .then((res) => res.json())
                  .then((data) => {
                      console.log(data);
                      Swal.fire(`${newStatus === 'active' ? 'Listed' : 'Unlisted'} Successfully`, '', 'success').then(()=>{
                        window.location.reload();
                      });
                    ;
                      // Update the button text and icon based on the new status
                     
                  })
                  .catch((err) => {
                      console.log(err);
                      Swal.fire(`${err}`, '', 'error');
                  });
          }
      });
  }

  
  $(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
  });
//Error Handing


