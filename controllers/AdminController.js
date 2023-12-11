const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt'); 
const Product  = require('../models/productModel');
const Category = require('../models/CategoryModel');
const OrderModel = require('../models/OrderModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


const adminHome = async (req, res,next) => {
  try {
    // Get the current order count
    const OrderCount = await OrderModel.countDocuments();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName').exec();

    // Get the current date
    const currentDate = new Date();

    // Calculate the percentage change for orders in the last 3 days
    const threeDaysAgo = new Date();
   

    const orderQuery = {
      orderDate: { $gte: currentDate, $lte: currentDate },
    };

    const orderCounts = await OrderModel.countDocuments(orderQuery);

    const threeDaysAgoCount = await OrderModel.countDocuments({
      orderDate: { $gte: threeDaysAgo, $lte: threeDaysAgo },
    });

    let percentageChange = 0;
    if (threeDaysAgoCount > 0) {
      percentageChange = ((orderCounts - threeDaysAgoCount) / threeDaysAgoCount) * 100;
    }

    // Calculate the product count change on a 3-day interval
    const productQuery = {
      createdAt: { $gte: currentDate, $lte: currentDate },
    };

    const productCounts = await Product.countDocuments(productQuery);

    const threeDaysAgoProductCount = await Product.countDocuments({
      createdAt: { $gte: threeDaysAgo, $lte: threeDaysAgo },
    });

    let productPercentageChange = 0;
    if (threeDaysAgoProductCount > 0) {
      productPercentageChange = ((productCounts - threeDaysAgoProductCount) / threeDaysAgoProductCount) * 100;
    }

    // Calculate the revenue for the last 3 days
    const revenueQuery = {
      orderDate: { $gte: currentDate, $lte: currentDate },
    };

    const revenues = await OrderModel.find(revenueQuery).select('billTotal');

    const threeDaysAgoRevenue = await OrderModel
      .find({ orderDate: { $gte: threeDaysAgo, $lte: threeDaysAgo } })
      .select('billTotal');

    let Revenue = 0;
    let RevenuePercentageChange = 0;

    if (revenues.length > 0 && threeDaysAgoRevenue.length > 0) {
      const totalRevenue = revenues.reduce((total, order) => total + order.billTotal, 0);
      const totalThreeDaysAgoRevenue = threeDaysAgoRevenue.reduce((total, order) => total + order.billTotal, 0);

      Revenue = totalRevenue;
      if (totalThreeDaysAgoRevenue > 0) {
        RevenuePercentageChange = ((totalRevenue - totalThreeDaysAgoRevenue) / totalThreeDaysAgoRevenue) * 100;
      }
    }

    // Ensure the percentage change is within the range of -100% to 100%
    percentageChange = Math.max(-100, Math.min(100, percentageChange));
    productPercentageChange = Math.max(-100, Math.min(100, productPercentageChange));

    console.log('threeDaysAgo:', threeDaysAgo);
    console.log('currentDate:', currentDate);
    console.log('orderCounts:', orderCounts);
    console.log('threeDaysAgoCount:', threeDaysAgoCount);
    console.log('productCounts:', productCounts);
    console.log('threeDaysAgoProductCount:', threeDaysAgoProductCount);
    const category =  await Category.find({})
   
    res.render('admin', {
      pagetitle: 'Home',
      orders,
      Category:category,
      OrderCount,
      percentageChange,
      ProductCount: productCounts,
      productPercentageChange,
      Revenue,
      RevenuePercentageChange,
    });
  } catch (error) {
    // Pass the error to the error handling middleware
    error.adminError = true;
    next(error);
  }
};



const adminDailyDataGet = async (req, res,next) => {
  try {
    // Calculate daily orders and revenue here based on your requirements
    const dailyOrdersData = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$billTotal' },
        },
      },
    ]);
    console.log(dailyOrdersData)
    res.json({ dailyOrdersData });
  } catch (error) {
    // Pass the error to the error handling middleware
    error.adminError = true;
    next(error);
  }
};



// Function to fetch current user data (Active users)
const fetchCurrentUserData = async () => {
  try {
    // Customize this query to get the data you need
    const currentUserData = await User.find({ isBlocked: false }).countDocuments();
    return currentUserData;
  } catch (error) {
    console.error('Error fetching current user data:', error);
    return 0; // Return a default value or handle the error as needed
  }
};

