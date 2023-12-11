const Admin = require('../models/adminModel');
const Category = require('../models/CategoryModel');
const Subcategory = require('../models/subCategoryModel');
const Products = require('../models/productModel')






const categoryManagementGet = async (req, res,next) => {
    try {

      if(req.query.page){
        page=parseInt(req.query.page);
      }else{
        page= 1 ;
      }
      const limit = 5;
      const skip = (page-1)*limit

      let errorMessage='' ;11
      let sucessMessage= '';
      if(req.session.categoryErr){
        errorMessage = req.session.categoryErr;
        req.session.categoryErr=''
      }
      if(req.session.categorySucess){
        sucessMessage=req.session.categorySucess;
        req.session.categorySuccess=''
      }

      console.log('sucessMessage' +sucessMessage);
      console.log('errorMessage' +errorMessage)

      const categories = await Category.find().skip(skip)
      .limit(limit); // Fetch all categories from the database
      const total = await Category.countDocuments();

      const totalPages = Math.ceil(total/limit);
      // Pass the categories to the view
      res.render('categoryManagement', {
        pagetitle: 'Category',
        categories: categories, 
        errorMessage,
        sucessMessage,
        currentPage:page,
        totalPages
      });
    }catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
  };



const categoryManagementCreate = async (req, res,next) => {
    try {
        const { name, description } = req.body;
        let image  =null
        if (req.file) {
            
            image = req.file.path.replace(/\\/g, '/').replace('public/', '');
          }
        // const image = req.file ? req.file.buffer.toString('base64') : null; // Store image as base64 string
        
       // Check if the category already exists (case-insensitive search)
       const existingCategory = await Category.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") }
    });

      if (existingCategory) {
        req.session.categoryErr='Already this Category Exists'
        return res.redirect('/admin/category-management');
      }
        const category = new Category({
            name,
            description,
            image
        });

        await category.save().then(()=>{
          req.session.categorySucess="Category Created Successfully!"
           res.redirect('/admin/category-management')
        })
        .catch((err)=>{
          req.session.categoryErr="Something went wrong while creating a category."+err
            res.redirect('/admin/category-management')
        })
        

    }catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
}

const categoryManagementEdit = async(req,res)=>{
    try {
        const { editName, editDescription } = req.body;
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
          req.session.categoryErr="Category is Not Found in Database"
            return res.redirect('/admin/category-management')
        }
        // Update name and description
        category.name = editName;
        category.description = editDescription;
        
        // Update image if a new one is uploaded
        if (req.file) {
            // Replace backslashes with forward slashes and remove 'public/' from the path
            const newImage = req.file.path.replace(/\\/g, '/').replace('public/', '');
            category.image = newImage;
        }
        await category.save().then(()=>{
          req.session.categorySucess="Category Updated Successfully!"
           res.redirect('/admin/category-management')
        }).catch((err)=>{
          req.session.categoryErr="Something went wrong while updating a category."+err
          res.redirect('/admin/category-management')
        });
    } catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
}

const categoryManagementDelete=async (req, res,next) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId);

        if (!category) {
          req.session.categoryErr="Category is Not Found in Database"
          return res.redirect('/admin/category-management')
        }
        // Find the category by ID and delete it
        await Subcategory.deleteMany({ category: categoryId })

        // Update products: Remove the category and subcategory IDs from products
        await Products.updateMany(
          { $or: [{ category: categoryId }, { subcategory: categoryId }] },
          { $unset: { category: '', subcategory: [] } }
      );

        const result = await Category.deleteOne({ _id: categoryId });

        if (result.deletedCount === 0) {
          req.session.categoryErr="Category is Not Found in Database"
          return res.redirect('/admin/category-management')
        }
        req.session.categorySuccess='Category Deleted Successfully!'
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//TO UNLIST CATEGORY 
const categoryManagementUnlist = async(req,res)=>{
  try{
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.status = category.status === 'active' ? 'unlisted' : 'active';
      await category.save()
      .then(()=>res.status(200).json({message:'Category unlisted Successfully'}))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Error while saving category' });
    });

  }catch(error){
    console.log("Error", error );
    return res.status(500).json({message:error})
  }
}






