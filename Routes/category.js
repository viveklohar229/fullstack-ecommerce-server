const { Category } = require('../Models/category');
const { ImageUpload } = require('../Models/imageUpload');
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
        const perPage = 120;

        let filter = {}; // Default filter is empty

       

        const totalPosts = await Category.countDocuments(filter); // Count documents based on the filter
        const totalPages = Math.max(1, Math.ceil(totalPosts / perPage)); // Ensures at least 1 page

        if (page > totalPages) {
            return res.status(404).json({ message: "No data found!" });
        }

        const categoryList = await Category.find(filter)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (categoryList.length === 0) {
            return res.status(404).json({ message: "No categories found!" });
        }

        return res.status(200).json({
            categoryList,
            totalPages,
            page
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, error: "Server error while fetching categories." });
    }
});



router.get(`/get/count`, async (req, res) => {
    try {
        const categoryCount = await Category.countDocuments();

        if (!categoryCount) {
            return res.status(500).json({ success: false });
        }

        res.json({ categoryCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: "The category with the given ID was not found." });
        }

        return res.status(200).json(category);

    } catch (error) {
        console.error("Error fetching category:", error);

        // Handle invalid ObjectId errors specifically
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid category ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



router.post("/create", async (req, res) => {
    try {
    
        let category = new Category({
            name: req.body.name,
            images: imagesArr,
            color: req.body.color
        });

        const savedCategory = await category.save();

        res.status(201).json({
            message: "Category created successfully",
            category: savedCategory,
            // failedUploads // Include failed uploads in response
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            error: "Internal Server Error",
            status: false
        });
    }
});

router.delete('/deleteImage', async (req, res)=>{
    const imgUrl = req.query.img;

    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length-1];

    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName,(error,result)=>{

    })
    if(response){
        res.status(200).send(response);
    }
})


router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found!",
                status: false
            });
        }

        const images = category.images || [];

        if (images.length > 0) {
            for (const image of images) {
                const imagePath = `uploads/${image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "The category has been deleted!",
            status: true
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            message: "An error occurred while deleting the category",
            error: error.message,
            status: false
        });
    }
});



router.put('/:id', upload.array("images"), async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, color: req.body.color, images: req.body.images },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory); // Ensure updated image URLs are returned
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
});



module.exports = router;

