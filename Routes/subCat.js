const { subCategory } = require('../Models/subCat');
const express = require('express');
const router = express.Router();



router.get(`/`, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 120;

        let filter = {};

        // ✅ Location filter
        if (req.query.location && req.query.location !== "All") {
            filter.location = req.query.location;
        }

        const totalPosts = await subCategory.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages && totalPages > 0) {
            return res.status(400).json({ message: "No data found!" });
        }

        const SubCategoryList = await subCategory.find(filter)
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!SubCategoryList) {
            return res.status(400).json({ success: false });
        }

        return res.status(200).json({
            SubCategoryList: SubCategoryList,
            totalPages: totalPages,
            page: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});


router.get('/:id', async (req, res) => {
    const subCat = await subCategory.findById(req.params.id).populate("category");
    if (!subCat) {
        res.status(500).json({ message: "The sub category with the given ID was not found." });
    }
    return res.status(200).send(subCat);
});



router.post("/create", async (req, res) => {
    try {
        // Create and save category
        const subCat = new subCategory({
            category: req.body.category,
            subCat: req.body.subCat,
           
        });

        const savedSubCat = await subCat.save();

        res.status(201).json({
            message: "Sub category created successfully",
            subCat: savedSubCat,
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

router.delete('/:id', async (req, res) => {

    // const subCat = await subCategory.findById(req.params.id);
    const deleteSubCat = await subCategory.findByIdAndDelete(req.params.id);
    if (!deleteSubCat) {
        return res.status(404).json({
            message: " Sub category not found!",
            status: false
        });
    }
    res.status(200).json({
        message: "The sub category has been deleted!",
        status: true
    });

});

router.put('/:id',  async (req, res) => {
    try {
        const updatedSubCat = await subCategory.findByIdAndUpdate(
            req.params.id,
            {
                category: req.body.category,
                subCat: req.body.subCat
            },
            { new: true }
        );

        if (!updatedSubCat) {
            return res.status(404).json({ message: "Sub category not found" });
        }

        res.status(200).json(updatedSubCat); // Ensure updated image URLs are returned
    } catch (error) {
        res.status(500).json({ message: "Error updating sub category", error: error.message });
    }
});


router.get(`/get/count`, async (req, res) => {
    try {
        const subCatCount = await subCategory.countDocuments();

        if (!subCatCount) {
            return res.status(500).json({ success: false });
        }

        res.json({ subCatCount: subCatCount });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: "Server error" });
        }
    }
});


module.exports = router;