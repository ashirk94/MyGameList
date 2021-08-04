//npm run devStart
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')


const indexRouter = require('./routes/index')
const consoleRouter = require('./routes/consoles')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: false}))


const mysql = require('mysql')
const con = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
  });
con.connect((err) => {
    if (err){
    console.log('Error connecting to db')
    return;
    }
    console.log('Connected to MySql')
})

app.use('/', indexRouter)
app.use('/consoles', consoleRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Welcome")
})
