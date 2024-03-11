if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const session = require('express-session')
const mongoose = require('mongoose')
const indexRouter = require('./routes/index')
const productRouter = require('./routes/products')
const userRouter = require('./routes/users')
const expressLayouts = require('express-ejs-layouts')
const attachSessionData = require('./session')
const bodyParser = require('body-parser');

const { checkRole } = require('./middleware');


// Make checkRole globally available by attaching it to app.locals
app.locals.checkRole = checkRole(app); // Pass app as a parameter

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to mongoDB'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false} // Set to true if using HTTPS
}))
app.use(attachSessionData);

app.use('/', indexRouter)
app.use('/products', productRouter)
app.use('/users', userRouter)

app.listen(process.env.PORT || 3000)
