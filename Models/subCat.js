const mongoose = require('mongoose');

const subCatSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        // type: String,
        ref:'Category',
        required: true
    },
    subCat: {
        type: String,
        required: true
    }
})

subCatSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

subCatSchema.set('toJSON', {
    virtuals: true,
});

exports.subCategory = mongoose.model('subCategory', subCatSchema);
exports.subCatSchema = subCatSchema;