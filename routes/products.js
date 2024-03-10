const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/user');
const multer = require('multer')
const path = require('path');
const { loggedIn } = require('../middleware');

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


router.get('/', async (req, res) => {
    try {
        let products;

        // Check if a search query parameter exists
        if (req.query.q) {
            // Perform search based on query
            products = await Product.find({ $text: { $search: req.query.q } }).populate('userId');
        } else {
            // Fetch all products if no query provided
            products = await Product.find({}).populate('userId');
        }

        // Render the 'products' view with the products data
        res.render('products', { products: products });
    } catch (err) {
        // Render an error page if an error occurs
        res.render('products', { errorMessage: 'Failed to fetch products' });
    }
});

//New
router.get('/new', loggedIn(), async (req, res) => {
    let userLocation;
    try {
        const user = await User.findById(req.session.userId); // Make sure userId is a valid ID
        if (user) {
          userLocation = user.location;
          console.log(userLocation);
        } else {
          console.log("User not found");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    res.render("products/new", { product: new Product(), userLocation: userLocation})
})

//create
router.post('/', upload.array('images', 5), async (req, res) => {
    // Extracting location data from req.body
    const { name, description, price, userId, lat, lng, address, addressDesc } = req.body;

    // Ensure the coordinates are correctly extracted as numbers
    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Construct the product with location and images
    const product = new Product({
        name: name,
        description: description,
        price: parseFloat(price), // Make sure price is a number
        userId: userId, // Assuming this is the ID of the user creating the product
        images: req.files.map(file => file.path.replace("public", '')), // Adjusting file paths
        location: {
            type: 'Point',
            coordinates: coordinates, // Using extracted coordinates
            address: address, // Using the full address from the form
            addressDesc: addressDesc // Additional address description
        }
    });

    try {
        const newProduct = await product.save();
        res.redirect('/products'); // Redirect to the products page on successful creation
    } catch (error) {
        console.error("Error creating product:", error); // Log the error for debugging
        res.render('products/new', {
            product: product,
            errorMessage: 'Error creating product' // Provide a generic error message or customize based on 'error'
        });
    }
});

//Edit

//Delete

module.exports = router;