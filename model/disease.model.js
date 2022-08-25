const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const diseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    causes: {
        type: String,
        required: true
    },
    homeRemedies: {
        type: String,
        required: true,
    },
    yogaLink: {
        type: String,
        required: true,
    },

      precaution :{
        type : String, 
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    keyword: {
        type: String,
        required: true

    },
    medicines: [{
        mId: {
            type: Schema.Types.ObjectId,
            ref: "medicines"
        }
    }],
    category: {
        type: Schema.Types.ObjectId,
        ref: "categories"
    },
    reviewerDetail: [{
        uId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        reviewText: {
            type: String
        },
    }]
});

module.exports = mongoose.model("diseases", diseaseSchema);