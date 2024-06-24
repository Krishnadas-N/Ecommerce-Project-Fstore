const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
       type: String,
       required: true,
    },

    description: {
      type: String,
      required: true
    },

    image:{
     type: String,
     default:''
    },

    images:[{
      type:String,
    }],

    brand:{
      type:String
    },
    productOffer: {
      percentageDiscount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    countInStock:{
      type: Number,
      required: true,
     
    },

    rating:{
      type:Number,
      default:0,
    },
    Rating:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Rating'
    },
    review:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Review'
    },

    isFeatured:{
      type:Boolean,
      default:false
    },
    sizes: [{
      type: String,
      enum: ["S", "M", "L", "XL", "P"], // Restrict sizes to predefined values
  }],
    category: {
       type: mongoose.Schema.Types.ObjectId,
       ref:'Category',
       required: true
    },
    subcategory: [{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true
    }],
    price: {
       type: Number,
       required: true,
       default:0,

    },
    isCategoryBlocked: {
      type: Boolean,
      default: false,
   },
    }, {
    timestamps: true
    })

const Product = mongoose.model('Product',productSchema);

module.exports = Product;