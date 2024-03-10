const mongoose = require('mongoose');

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
    type: mongoose.Schema.Types.ObjectId, // for later
    ref: 'User', // for later
    required: true
  },
  images: [String], // Array of image URLs
  // Adding the location field
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: { type: String, required: false }, // Optional: User can fill this later
    addressDesc: { type: String, required: false }
  }
});

productSchema.index({ name: 'text' }); // Needed for searches
// Adding a GeoJSON index for efficient querying by location
productSchema.index({ "location.coordinates": "2dsphere" });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;