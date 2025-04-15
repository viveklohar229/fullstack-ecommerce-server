const { MyList } = require('../Models/myList');
const express = require('express');
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const myList = await MyList.find(req.query);
        if (!myList) {
            return res.status(404).json({ status: false });
        }

        return res.status(200).json(myList);

    } catch (error) {
        res.status(500).json({ status: false });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const myList = await MyList.findById(id);

        if (!myList) {
            return res.status(404).json({ status: false, message: "The my list with the given ID was not found." });
        }

        return res.status(200).json(myList);

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
})

router.post("/add", async (req, res) => {
    try {

        const myListItem = await MyList.find({ productId: req.body.productId, userId: req.body.userId });

        if (myListItem.length === 0) {
            let myList = new MyList({
                productTitle: req.body.productTitle,
                images: req.body.images,
                rating: req.body.rating,
                price: req.body.price,
                productId: req.body.productId,
                userId: req.body.userId,
            });

            if (!myList) {
                res.status(500).json({
                    error: error,
                    status: false
                })
            }

            savedMyList = await myList.save();

            res.status(201).json({
                status: true,
                msg: "Product added to my list successfully",
                myList: savedMyList,
            });


        } else {
            res.status(401).json({ status: false, msg: "Product already added in the my list" })
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
        const myList = await MyList.findById(req.params.id);
        if (!myList) {
            return res.status(404).json({
                message: "The my list item given id is  not found!",
                status: false
            });
        }

        const deleteMyList = await MyList.findByIdAndDelete(req.params.id);

        if (!deleteMyList) {
            res.status(404).json({
                message: "My List not found!",
                status: false
            })
        }

        res.status(200).json({
            message: "The my list has been deleted!",
            status: true
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while deleting the my list",
            error: error.message,
            status: false
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedMyList = await MyList.findByIdAndUpdate(
            req.params.id,
            {
                productTitle: req.body.productTitle,
                images: req.body.images,
                rating: req.body.rating,
                price: req.body.price,
                productId: req.body.productId,
                userId: req.body.userId,
            },
            { new: true }
        )

        if (!updatedMyList) {
            return res.status(404).json({ status: false, message: "My list not found" });
        }

        res.status(200).json(updatedMyList);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating my list", error: error.message });
    }
});


module.exports = router;

