const { HomeBannerSlider } = require('../Models/homeBannerSlider');
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
    
        const homeBannerList = await HomeBannerSlider.find();

        if (!homeBannerList) {
            return res.status(404).json({ success: false});
        }

        return res.status(200).json(homeBannerList);

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, });
    }
});

router.get(`/get/count` , async (req, res)=>{
    const homeBannerCount = await HomeBannerSlider.countDocuments();

    if(!homeBannerCount){
        res.status(500).json({success: false})
    }
    res.send({
        homeBannerCount: homeBannerCount
    });
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const homeBanner = await HomeBannerSlider.findById(id);
        if (!homeBanner) {
            return res.status(404).json({ success: false });
        }
        return res.status(200).json(homeBanner);
    } catch (error) {
        console.error("Error fetching home banner:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid home banner ID format." });
        }
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.post("/create", async (req, res) => {
    try {
        let newEntry = new HomeBannerSlider({
            images: imagesArr,
        });

        if (!newEntry) {
            res.status(500).json({
                error: err,
                success: false
            })
        }

        savedNewEntry = await newEntry.save();

        res.status(201).json(savedNewEntry);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            error: "Internal Server Error",
            status: false
        });
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
        const homeBanner = await HomeBannerSlider.findById(req.params.id);
        if (!homeBanner) {
            return res.status(404).json({
                message: "Home Banner not found!",
                status: false
            });
        }
        
        const images = homeBanner.images || [];
        if (images.length > 0) {
            for (const image of images) {
                const imagePath = `uploads/${image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        await HomeBannerSlider.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "The Home Banner Slider has been deleted!",
            status: true
        });
    } catch (error) {
        console.error("Error deleting Home Banner Slider:", error);
        res.status(500).json({
            message: "An error occurred while deleting the Home Banner Slider",
            error: error.message,
            status: false
        });
    }
});



router.put('/:id', upload.array("images"), async (req, res) => {
    try {
        const updatedHomeBanner = await HomeBannerSlider.findByIdAndUpdate(
            req.params.id,
            { images: req.body.images },
            { new: true }
        );

        if (!updatedHomeBanner) {
            return res.status(404).json({ message: "Home Banner not found" });
        }

        res.status(200).json(updatedHomeBanner); // Ensure updated image URLs are returned
    } catch (error) {
        res.status(500).json({ message: "Error updating  Home Banner", error: error.message });
    }
});



module.exports = router;

