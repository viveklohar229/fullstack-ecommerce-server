const { User } = require('../Models/user');
const { ImageUpload } = require('../Models/imageUpload');
const { sendEmail } = require('../utils/emailService');
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

var imagesArr = [];


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
})
const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];

    try {



        for (let i = 0; i < req?.files.length; i++) {
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                });
        }

        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });
        // console.log(imagesArr);

        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);


    } catch (error) {
        console.log(error);
        // console.error("Error replacing images:", error);
        // res.status(500).json({ message: "Image replacement failed", error: error.message });
    }
});

router.post('/authWithGoogle', async (req, res) => {
    const { name, phone, email, password, images, isAdmin } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            const result = await User.create({
                name: name,
                phone: phone,
                email: email,
                password: password,
                images: images,
                isAdmin: isAdmin
            });

            const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            return res.status(200).send({
                user: result,
                token: token,
                msg: "User Login Successfully !"
            })
        }
        else {
            const existingUser = await User.findOne({ email: email });
            const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
            return res.status(200).send({
                user: existingUser,
                token: token,
                msg: "User Login Successfully !"
            })
        }
    } catch (error) {
        console.log(error);
    }
});


router.post('/signup', async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {
        // Check if a user already exists with the same email OR phone
        const existingUser = await User.findOne({
            $or: [{ email: email }, { phone: phone }]
        });

        if (existingUser) {
            return res.status(400).json({ status: false, message: "User with this email or phone already exists!" });
        }

        // Create new user
        const hashPassword = await bcrypt.hash(password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await User.create({
            name,
            phone,
            email,
            password: hashPassword,
            isAdmin,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,
        });

        // Send OTP email
        const emailSent = await sendEmailFun(email, "Verify Email", "", `Your OTP is ${verifyCode}`);

        // Generate token
        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY, { expiresIn: "7d" });

        res.status(201).json({
            status: true,
            message: "Registration successful! Please verify your email.",
            user: newUser,
            token
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ status: false, message: "Something went wrong" });
    }
});



router.post("/verifyAccount/resendOtp", async (req, res) => {
    const { email } = req.body;
    try {
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update user OTP
        existingUser.otp = verifyCode;
        existingUser.otpExpires = Date.now() + 600000; // 10 minutes
        await existingUser.save();

        // Send email
        await sendEmailFun(
            email,
            "Verify Email",
            `Your OTP is ${verifyCode}`,
            `<p>Your OTP is <b>${verifyCode}</b></p>`
        );

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

router.put(`/verifyAccount/emailVerify/:id`, async (req, res) => {
    const { email, otp } = req.body;
    try {

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    name: user.name,
                    email: user,
                    phone: user.phone,
                    password: user.password,
                    images: user.images,
                    isAdmin: user.isAdmin,
                    isVerified: user.isVerified,
                    otp: otp,
                    otpExpires: Date.now() + 600000,
                },
                { new: true }
            )
        }

        const resp = sendEmailFun(email, "Verify Email", "", "Your OTP is" + otp);

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        return res.status(200).json({
            success: trusted,
            message: "OTP SEND",
            token: token,
        });

    } catch (error) {
        console.log(error);
        res.json({ status: "FAILED", msg: "Something went wrong !" })
    }
})

const sendEmailFun = async (to, subject, text, html) => {
    const result = await sendEmail(to, subject, text, html);
    if (result.success) {
        return true;
    } else {
        return false
    }
}

router.post('/verifyEmail', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.isVerified = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.status(200).json({ success: true, message: "OTP verified successfully!" });
        } else if (!isCodeValid) {
            return res.status(400).json({ success: true, message: "Invalid OTP!" });
        } else {
            return res.status(400).json({ success: true, message: "OTP Expired !" });
        }
    } catch (error) {
        console.log("Error in verifiedEmail", error)
        res.status(500).json({ success: false, message: "Error in verification email !" });
    }
});


