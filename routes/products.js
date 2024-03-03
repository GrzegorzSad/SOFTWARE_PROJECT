const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const multer = require('multer')
const path = require('path');

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
router.get('/', (req, res) => {
    Product.find({})
        .then(products => {
            res.render('products', { products: products })
        })
        .catch(err => {
            res.render('error', { errorMessage: 'Failed to fetch products' })
        })
})

//New
router.get('/new', (req, res) => {
    res.render("products/new", { product: new Product() })
})

//create
router.post('/', upload.array('images', 5), async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        userId: req.body.userId,
        images: req.files.map(file => file.path.replace("public", '')),
    })
    try {
        const newProduct = await product.save()
        res.redirect('/products')
    }
    catch {
        res.render('products/new', {
            product: product,
            errorMessage: 'Error creating product'
        })
    }
})

//Edit

//Delete

module.exports = router;