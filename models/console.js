const mysql = require('mysql')

const consoleSchema = new mysql.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mysql.model('Console', consoleSchema)