// Function to fetch new user data (e.g., users registered in the last 30 days)
const fetchNewUserData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Customize this query to get the data you need
    const newUserData = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).countDocuments();
    return newUserData;
  } catch (error) {
    console.error('Error fetching new user data:', error);
    return 0; // Return a default value or handle the error as needed
  }
};

const adminUserDataGet =  async (req, res,next) => {
  try {
    // Fetch user data based on your requirements
    const currentUserData = await fetchCurrentUserData(); // Implement this function
    const newUserData = await fetchNewUserData(); // Implement this function

    res.json({ currentUserData, newUserData});
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

// Function to fetch log data
const fetchLogData = async () => {
  // Implement logic to fetch log data, e.g., from a database
  // Example data format:
  const logData = [
    { type: 'success', title: 'New item sold', time: '10:10' },
    // Add more log entries here
  ];

  return logData;
};

const adminDataLogs = async (req, res,next) => {
  try {
    // Fetch log data from your database or any other source
    const logData = await fetchLogData(); // Implement this function

    res.json({ logData });
  } catch (error) {
    console.error('Error fetching log data:', error);
    res.status(500).json({ message: 'Error fetching log data' });
  }
}


const adminDaliyVisistors = async (req, res,next) => {
  try {
    // Implement logic to fetch daily visitors data from the database
    // You can use your User model and aggregation queries for this

    // Example: Fetch the number of users registered daily
    const dailyVisitorsData = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ dailyVisitorsData });
  } catch (error) {
    console.error('Error fetching daily visitors data:', error);
    res.status(500).json({ message: 'Error fetching daily visitors data' });
  }
}



const adminMovingtoOutofStockProducts = async (req, res,next) => {
  try {
    // Implement logic to fetch products moving to out of stock from the database
    // You can customize your query based on your criteria

    const movingToOutOfStockProducts = await Product.find({
      countInStock: { $lt: 10 }, // Adjust the quantity threshold as needed
    });
    console.log(movingToOutOfStockProducts)
    res.json({ movingToOutOfStockProducts });
  } catch (error) {
    console.error('Error fetching products moving to out of stock:', error);
    res.status(500).json({ message: 'Error fetching products moving to out of stock' });
  }
}

const adminOutofStockProducts =  async (req, res,next) => {
  try {
    // Implement logic to fetch out of stock products from the database
    // You can customize your query based on your criteria

    const outOfStockProducts = await Product.find({
      countInStock: 0,
    });
    console.log(outOfStockProducts)
    res.json({ outOfStockProducts });
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    res.status(500).json({ message: 'Error fetching out of stock products' });
  }
};

const adminGetReports =  async (req, res,next) => {
  try {
      // Implement logic to fetch the report based on the time frame from the database
      const timeFrame = req.params.timeFrame; // Get the time frame from the URL

      // You can use the 'timeFrame' variable to customize your query based on the selected option

      // const reportData = await Report.generateReport(timeFrame);

      res.json({reportData:"hhh"});
  } catch (error) {
      console.error(`Error fetching report for ${req.params.timeFrame}:`, error);
      res.status(500).json({ message: `Error fetching report for ${req.params.timeFrame}` });
  }
}



const adminOrdersByCategory =  async (req, res,next) => {
  try {
    console.log("Category Ethi////////////////////////////////////////////////////////////////////////////////////////////////////////////");
    const { category } = req.query;

    let aggregationPipeline = [
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
    ];

    if (category) {
      aggregationPipeline.push({
        $match: {
          'product.category': mongoose.Types.ObjectId(category),
        },
      });
    }

    aggregationPipeline.push({
      $group: {
        _id: '$_id',
        user: { $first: '$user' },
        items: { $push: '$items' },
        billTotal: { $first: '$billTotal' },
        paymentMethod: { $first: '$paymentMethod' },
        paymentStatus: { $first: '$paymentStatus' },
        paymentId: { $first: '$paymentId' },
        deliveryAddress: { $first: '$deliveryAddress' },
        orderDate: { $first: '$orderDate' },
        status: { $first: '$status' },
      },
    });

    const orders = await OrderModel.aggregate(aggregationPipeline);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by category:', error);
    res.status(500).json({ error: 'Error fetching orders by category' });
  }
}

