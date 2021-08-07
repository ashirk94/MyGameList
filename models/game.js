const mongoose = require('mongoose')

const imageBasePath = 'uploads/gameImages'

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required:true
    },
    notes: {
        type: String
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    imageName: {
        type: String,
        required: true
    },
    console: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Console'
    }
})

module.exports = mongoose.model('Game', gameSchema)
module.exports.imageBasePath = imageBasePath