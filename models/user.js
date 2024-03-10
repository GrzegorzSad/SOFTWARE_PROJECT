const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImgUrl: {
    type: String,
    default: '/default-profile-image.jpg' // You can set a default profile image URL here if needed
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Define possible roles for users
    default: 'user'
  },
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

// userSchema.pre('save', async function(next) {
//   try {
//       // Check if the password has been modified
//       if (!this.isModified('password')) {
//           return next();
//       }
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(this.password, 10);
//       this.password = hashedPassword;
//       next();
//   } catch (error) {
//       next(error);
//   }
// });

// Ensure the schema uses 2dsphere index for geospatial queries on location
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;