function calculateMostSoldProducts(orders) {
  const productCount = new Map();
  orders.forEach(order => {
    order.items.forEach(item => {
      if (productCount.has(item.productId.name)) {
        productCount.set(item.productId.name, productCount.get(item.productId.name) + item.quantity);
      } else {
        productCount.set(item.productId.name, item.quantity);
      }
    });
  })

  const sortedProducts = Array.from(productCount.entries()).sort((a, b) => b[1] - a[1]);
  return sortedProducts.slice(0, 5); // Get the top 5 most sold products
}

function calculateTotalProfit(orders) {
  return orders.reduce((totalProfit, order) => {
    if (order.paymentStatus === 'Success') {
      const orderCost = order.items.reduce((cost, item) => cost + item.productPrice, 0);
      totalProfit += order.billTotal - orderCost;
    }
    return totalProfit;
  }, 0);
}


const adminDailySalesReport = async (req, res,next) => {

  try {
    const type = req.params.type;
    if (type === 'daily') {
      const dailySalesDataArray = [];

      // Get the current date
      const currentDate = new Date();
  
      // Loop through the past 20 days
      for (let i = 0; i < 20; i++) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() - i);
        endDate.setHours(23, 59, 59, 999);
  
        // Retrieve orders for the current day
        const orders = await OrderModel.find({
          orderDate: { $gte: startDate, $lte: endDate }
        }).populate('items.productId');
  
        // Calculate daily statistics for the current day
        const dailySalesData = {
          date: startDate.toDateString(),
          Day: startDate.toLocaleDateString('en-US', { weekday: 'long' }),
          totalOrders: orders.length,
          totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
          mostSoldProducts: await calculateMostSoldProducts(orders),
          totalCancelledOrders: orders.filter(order => order.paymentStatus === 'Failed').length,
          totalProfit: await calculateTotalProfit(orders),
        };
  
        // Retrieve user details for the current day
        const users = await User.find({
          createdAt: { $gte: startDate, $lte: endDate }
        });
  
        // Calculate the number of customers who signed in for the current day
        const customersSignedIn = users.length;
  
        // Add user data and customer count to the daily sales data
        dailySalesData.customersSignedIn = customersSignedIn;
  
        // Add the daily sales data to the array
        dailySalesDataArray.push(dailySalesData);
      }
      
      console.log(dailySalesDataArray)
      // Render the page with the paginated report data.
     return res.render('adminSalesDaily', { pagetitle: 'Daily Sales Report', dailySalesDataArray:dailySalesDataArray });
    }


   else if (type === 'weekly') {
      const weeklySalesDataArray = [];
    
      // Get the current date
      const currentDate = new Date();
    
      // Loop through the past 10 weeks
      for (let i = 0; i < 10; i++) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i * 7); // Adjust for weeks
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of the week
        endDate.setHours(23, 59, 59, 999);
    
        // Retrieve orders for the current week
        const orders = await OrderModel.find({
          orderDate: { $gte: startDate, $lte: endDate },
        }).populate('items.productId');
    
        // Calculate weekly statistics for the current week
        const weeklySalesData = {
          startDate: startDate.toDateString(),
          endDate: endDate.toDateString(),
          totalOrders: orders.length,
          totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
          mostSoldProducts: await calculateMostSoldProducts(orders),
          totalCancelledOrders: orders.filter((order) => order.paymentStatus === 'Failed').length,
          totalProfit: await calculateTotalProfit(orders),
        };
    
        // Retrieve user details for the current week
        const users = await User.find({
          createdAt: { $gte: startDate, $lte: endDate },
        });
    
        // Calculate the number of customers who signed in for the current week
        const customersSignedIn = users.length;
    
        // Add user data and customer count to the weekly sales data
        weeklySalesData.customersSignedIn = customersSignedIn;
    
        // Add the weekly sales data to the array
        weeklySalesDataArray.push(weeklySalesData);
      }
    
      console.log(weeklySalesDataArray);
      // Render the page with the paginated report data.
      return res.render('adminWeeklySales', {
        pagetitle: 'Weekly Sales Report',
        weeklySalesDataArray: weeklySalesDataArray,
      });
    }
    
  else if(type === 'yearly'){
    const yearsToRetrieve = 5;
const yearlySalesDataArray = [];

// Get the current year
const currentYear = new Date().getFullYear();

// Loop through the past 5 years
for (let i = 0; i < yearsToRetrieve; i++) {
  const startYear = currentYear - i;
  const endYear = startYear;
  
  // Retrieve orders for the current year
  const orders = await OrderModel.find({
    orderDate: {
      $gte: new Date(startYear, 0, 1),
      $lte: new Date(endYear, 11, 31, 23, 59, 59, 999)
    }
  }).populate('items.productId');

  // Calculate yearly statistics for the current year
  const yearlySalesData = {
    year: startYear,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
    mostSoldProducts: await calculateMostSoldProducts(orders),
    totalCancelledOrders: orders.filter(order => order.paymentStatus === 'Failed').length,
    totalProfit: await calculateTotalProfit(orders),
  };

  // Retrieve user details for the current year
  const users = await User.find({
    createdAt: {
      $gte: new Date(startYear, 0, 1),
      $lte: new Date(endYear, 11, 31, 23, 59, 59, 999)
    }
  });

  // Calculate the number of customers who signed in for the current year
  const customersSignedIn = users.length;

  // Add user data and customer count to the yearly sales data
  yearlySalesData.customersSignedIn = customersSignedIn;

  // Add the yearly sales data to the array
  yearlySalesDataArray.push(yearlySalesData);
}
  
    // Render the page with the paginated report data.
    res.render('adminYearlySalesReport', {
      pagetitle: 'Yearly Sales Report', yearlySalesDataArray 
    });
  }
  else{
    res.render('errorHandler')
  }

  } catch (error) {
    // Pass the error to the error handling middleware
    error.adminError = true;
    next(error);
  }
};



