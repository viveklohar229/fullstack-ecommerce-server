// const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");

const recentlyViewedSchema = mongoose.Schema({
    prodId: {
        type: String,
        default:''
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },

    images: [
        {
            type: String,
            required: true
        }
    ],

    brand: {
        type: String,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    catName:{
        type:String,
        default:''
    },
    subCatId:{
        type:String,
        default:''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCat: {
        type: String,
        ref: 'subCategory',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,

    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    discount:{
        type: Number,
        required: true
    },
    productRams:[{
        type: String,
        // ref: 'ProductRams',
        default: null
    }],
    productSize:[{
        type: String,
        // ref: 'ProductSize',
        default: null
    }],
    productWeight:[{
        type: String,
        // ref: 'ProductWeight',
        default: null
    }],
    dataCreated: {
        type: Date,
        default: Date.now,
    },

})

recentlyViewedSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

recentlyViewedSchema.set('toJSON', {
    virtuals: true,
});

exports.RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);
exports.recentlyViewedSchema = recentlyViewedSchema;