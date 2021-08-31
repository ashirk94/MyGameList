//app starts here
//if(process.env.NODE_ENV !== 'production') {
require('dotenv').config()

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const consoleRouter = require('./routes/consoles')
const gameRouter = require('./routes/games')
const donateRouter = require('./routes/donate')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: false}))
app.use(methodOverride('_method'))
app.use(express.json())

const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => {})

app.use('/', indexRouter)
app.use('/consoles', consoleRouter)
app.use('/games', gameRouter)
app.use('/donate', donateRouter)



const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("App Running")
})