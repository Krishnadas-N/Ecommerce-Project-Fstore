const mobileInput = document.getElementById('mobile');
const mobileMessage = document.getElementById('mobileMessage');
mobileInput.addEventListener('input',async ()=>{
    if(mobileInput.value.length>9){
    try {
        const response = await fetch(`/check-mobile?mobile=${mobileInput.value}`);
        const data = await response.json();
         // Display message based on uniqueness
         if (!data.unique) {
            mobileMessage.textContent = 'Mobile number already exists.';
        } else {
            mobileMessage.textContent = '';
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}
if(mobileInput.value.length !== 10){
    mobileMessage.textContent = "Please enter a valid mobile number.";
}
})

   
    // Attach the event listener to the form

    const spinnerOverlay = document.getElementById('spinner-overlay');
    function validateForm(event) {
       event.preventDefault()
        // Get all input fields
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const genderRadioButtons = document.getElementsByName('gender');
        const passwordInput = document.getElementById('password');
        const confirmpasswordInput = document.getElementById('confirmpassword');

        // Get all validation messages
        const firstNameMessage = document.getElementById('firstNameMessage');
        const lastNameMessage = document.getElementById('lastNameMessage');
        const emailMessage = document.getElementById('emailMessage');
        const passwordMessage = document.getElementById('passwordMessage');
        const confirmpasswordMessage = document.getElementById('confirmpasswordMessage');

        // Clear all validation messages
        firstNameMessage.textContent = '';
        lastNameMessage.textContent = '';
        emailMessage.textContent = '';
        mobileMessage.textContent = '';
        passwordMessage.textContent = '';
        confirmpasswordMessage.textContent = '';

        let valid = true;

        // Validate the first name field
        if (firstNameInput.value.trim() === '') {
            firstNameMessage.textContent = 'Please enter your first name.';
            valid = false;
        }

        // Validate the last name field
        if (lastNameInput.value.trim() === '') {
            lastNameMessage.textContent = 'Please enter your last name.';
            valid = false;
        }

        // Validate the email field
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailInput.value.trim())) {
            emailMessage.textContent = 'Please enter a valid email address.';
            valid = false;
        }
        if(mobileInput.value.length !== 10){
            mobileMessage.textContent = "Please enter a valid mobile number.";
            valid = false;
        }
        // Validate the password field
        if (passwordInput.value.length < 6) {
            passwordMessage.textContent = 'Please enter a password of at least 6 characters.';
            valid = false;
        }

        // Validate the confirm password field
        if (confirmpasswordInput.value !== passwordInput.value) {
            confirmpasswordMessage.textContent = 'Password and Confirm Password must be the same.';
            valid = false;
        }

        // If all fields are valid, proceed with form submission
        if (valid) {
            spinnerOverlay.style.display = 'flex';
            // Initialize a variable to store the selected value
            let selectedGender = '';

            // Loop through the radio buttons to find the selected one
            for (const radioButton of genderRadioButtons) {
                if (radioButton.checked) {
                    selectedGender = radioButton.value;
                    break; // Exit the loop once a selected radio button is found
                }
            }

            // Form data for submission
            const formData = {
                firstName: firstNameInput.value.trim(),
                lastName: lastNameInput.value.trim(),
                gender: selectedGender,
                email: emailInput.value.trim(),
                mobile: mobileInput.value.trim(),
                password: passwordInput.value,
            };

            // Send the form data to the server
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
                .then((response) => response.json())
                .then((data) => {
                    localStorage.setItem('otpPageVisited', 'false');
                    spinnerOverlay.style.display = 'none';
                    if (data.errors) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Validation Error',
                            text: data.errors,
                        });
                        // Display validation errors in the error message div
                    } else if (data.message) {
                 
                        // Redirect to OTP page upon successful response
                        location.href = '/verify-signin';
                    }
                })
                .catch((error) => {
                    spinnerOverlay.style.display = 'none';
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Some Errors caused in backend please try again',
                        text: error,
                    });
                    // Handle any network or server errors
                });
        }
    }