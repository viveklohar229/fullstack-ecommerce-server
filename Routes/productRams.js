const { ProductRams } = require('../Models/productRams');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const productRamsList = await ProductRams.find()

        if (!productRamsList || productRamsList.length === 0) {
            return res.status(404).json({ success: false, message: "No  product rams found" });
        }

        res.status(200).json(productRamsList);
    } catch (error) {
        console.error("Error fetching product Rams :", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productRam = await ProductRams.findById(id);

        if (!productRam) {
            return res.status(404).json({ message: "The product ram with the given ID was not found." });
        }

        return res.status(200).json(productRam);

    } catch (error) {
        console.error("Error fetching product ram:", error);

        // Handle invalid ObjectId errors specifically
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ram ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



router.post('/create', async (req, res) => {
    let productRam = new ProductRams({
        productRams: req.body.productRams
    });

    if (!productRam) {
        res.status(500).json({
            error: err,
            success: false
        })
    }

    productRam = await productRam.save();

    res.status(201).json(productRam);
});

router.delete('/:id', async (req, res)=>{
    const deletedItem = await ProductRams.findByIdAndDelete(req.params.id);

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
    const item = await ProductRams.findByIdAndUpdate(req.params.id,
        {
            productRams: req.body.productRams,
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