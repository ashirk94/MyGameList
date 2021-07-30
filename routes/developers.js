const express = require('express')
const developer = require('../models/developer')
const Developer = require('../models/developer')
const router = express.Router()

//all developers
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const developers = await Developer.find(searchOptions)
        res.render('developers/index', { 
            developers: developers, 
            searchOptions: req.query }) 
    } catch {
        res.redirect('/')
    }
})

//new developer
router.get('/new', (req, res) => {
    res.render('developers/new', { developer: new Developer() })
})

//create developer route
router.post('/', async (req, res) => {
    const developer = new Developer({
        name: req.body.name
})
try{
    const newDeveloper = await developer.save()
    //res.redirect(`developers/${newDeveloper.id}`)
    res.redirect(`developers`)
} catch{
    res.render('developers/new', {
        developer: developer,
        errorMessage: 'Error creating developer'
    })
}
})

module.exports = router