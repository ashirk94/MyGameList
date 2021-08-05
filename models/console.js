const mongoose = require('mongoose')

const consoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Console', consoleSchema)