function generateAndSendPDF(yearlySalesData, startYear, endYear, res) {
  const doc = new PDFDocument();
  const filename = `yearly_sales_report_${startYear}_${endYear}.pdf`;

  // Set the response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res); // Send the PDF directly to the response

  doc.fontSize(16).text('Yearly Sales Report', { align: 'center' });

  // Define column positions and sizes
  const columns = {
    year: { x: 50, width: 60 },
    totalOrders: { x: 150, width: 80 },
    totalRevenue: { x: 230, width: 110 },
    mostSoldProducts: { x: 320, width: 170 },
    totalCancelledOrders: { x: 490, width: 100 },
    totalProfit: { x: 580, width: 100 },
    customersSignedIn: { x: 660, width: 100 }
  };

  // Write headers
  doc.fontSize(12);
  for (const key in columns) {
    doc.text(key, columns[key].x, 80);
  }

  // Write data
  let y = 100; // Vertical cursor position
  doc.fontSize(10);
  yearlySalesData.forEach(data => {
    for (const key in columns) {
      doc.text(data[key], columns[key].x, y, { width: columns[key].width });
    }

    // Draw horizontal line for row border
    doc.moveTo(columns.year.x, y + 15)
      .lineTo(columns.customersSignedIn.x + columns.customersSignedIn.width, y + 15)
      .stroke();

    y += 30; // Move cursor down for the next line
  })

  // Draw vertical lines for column borders
  doc.moveTo(columns.year.x, 80)
    .lineTo(columns.year.x, y)
    .stroke();

  for (const key in columns) {
    doc.moveTo(columns[key].x + columns[key].width, 80)
      .lineTo(columns[key].x + columns[key].width, y)
      .stroke();
  }

  doc.end();
}





// Define a function to generate the Excel report and send it as a response
function generateAndSendExcel(yearlySalesData, startYear, endYear, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Yearly Sales Report');

  // Define the columns in the Excel worksheet
  worksheet.columns = [
    { header: 'Year', key: 'year' },
    { header: 'Total Orders', key: 'totalOrders' },
    { header: 'Total Revenue', key: 'totalRevenue' },
    { header: 'Most Sold Products', key: 'mostSoldProducts' },
    { header: 'Total Cancelled Orders', key: 'totalCancelledOrders' },
    { header: 'Total Profit', key: 'totalProfit' },
    { header: 'Customers Signed In', key: 'customersSignedIn' },
  ];

  // Loop through the yearly sales data and add it to the Excel worksheet
  yearlySalesData.forEach((data) => {
    worksheet.addRow({
      year: data.year,
      totalOrders: data.totalOrders,
      totalRevenue: data.totalRevenue,
      mostSoldProducts: data.mostSoldProducts,
        // .map((product) => `${product.productName}: Sold ${product.quantity} times`)
        // .join('\n'),
      totalCancelledOrders: data.totalCancelledOrders,
      totalProfit: data.totalProfit,
      customersSignedIn: data.customersSignedIn,
    });
  });

  const filename = `yearly_sales_report_${startYear}_${endYear}.xlsx`;

  // Set the response headers for Excel
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Send the Excel workbook directly to the response
  workbook.xlsx.write(res).then(() => {
    console.log(`Excel file sent as response`);
  });
}


