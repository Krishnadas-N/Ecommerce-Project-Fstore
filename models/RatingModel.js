const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  product:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product',
    required: true,
  },
  Ratings:[{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: true,
    },
  
    content: {
      type: String,
      
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  }],
  averageRating: {
    type: Number,
    default: 0, // Default to 0 if no reviews yet
  },
}
,{
  timestamps:true
});

module.exports = mongoose.model('Rating',RatingSchema)
