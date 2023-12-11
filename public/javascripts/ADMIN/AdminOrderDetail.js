
                        function submitOrderStatusForm(orderId) {
                            const newStatus = document.querySelector('select[name="orderStatus"]').value;
                    
                            // Make the fetch request
                            fetch(`/admin/order-management/update-order-status/${orderId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ orderStatus: newStatus }),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data.success) {
                                        // Handle success
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Order Status Updated',
                                            text: 'The order status has been updated successfully.',
                                        });
                                        
                                    } else {
                                        // Handle error
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error Updating Order Status',
                                            text: data.message || 'An error occurred while updating the order status.',
                                        });
                                    }
                                })
                                .catch((error) => {
                                    // Handle fetch error
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Fetch Error',
                                        text: 'An error occurred while making the request.',
                                    });
                                });
                        }
                        function refundAmount(orderId, userId) {
                            // Prepare the data to be sent
                            const requestData = {
                                orderId: orderId,
                                userId: userId,
                            };
                        
                            // Make a POST request to the backend endpoint
                            fetch('/admin/refund-amount', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestData),
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Handle successful response
                                console.log(data);  // You can replace this with your desired logic
                        
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Amount refunded to user successfully',
                                    text: 'The order status has been updated successfully.',
                                })
                                // Show a success message using SweetAlert
                              setTimeout(()=>{
                                window.location.reload()
                              },1000)
                            })
                            .catch(error => {
                                // Handle errors
                                console.error('Error:', error);
                                
                                Swal.fire({
                                    icon: 'Error!',
                                    title: 'Failed to refund amount',
                                    text: error,
                                });
                               
                            })// Show an error message using SweetAlert
                        }
