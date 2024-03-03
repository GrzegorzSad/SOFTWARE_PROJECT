const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      //type: mongoose.Schema.Types.ObjectId,  //for later
      type:String,
      //ref: 'User', //for later
      required: true
    },
    images: [String] // Array of image URLs
  });
  
  const Product = mongoose.model('Product', productSchema)
  
  module.exports = Product