const generateYearlyReport = async (req, res,next) => {
  try {
    const startYear = parseInt(req.query.startYear);
    const endYear = parseInt(req.query.endYear);
    const yearlySalesDataArray = [];
    const format = req.query.format;
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Loop through the years within the specified range
    for (let year = startYear; year <= endYear; year++) {
      const startOfYear = currentYear - (year - startYear);
      const endOfYear = startOfYear;

      // Retrieve orders for the current year
      const orders = await OrderModel.find({
        orderDate: {
          $gte: new Date(startOfYear, 0, 1),
          $lte: new Date(endOfYear, 11, 31, 23, 59, 59, 999)
        }
      }).populate('items.productId');

      // Calculate yearly statistics for the current year
      const yearlySalesData = {
        year: year,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
        mostSoldProducts: await calculateMostSoldProducts(orders),
        totalCancelledOrders: orders.filter(order => order.paymentStatus === 'Failed').length,
        totalProfit: await calculateTotalProfit(orders)
      };

      // Retrieve user details for the current year
      const users = await User.find({
        createdAt: {
          $gte: new Date(startOfYear, 0, 1),
          $lte: new Date(endOfYear, 11, 31, 23, 59, 59, 999)
        }
      });

      // Calculate the number of customers who signed in for the current year
      const customersSignedIn = users.length;

      // Add user data and customer count to the yearly sales data
      yearlySalesData.customersSignedIn = customersSignedIn;

      // Add the yearly sales data to the array
      yearlySalesDataArray.push(yearlySalesData);
    }
    console.log(yearlySalesDataArray)
    if (format === 'excel') {
      // Generate and send the Excel report
      generateAndSendExcel(yearlySalesDataArray, startYear, endYear, res);
    } else if (format === 'pdf') {
      // Generate and send the PDF report
      generateAndSendPDF(yearlySalesDataArray,  startYear, endYear,res);
    } else {
      // Handle unsupported format
      res.status(400).json({ error: 'Unsupported format' });
    }
   
  } catch (err) {
    console.log(err);
  }
};


//Weekly

function generatePDFWeekly(weeklySalesData, startDate, endDate, res) {
  // Create a new PDF document
  const doc = new PDFDocument();

  // Set the response header for a PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=weekly_report_${startDate.toISOString()}.pdf`);

  // Pipe the PDF document to the response object
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(16).text('Weekly Sales Report', { align: 'center' });

  doc.fontSize(12).text(`Start Date: ${startDate.toDateString()}`);
  doc.fontSize(12).text(`End Date: ${endDate.toDateString()}`);
  doc.fontSize(12).text(`Total Orders: ${weeklySalesData.totalOrders}`);
  doc.fontSize(12).text(`Total Revenue: ₹${weeklySalesData.totalRevenue}`);
  doc.fontSize(12).text(`Most Sold Products: ${weeklySalesData.mostSoldProducts}`);
  doc.fontSize(12).text(`Total Cancelled Orders: ${weeklySalesData.totalCancelledOrders}`);
  doc.fontSize(12).text(`Total Profit: ₹${weeklySalesData.totalProfit}`);
  doc.fontSize(12).text(`Customers Signed In: ${weeklySalesData.customersSignedIn}`);

  // End the PDF document
  doc.end();
}



