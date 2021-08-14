const mongoose = require('mongoose')
const Game = require('./game')
const consoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

consoleSchema.pre('remove', function(next) {
    Game.find({ console: this.id }, (err, games) => {
        if(err) {
            next(err)
        } else if (games.length > 0) {
            next(new Error('This Console is connected to games'))
        } else {
            next()
        }
})
})
module.exports = mongoose.model('Console', consoleSchema)