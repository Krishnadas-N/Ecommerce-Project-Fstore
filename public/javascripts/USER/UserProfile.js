document.addEventListener('DOMContentLoaded', function () {
    var copyButton = document.getElementById('copyButton');

    copyButton.addEventListener('click', function () {
      // Select the text input
      var textInput = document.querySelector('input[type="text"]');
      textInput.select();

      try {
        // Copy the text to the clipboard using the asynchronous Clipboard API
        document.execCommand('copy');
        copyButton.textContent = 'Copied';
      } catch (err) {
        console.error('Unable to copy to clipboard', err);

        // For desktop users who might not support the Clipboard API
        var range = document.createRange();
        range.selectNode(textInput);
        window.getSelection().removeAllRanges(); // Clear previous selections
        window.getSelection().addRange(range);

        try {
          // Copy the text to the clipboard using the synchronous document.execCommand
          document.execCommand('copy');
          copyButton.textContent = 'Copied';
        } catch (err) {
          console.error('Unable to copy to clipboard (fallback)', err);
        }
      }

      // Reset the button text after a short delay
      setTimeout(function () {
        copyButton.textContent = 'Copy';
      }, 2000); // Change the delay time as needed
    });
  });


 
  document.getElementById('saveAddress').addEventListener('click', function () {
    // Validate and save the address
    if (validateForm()) {
        saveAddress();
    }
}); 



function validateForm() {
    var valid = true;
    var addressType = $('#addressType').val();
    var houseNo = $('#houseNo').val();
    var street = $('#street').val();
    var pincode = $('#pincode').val();
    var city = $('#city').val();
    var district = $('#district').val();
    var state = $('#state').val();
    var country = $('#country').val();
      // Clear previous errors
      clearErrors();

      // Validation rules
      if(!addressType){
        valid = false;
        $('#addressTypeError').text('Type of Address is required')
      }
      if (!houseNo) {
          valid = false;
          $('#houseNoError').text('House No is required.');
      }
      if (!street) {
          valid = false;
          $('#streetError').text('Street is required.');
      }
      if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
          valid = false;
          $('#pincodeError').text('Pincode must be a 6-digit number.');
      }
      if (!city) {
        valid = false;
        $('#cityError').text('City is required.');
    }
    if(!district){
        valid = false;
        $('#districtError').text('District is Required')
    }
    if (!state) {
        valid = false;
        $('#stateError').text('State is required.');
    }
    if (!country) {
        valid = false;
        $('#countryError').text('Country is required.');
    }
    
    return valid;
}
function clearErrors() {
    $('#addressTypeError').text();
    $('#houseNoError').text('');
    $('#streetError').text('');
    $('#pincodeError').text('');
    $('#cityError').text('');
    $('#districtError').text('')
    $('#stateError').text('');
    $('#countryError').text('');
}


function saveAddress() {
    var addressData = {
        addressType:$('#addressType').val(),
        houseNo: $('#houseNo').val(),
        street: $('#street').val(),
        landmark: $('#landmark').val(),
        pincode: $('#pincode').val(),
        city: $('#city').val(),
        district:$('#district').val(),
        state: $('#state').val(),
        country: $('#country').val()
    };
    fetch('/profile/addAddress', {
        method: 'POST',
        body: JSON.stringify(addressData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            Swal.fire('success','Address Saved Successfully','success')
           
           setTimeout(()=>{
            window.location.reload()
           },2000) 
        } else {
            alert('Failed to save address. Please try again.'+data.message);
        }
    })
    .catch(function(error) {
        console.error(error);
     
        alert('An error occurred while saving the address.');
    });
}

