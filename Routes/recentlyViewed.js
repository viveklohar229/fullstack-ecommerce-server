const express = require("express");
const { RecentlyViewed } = require("../Models/recentlyViewed");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const productList = await RecentlyViewed.find(req.query)
            .populate("category")
            .populate("subCat");

        if (!productList === 0) {
            return res.status(404).json({ success: false, message: "No recently viewed products found." });
        }

        return res.status(200).json(productList);
    } catch (error) {
        console.error("Error fetching recently viewed products:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await RecentlyViewed.findById(id).populate("category subCat");

        if (!product) {
            return res.status(404).json({ message: "The product with the given ID was not found." });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        
        let findProduct = await RecentlyViewed.findOne({ prodId: req.body.prodId })
        var product;
        if (!findProduct) {
            product = new RecentlyViewed({
                name: req.body.name,
                prodId: req.body.id,
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
            });

            const savedProduct = await product.save();

            return res.status(201).json(savedProduct);
        }
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
