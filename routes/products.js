const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/user');
const multer = require('multer')
const path = require('path');
const { loggedIn } = require('../middleware');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

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

let pinLocation = [];
let range = 50;

router.post('/updateLocation', (req, res) => {
    try {
        pinLocation = [parseFloat(req.body.lat), parseFloat(req.body.lng)];
        console.log(pinLocation, 'PIN')
    } catch (error) {
        console.error("Error fetching pin:", error);
    }
    try {
        range = +req.body.range
        console.log(range)
    } catch (error) {
        console.error("Error fetching pin:", error);
    }
    res.redirect('/products',)
})



router.get('/', async (req, res) => {
    let userLocation = [];

    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            userLocation = user.location;
            console.log(userLocation);
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }

    // Assign pinLocation based on userLocation if it's not defined
    if (!pinLocation) {
        pinLocation = userLocation.coordinates;
    }

    // Ensure pinLocation is a valid array of coordinates
    pinLocation = [parseFloat(pinLocation[0]), parseFloat(pinLocation[1])];
    console.log(pinLocation);

    try {
        let products = [];

        if (req.query.q) {
            // Perform text search query
            products = await Product.find({ $text: { $search: req.query.q } }).populate('userId');
        } else {
            products = await Product.find({}).populate('userId');
        }

        console.log(products);

        let filteredProducts = [];

        try {
            // Filter products based on distance
            filteredProducts = products.filter(product => {
                if (!product.location || !product.location.coordinates) return false;

                const productLat = product.location.coordinates[1];
                const productLon = product.location.coordinates[0];
                const distance = calculateDistance(pinLocation[0], pinLocation[1], productLat, productLon);

                return distance <= range;
            });

            console.log(filteredProducts);
        } catch (err) {
            console.error("Error filtering products:", err);
        }

        res.render('products', { products: filteredProducts, userLocation, pinLocation, range });
    } catch (err) {
        console.error("Error fetching products:", err);
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
    res.render("products/new", { product: new Product(), userLocation: userLocation })
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