//Edit ADdress
function addressRemove(addressType) {
    // You can use AJAX (e.g., fetch or XMLHttpRequest) to send a DELETE request to the backend

    fetch(`/profile/deleteAddress?addressType=${addressType}`, {
        method: 'DELETE',
        headers:{
            'Content-Type':'application/json'
        },
      
    })
    .then((response) => {
        if (response.ok) {
            // Address was successfully deleted
            // You can update the UI or display a message here
            console.log('Address deleted successfully.');
            Swal.fire('success','Address Deleted Sucessfully','success')
            window.location.reload()
        } else {
            // Handle the error and display an error message
            console.error('Error deleting address:', response.statusText);
            Swal.fire('error','Error Caused while Deleting','error')
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

//Edit Profile Details
// Open the first modal when the button is clicked
// Open the user contact details modal when the button is clicked
const openModalButton = document.getElementById('openModal');
const userContactModal = new bootstrap.Modal(document.getElementById('userContactModal'));
const otpVerificationModal = new bootstrap.Modal(document.getElementById('otpVerificationModal'));


// Validate and submit the form
const form = document.querySelector('#editprofile');
const firstNameInput = document.getElementById('form6Example1');
const lastNameInput = document.getElementById('form6Example2');
const emailInput = document.getElementById('form6Example5');
const mobileInput = document.getElementById('form6Example6');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    // Reset previous error messages
    document.querySelectorAll('.error-message').forEach((error) => {
        error.textContent = '';
    });

    // Validate first name and last name (not null)
    if (firstNameInput.value.trim() === '') {
        document.getElementById('firstNameError').textContent = 'First name is required.';
        isValid = false;
    }
    if (lastNameInput.value.trim() === '') {
        document.getElementById('lastNameError').textContent = 'Last name is required.';
        isValid = false;
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailInput.value)) {
        document.getElementById('emailError').textContent = 'Invalid email format.';
        isValid = false;
    }

    // Validate mobile number (10 digits)
    if (mobileInput.value.length !== 10) {
        document.getElementById('mobileError').textContent = 'Mobile number must be 10 digits.';
        isValid = false;
    }

    if (!isValid) {
        event.preventDefault(); 
        return;// Prevent form submission if validation fails
    }else{
        userContactModal.show();
    }
});



// Verify OTP Button (inside the OTP verification modal)
const verifyOTPButton = document.getElementById('verifyOTPButton');
const otpInput = document.getElementById('otpInput');

verifyOTPButton.addEventListener('click', () => {
    const enteredOTP = otpInput.value;
    // Implement your logic to verify OTP via fetch
    fetch('/profile/editVerify', {
        method: 'POST',
        body: JSON.stringify({ otp: enteredOTP }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            otpVerificationModal.hide();
          
            // OTP verified, proceed with form submission to the server
            // Get values using getElementById
                    const firstName = document.getElementById('form6Example1').value;
                    const lastName = document.getElementById('form6Example2').value;
                    const email = document.getElementById('form6Example5').value;
                    const gender = document.querySelector('input[name="gender"]:checked').value;
                    const mobile = document.getElementById('form6Example6').value;

                    // Now you have the values in the variables firstName, lastName, email, gender, and mobile.

            const Data ={
                firstName,
                lastName,
                email,
                gender,
                mobile
            }
    
            console.log(Data)
            fetch('/profile/editProfile', {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(Data),
            })
            .then(response => response.json() )
            .then((response)=>{
                if (response.success) {
                     // Handle success with Swal
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Profile Updated successfully',
                    });
                    window.location.reload()
                } else {
                    // Handle errors (e.g., display an error message)
                                // Handle errors with Swal
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Error: ${response.message}`,
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Fetch error: ${error}`,
                });
            });
        } else {
            alert('Invalid OTP. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error verifying OTP:', error);
    });
});




// Request OTP Button (inside the user contact details modal)
const requestOTPButton = document.getElementById('requestOTPButton');

