// errorMiddleware.js

function errorHandler(err, req, res, next) {
    console.error(err.stack);
  
    // Set a default status code for internal server error
    let statusCode = 500;
  
    // Check if the error is specific to admin or user route
    if (err.adminError) {
      // Admin-specific error handling
      statusCode = 500; // Set the status code for admin error
     return res.render('AdminError', { error: err.message,pagetitle:''  });
    } else {
      // User-specific error handling
      statusCode = 500; // Set the status code for user error
     return res.render('userViews/500Errors', { error: err.message });
    }
  
    // Set the status code and send an error response
    res.status(statusCode).send('Internal Server Error');
  }
  
  module.exports = errorHandler;
  