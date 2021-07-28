const express = require('express')
const author = require('../models/author')
const Author = require('../models/author')
const router = express.Router()

//all authors
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors: authors, 
            searchOptions: req.query }) 
    } catch {
        res.redirect('/')
    }
})

//new author
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

//create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
})
try{
    const newAuthor = await author.save()
    //res.redirect(`authors/${newAuthor.id}`)
    res.redirect(`authors`)
} catch{
    res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating author'
    })
}
})

module.exports = router