//Subcategory Gett

const subCategoriesGet = async (req, res,next) => {
    console.log("sui me");
    try {
      const categoryId = req.params.categoryId;
      const subcategories = await Subcategory.find({ category: categoryId });
      console.log(subcategories);
      res.json({ subcategories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }


  //To Get Sub categroy detail like name and description
 const subCategoryDetail = async(req,res)=>{
  try{
    const subCategoryId = req.params.subCategoryId;
    const subCategoryDetails = await Subcategory.find({_id:subCategoryId})
    if(!subCategoryDetails){
      res.status(404).json({message:'error not Found'});
    }
    console.log('subcategory details'+subCategoryDetails);

    return res.json({subCategoryDetails})
  }catch(error){
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
 }



  const subCategoriesCreate = async (req, res,next) => {
    try {
      const { subcategoryName, subcategoryDescription, categoryId } = req.body;

     console.log(subcategoryName,subcategoryDescription,categoryId);

     //Check Category Exist 
     const CategrorExist = await Category.findOne({_id:categoryId })
      if(!CategrorExist){
      return res.status(404).json({message:'The Category doesnt exist'})
      }

      const subcategoryExist = await Subcategory.findOne({ name:subcategoryName });
  
      if (subcategoryExist) {
        return res.status(409).json({ message: 'This Subcategory already exists' });
      }
  
      const subcategory = new Subcategory({
        name: subcategoryName,
        description: subcategoryDescription,
        category: categoryId, // Assign the category ID
      });

      // Save the subcategory
      await subcategory.save();
  
      // Update the Category model to add the subcategory's ID to the subcategories array
      await Category.findByIdAndUpdate(categoryId, { $push: { subcategories: subcategory._id } });
      await Products.updateMany({},{ $push:{ subcategory:subcategory._id }});

      res.status(201).json(subcategory);
  
    } catch (error) {
      res.status(400).json({ error: 'Failed to create subcategory' });
    }
  }
  

  const subCategoriesEdit = async (req, res,next) => {
    try {
      console.log(req.params.subCategoryId);
      const subCategoryId = req.params.subCategoryId;
      const { name, description } = req.body; // Assuming you want to update the name and description
     
      // Find the subcategory by its ID
      const subcategory = await Subcategory.findById(subCategoryId);
  
      if (!subcategory) {
        return res.status(404).json({ message: 'Subcategory not found' });
      }
  
      // Update the subcategory's properties with the new information
      subcategory.name = name;
      subcategory.description = description;
  
      // Save the updated subcategory to the database
      await subcategory.save();
  
      return res.status(200).json({ message: 'Subcategory successfully updated', updatedSubcategory: subcategory });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


const subCategorriesDelete = async(req,res)=>{
    try{
      const subCategoryId = req.params.subCategoryId;

      const parentCategory = await Category.findOne({ subcategories: subCategoryId  })

      if(!parentCategory){
        return res.status(404).json('Subcategory not found')
      }
      const products = await Products.find({subcategory:subCategoryId})
     
      products.subcategory.pull(subCategoryId);


      parentCategory.subcategories.pull(subCategoryId);

      await products.save();
      await parentCategory.save();

      const result = await Subcategory.deleteOne({ _id: subCategoryId });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'subCategory not found' });
      }
      return res.status(201).json({message:'Successfully Deleted'})

    }catch(error){
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
   
    }
}

module.exports = { categoryManagementGet,
    categoryManagementCreate,
    categoryManagementEdit,
    categoryManagementDelete ,
    categoryManagementUnlist,
    subCategoriesGet,
    subCategoriesCreate,
    subCategoryDetail,
    subCategoriesEdit,
    subCategorriesDelete}