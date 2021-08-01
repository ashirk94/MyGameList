const express = require('express')
const console = require('../models/console')
const Console = require('../models/console')
const router = express.Router()

//all consoles
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const consoles = await Console.find(searchOptions)
        res.render('consoles/index', { 
            consoles: consoles, 
            searchOptions: req.query }) 
    } catch {
        res.redirect('/')
    }
})

//new console
router.get('/new', (req, res) => {
    res.render('consoles/new', { console: new Console() })
})

//create console route
router.post('/', async (req, res) => {
    const developer = new Console({
        name: req.body.name
})
try{
    const newConsole = await console.save()
    //res.redirect(`consoles/${newConsole.id}`)
    res.redirect(`consoles`)
} catch{
    res.render('consoles/new', {
        console: console,
        errorMessage: 'Error creating console'
    })
}
})

module.exports = router