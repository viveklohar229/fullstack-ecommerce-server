const { Category } = require('../Models/category');
const { ImageUpload } = require('../Models/imageUpload');
const { Product } = require('../Models/products');
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

var imagesArr = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
})
const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];

    try {

        // console.log("Uploaded files:", req.files);
        // if (!req?.files || req?.files.length === 0) {
        //     return res.status(400).json({ message: "No file uploaded!" });
        // }

        for (let i = 0; i < req?.files.length; i++) {
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                });
        }

        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });
        console.log(imagesArr);

        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);


    } catch (error) {
        console.log(error);
        // console.error("Error replacing images:", error);
        // res.status(500).json({ message: "Image replacement failed", error: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 1000;

        let filter = {};

        // Category filter
        if (req.query.catName) {
            const category = await Category.findOne({ name: req.query.catName });
            if (category) {
                filter.category = category._id;
            }
        }

        // Subcategory filter
        if (req.query.subCatId) {
            filter.subCat = req.query.subCatId;
        }

        // Price filter
        if (req.query.minPrice && req.query.maxPrice) {
            filter.price = {
                $gte: parseFloat(req.query.minPrice),
                $lte: parseFloat(req.query.maxPrice)
            };
        }

        // Rating filter
        if (req.query.rating) {
            filter.rating = parseFloat(req.query.rating);
        }

        // Location filter (handle "All")
        if (req.query.location && req.query.location !== "All") {
            filter.location = { $elemMatch: { value: req.query.location } };
        }

        const totalPosts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages && totalPages > 0) {
            return res.status(400).json({ message: "Page not found!" });
        }

        const productList = await Product.find(filter)
            .populate("category")
            .populate("subCat")
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            products: productList,
            totalPages,
            page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});




router.get(`/get/count`, async (req, res) => {
    try {
        const productsCount = await Product.countDocuments();

        if (!productsCount) {
            return res.status(500).json({ success: false });
        }

        res.send({
            productsCount: productsCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


router.get('/featured', async (req, res) => {
    try {
        let filter = { isFeatured: true }; // Filter to get only featured products

        // Check if location is passed in the query
        if (req.query.location && req.query.location !== "All") {
            filter.location = req.query.location; // Filter products by location
        }

        // Fetch the featured products based on the filter
        const productList = await Product.find(filter).populate("category");

        // Check if any products are found
        if (!productList || productList.length === 0) {
            return res.status(404).json({ success: false, message: "No featured products found" });
        }

        // Send the response with the featured products
        res.status(200).json(productList);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});





router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "The product with the given ID was not found." });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);

        // Handle invalid ObjectId errors specifically
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



router.post("/create", async (req, res) => {
    console.log("Category Received:", req.body.category);

    try {
        const category = await Category.findById(req.body.category); // ✅ req.body.category use karo, params.id nahi
        if (!category) {
            return res.status(404).json({ error: "Invalid Category!" });
        }


        const product = new Product({
            name: req.body.name,
            subCat: req.body.subCat,
            description: req.body.description,
            images: imagesArr,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            category: req.body.category,
            catName: req.body.catName,
            subCatId: req.body.subCatId,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRams: req.body.productRams,
            productSize: req.body.productSize,
            productWeight: req.body.productWeight,
            location: req.body.location,

        });

        const savedProduct = await product.save();

        imagesArr = [];
        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct,
        });


    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error, result) => {

    })
    if (response) {
        res.status(200).send(response);
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found!",
                status: false
            });
        }

        const images = product.images || [];

        if (images.length > 0) {
            for (const image of images) {
                const imagePath = `uploads/${image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "The product has been deleted!",
            status: true
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            message: "An error occurred while deleting the product",
            error: error.message,
            status: false
        });
    }
});



router.put("/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            subCat: req.body.subCat,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            category: req.body.category,
            catName: req.body.catName,
            subCatId: req.body.subCatId,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRams: req.body.productRams,
            productSize: req.body.productSize,
            productWeight: req.body.productWeight,
            location: req.body.location,
        },
        { new: true }
    );

    if (!product) {
        res.status(404).json({
            message: "The product can not be updated",
            status: false
        });
    }
    res.status(200).json({
        message: "Product updated successfully",
        status: true
    });

})



module.exports = router;