function generateAndSendExcelWeekly(WeeklySalesData, startDate, endDate, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Sales Report');

  // Define the columns in the Excel worksheet
  worksheet.columns = [
    { header: 'Start Date', key: 'startDate' },
    { header: 'End Date', key: 'endDate' },
    { header: 'Total Orders', key: 'totalOrders' },
    { header: 'Total Revenue', key: 'totalRevenue' },
    { header: 'Most Sold Products', key: 'mostSoldProducts' },
    { header: 'Total Cancelled Orders', key: 'totalCancelledOrders' },
    { header: 'Total Profit', key: 'totalProfit' },
    { header: 'Customers Signed In', key: 'customersSignedIn' },
  ];

  // Loop through the yearly sales data and add it to the Excel worksheet
  WeeklySalesData.forEach((data) => {
    worksheet.addRow({
      startDate: data.startDate,
      EndDate:data.endDate,
      totalOrders: data.totalOrders,
      totalRevenue: data.totalRevenue,
      mostSoldProducts: data.mostSoldProducts,
        // .map((product) => `${product.productName}: Sold ${product.quantity} times`)
        // .join('\n'),
      totalCancelledOrders: data.totalCancelledOrders,
      totalProfit: data.totalProfit,
      customersSignedIn: data.customersSignedIn,
    });
  });

  const filename = `WEEkLY_sales_report_${startDate}_${endDate}.xlsx`;

  // Set the response headers for Excel
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Send the Excel workbook directly to the response
  workbook.xlsx.write(res).then(() => {
    console.log(`Excel file sent as response`);
  });
}

