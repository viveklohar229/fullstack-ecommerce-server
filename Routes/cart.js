const { Cart } = require('../Models/cart');
const express = require('express');
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const cartList = await Cart.find(req.query);


        if (!cartList) {
            return res.status(404).json({ message: "No categories found!" });
        }

        return res.status(200).json(cartList);

    } catch (error) {
        res.status(500).json({ error: "Server error while fetching categories." });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Cart.findById(id);

        if (!cart) {
            return res.status(404).json({ status: false, message: "The cart with the given ID was not found." });
        }

        return res.status(200).json(cart);

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
})

router.post("/add", async (req, res) => {
    try {

        const cartItem = await Cart.find({ productId: req.body.productId , userId:req.body.userId});

        if (cartItem.length === 0) {
            let cart = new Cart({
                productTitle: req.body.productTitle,
                images: req.body.images,
                rating: req.body.rating,
                price: req.body.price,
                quantity: req.body.quantity,
                subTotal: req.body.subTotal,
                productId: req.body.productId,
                userId: req.body.userId,
            });

            if (!cart) {
                res.status(500).json({
                    error: error,
                    status: false
                })
            }

            savedCart = await cart.save();

            res.status(201).json({
                status: true,
                msg: "Product added to cart successfully",
                cart: savedCart,
            });


        } else {
            res.status(401).json({ status: false, msg: "Product already added in the cart" })
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            status: false
        });
    }

});

router.delete('/:id', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id);
        if (!cart) {
            return res.status(404).json({
                message: "The cart item given id is  not found!",
                status: false
            });
        }

        const deleteItem = await Cart.findByIdAndDelete(req.params.id);

        if (!deleteItem) {
            res.status(404).json({
                message: "Cart not found!",
                status: false
            })
        }

        res.status(200).json({
            message: "The cart has been deleted!",
            status: true
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while deleting the cart",
            error: error.message,
            status: false
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            {
                productTitle: req.body.productTitle,
                images: req.body.images,
                rating: req.body.rating,
                price: req.body.price,
                quantity: req.body.quantity,
                subTotal: req.body.subTotal,
                productId: req.body.productId,
                userId: req.body.userId,
            },
            { new: true }
        )

        if (!updatedCart) {
            return res.status(404).json({ status: false, message: "Cart not found" });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ status: false, message: "Error updating cart", error: error.message });
    }
});


module.exports = router;

