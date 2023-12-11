if (localStorage.getItem('otpPageVisited') === 'true') {
    console.log('Redirecting to login page...');
    // Redirect the user to the login page
    window.location.href = '/register';
} else {
    // Set a flag indicating that the OTP page has been visited
    localStorage.setItem('otpPageVisited', 'true');
}


function startTimer(duration, display, link) {
    var timer = duration, seconds;
    display.style.display = "inline";
    var timerInterval = setInterval(function () {
        seconds = parseInt(timer % 60, 10);
  
        seconds = seconds < 10 ? "0" + seconds : seconds;
  
        display.textContent = "00:" + seconds; // Assuming you want to display in the MM:SS format
  
        if (--timer < 0) {
            clearInterval(timerInterval);
            display.style.display = "none";
            link.style.display = "inline"; // Show the "Resend" link
        }
    }, 1000);
  }
  

  // Function to get the current timestamp
  function getCurrentTimestamp() {
    return new Date().getTime();
  }


 // Call the startTimer function with 5 minutes (300 seconds) as the initial duration
 var fiveMinutes = 30;
 var timerDisplay = document.getElementById("timer");
 var resendLink = document.getElementById("resendLink");
 startTimer(fiveMinutes, timerDisplay, resendLink);

   // Get references to the OTP input fields and the submit button
const otpInputs = Array.from(document.querySelectorAll('.form-control'));
const submitOTPButton = document.getElementById('submitOTPButton');


// Function to check if the OTP is valid
function isOTPValid(otp) {
    return /^\d{6}$/.test(otp); // Validates that the OTP contains exactly 6 digits
  }
  

// Function to get the entered OTP
function getEnteredOTP() {
    return otpInputs.map(input => input.value).join('');
  }

  const spinnerOverlay = document.getElementById('spinner-overlay');
  submitOTPButton.addEventListener('submit', async (e) => {
    e.preventDefault()
    const enteredOTP = getEnteredOTP();

    if (isOTPValid(enteredOTP)) {
        spinnerOverlay.style.display = 'flex';
      try {
        const response = await fetch('/verify-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp: enteredOTP }),
        });
  
        if (response.ok) {
            spinnerOverlay.style.display = 'none';
          // OTP verification was successful
          // Show a success SweetAlert and redirect the user
          Swal.fire({
            icon: 'success',
            title: 'OTP Verification Successful',
            text: 'You can now proceed to login.',
          }).then(() => {
            // Redirect the user to the login page
            window.location.href = '/login'; // Change '/login' to the actual login page URL
          });
        } else {
            spinnerOverlay.style.display = 'none';
          // Handle a failed verification
          // Show an error SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'OTP Verification Failed',
            text: 'Please check the OTP and try again. '+response.message,
          });
          console.error('OTP verification failed.');
        }
      } catch (error) {
        spinnerOverlay.style.display = 'none';
        // An error occurred while verifying OTP
        // Show an error SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
        });
        console.error('An error occurred while verifying OTP:', error);
      }
    } else {
      // Display an error message to the user indicating that the OTP is invalid
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'Please enter a 6-digit number.',
      });
      console.error('Invalid OTP. Please enter a 6-digit number.');
    }
  });
   
  async function resendOTP() {
    try {
        resendLink.style.display = 'none';
        document.getElementById('resendSpinner').style.display = 'inline-block';
      const response = await fetch('/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include any necessary data in the request body
      });
  
      if (response.ok) {
        // OTP resend was successful
        // Show a success message
        const toast = document.getElementById('toast');
        toast.textContent = 'OTP resent successfully!';
        toast.style.backgroundColor = '#28a745'; // Set a green background color for success
        toast.style.display = 'block';

        // Hide the toast message after a few seconds (e.g., 3 seconds)
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
        
        document.getElementById('resendSpinner').style.display='none'
        // Reset the countdown timer
        startTimer(fiveMinutes, timerDisplay, resendLink);
      } else {
        // Handle a failed OTP resend
        // Show an error message
        const toast = document.getElementById('toast');
            toast.textContent = 'OTP failed to  resent!';
            toast.style.backgroundColor = '#28a745'; // Set a green background color for success
            toast.style.display = 'block';

            // Hide the toast message after a few seconds (e.g., 3 seconds)
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
      }
    } catch (error) {
      // An error occurred while resending OTP
      // Show an error message
      showErrorMessage('An error occurred while resending OTP. Please try again.');
      console.error('An error occurred while resending OTP:', error);
    }
  }
  
  resendLink.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the link from navigating to a new page
    resendOTP(); // Call the resendOTP function
  });
  
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (event) => {
      if (event.inputType === 'insertText' && /^[0-9]$/.test(event.data)) {
        // Automatically focus on the next input box when a number is pressed
        const nextIndex = index + 1;
        if (nextIndex < otpInputs.length) {
          otpInputs[nextIndex].focus();
        }
      }
    });
  });