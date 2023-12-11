
    const currentDate = new Date();

    document.addEventListener("DOMContentLoaded", function () {

        document.getElementById('createCouponSubmit').addEventListener('click', function () {
            // Clear previous error messages
            const errorFields = ['code', 'description','discountAmount', 'maxDiscountAmount','minimumAmount', 'maximumAmount', 'expirationDate', 'maxUsers'];
            errorFields.forEach((field) => {
                document.getElementById(`${field}Error`).textContent = '';
            });
        
            // Form data collection
            const code = document.getElementById('code').value;
            const description = document.getElementById('description').value;
            const maximumDIscountAmount = parseFloat(document.getElementById('maxDiscountAmount').value);
            const expirationDate = new Date(document.getElementById('expirationDate').value);
            const maxUsers = parseInt(document.getElementById('maxUsers').value, 10);
            const minimumAmount = parseFloat(document.getElementById('minimumAmount').value);
            const maximumAmount = parseFloat(document.getElementById('maximumAmount').value);
            const discountAmount = parseFloat(document.getElementById('discountAmount').value)
            // Validation logic
            let isValid = true;
        
            // Coupon Code Validation
            if (!/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6,}$/.test(code)) {
                document.getElementById('codeError').textContent = 'Invalid Coupon Code. It must contain at least 6 characters and a mix of uppercase letters and numbers.';
                isValid = false;
            }
        
            // Description Validation
            if (description.trim() === '' ||  description.length>25) {
                document.getElementById('descriptionError').textContent = 'Description is required.and the description under 25 words';
                isValid = false;
            }
    
            if(discountAmount<1 && discountAmount>100){
                document.getElementById('discountAmountError').textContent='The discount Percentage is must be 0 and 100'
            }
            
            if(maximumDIscountAmount < 1 && isNaN(maximumDIscountAmount)){
                document.getElementById('maxDiscountAmountError').textContent='The maximum amount is must be greater than 1'
            }
           
        
            // Expiration Date Validation
            if (expirationDate <= currentDate) {
                document.getElementById('expirationDateError').textContent = 'Expiration Date must be greater than the current date.';
                isValid = false;
            }
        
            // Maximum Users Validation
            if (isNaN(maxUsers) || maxUsers <= 0) {
                document.getElementById('maxUsersError').textContent = 'Maximum Users must be a positive number.';
                isValid = false;
            }
            
            if (minimumAmount <= 0) {
                document.getElementById('minimumAmountError').textContent = 'Minimum Amount must be greater than zero.';
                isValid = false;
            }
        
            // Maximum Amount Validation
            if (maximumAmount <= minimumAmount) {
                document.getElementById('maximumAmountError').textContent = 'Maximum Amount must be greater than or equal to Minimum Amount.';
                isValid = false;
            }
            // If the form is valid, submit the data
            if (isValid) {
                // Directly submit the form
                document.getElementById('createCouponForm').submit();
            }
        });
        
    
    
      // Automatically hide the toast after 6 seconds (6000 milliseconds)
      const toast = document.getElementById('errorToast')
      setTimeout(() => {
        toast.style.display='none'
      }, 6000);
    
    
    
    
    //RANDOM CODE GENERTAION 
    document.getElementById('generateCode').addEventListener('click', function () {
        // Generate a random coupon code
        const randomCode = generateRandomCode();
        
        // Fill the input field with the generated code
        document.getElementById('code').value = randomCode;
        
        // You can also trigger the input field's change event to validate the generated code
        const codeInput = document.getElementById('code');
        const codeChangeEvent = new Event('change', {
            bubbles: true,
            cancelable: true,
        });
        codeInput.dispatchEvent(codeChangeEvent);
    });
    
    function generateRandomCode() {
        // Generate a random code following your criteria
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const codeLength = 8;
        let randomCode = '';
        
        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomCode += characters.charAt(randomIndex);
        }
        
        return randomCode;
    }
    
    
    
    function closeCustomToast() {
        const customToast = document.getElementById('customToast');
        customToast.style.display = 'none';
    }
    
    
        })
    
    //EDIT COUPON 
    
    
    
    function populateEditModal(itemId) {
        // Access the item properties and populate the edit modal fields
       
        console.log(itemId)
                const item_id =  itemId
     
            const errorFields = ['code','maxDiscountAmount', 'description', 'discountAmount', 'minimumAmount', 'maximumAmount', 'expirationDate', 'maxUsers'];
    
            // Clear previous error messages
            errorFields.forEach((field) => {
                document.getElementById(`${field}Error_${item_id}`).textContent = '';
            });
    
            // Form data collection
            const code = document.getElementById(`code_${item_id}`).value;
            const description = document.getElementById(`description_${item_id}`).value;
            const expirationDate = new Date(document.getElementById(`expirationDate_${item_id}`).value);
            const maximumDiscountAmount = parseFloat(document.getElementById(`discountAmount_${item_id}`).value)
            const maxUsers = parseInt(document.getElementById(`maxUsers_${item_id}`).value, 10);
            const minimumAmount = parseFloat(document.getElementById(`minimumAmount_${item_id}`).value);
            const maximumAmount = parseFloat(document.getElementById(`maximumAmount_${item_id}`).value);
            const discountAmount = parseFloat(document.getElementById(`discountAmount_${item_id}`).value);
    
            // Validation logic
            let isValid = true;
    
            // Coupon Code Validation
            if (!/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6,}$/.test(code)) {
                document.getElementById(`codeError_${item_id}`).textContent = 'Invalid Coupon Code. It must contain at least 6 characters and a mix of uppercase letters and numbers.';
                isValid = false;
            }
    
            // Description Validation
            if (description.trim() === '' || description.length>25) {
                document.getElementById(`descriptionError_${item_id}`).textContent = 'Description is required & must be in 20 words.';
                isValid = false;
            }
    
            if (discountAmount < 1 || discountAmount > 100) {
                document.getElementById(`discountAmountError_${item_id}`).textContent = 'The discount Percentage must be between 1 and 100.';
                isValid = false;
            }
            
            if(maximumDiscountAmount <1 || isNaN(maximumDiscountAmount)){
                document.getElementById(`discountAmountError_${item_id}`).textContent='The Maximum Discount must be an number and not less than one'
            }
            // Start Date Validation
          
    
            // Expiration Date Validation
            if (expirationDate <= currentDate) {
                document.getElementById(`expirationDateError_${item_id}`).textContent = 'Expiration Date must be greater than the current date.';
                isValid = false;
            }
    
            // Maximum Users Validation
            if (isNaN(maxUsers) || maxUsers <= 0) {
                document.getElementById(`maxUsersError_${item_id}`).textContent = 'Maximum Users must be a positive number.';
                isValid = false;
            }
    
            if (minimumAmount <= 0) {
                document.getElementById(`minimumAmountError_${item_id}`).textContent = 'Minimum Amount must be greater than zero.';
                isValid = false;
            }
    
            // Maximum Amount Validation
            if (maximumAmount <= minimumAmount) {
                document.getElementById(`maximumAmountError_${item_id}`).textContent = 'Maximum Amount must be greater than or equal to Minimum Amount.';
                isValid = false;
            }
    
            // If the form is valid, submit the data
            if (isValid) {
                console.log('Form is valid. Submitting the form.');
                // Directly submit the form
                document.getElementById(`createCouponForm_${item_id}`).submit();
            }
    
    
    }
    
    
        //TO ACTIVATE AND DEACTIVATE THE COUPON 
    function toggleActivation(itemId, activate) {
      
        fetch(`/admin/coupon/update-status/${itemId}?activate=${activate}`, {
            method: 'POST', // Use POST or another appropriate HTTP method
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Success', data.message, 'alert-success');
                setTimeout(()=>{
                    window.location.reload();
                },3000)
                // Update the item's activation status based on 'activate'
                const item = document.getElementById(`item-${itemId}`);
                if (item) {
                    item.isActive = activate;
                    
                }
            } else {
                showAlert('Error', data.message, 'alert-danger');
                console.error('Activation toggle failed:', data.message);
            }
        })
        .catch(error => {
            showAlert('Error', 'Fetch error', 'alert-danger');
            console.error('Fetch error:', error);
        });
    }
    
    
    
    //Side Alert
    function showAlert(title, message, alertClass) {
        const alertContainer = document.getElementById('alertContainer');
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
          <strong>${title}:</strong> ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>`;
        alertContainer.appendChild(alertElement);
      }
    