const mongoose = require('mongoose');

const homeBannerSliderSchema = mongoose.Schema({
    images:[
    {
        type: String,
        required: true
    }
]
})

homeBannerSliderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

homeBannerSliderSchema.set('toJSON', {
    virtuals: true,
});

exports.HomeBannerSlider = mongoose.model('HomeBannerSlider', homeBannerSliderSchema);
exports.homeBannerSliderSchema = homeBannerSliderSchema;


