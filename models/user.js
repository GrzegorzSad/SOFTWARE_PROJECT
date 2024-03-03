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

const User = mongoose.model('User', userSchema);

module.exports = User;