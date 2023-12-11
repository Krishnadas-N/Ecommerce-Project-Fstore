function removeItem(productId){
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to remove this product.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
      }).then((result) => {
        if (result.isConfirmed) {
    fetch('/cart/remove-product/'+productId,{
        method:'DELETE',
    })
    .then((res)=>res.json())
    .then((data)=>{
        const alertBox = document.getElementById('alert-box');
        let alertHTML = '';
  
        if(data.success){
            updateBillTotal();

        // Success message (green)
        alertHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="True">&times;</span>
            </button>
            <h4 class="alert-heading">Success</h4>
            <p>Deleted Sucessfully</p>
        </div>`;
        }else{
            // Error message (red)
        alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="True">&times;</span>
          </button>
          <h4 class="alert-heading">Error</h4>
          <p> ${data.message} </p>
        </div>`;
        }
         // Replace the content of the alert-box container with the alert message
      alertBox.innerHTML = alertHTML;
      setTimeout(()=>{
        window.location.reload()
      },2000)
    })
    .catch((err)=>{
        console.log(err)
    })
}
      })
 }


 
 //Function to Update Quanity of 
 const updateQuantity = (productId,newQuantity)=>{
  
    fetch('/cart/update-cart-quantity/'+productId,{
        method:'PUT',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
    }).then((res)=>res.json())
    .then((data)=>{
        if(data.success){
            updateBillTotal();
        }else{
            console.log(data.message)
        }
    })
    .catch((err)=>{
        console.log(err)
    })
 }

 //
 

 const qtyUpButtons = document.querySelectorAll('.qty-up');
 const qtyDownButtons = document.querySelectorAll('.qty-down');

 //Increase Quanity
 qtyUpButtons.forEach((button)=>{
    button.addEventListener('click',()=>{
 
        const productId = button.getAttribute('data-id');
        console.log(productId);
        
        const qtyElement = document.getElementById(`qty-${productId}`);
        const currentQty = parseInt(qtyElement.textContent);
        const stock = parseInt(button.getAttribute('data-stock'));

        console.log(productId,qtyElement,currentQty,stock);

        if(currentQty<stock){
        const newQty = currentQty+1;
        qtyElement.textContent = newQty;
        updateQuantity(productId,newQty);
        
        }else{
            const stockAlert = document.getElementById('stockAlert');
            stockAlert.style.display = 'block';
            setTimeout(() => {
                stockAlert.style.display = 'none';
            }, 3000);
            button.classList.add('disabled');
            button.removeEventListener('click', handleClick);
        }
    })
 })

 //Decrease Quantity
 qtyDownButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        console.log(productId)
        const qtyElement = document.getElementById(`qty-${productId}`);
        const currentQty = parseInt(qtyElement.textContent);

        console.log(productId,qtyElement,currentQty);
        if (currentQty > 1) {
            const newQty = currentQty - 1;
            qtyElement.textContent = newQty;
            updateQuantity(productId, newQty);
            
        } else {
            button.classList.add('disabled');
            toastr.warning("Quantity cannot be less than 1.");
        }
    });
});

function updateBillTotal() {
    const selectedProductIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(checkbox => checkbox.getAttribute('data-id'));

    fetch('/cart/update-cart-total', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedProductIds }),
    })
        .then(response => response.json())
        .then(data => {
            if(data.success){
            // Handle the response from the server, which may include the updated billTotal.
            console.log(data); // Log the response for testing purposes
            window.location.reload();
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.message
                });
                console.log(data.message)
            }
        })
        .catch(error => {
            // Handle errors if the request fails
            console.error('Error:', error);
        });
}

// Add an event listener to the checkboxes to call the updateBillTotal function when a checkbox is clicked
// Add an event listener to the checkboxes to call the updateBillTotal function when a checkbox is clicked
document.querySelectorAll('.product-checkbox').forEach(checkbox => {
    // Set the initial checkbox state from localStorage, if available
    const productId = checkbox.getAttribute('data-id');
    const isChecked = localStorage.getItem(`checkbox_${productId}`) === 'true';
    console.log(isChecked)
    checkbox.checked = isChecked ;

    checkbox.addEventListener('change', () => {
        updateBillTotal();

        // Store the checkbox state in localStorage
        localStorage.setItem(`checkbox_${productId}`, checkbox.checked);
    });
})

document.querySelector('a.btn').addEventListener('click', function(e) {
    if (this.classList.contains('disabled')) {
        e.preventDefault(); // Prevents the default action
    }
});



//COUPON
// Function to update the displayed coupon list based on the bill total
function updateCouponList(billTotal) {
    fetch(`/cart/getCoupons?billTotal=${billTotal}`)
        .then((response) => response.json())
        .then((coupons) => {
            const couponList = document.getElementById('couponList');
            couponList.innerHTML = '';

            if (coupons.length === 0) {
                couponList.innerHTML = '<p>No coupons available for this bill total</p>';
            } else {
                coupons.forEach((coupon) => {
                    const couponItem = document.createElement('div');
                    couponItem.classList.add('coupon-item');

                    const couponDetails = document.createElement('div');
                    couponDetails.classList.add('coupon-details');
                    couponDetails.innerHTML = `${coupon.code} - ${coupon.description}`;

                    const applyButton = document.createElement('button');
                    applyButton.classList.add('apply-btn');
                    applyButton.setAttribute('data-coupon', coupon.code);
                    applyButton.textContent = 'Apply';

                    couponItem.appendChild(couponDetails);
                    couponItem.appendChild(applyButton);

                    couponList.appendChild(couponItem);
                });

                // Attach event listeners to the Apply buttons
                document.querySelectorAll('.apply-btn').forEach((button) => {
                    button.addEventListener('click', function () {
                        const couponCode = this.getAttribute('data-coupon');
                        document.getElementById('couponCode').value = couponCode;
                    });
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching coupons:', error);
        });
}
// Function to handle the apply coupon button click
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value;
    const billTotalElement = document.getElementById('cartTotal');
    const billTotal = parseFloat(billTotalElement.textContent.slice(1));

    // Make an AJAX request to the backend to validate and apply the coupon
    fetch(`/cart/applyCoupon?code=${couponCode}&billTotal=${billTotal}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                document.getElementById('discountedPrice').textContent = '₹ ' + data.discountedPrice;

                // Update the total price on the frontend
                document.getElementById('totalPrice').textContent = '₹ ' + (billTotal - data.discountedPrice);
        

            } else {
              const span =   document.getElementById('errorCoupon')
              span.style.display='block'
              span.innerText=data.message
              setTimeout(()=>{span.style.display="none"},5000)
              document.getElementById('discountedPrice').textContent = '₹ ' + 0;

              // Update the total price on the frontend
              document.getElementById('totalPrice').textContent = '₹ ' + (billTotal - 0);
      

                // Update the displayed bill total if the coupon was applied successfully
              //  billTotalElement.textContent = '₹ ' + data.updatedBillTotal;
            }
        })
        .catch((error) => {
            console.error('Error applying coupon:', error);
        });
}

const billTotalElement = document.querySelector('[data-billTotal]');
const billTotal = parseFloat(billTotalElement.getAttribute('data-billTotal'));
console.log(billTotal); // You can use this value as needed

updateCouponList(billTotal)

