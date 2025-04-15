const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const path = require("path");
// const authJwt = require('./Helper/jwt');

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());
// app.use(authJwt());


// Routes
const categoryRoutes = require('./Routes/category');
const subCatRoutes = require('./Routes/subCat');
const productRoutes = require('./Routes/products');
const productRamsRoutes = require('./Routes/productRams');
const productSizeRoutes = require('./Routes/productSize');
const productWeightRoutes = require('./Routes/productWeight');
const recentlyViewedRoutes = require('./Routes/recentlyViewed');
const userRoutes = require('./Routes/user');
const cartRoutes = require('./Routes/cart');
const productReviewsRoutes = require('./Routes/productReviews');
const myListRoutes = require('./Routes/myList');
const ordersRoutes = require('./Routes/orders');
const imageUploadRoutes = require('./Helper/imageUpload');
const homeBannerSliderRoutes = require('./Routes/homeBannerSlider');
const searchRoutes = require('./Routes/search');




// app.use('/uploads', express.static('uploads'));
app.use('/api/category', categoryRoutes);
app.use('/api/subCat', subCatRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productRams', productRamsRoutes);
app.use('/api/productSize', productSizeRoutes);
app.use('/api/productWeight', productWeightRoutes);
app.use('/api/recentlyViewed', recentlyViewedRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/productReviews', productReviewsRoutes);
app.use('/api/myList', myListRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/imageUpload', imageUploadRoutes);
app.use('/api/homeBanner', homeBannerSliderRoutes);
app.use('/api/search', searchRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');

        //Server
        app.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        })


    })
    .catch((err) => { 
        console.log(err);
    })




// mongoose.connect(process.env.CONNECTION_STRING).then(() => console.log("Database Connection is ready...")).catch((err) => {
//     console.log(err);
// })