const generateWeeklyReport = async (req, res,next) => {
  try {
    const startDate = new Date(req.query.startDate);
    const format = req.query.format;

    // Calculate the end date for the selected week
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of the selected week
    endDate.setHours(23, 59, 59, 999);

    // Retrieve orders for the selected week
    const orders = await OrderModel.find({
      orderDate: { $gte: startDate, $lte: endDate },
    }).populate('items.productId');

    // Calculate weekly statistics for the selected week
    const weeklySalesData = {
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      totalOrders: orders.length,
      totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
      mostSoldProducts: await calculateMostSoldProducts(orders),
      totalCancelledOrders: orders.filter((order) => order.paymentStatus === 'Failed').length,
      totalProfit: await calculateTotalProfit(orders),
    };

    // Retrieve user details for the selected week
    const users = await User.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate the number of customers who signed in for the selected week
    const customersSignedIn = users.length;

    // Add user data and customer count to the weekly sales data
    weeklySalesData.customersSignedIn = customersSignedIn;

    console.log(weeklySalesData);

    if (format === 'excel') {
      // Generate and send the Excel report
      generateAndSendExcelWeekly([weeklySalesData], startDate, endDate, res);
    } else if (format === 'pdf') {
      // Generate and send the PDF report
      generatePDFWeekly(weeklySalesData, startDate, endDate, res);
    } else {
      // Handle unsupported format
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};







function generateAndSendExcelDaily(dailySalesData, startDate, endDate, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Daily Sales Report');

  // Define the columns in the Excel worksheet
  worksheet.columns = [
    { header: 'Start Date', key: 'startDate' },
    { header: 'End Date', key: 'endDate' },
    { header: 'Total Orders', key: 'totalOrders' },
    { header: 'Total Revenue', key: 'totalRevenue' },
    { header: 'Most Sold Products', key: 'mostSoldProducts' },
    { header: 'Total Cancelled Orders', key: 'totalCancelledOrders' },
    { header: 'Total Profit', key: 'totalProfit' },
    { header: 'Customers Signed In', key: 'customersSignedIn' },
  ];

  // Loop through the daily sales data and add it to the Excel worksheet
  dailySalesData.forEach((data) => {
    worksheet.addRow({
      startDate: data.startDate,
      endDate: data.endDate,
      totalOrders: data.totalOrders,
      totalRevenue: data.totalRevenue,
      mostSoldProducts: data.mostSoldProducts,
        // .map((product) => `${product.productName}: Sold ${product.quantity} times`)
        // .join('\n'),
      totalCancelledOrders: data.totalCancelledOrders,
      totalProfit: data.totalProfit,
      customersSignedIn: data.customersSignedIn,
    });
  });

  const filename = `daily_sales_report_${startDate.toISOString()}_${endDate.toISOString()}.xlsx`;

  // Set the response headers for Excel
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  // Send the Excel workbook directly to the response
  workbook.xlsx.write(res).then(() => {
    console.log(`Excel file sent as response`);
  });
}

// Define a function to generate the PDF report and send it as a response
function generateAndSendPDFDaily(dailySalesData, startDate, endDate, res) {
  const doc = new PDFDocument();
  const filename = `daily_sales_report_${startDate.toISOString()}_${endDate.toISOString()}.pdf`;

  // Set the response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res); // Send the PDF directly to the response

  doc.fontSize(16).text('Daily Sales Report', { align: 'center' });

  // Loop through the daily sales data and add it to the PDF
  dailySalesData.forEach((data) => {
    doc.fontSize(12).text(`Start Date: ${data.startDate}`);
    doc.fontSize(12).text(`End Date: ${data.endDate}`);
    doc.fontSize(12).text(`Total Orders: ${data.totalOrders}`);
    doc.fontSize(12).text(`Total Revenue: ${data.totalRevenue}`);
    doc.fontSize(12).text(`Most Sold Products:${data.mostSoldProducts}`);
    // data.mostSoldProducts.forEach((product) => {
    //   doc.fontSize(10).text(`- ${product.productName}: Sold ${product.quantity} times`);
    // });
    doc.fontSize(12).text(`Total Cancelled Orders: ${data.totalCancelledOrders}`);
    doc.fontSize(12).text(`Total Profit: ${data.totalProfit}`);
    doc.fontSize(12).text(`Customers Signed In: ${data.customersSignedIn}`);
    doc.addPage(); // Add a new page for the next day's data
  });

  doc.end();
}

const generateDailyReport = async (req, res,next) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const format = req.query.format;

    // Calculate the number of days within the selected date range
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const dailySalesDataArray = [];
    
    // Loop through each day within the date range
    for (let i = 0; i <= daysInRange; i++) {
      const currentDayStart = new Date(startDate);
      currentDayStart.setDate(startDate.getDate() + i);
      currentDayStart.setHours(0, 0, 0, 0);
      
      const currentDayEnd = new Date(currentDayStart);
      currentDayEnd.setHours(23, 59, 59, 999);

      // Retrieve orders for the current day
      const orders = await OrderModel.find({
        orderDate: { $gte: currentDayStart, $lte: currentDayEnd },
      }).populate('items.productId');

      // Calculate daily statistics for the current day
      const dailySalesData = {
        startDate:startDate,
        endDate:endDate,
        date: currentDayStart.toDateString(),
        totalOrders: orders.length,
        totalRevenue: orders.reduce((total, order) => total + order.billTotal, 0),
        mostSoldProducts: await calculateMostSoldProducts(orders),
        totalCancelledOrders: orders.filter((order) => order.paymentStatus === 'Failed').length,
        totalProfit: await calculateTotalProfit(orders),
      };

      // Retrieve user details for the current day
      const users = await User.find({
        createdAt: { $gte: currentDayStart, $lte: currentDayEnd },
      });

      // Calculate the number of customers who signed in for the current day
      const customersSignedIn = users.length;

      // Add user data and customer count to the daily sales data
      dailySalesData.customersSignedIn = customersSignedIn;

      // Add the daily sales data to the array
      dailySalesDataArray.push(dailySalesData);
    }

    // Generate and send the report based on the selected format
    if (format === 'excel') {
      generateAndSendExcelDaily(dailySalesDataArray, startDate, endDate, res);
    } else if (format === 'pdf') {
      generateAndSendPDFDaily(dailySalesDataArray, startDate, endDate, res);
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




















const adminSignupPost = async (req, res,next) => {
    try {
      const { firstName, lastName, email, mobile, password } = req.body;
  
      // Check if an admin with the same email already exists
      const existingAdmin = await Admin.findOne({ email });
  
      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin with this email already exists. Please login again.' });
      }
  
      // Create a new admin instance
      const newAdmin = new Admin({
        name: `${firstName} ${lastName}`,
        email,
        mobile,
        password,
      });
  
      // Save the admin to the database
      const savedAdmin = await newAdmin.save();
  
      res.status(201).json(savedAdmin); // Respond with the saved admin data
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  




const adminLoginGet = (req, res,next) => {
  try{
  if (req.session.isAdmin){
     return res.redirect('/admin');
  } else { 
    let errorMessage;
    if(req.session.loginErr){
      errorMessage = req.session.loginErr;
      req.session.loginErr=''
    }
  res.render('adminLogin',{message:false,errorMessage})

  }
}catch (error) {
  // Pass the error to the error handling middleware
  error.adminError = true;
  next(error);
}
};






const adminLoginPost = async (req, res,next) => {
  try {
    const { email, password } = req.body;

    // Check if an admin with the provided username exists
    const admin = await Admin.findOne({ email });
   
    console.log(admin+"   2323");
   
   
    if (!admin) {
      req.session.loginErr = 'Admin not found. Please check your username and password'
      return res.redirect('/admin/login')
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      req.session.loginErr = 'Invalid password. Please check your username and password.'
      return res.redirect('/admin/login')
    }

    // Set a session variable to indicate that the admin is logged in
    // req.session.loggedin = true;

    // req.session.admin = {
    //   id: admin._id,
    //   username: admin.username,
    // };
    req.session.isAdmin= admin._id;
    res.status(200).redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


const adminLogout = (req, res) => {
  // For example, if you are using a session-based authentication system with Express and Express Session:
  // req.session.admin = null; // Clear the admin session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying admin session:', err);
    } else {
      console.log('Admin session destroyed');
      res.redirect('/admin/login');// Redirect to a suitable page after logout
    }
  });
  // Redirect to the login page or any other desired page after logout
   // Redirect to the admin login page
};



const adminSideUsersList = async(req,res,next)=>{

let query ={}
let searchQuery = req.query.search;
if (searchQuery) {
  query = {
    $or: [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
    ],
  };
}
  if(req.query.page){
    page=parseInt(req.query.page);
  }else{
    page= 1 ;
  }
  const limit = 8;
  const skip = (page-1)*limit
  try{
 
    const total = await User.countDocuments(query);

  const users = await User.find(query).skip(skip)
  .limit(limit);

  console.log(users);
  const totalPages = Math.ceil(total/limit);

  res.render('usersList',{ users ,currentPage:page,totalPages,pagetitle:"Users"});

  }catch (error) {
    // Pass the error to the error handling middleware
    error.adminError = true;
    next(error);
  }
}

const adminCreateUser = async (req, res,next) => {
  try {
      // Extract user data from the request body
      const {
          newFirstName,
          newLastName,
          newEmail,
          newGender,
          newMobile,
          newPassword,
      } = req.body;

      console.log(newFirstName,
        newLastName,
        newEmail,
        newGender,
        newMobile,
        newPassword,);
      // Check if the user already exists based on a unique identifier (e.g., email)
      const existingUser = await User.findOne({ email: newEmail });

      if (existingUser) {
          // User with the same email already exists
          return res.status(409).json({ error: 'User already exists' });
      }

      // Create a new user object
      const newUser = new User({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          gender: newGender,
          mobile: newMobile,
          password: newPassword,
      });

      // Save the new user to the database
      await newUser.save();

      // Respond with a success message
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create new user' });
  }
};



const adminUserBlock = async (req, res,next) => {
  const userId = req.params.Id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send('User not found');
    }
   console.log(user);
    if(user.isBlocked===false){
      user.isBlocked=true;
    }else{
      user.isBlocked=false;
    }
    await user.save();
    console.log(user);
    res.status(200).redirect('/admin/users');

  }catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
}
};


