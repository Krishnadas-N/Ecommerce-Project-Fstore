const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

  product:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product',
    required: true,
  },
  
  reviews: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review: {
      type: String,
    },
    isPublish: {
      type: Boolean,
      default: false
    }
  }],
},{
    timestamps:true
});

module.exports = mongoose.model('Review',ReviewSchema)
