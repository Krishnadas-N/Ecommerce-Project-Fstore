function confirmDelete(orderId) {
    Swal.fire({
        title: 'Delete Order?',
        text: 'Are you sure you want to delete this order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it'
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user confirms, send a request to delete the order
            fetch(`/admin/order-management/deleteOder/${orderId}`, {
                method: 'DELETE'
            }).then((response) => response.json() ) 
             .then((response)=>{
                if (response.success) {
                    // Order deleted successfully
                    Swal.fire('Order Deleted', '', 'success');
                    
                    // You can also refresh the page or update the UI as needed
                } else {
                    // Handle deletion failure
                    Swal.fire('Error Deleting Order', response.message, 'error');
                }
            });
        }
    });
}