router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            res.status(400).json({ status: false, message: "User not found Or not registered!" });
        }
        if (!existingUser.isVerified) {
            res.json({ error: true, isVerified: false, message: "Your account is not active yet please verify your account first or Sign Up with a new user !" });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.status(400).json({ status: false, message: "Incorrect password!" });
        }
        if (!existingUser.isAdmin){
            const token = jwt.sign(
                { email: existingUser.email, id: existingUser._id },
                process.env.JSON_WEB_TOKEN_SECRET_KEY,
                { expiresIn: "1h" }
            );
    
            return res.status(200).json({
                status: true,
                user: {
                    name: existingUser.name,
                    email: existingUser.email,
                    userId: existingUser._id,
                },
                token,
                msg: "User authenticated successfully!"
            });
        }else{
            return res.status(400).json({ status: false, message: "user does not exist!" }); 
        }


    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
});


router.post("/AdminSignIn", async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            res.status(400).json({ status: false, message: "User not found Or not registered!" });
        }
        if (!existingUser.isVerified) {
            res.json({ error: true, isVerified: false, message: "Your account is not active yet please verify your account first or Sign Up with a new user !" });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.status(400).json({ status: false, message: "Incorrect password!" });
        }
        if (existingUser.isAdmin){
            const token = jwt.sign(
                { email: existingUser.email, id: existingUser._id },
                process.env.JSON_WEB_TOKEN_SECRET_KEY,
                { expiresIn: "1h" }
            );
    
            return res.status(200).json({
                status: true,
                user: {
                    name: existingUser.name,
                    email: existingUser.email,
                    userId: existingUser._id,
                },
                token,
                msg: "User authenticated successfully!"
            });
        }else{
            return res.status(400).json({ status: false, message: "user does not exist!" }); 
        }


    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
});




router.get('/', async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        return res.status(500).json({ success: false })
    }
    res.send(userList);
});

router.get(`/get/count` , async (req, res)=>{
    const userCount = await User.countDocuments();

    if(!userCount){
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });
})


router.delete('/:id', async (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, msg: "The user is deleted !" })
        } else {
            return res.status(400).json({ success: false, msg: "User not found !" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
});

router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error, result) => {

    })
    if (response) {
        res.status(200).send(response);
    }
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocument((count) => {
        if (!userCount) {
            res.status(500).json({ success: false })
        }
        res.send({
            userCount: userCount
        });
    })

});


router.put('/:id', async (req, res) => {
    const { name, phone, email, password, images } = req.body;
    const imagesArr = req.body.images || [];

    const userExist = await User.findById(req.params.id);
    if (!userExist) return res.status(404).json({ error: "User not found!" });

    const newPassword = password
        ? bcrypt.hashSync(password, 10)
        : userExist.passwordHash;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            password: newPassword,
            images: imagesArr,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,
        },
        { new: true }
    );

    if (!user) {
        return res.status(400).send('The user cannot be Updated !');
    }

    res.send(user);
});


router.put('/changePassword/:id', async (req, res) => {
    const { name, phone, email, password, newPass, images } = req.body;
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
        return res.status(400).json({ status: false, message: "User not found or not registered!" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
        return res.status(400).json({ error: true, msg: "Current password wrong!" });
    }

    // ✅ Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPass, existingUser.password);
    if (isSamePassword) {
        return res.status(400).json({ error: true, msg: "New password cannot be same as old password!" });
    }

    const newPassword = newPass ? bcrypt.hashSync(newPass, 10) : existingUser.password;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name,
            phone,
            email,
            password: newPassword,
            images
        },
        { new: true }
    );


    if (!user) {
        return res.status(400).send('The user cannot be updated!');
    }

    res.send(user);
});

router.post('/forgetPassword', async (req, res) => {
    const { email } = req.body;

    try {
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({ status: false, message: "User with this email does not exist!" });
        }

        // Save OTP and expiry to user
        existingUser.otp = verifyCode;
        existingUser.otpExpires = Date.now() + 600000; // 10 minutes
        await existingUser.save();

        // Send email
        await sendEmailFun(email, "Verify Email", "", "Your OTP is " + verifyCode);

        res.status(200).json({
            status: "SUCCESS",
            success: true,
            message: "OTP sent successfully!",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ status: "FAILED", message: "Something went wrong" });
    }
});


router.post('/forgetPassword/changePassword', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                status: "FAILED",
                message: "User not found!",
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        existingUser.password = hashPassword;
        await existingUser.save();

        res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Password changed successfully!",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(500).json({ msg: "The user with the given ID was not found." })
    }
    res.status(200).send(user);
});





module.exports = router;