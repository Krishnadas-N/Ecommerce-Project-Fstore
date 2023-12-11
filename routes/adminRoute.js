const express = require('express');
const admin_router = express.Router();
const {storage , upload} = require('../utils/multerConfig')

const { adminHome,
    adminDailyDataGet,
    adminUserDataGet,
    adminDaliyVisistors,
    adminMovingtoOutofStockProducts,
    adminOutofStockProducts,
    adminGetReports,
    adminDailySalesReport,
    adminOrdersByCategory,
    adminDataLogs,
    adminLoginGet, 
    adminLoginPost,
    adminSignupPost,
    adminSideUsersList,
    adminUserBlock,
    adminUpdateUser,
    adminUserDelete ,
    adminCreateUser,
    adminLogout,
    generateYearlyReport,
    generateWeeklyReport,
    generateDailyReport
                     }  = require('../controllers/AdminController');

const {categoryManagementGet,
    categoryManagementCreate,
    categoryManagementEdit,
    categoryManagementDelete,
    categoryManagementUnlist,
    subCategoriesGet,
    subCategoryDetail,
    subCategoriesCreate,
    subCategoriesEdit,
    subCategorriesDelete}  =require('../controllers/categoryController')

const{
    productManagementGet,
    productManagementCreate,  
    productCategories,
    productManagementEditGet,
    productManagementEdit,
    productManagementDelete,
    productManagementPublish,
    productManagementremoveImages  } =require('../controllers/productManagement')


const coupons = require('../controllers/couponManagement');

const{
    bannersGet,
    bannersCreate,
    bannersEdit,
    bannersDelete,
    bannersUpdate

    }=require('../controllers/BannerController')


const Order = require('../controllers/AdminOrderManagement')

function isAuthenticated(req,res,next){
    if(req.session.isAdmin){
        next();
    }else{
    res.redirect('/admin/login')
    }
}


admin_router.get('/',isAuthenticated,adminHome)

// GET request to display the admin login form
admin_router.post('/signup', adminSignupPost);

admin_router.get('/login',adminLoginGet)

// POST request to handle admin login
admin_router.post('/login', adminLoginPost);//api/admin/login

admin_router.get('/logout',adminLogout)

admin_router.get('/users',isAuthenticated,adminSideUsersList);

admin_router.post('/users/create',adminCreateUser)

admin_router.post('/users/block-user/:Id',adminUserBlock);

admin_router.post('/users/update-user/:Id',adminUpdateUser);

admin_router.delete('/users/delete/:Id',adminUserDelete);



//ADMIN DashBoard 

admin_router.get('/daily-data',adminDailyDataGet)

admin_router.get('/user-data',adminUserDataGet)

admin_router.get('/logs',adminDataLogs)

admin_router.get('/daily-visitors',adminDaliyVisistors)

admin_router.get('/moving-to-out-of-stock',adminMovingtoOutofStockProducts)

admin_router.get('/out-of-stock',adminOutofStockProducts)

admin_router.get('/reports/:timeFrame',adminGetReports)

admin_router.get('/orders-by-category',adminOrdersByCategory)


admin_router.get('/generate-sales-report/:type', adminDailySalesReport);

admin_router.get('/generateYearlyReport',generateYearlyReport)

admin_router.get('/generateWeeklyReport',generateWeeklyReport);

admin_router.get('/generateDailyReport',generateDailyReport)


//Category ManageMent

admin_router.get('/category-management',isAuthenticated,categoryManagementGet);

admin_router.post('/category-management/newCategory', upload.single('image'),categoryManagementCreate)

admin_router.post('/category-management/edit-category/:categoryId',upload.single('editImage'),categoryManagementEdit)

admin_router.delete('/category-management/delete-category/:categoryId',categoryManagementDelete)

//To unlsit the category
admin_router.patch('/category-management/update-status/:categoryId',categoryManagementUnlist)




//Sub Cateegory MAnagement 
admin_router.get('/category-management/subCategories/:categoryId',subCategoriesGet);

//to get Subcategory Detail
admin_router.get('/category-management/subCategoryDetail/:subCategoryId',subCategoryDetail)

admin_router.post('/category-management/subCategories/create',subCategoriesCreate);

admin_router.post('/category-management/subCategories/:subCategoryId',subCategoriesEdit)

admin_router.delete('/category-management/subCategories/delete/:subCategoryId',subCategorriesDelete);






//Product Management

admin_router.get('/product-management',isAuthenticated,productManagementGet)

admin_router.post('/product-management/newProduct',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images' }]),productManagementCreate)

admin_router.get('/product-management/getCategories',isAuthenticated,productCategories);

admin_router.get('/product-management/editProduct/:Id',productManagementEditGet)

admin_router.post('/product-management/editProduct/:Id',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images' }]),productManagementEdit);

admin_router.delete('/product-management/delete-product/:productId',productManagementDelete);

admin_router.put('/product-management/updateProduct/:productId',productManagementPublish);

admin_router.delete('/product-management/:productId/removeImage/:index',productManagementremoveImages)





//Coupon Management

admin_router.get('/coupon-management',isAuthenticated,coupons.couponManagementGet);

admin_router.post('/createCoupon',coupons.couponCreate);

admin_router.post('/coupon/update-status/:Id',coupons.couponUpdate);

admin_router.post('/EditCoupon/:Id',coupons.couponEdit)



//BANNER MANAGEMENT 
admin_router.get('/banner-management',bannersGet);

admin_router.post('/banner-management/create',upload.single('image'),bannersCreate);

admin_router.put('/banner-management/edit/:bannerId',upload.single('image'),bannersEdit);

admin_router.delete('/banner-management/delete/:bannerId',bannersDelete);

admin_router.put('/banner-management/change-status/:bannerId',bannersUpdate)

//Order Management

admin_router.get('/order-management',Order.OrderManagementPageGet);

admin_router.delete('/order-management/deleteOder/:orderId',Order.OrderDelete)
// 

admin_router.get('/order-management/orderDetailedView/:orderId',Order.orderDetailedView);

admin_router.post('/order-management/update-order-status/:orderId',Order.updateOrderStatus);

admin_router.post('/refund-amount',Order.refundAmount)



module.exports = admin_router;
