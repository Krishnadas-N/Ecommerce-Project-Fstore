const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type:String,
    required:true

  },
  image:{
    type: String,
    required: true,

  },

  description:{
    type : String ,

  },
  link:{
    type:String,
    required:true
  },
  position:{
    type:Number,
  },
  isActive:{
    type:Boolean,
    default:false
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
