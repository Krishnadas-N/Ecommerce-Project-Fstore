const Admin = require('../models/adminModel');
const Product = require('../models/productModel');
const mongoose =require('mongoose')
const Category = require('../models/categoryModel')
const Subcategory = require('../models/subCategoryModel')
const Wishlist = require('../models/wishlistModel')
const Rating = require('../models/ratingModel');
const Review = require('../models/reviewSchema')
const Order = require('../models/orderModel')


const productManagementGet = async (req, res,next) => {
    try {

               // Pagination
               let sucessmessage ;
               if(req.session.successMessage){
                sucessmessage=req.session.successMessage
                req.session.successMessage=''
               };
               let productErrormsg = ''
               if(req.session.productErrormsg){
                productErrormsg = req.session.productErrormsg
               }

               const page = req.query.page?parseInt(req.query.page): 1;
               const limit = 4;
               const skip = (page - 1) * limit;

                       // Check if a category is selected for filtering
                const selectedCategory = req.query.category || ''; // Default to empty string if not provided

                const searchQuery = req.query.search || '';
        
                const query = {};
                req.session.successMessage = null;
                // Check if a search query is provided
                if (searchQuery) {
                    const regex = new RegExp(searchQuery, 'i');

                    query.$or = [
                            { name: { $regex: regex } }, // Match product name
                            { brand: { $regex: regex } }, // Match category
                            // Add more fields here for additional search criteria
                        ];
                    
                }
                // If a category is selected, add it to the query
                if (selectedCategory) {
                    query.category = selectedCategory;
                }

                console.log("query",query);
 

            // Handle the search query
            const [products,totalCount] = await Promise.all([
                Product.find(query)
                .populate('category') // Populate the 'category' field
                .lean()
                .skip(skip)
                .limit(limit),
                Product.countDocuments(query),
            ])

        // const totalCount = await Product.countDocuments({}) 
        const totalPages = Math.ceil(totalCount / limit );

        const categories = await Category.find({status:'active'}).lean();
        
         // Separate products into two arrays: one for listed categories and one for unlisted categories
         const productsForListedCategories = [];
         const productsForUnlistedCategories = [];
 
         for (const product of products) {
             if (product.category && product.category.status === 'active') {
                 productsForListedCategories.push(product);
             } else {
                 productsForUnlistedCategories.push(product);
             }
         }
 
         // Concatenate the two arrays to get products with listed categories at the top
         const sortedProducts = productsForListedCategories.concat(productsForUnlistedCategories);
 
         const subcategories=  await Subcategory.find({});
         console.log(subcategories)
        res.render('productManagement', { products: sortedProducts, 
            categories,
            selectedCategory,
            searchQuery,
            currentPage:page
            ,totalPages,
            subcategories,
            sucessmessage,
            productErrormsg,
             pagetitle: 'Products' });

    } catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
};

