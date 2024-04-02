const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const User = require('../models/user');
const Review = require('../models/review');
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

let pinLocation = [];
let range = 50;

router.get('/', async (req, res) => {
    pinLocation = [+req.query.lng, +req.query.lat]
    range = +req.query.range

    let userLocation = [];

    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            userLocation = user.location;
            ////console.log(userLocation);
        } else {
            ////console.log("User not found");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }

    // Assign pinLocation based on userLocation if it's not defined
    if (!pinLocation) {
        pinLocation = userLocation.coordinates;
    }

    // Ensure pinLocation is a valid array of coordinates
    ////console.log(pinLocation);

    let products = []

    try {



        const query = {
            $and: [
                // Conditionally include the $text search if req.query.q exists
                req.query.q ? { $text: { $search: req.query.q } } : {},
                {
                    "location": {
                        $geoWithin: {
                            $centerSphere: [[pinLocation[0], pinLocation[1]], range / 6371] //from radians to kms
                        }
                    }
                }
            ]
        };

        const result = await Product.find(query)
            .populate('userId')
            .then(result => {
                //console.log(result); // populated documents
                products = result
            })
            .catch(err => {
                console.error(err);
            });

        // } else {
        //     products = await Product.find({}).populate('userId');
        // }

        ////console.log(products);


        res.render('products', { products: products, userLocation: userLocation, pinLocation: pinLocation, range: range, q: req.query.q });
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
            ////console.log(userLocation);
        } else {
            ////console.log("User not found");
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

//show
router.get('/:productId', async (req, res) => {
    let userLocation = [];

    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            userLocation = user.location;
            ////console.log(userLocation);
        } else {
            ////console.log("User not found");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
    
    try {
        const product = await Product.findById(req.params.productId).populate('userId');
        const bookedDates = product.bookings.map(booking => ({
            start: booking.startDate.toISOString(),
            end: booking.endDate.toISOString()
        }));

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Fetch reviews for the product
        const reviews = await Review.find({ product: product._id }).populate('reviewer');

        res.render('products/show', { product: product, userLocation: userLocation, bookedDates: bookedDates, reviews: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//POST REVIEW (not making a seperate review file cos its just 1 route)

router.post('/:productId/reviews', loggedIn(), async (req, res) => {
    try {
        const { rating, text } = req.body;
        const productId = req.params.productId;
        const reviewer = req.session.userId

        // Fetch the product to get its owner's ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create the review with automatic population of productOwner field
        const review = await Review.create({
            rating,
            text,
            product: productId,
            productOwner: product.userId,
            reviewer
        });

        res.redirect('back');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


//Edit

//Delete


// POST route to create a new booking
router.post('/:productId/bookings', loggedIn(), async (req, res) => {
    try {
        const productId = req.params.productId;
        const { startDate, endDate, bookedBy } = req.body; // Assuming startDate, endDate, and bookedBy are provided in the request body

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check for overlapping bookings
        const overlappingBooking = product.bookings.find(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            const newStart = new Date(startDate);
            const newEnd = new Date(endDate);
            return (
                (newStart >= bookingStart && newStart < bookingEnd) || // New start date overlaps with existing booking
                (newEnd > bookingStart && newEnd <= bookingEnd) || // New end date overlaps with existing booking
                (newStart <= bookingStart && newEnd >= bookingEnd) // New booking completely overlaps existing booking
            );
        });

        if (overlappingBooking) {
            return res.status(400).json({ error: 'This date range overlaps with an existing booking.' });
        }

        // Create a new booking object
        const booking = {
            startDate: startDate,
            endDate: endDate,
            bookedBy: bookedBy
        };

        // Add the booking to the product's bookings array
        product.bookings.push(booking);

        // Save the updated product to the database
        await product.save();

        res.redirect('back');
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
