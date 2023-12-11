
const paginationLinks = document.getElementById('pagination');
const ordersContainer = document.getElementById('orders-container');



  // Define fetchOrders globally
const fetchOrders = async (page) => {
    try {
        const response = await fetch(`/get-orders?pageNumber=${page}`);
        const data = await response.json();

        // Clear previous orders and pagination links
        ordersContainer.innerHTML = '';
        paginationLinks.innerHTML = '';

        if (data.orders.length > 0) {
            data.orders.forEach((order) => {
                order.items.forEach((item) => {
                    const orderCard = document.createElement('div');
                    orderCard.className = 'card card-body';
                    orderCard.innerHTML = `
                    <div class="media align-items-center align-items-lg-start text-center text-lg-left flex-column flex-lg-row">
                        <div class="mr-2 mb-3 mb-lg-0">
                            <a href="/orderDetails/${order._id}?product=${item.productId}">
                                <img src="/${item.image}" width="150" height="150" alt="">
                            </a>
                        </div>
                        
                        <div class="media-body">
                            <h6 class="media-title font-weight-semibold">
                                <a href="/product-detail/${item.productId}" data-abc="true">${item.name}</a>
                            </h6>
                            
                            <ul class="list-inline list-inline-dotted mb-3 mb-lg-2">
                                <li class="list-inline-item">
                                    <a href="#" class="text-muted" style="text-decoration:'none';" data-abc="true">Status: ${order.status}</a>
                                </li>
                                <li class="list-inline-item">
                                    <a href="#" class="text-muted" data-abc="true">Qty: ${item.quantity}</a>
                                </li>
                                <li>
                                   OrderID: ${order.orderId}
                                </li>
                            </ul>
                            
                            <p class="mb-3"> </p>
                            
                            <ul class="list-inline list-inline-dotted mb-0">
                                <li class="list-inline-item">
                                    Payment Method: ${order.paymentMethod}
                                </li>
                            </ul>
                        </div>
                        
                        <div class="mt-3 mt-lg-0 ml-lg-3 text-center">
                            <h3 class="mb-0 font-weight-semibold">${item.price}</h3>
                            
                            <div>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                            </div>
                            ${
                                order.status === 'Canceled'
                                    ? `<p class="text-danger" id="cancellationMessage">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                                <path fill="#282C3F" fill-rule="nonzero" d="M15.854 8.146a.495.495 0 0 0-.703 0L12 11.296l-3.15-3.15a.495.495 0 0 0-.704 0 .495.495 0 0 0 0 .703L11.297 12l-3.15 3.15a.5.5 0 1 0 .35.85.485.485 0 0 0 .349-.146l3.15-3.15 3.151 3.15a.5.5 0 0 0 .35.147.479.479 0 0 0 .35-.147.495.495 0 0 0 0-.703L12.702 12l3.15-3.15a.495.495 0 0 0 0-.704z"></path>
                                            </svg> Canceled.<span style="font-size: 13px;">${order.requests && order.requests.length > 0 && order.requests[0].status === 'Pending' ? '(Amount will be refunded shortly.)' : '(Amount Refunded)'}</span>
                                        </p>`
                                    : order.status === 'Returned' && order.requests[0].status === 'Pending'
                                    ? `<p class="text-info" id="returnMessage">
                                        Returned.<span style="font-size: 11px;">(Amount will be refunded shortly)</span>
                                        </p>
                                       `
                                    : order.status === 'Returned' && order.requests[0].status === 'Accepted'
                                    ? `<p class="text-success" id="returnMessage">
                                    Returned.<span style="font-size: 11px;">Amount refunded.</span>
                                        </p>`
                                    : order.status === 'Delivered'
                                    ? `<button type="button" class="btn btn-small mt-3" onclick="openReturnModal('${order._id}')">Return Order</button>`
                                    : `<a href="/generate-invoice/${order._id}" class="btn btn-small btn-pdf">
                                            <i class="fas fa-file-pdf"></i> Invoice pdf
                                        </a>
                                        <button type="button" class="btn btn-small mt-3" onclick="cancelOrder('${order._id}')"> Cancel Order </button>
                                        <div class="modal" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                                            <div class="modal-dialog">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="confirmationModalLabel">${
                                                            order.status === 'Delivered'
                                                                ? 'Confirm Order Return'
                                                                : 'Confirm Order Cancellation'
                                                        }</h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        ${
                                                            order.status === 'Delivered'
                                                                ? `Are you sure you want to return this order? Please provide a reason below (optional):`
                                                                : `Are you sure you want to cancel this order? Please provide a reason below (optional):`
                                                        }
                                                        <textarea id="cancellationReason" class="form-control" rows="3"></textarea>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                        <button type="button" class="btn btn-danger" id="confirmCancellationButton">
                                                            ${
                                                                order.status === 'Delivered'
                                                                    ? 'Confirm Return'
                                                                    : 'Confirm Cancellation'
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`
                            }
                        </div>
                    </div>
                    <hr class="my-3">
                `;
                    ordersContainer.appendChild(orderCard);
                });
            });
        } else {
            // Display a message if no orders are found
            const noOrdersMessage = document.createElement('div');
            noOrdersMessage.textContent = 'No Orders Found. Please continue shopping.';
            ordersContainer.appendChild(noOrdersMessage);
        }
        // Add pagination links
        const totalPages = data.paginationInfo.totalPages;
        const currentPage = data.paginationInfo.currentPage;
        const visiblePages = 3; // Number of pages to show on each side of the current page

        const startPage = Math.max(1, currentPage - visiblePages);
        const endPage = Math.min(totalPages, currentPage + visiblePages);

        for (let page = startPage; page <= endPage; page++) {
            const li = document.createElement('li');
            li.className = `page-item ${page === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link ${page === currentPage ? 'active' : ''}" href="#" onclick="fetchOrders(${page})">${page}</a>`;
            paginationLinks.appendChild(li);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
   
    // Initial fetch when the page loads
    fetchOrders(1);

    // Your existing code for event listener
    paginationLinks.addEventListener('click', (event) => {
        event.preventDefault();
        const page = event.target.textContent;
        fetchOrders(page);
    });
});


const openReturnModal = (orderId) => {
    const returnModal = document.getElementById('returnModal');
    returnModal.dataset.orderId = orderId;
    // Show the modal
    returnModal.classList.add('show');
    returnModal.style.display = 'block';
    console.log(`Opening return modal for order ${orderId}`);
  };



const submitReturn = ()=>{
   // Get the order ID and return reason from the modal
   const orderId = document.getElementById('returnModal').dataset.orderId;
   const returnReason = document.getElementById('returnReason').value;
   console.log(`Submitting return for order ${orderId} with reason: ${returnReason}`);

   const spinner = document.getElementById('submitReturnSpinner');
   spinner.style.display = 'inline-block';

    fetch('/return-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId: orderId,
            returnReason: returnReason,
        }),
    })
    .then(response => response.json())
    .then(data => {
        closeModal();
        // Handle the response from the backend
        console.log('Return submitted successfully:', data);
        if(data.success){
           
            Swal.fire({
                title: "Success!",
                text: `Your return has been processed`,
                icon: "success"
            })
        }else{
           
            Swal.fire({
                title: "Error!",
                text: `${data.message}`,
                icon: "error"
            })
        }
        // Close the modal
     
    })
    .catch(error => {
        // Handle errors
        console.error('Error submitting return:', error);
        Swal.fire({
            title: "Error!",
            text: `${error}`,
            icon: "error"
        })
  
        // Optionally, you may want to show an error message to the user
    })
    .finally(() => {
        // Hide the spinner regardless of success or failure
        spinner.style.display = 'none';
    });

}

const closeModal = ()=>{
    const returnModal = document.getElementById('returnModal');
    returnModal.classList.remove('show');
    returnModal.style.display='none';
    document.getElementById('returnReason').value = '';
}