const productCategories = async (req, res,next) => {
    
    try {
        const categories = await Category.find({status:'active'}, 'name'); // Only fetch category names
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const productManagementCreate =  async (req, res,next) => {
        try {
            console.log("kkksdskdjskjkdsdsskds")
            // Extract product details from the request body
            const existingProduct = await Product.findOne({name: { $regex: new RegExp("^" + req.body.name + "$", "i") }});
            if(existingProduct){
              req.session.productErrormsg='This products already exixts'
              return res.redirect('/admin/product-management');
            }

            // Convert string IDs to ObjectId references
               const subcategoryIds = req.body.subcategories.map(subcategoryId => {
                try {
                    return new mongoose.Types.ObjectId(subcategoryId);
                  } catch (error) {
                    console.error('Error converting subcategory ID:', error);

                   req.session.productErrormsg='Error converting subcategory ID'
                   return res.redirect('/admin/product-management');// Re-throw the error to handle it in the outer catch block
                  }
                })

          

            const product = new Product({
                name: req.body.name,
                description: req.body.description,
                image: req.files['image'][0].path.replace(/\\/g, '/').replace('public/', ''), // Assuming 'image' is the name attribute of the main image input
                images: req.files['images'].map(file => file.path.replace(/\\/g, '/').replace('public/', '')), // Assuming 'images' is the name attribute of the additional images input
                brand: req.body.brand,
                countInStock: req.body.countInStock,
                sizes : req.body.sizes,
                category: req.body.category, // You may need to convert this to a MongoDB ObjectId
                subcategory:subcategoryIds,
                price: req.body.price
            });
            console.log(subcategoryIds)

            console.log(req.body.category)
            console.log('//////////////////////////////////////////////////////////////////////');
            console.log(req.files );
            // Process the main image
          
    
            // Save the new product to the database
             product.save().then(async (product) => {
                // Associate the product with its category
                const category = await Category.findById(product.category);
                if (category) {
                    category.products.push(product._id);
                    await category.save();
                }

                 // Associate the product with its subcategories
            for (const subcategoryId of subcategoryIds) {
                const subcategory = await Subcategory.findById(subcategoryId);
                if (subcategory) {
                    subcategory.products.push(product._id);
                    await subcategory.save();
                }
            }
                console.log('Product saved successfully.');

            })
            .catch((error) => {
                console.error('Error saving product:', error);
                throw new Error('Error saving product:', error)
            });
            req.session.successMessage = 'Product Added Successfully'
            return res.redirect('/admin/product-management');
        } catch (error) {
          // Pass the error to the error handling middleware
          error.adminError = true;
          next(error);
        }
    };






const productManagementEditGet = async (req, res,next) => {
    try {
      const id = req.params.Id;
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid ID");
      }
        const categories = await Category.find()
      // Log the ID for debugging
      console.log('Product ID:', id);
      Product.findOne({ _id: id })
      .populate([
        { path: 'category', model: 'Category' },
        { path: 'subcategory', model: 'Subcategory' }
      ])
      .exec()
      .then(result => {
        if (!result) {
          return res.status(404).send("No such product found");
        } else {
          return res.status(200).render('adminEditProduct', { pagetitle: "Admin Edit Product", item: result,categories });
        }
      })
      .catch(err => console.log(err));
    } catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
  }
  






 const productManagementEdit = async (req, res,next) => {
        try {
            // Check if the product with the specified ID exists in the database
            const productId = req.params.Id;
            console.log(productId);
            console.log(req.body)
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
    
            // Extract product details from the request body
            const {
                name,
                description,
                brand,
                countInStock,
                sizes,
                category,
                price,
            } = req.body;
    
            // Initialize image and images variables
            let image = existingProduct.image;
            let images = existingProduct.images;
    
        
            // Check if files are provided in the request
            if (req.files) {
                // Process the main image
                if (req.files['image']) {
                    image = req.files['image'][0].path.replace(/\\/g, '/').replace('public/', '');
                }
    
                // Process additional images (if any)
                if (req.files['images']) {
                    images = images.concat(
                        req.files['images'].map((file) =>
                            file.path.replace(/\\/g, '/').replace('public/', '')
                        )
                    );
                }
            }

            const removedImageIndices = req.body.removeExistingImage;
            if (Array.isArray(removedImageIndices)) {
                // Remove images based on the indices
                const uniqueIndices = [...new Set(removedImageIndices)]; 
                uniqueIndices.forEach((index) => {
                    if (index >= 0 && index < existingProduct.images.length) {
                        // Get the path of the image to delete
                        const imagePathToDelete = existingProduct.images[index];
    
                        // Delete the image from the server
                        // Implement a function to delete files on your server
                        // For example, using the "fs" module or a storage library
    
                        // Remove the image path from the array
                        existingProduct.images.splice(index, 1);
                    }
                });
            }
    
    
            // Update the product in the database
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    name,
                    description,
                    brand,
                    countInStock,
                    sizes,
                    category,
                    price,
                    image,
                    images,
                },
                {
                    new: true,
                }
            );
    
            const updatedCategory = await Category.findById(updatedProduct.category);
            if (updatedCategory) {
                updatedCategory.products.push(updatedProduct._id);
                await updatedCategory.save();
            }
    
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // Set a success message in the session
            req.session.successMessage = 'Product Edited successfully';
            // res.status(200).json({ status: 201, message: 'Product Edited Successfully' });
            res.status(200).json({success:true,message:'Product Edit Successfuly'});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error', errorMessage: error.message });
        }
    };
    
      



