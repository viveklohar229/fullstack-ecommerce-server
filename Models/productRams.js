const mongoose = require('mongoose');

const productRamsSchema = mongoose.Schema({
    productRams:
    {
        type: String,
        default: null
    }
})


productRamsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productRamsSchema.set('toJSON', {
    virtuals: true,
});

exports.ProductRams = mongoose.model('ProductRams', productRamsSchema);
exports.productRamsSchema = productRamsSchema;