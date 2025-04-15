// const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
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
    catName: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
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
    discount: {
        type: Number,
        required: true
    },
    productRams: [{
        type: String,
        // ref: 'ProductRams',
        default: null
    }],
    productSize: [{
        type: String,
        // ref: 'ProductSize',
        default: null
    }],
    productWeight: [{
        type: String,
        // ref: 'ProductWeight',
        default: null
    }],
    location: [
        {
          value: {
            type: String,
            required: true,
            trim: true,
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
          flag: {
            type: String,
            trim: true,
          },
        }
      ],
      
    dataCreated: {
        type: Date,
        default: Date.now,
    },

})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
exports.productSchema = productSchema;