const express = require('express')
const router = express.Router()
const User = require('../models/user')
const multer = require('multer')
const path = require('path')
const { checkRole } = require('../middleware');
let referer; //for going back after logins and stuff

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/') // Save uploaded files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname); // Get file extension
      cb(null, Date.now() + extension); // Append extension to generated filename
    }
  });
  
  const upload = multer({ storage: storage });

//All
router.get('/',checkRole('admin'), (req, res) => {
    User.find({})
        .then(users => {
            res.render('users', { users:users })
        })
        .catch(err => {
            res.render('error', { errorMessage: 'Failed to fetch users' })
        })
})


// login view
router.get('/login', (req, res) => {
  referer = req.get('referer');
  res.render('users/login');
});

//login 
router.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      // Find the user by username in the database
      const user = await User.findOne({ username }); // Corrected 'user' to 'User'

      // If user does not exist or password is incorrect, return error
      if (!user) {
          return res.status(401).json({ error: "Invalid username" });
      }
       //else if(!(await bcrypt.compare(password, user.password)))
       else if (password != user.password)
       {
          return res.status(401).json({ error: "Invalid password" });
      }

       // Set session data
       req.session.userId = user._id
       req.session.username = user.username
       req.session.role = user.role

      // Redirect user to dashboard or any other page
      res.redirect(referer || '/');

  } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

//logout

router.get('/logout', (req, res) => {
    // Clear session data
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Redirect to the home page or any other page after logout
        res.redirect('/');
    });
});




//new
router.get('/new', (req, res) => {
    res.render("users/new", { user: new User() })
})

//create
router.post('/', upload.single('profileImg'), async (req, res) => {
  const { username, email, password, role, lat, lng, addressDesc, address } = req.body;
  const profileImgUrl = req.file ? req.file.path.replace("public", '') : '/default-profile-image.jpg';

  try {
    const newUser = new User({
      username,
      email,
      password,
      profileImgUrl,
      role,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address, // Now using the full address from the geocoding result
        addressDesc: addressDesc
      }
    });
  
      await newUser.save();

      // Automatically log in the new user
      req.session.userId = newUser._id;
      req.session.username = newUser.username;

      res.redirect(referer || '/');

    } catch (error) {
      res.render('users/new', {
        user: {
          username,
          email,
          password,
          role,
          location: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB expects coordinates in [longitude, latitude] order
            address: addressDesc
          },
          profileImgUrl: req.file ? req.file.path : '/default-profile-image.jpg'
        },
        errorMessage: 'Error creating user'
      });
    }
  });

//delete

//show
router.get('/show/:userId', async (req, res) => {
  try {
      const userId = req.params.userId; // Extract userId from route parameters
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.render('users/show', { user });
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).send('Internal Server Error');
  }
});

module.exports = router;