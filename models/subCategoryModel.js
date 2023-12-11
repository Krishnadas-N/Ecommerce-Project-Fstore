const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  products:[{
    type : Schema.Types.ObjectId ,
    ref:'Product'
  }]
},{
    timestamps: true
});

SubcategorySchema.index({ category: 1 });




  
const Subcategory = mongoose.model('Subcategory',SubcategorySchema)

module.exports = Subcategory;