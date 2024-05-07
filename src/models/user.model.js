const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";

var userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        require: true,
        unique: true,
    },
    age: {
        type: Number,
        trim: true,
        require: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, userSchema);

