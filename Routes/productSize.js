const { ProductSize } = require('../Models/productSize');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const productSizeList = await ProductSize.find()

        if (!productSizeList || productSizeList.length === 0) {
            return res.status(404).json({ success: false, message: "No  product size found" });
        }
        res.status(200).json(productSizeList);
    } catch (error) {
        console.error("Error fetching product Size :", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productSize = await ProductSize.findById(id);

        if (!productSize) {
            return res.status(404).json({ message: "The product size with the given ID was not found." });
        }

        return res.status(200).json(productSize);

    } catch (error) {
        console.error("Error fetching product size:", error);

        // Handle invalid ObjectId errors specifically
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ram ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.post('/create', async (req, res) => {
    let productSize = new ProductSize({
        productSize: req.body.productSize
    });

    if (!productSize) {
        res.status(500).json({
            error: err,
            success: false
        })
    }

    productSize = await productSize.save();

    res.status(201).json(productSize);
});

router.delete('/:id', async (req, res)=>{
    const deletedItem = await ProductSize.findByIdAndDelete(req.params.id);

    if (!deletedItem){
        res.status(404).json({
            message:'Item not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message:'Item Deleted!'
    })
});

router.put('/:id', async (req, res)=>{
    const item = await ProductSize.findByIdAndUpdate(req.params.id,
        {
            productSize: req.body.productSize,
        },
        {new: true}
    )

    if (!item){
        res.status(404).json({
            message:'Item can not be  updated!',
            success: false
        })
    }

   res.send(item);
   
});

module.exports = router;