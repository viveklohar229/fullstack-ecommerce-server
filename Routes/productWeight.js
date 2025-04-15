const { ProductWeight } = require('../Models/productWeight');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const productWeightList = await ProductWeight.find()

        if (!productWeightList || productWeightList.length === 0) {
            return res.status(404).json({ success: false, message: "No  product weight found" });
        }

        res.status(200).json(productWeightList);
    } catch (error) {
        console.error("Error fetching product Weight :", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productWeight = await ProductWeight.findById(id);

        if (!productWeight) {
            return res.status(404).json({ message: "The product weight with the given ID was not found." });
        }

        return res.status(200).json(productWeight);

    } catch (error) {
        console.error("Error fetching product weight:", error);

        // Handle invalid ObjectId errors specifically
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product weight ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.post('/create', async (req, res) => {
    let productWeight = new ProductWeight({
        productWeight: req.body.productWeight
    });

    if (!productWeight) {
        res.status(500).json({
            error: err,
            success: false
        })
    }

    productWeight = await productWeight.save();

    res.status(201).json(productWeight);
});

router.delete('/:id', async (req, res)=>{
    const deletedItem = await ProductWeight.findByIdAndDelete(req.params.id);

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
    const item = await ProductWeight.findByIdAndUpdate(req.params.id,
        {
            productWeight: req.body.productWeight,
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