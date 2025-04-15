const { ProductReviews } = require('../Models/productReviews');
const express = require('express');
const router = express.Router();


router.get("/", async (req, res) => {

    let reviews = [];
    try {

        if (req.query.productId !== undefined && req.query.productId !== null && req.query.productId !== "") {
            reviews = await ProductReviews.find({ productId: req.query.productId });
        } else {
            reviews = await ProductReviews.find();
        }
        if (!reviews) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get(`/get/count` , async (req, res)=>{
    const reviewCount = await ProductReviews.countDocuments();

    if(!reviewCount){
        res.status(500).json({success: false})
    }
    res.send({
        reviewCount: reviewCount
    });
})


router.get('/:id', async (req, res) => {

    const review = await ProductReviews.findById(req.params.id)
    if (!review) {
        return res.status(500).json({ message: "The review with the given ID was not found." });
    }

    return res.status(200).send(review);
})

router.post("/add", async (req, res) => {

    let review = new ProductReviews({
        customerName: req.body.customerName,
        review: req.body.review,
        customerRating: req.body.customerRating,
        customerId: req.body.customerId,
        productId: req.body.productId,
    });

    if (!review) {
        res.status(500).json({
            error: error,
            success: false
        })
    }

    savedReviews = await review.save();

    res.status(201).json(savedReviews);


});

// router.delete('/:id', async (req, res) => {
//     try {
//         const cart = await Cart.findById(req.params.id);
//         if (!cart) {
//             return res.status(404).json({
//                 message: "The cart item given id is  not found!",
//                 status: false
//             });
//         }

//         const deleteItem = await Cart.findByIdAndDelete(req.params.id);

//         if (!deleteItem) {
//             res.status(404).json({
//                 message: "Cart not found!",
//                 status: false
//             })
//         }

//         res.status(200).json({
//             message: "The cart has been deleted!",
//             status: true
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "An error occurred while deleting the cart",
//             error: error.message,
//             status: false
//         });
//     }
// });

// router.put('/:id', async (req, res) => {
//     try {
//         const updatedCart = await Cart.findByIdAndUpdate(
//             req.params.id,
//             {
//                 productTitle: req.body.productTitle,
//                 images: req.body.images,
//                 rating: req.body.rating,
//                 price: req.body.price,
//                 quantity: req.body.quantity,
//                 subTotal: req.body.subTotal,
//                 productId: req.body.productId,
//                 userId: req.body.userId,
//             },
//             { new: true }
//         )

//         if (!updatedCart) {
//             return res.status(404).json({ status: false, message: "Cart not found" });
//         }

//         res.status(200).json(updatedCart);
//     } catch (error) {
//         res.status(500).json({ status: false, message: "Error updating cart", error: error.message });
//     }
// });


module.exports = router;

