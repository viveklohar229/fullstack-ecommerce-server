const { Orders } = require('../Models/orders');
const express = require('express');
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 120;

        const totalPosts = await Orders.countDocuments();
        const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));

        if (page > totalPages) {
            return res.status(404).json({ message: "No data found!" });
        }

        const ordersList = await Orders.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!ordersList) {
            return res.status(404).json({ status: false });
        }

        return res.status(200).json({
            ordersList,
            totalPages,
            page
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ status: false, error: "Server error while fetching categories." });
    }
});

router.get(`/get/count` , async (req, res)=>{
    const orderCount = await Orders.countDocuments();

    if(!orderCount){
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await Orders.findById(id);

        if (!orders) {
            return res.status(404).json({ message: "The orders with the given ID was not found." });
        }

        return res.status(200).json(orders);

    } catch (error) {
        console.error("Error fetching orders:", error);


        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid orders ID format." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



router.post("/create", async (req, res) => {
    try {

        const orders = new Orders({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userId: req.body.userId,
            products: req.body.products,
            status: req.body.status,

        });

        if (!orders) {
            res.status(500).json({
                error: error,
                status: false
            })
        }

        const savedorders = await orders.save();

        res.status(201).json(savedorders);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            error: "Internal Server Error",
            status: false
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id);
        if (!orders) {
            return res.status(404).json({
                message: "Orders not found!",
                status: false
            });
        }

        await orders.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "The orders has been deleted!",
            status: true
        });
    } catch (error) {
        console.error("Error deleting orders:", error);
        res.status(500).json({
            message: "An error occurred while deleting the orders",
            error: error.message,
            status: false
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedOrders = await Orders.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                pincode: req.body.pincode,
                amount: req.body.amount,
                paymentId: req.body.paymentId,
                email: req.body.email,
                userId: req.body.userId,
                products: req.body.products,
                status: req.body.status,
            },
            { new: true }
        );

        if (!updatedOrders) {
            return res.status(404).json({ message: "Orders not found" });
        }

        res.status(200).json(updatedOrders);
    } catch (error) {
        res.status(500).json({ message: "Error updating orders", error: error.message });
    }
});



module.exports = router;