const productManagementDelete =  async (req, res,next) => {
    const { productId } = req.params;

    try {
        // Find the product by ID and delete it
        const deletedProduct = await Product.findOneAndDelete({ _id: productId });


        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

         // Now, remove references to the product from Category and Subcategory schemas
         await Category.updateMany({ products: productId }, { $pull: { products: productId } });
         await Subcategory.updateMany({ products: productId }, { $pull: { products: productId } });
         
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const productManagementPublish =  async (req, res,next) => {
    try {
        const productId = req.params.productId;
        const { isFeatured } = req.body;
        console.log("publish ethii");
        // Find the product by ID and update the isFeatured field
        const product = await Product.findByIdAndUpdate(productId, { isFeatured }, { new: true });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product status updated successfully', product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}



const ProductDetailedView = async (req, res,next) => {
    try {
      let UserExist = false;
      if (req.cookies?.userloggedIn && req.cookies?.userloggedIn !== undefined) {
        UserExist = true;
      }
  
      const id = req.params.productId;
  
      const product = await Product.findById(id);
      const category = await Category.find({});
  
      if (!product) {
        // Handle the case where the product with the specified id is not found
        return res.status(404).render('errorHandler');
      }
  
      const productReviews = await Review.aggregate([
        {
          $match: { product:new mongoose.Types.ObjectId(id) }
        },
        {
          $unwind: "$reviews"
        },
        {
          $lookup: {
            from: "users", // Name of the User model collection
            localField: "reviews.author",
            foreignField: "_id",
            as: "reviews.authorDetails"
          }
        },
        {
          $unwind: "$reviews.authorDetails"
        },
        {
          $match: { "reviews.isPublish": true } // Filter for reviews with isPublish true
        },
        {
          $project: {
            "_id": "$reviews._id",
            "review": "$reviews.review",
            "isPublish": "$reviews.isPublish",
            "author.firstName": "$reviews.authorDetails.firstName",
            "author.lastName": "$reviews.authorDetails.lastName",
            "author.email": "$reviews.authorDetails.email",
            "createdAt": "$reviews.createdAt",
            "updatedAt": "$reviews.updatedAt"
          }
            // Add more fields as needed
          }
       
      ]);
      
      let userReview = null;
      let userRating = null;
      let productInWishlist;
      let hasPurchased = null;
  
      if (UserExist) {
        const userId = req.user._id;
        userReview = await Review.findOne({ 'reviews.author': userId, product: id });
        userRating = await Rating.findOne({ 'Ratings.author': userId, product: id });
        hasPurchased = await Order.findOne({
            user: userId,
            'items.productId': id,
            status: { $in: ['Processing', 'Shipped', 'Delivered'] },
          });
    
        const wishlist = await Wishlist.findOne({ user: userId });
  
        if (wishlist && wishlist.products.includes(id)) {
          // The product is in the user's wishlist
          productInWishlist = true;
        } else {
          // The product is not in the user's wishlist
          productInWishlist = false;
        }
      } else {
        productInWishlist = false;
      }
      
     
      const productRatings = await Rating.find({ product: id });
      const allRatings = productRatings.flatMap((rating) => rating.Ratings.map((r) => r.rating));
      
      const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b) / allRatings.length : 0;
      
      // Count the number of each star rating
      const starRatingsCount = [0, 0, 0, 0, 0];
      allRatings.forEach((rating) => {
        starRatingsCount[rating - 1]++;
      });
      
      console.log(averageRating, starRatingsCount);
      console.log('/////////////////////////////');
      console.log(userReview)
      console.log('/////////////////////////////');
  
      console.log(`productReviews: ${productReviews}, userReview: ${userReview}, userRating: ${userRating}, averageRating: ${averageRating}`);
      console.log(allRatings,averageRating,starRatingsCount)
      console.log('//////////////////////////////////////////////////////////');
      console.log(hasPurchased)
      res.render('ProductDetailedView', {
        product,
        category,
        UserExist,
        productInWishlist,
        productReviews,
        userReview,
        userRating,
        averageRating,
        starRatingsCount,
        hasPurchased
      });
    }  catch(error){
      console.error(error);
      console.log(error);
      next(error);
    }
  };
  
const productManagementremoveImages =  async (req, res,next) => {
  const { productId, index } = req.params;
  console.log(productId, index);
  try {
    console.log(productId, index);
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      console.log(productId,index)
    console.log(product)
      // Remove the image at the specified index
      product.images.splice(index, 1);

      // Save the updated product
      await product.save();

      res.status(200).json(product.images);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
}






module.exports ={ productManagementGet,
    productManagementCreate,
    productCategories,
    productManagementEdit,
    productManagementEditGet,
    productManagementDelete,
    productManagementPublish,
    productManagementremoveImages,

    ProductDetailedView
}