requestOTPButton.addEventListener('click', () => {
    // Close the user contact details modal
    userContactModal.hide();

    // Implement your logic to send OTP to the server via fetch
    fetch('/profile/editConfirmation', {
        method: 'POST',
        body: JSON.stringify({ email: '<%= userDetails.email %>' }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // OTP sent successfully, open the OTP verification modal
            otpVerificationModal.show();
        } else {
            alert('Failed to send OTP. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error sending OTP:', error);
    });
});



document.querySelector('#changePasswordbtn').addEventListener('click', () => {
    // Make a fetch request to the '/change password' route
    const button = document.getElementById('changePasswordbtn');
    const spinner = document.getElementById('spinner');

    // Show the spinner
    spinner.classList.remove('d-none');

    fetch('/profile/change-password', {
        method: 'GET', // You can adjust the HTTP method as needed
    })
    .then(response => {
        spinner.classList.add('d-none');

        if (response.ok) {
            // Handle success with a success toast message
            displaySuccessMessage('Password Reset link sent successfully');
        } else {
            // Handle errors with an error toast message
            displayerrorMessage('Error changing password');
        }
    })
    .catch(error => {
        spinner.classList.add('d-none');

        // Handle fetch errors with an error toast message
        displayerrorMessage('Sorry for the trouble We are now unable to Connect the Server');
    });
});

function cancelOrder(orderId) {
    // Open the confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();
  
    // Handle the "Confirm Cancellation" button click
    const confirmCancellationButton = document.getElementById('confirmCancellationButton');
    confirmCancellationButton.addEventListener('click', function () {
      const cancellationReason = document.getElementById('cancellationReason').value;
      // Send an AJAX request to the server to cancel the order with the reason
      fetch(`/cancel-order/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancellationReason }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            // Handle success, e.g., display a success message or update the UI
            Swal.fire('Success', 'Order has been canceled successfully', 'success');
            setTimeout(()=>{
                window.location.reload()
            },1000)// Reload the page or refresh the order list
          } else {
            // Handle the case when the cancellation fails
            alert('Order cancellation failed. Please try again.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('An error occurred. Please try again later.');
        });
  
      // Close the modal
      confirmationModal.hide();
    });
  }

  function displayerrorMessage(message) {
    // Create a small rectangle box with a success icon and the message
    const errorBox = document.createElement('div');
   errorBox.className = 'error-box';
    
   errorBox.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ff0000; margin-right:5px"></i> ${message}`;

    // Add the 'slide-in' class to animate the message from the top
    errorBox.classList.add('slide-in');

    // Append the box to the document's body
    document.body.appendChild(errorBox);

    // Remove the box after a certain duration (e.g., 5 seconds)
    setTimeout(() => {
      // Remove the 'slide-in' class to slide the message out
      errorBox.classList.remove('slide-in');

      // Delay removal of the message to allow the slide-out animation
      setTimeout(() => {
        document.body.removeChild(errorBox);
      }, 500);
    }, 5000);
  }



function displaySuccessMessage(message) {
    // Create a small rectangle box with a success icon and the message
    const successBox = document.createElement('div');
    successBox.className = 'success-box';
    successBox.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b123; margin-right:5px"></i> ${message}`;

    // Append the box to the document's body
    document.body.appendChild(successBox);

    // Remove the box after a certain duration (e.g., 5 seconds)
    setTimeout(() => {
      document.body.removeChild(successBox);
    }, 5000);
  }

//Wallet Section

function addMoneyToWallet(userId) {
    Swal.fire({
        title: 'ENTER THE AMOUNT TO ADD :',
        input: 'text',
        inputLabel: 'Amount',
        inputPlaceholder: 'Enter the amount',
        showCancelButton: true,
        confirmButtonText: 'Add Money',
        showLoaderOnConfirm: true,
        preConfirm: (amount) => {
            // Validate the entered amount (you can add more validation as needed)
            if (!amount || isNaN(parseFloat(amount)) || amount<0) {
                Swal.showValidationMessage('Please enter a valid amount');
                return false;
            }

            // Make a POST request to add money to the wallet
            return fetch('/create-razorpay-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, amount }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error adding money to wallet');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Initialize Razorpay
                    const options = {
                        key: data.key_id,
                        amount: data.amount * 100, // Amount in paise
                        currency: data.currency,
                        name: data.name,
                        description: 'Add Money to Wallet',
                        order_id: data.orderId,
                        handler: function (response) {
                            // Handle the payment success
                            Swal.fire('Success', 'Payment successful!', 'success');
                            // Send the payment confirmation to your server
                            confirmPayment(userId, amount, response.razorpay_payment_id);
                        },
                        prefill: {
                            email: data.email,
                            contact: data.contact,
                        },
                        theme: {
                            color: '#007BFF',
                        },
                    };
    
                    const rzp = new Razorpay(options);
                    rzp.open();
                } else {
                    Swal.fire('Error', 'Failed to create Razorpay order', 'error');
                }
            })
            .catch(error => {
                Swal.showValidationMessage(`Request failed: ${error}`);
            });
        },
        allowOutsideClick: () => !Swal.isLoading(),
    })
    .then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success', `Money added successfully. New balance: $${result.value.balance.toFixed(2)}`, 'success');
        }
    });
}

function confirmPayment(userId, amount, paymentId) {
    // Send a request to your server to confirm the payment and update the wallet
    fetch('/confirm-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount, paymentId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            setTimeout(()=>{
                window.location.reload()
            },1000)
            // Handle the success response if needed
        } else {
            Swal.fire('Error', 'Failed to confirm payment', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire('Error', 'Something went wrong', 'error');
    });
}

function showWithdrawalPrompt(balance) {
    Swal.fire({
      title: 'Enter withdrawal amount',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Withdraw',
      showLoaderOnConfirm: true,
      preConfirm: (amount) => {
         // Client-side validation
      if (parseFloat(amount) < 1 || isNaN(parseFloat(amount))) {
        Swal.showValidationMessage('Invalid withdrawal amount. Amount must be at least 1.');
        return false;
      } else if (parseFloat(amount) > balance) {
        Swal.showValidationMessage(`You don't have enough balance`);
        return false;
      }
      
        // You can perform client-side validation here if needed
        return fetch('/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch((error) => {
            Swal.showValidationMessage(`Request failed: ${error}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Withdrawal successful!',
          icon: 'success',
        });
        setTimeout(()=>{
            window.location.reload()
        },1000)
      }
    });
  }


// Function to load content for a specific page
function loadContentForPage(page) {
    // Perform an AJAX request to fetch and update content based on the page number
    $.ajax({
        type: 'GET',
        url: '/profile/load-content?page=' + page, // Include "profile" in the URL
        success: function(data) {
            // Update the content area with the fetched data
            $('#content-area').html(data);
        },
        error: function(err) {
            console.error('Error loading content:', err);
        }
    });
}


function showErrorPopup(message) {
    var errorPopup = document.getElementById('errorPopup');
    var errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = message;
    errorPopup.style.display = 'block';
  }

  function closeErrorPopup() {
    var errorPopup = document.getElementById('errorPopup');
    errorPopup.style.display = 'none';
  }

  const profileMessageInput = document.getElementById('profileMessage');

  if (profileMessageInput && profileMessageInput.value !== '') {
    // Call the showErrorPopup function with the profileMsg value
    showErrorPopup(profileMessageInput.value);
  }