const adminUpdateUser = async (req, res,next) => {
  console.log('verind');
  const userId = req.params.Id;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).send('User not found');
      }
      console.log(req.body.mobile+"FGgfgf");
      // Update user details based on form data
      user.firstName= req.body.firstName; 
      user.lastName= req.body.lastName;
      user.email= req.body.email;
      user.gender = req.body.gender;
      user.mobile = req.body.mobile;
      


      // Save the updated user data
      await user.save();

      res.status(200).redirect('/admin/users');
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Failed to update user details');
  }
}


const adminUserDelete = async (req, res,next) => {
  console.log("Hwkwkewkesdknkjfhdskhfksdahfkhadsklhfkhsflkhlflahsdflds");
  try {
    const userId = req.params.Id;
    console.log(userId);
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).send("User not found");
    } else {
      // req.session.user=false;
      res.send("User deleted successfully");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while deleting the user");
  }
}





module.exports = {
  adminLoginGet,
  adminDailyDataGet,
  adminUserDataGet,
  adminDataLogs,
  adminMovingtoOutofStockProducts,
  adminOutofStockProducts,
  adminDailySalesReport,
  adminOrdersByCategory,
  adminDaliyVisistors,
  adminGetReports,
  adminLoginPost,
  adminSignupPost,
  adminSideUsersList,
  adminHome,
  adminUserBlock,
  adminUpdateUser,
  adminUserDelete,
  adminCreateUser,
  adminLogout,
  generateYearlyReport,
  generateWeeklyReport,
  generateDailyReport
  
};
