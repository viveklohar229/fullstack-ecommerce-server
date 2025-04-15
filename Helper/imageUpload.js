const { ImageUpload } = require('../Models/imageUpload');
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

const deleteFromCloudinary = async (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (err) {
        console.error("Error deleting from Cloudinary:", err);
        return null;
    }
};


router.get('/', async (req, res) => {
    try {
        const imageUploadList = await ImageUpload.find();

        if (!imageUploadList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json(imageUploadList);
    } catch (error) {
        res.status(500).json({ success: false });
    }
})

router.post("/imageUpload", async (req, res) => {
    try {
        console.log("File Received:", req.files); // Debugging
        console.log("Body Data:", req.body); // Debugging

        if (!req.body.imageUrls) {
            return res.status(400).json({ error: "No image URL received" });
        }

        const imageUrl = req.body.imageUrls; // Ensure it's an array
        const savedImage = await ImageUpload.create({ images: imageUrl });
        res.status(200).json(savedImage);

    } catch (error) {
        console.error("Image Upload Error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});


// router.delete('/deleteAllImages', async (req, res) => {
//     try {
//         const images = await ImageUpload.find();

//         if (images.length === 0) {
//             return res.status(404).json({ message: "No images found to delete." });
//         }
//         // If using Cloudinary, delete all images from Cloudinary
//         for (const img of images) {
//             const deleteFromCloudinary = await deleteFromCloudinary(img.url);
//         }
//         // Delete all images from the database
//         await ImageUpload.deleteMany({});



//         res.json({ message: "All images deleted successfully!" });
//     } catch (error) {
//         console.error("Error deleting images:", error);
//         res.status(500).json({ error: "Server error while deleting images." });
//     }
// });
router.delete('/deleteAllImages', async (req, res) => {
    try {
        const images = await ImageUpload.find();

        if (images.length === 0) {
            return res.status(404).json({ message: "No images found to delete." });
        }

        for (const img of images) {
            if (img.images && img.images.length > 0) {
                for (const singleImageUrl of img.images) {
                    console.log("Trying to delete image from Cloudinary:", singleImageUrl);
                    const result = await deleteFromCloudinary(singleImageUrl);
                    console.log("Cloudinary delete result:", result);
                }
            }
        }
        

        await ImageUpload.deleteMany({});
        res.json({ message: "All images deleted successfully!" });

    } catch (error) {
        console.error("Error deleting images:", error);
        res.status(500).json({ error: "Server error while deleting images." });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const imageId = req.params.id;
        const newImageUrls = req.body.imageUrls;

        if (!newImageUrls || newImageUrls.length === 0) {
            return res.status(400).json({ error: "No image URLs provided for update." });
        }

        const updatedImage = await ImageUpload.findByIdAndUpdate(
            imageId,
            { $set: { images: newImageUrls } },
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ error: "Image not found for update." });
        }

        res.status(200).json({
            message: "Image updated successfully!",
            updatedImage
        });
    } catch (error) {
        console.error("Error updating image:", error);
        res.status(500).json({ error: "Server error while updating image." });
    }
});

module.exports = router;