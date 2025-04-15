const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: null,
        // required: true,
        // unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        // required: true,
    },
    images: [
        {
            type: String,
            required: true,
        }
    ],
    isAdmin: {
        type: Boolean,
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,

    },
    otpExpires: {
        type: Date,

    },
    date: {
        type: Date,
        default: Date.now
    },


}, { timestamps: true })


userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;