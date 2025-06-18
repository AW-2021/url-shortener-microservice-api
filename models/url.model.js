const mongoose = require('mongoose');

const UrlSchema = mongoose.Schema(
    {
        original_url: {
            type: String,
            required: true
        },

        short_url: {
            type: Number,
            required: true
        },
    }
);

const Url = mongoose.model("Url", UrlSchema);

module.exports = Url;