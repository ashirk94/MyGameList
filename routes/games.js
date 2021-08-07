const express = require('express')
const multer = require('multer')
const game = require('../models/game')
const Game = require('../models/game')
const Console = require('../models/console')
const fs = require('fs')
const router = express.Router()
const path = require('path')
const uploadPath = path.join('public', Game.imageBasePath)
const imageMimeTypes = ['images/jpeg', 'images/png', 'images/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//all games
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.title != null && req.query.title !== '') {
        searchOptions.title = new RegExp(req.query.title, 'i')
    }
    try {
        const games = await Game.find(searchOptions)
        res.render('games/index', { 
            games: games, 
            searchOptions: req.query }) 
    } catch {
        res.redirect('/')
    }
})

//new game
router.get('/new', async (req, res) => {
    renderNewPage(res, new Game())
})

//create game route
router.post('/', upload.single('image'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const game = new Game({
        title: req.body.title,
        console: req.body.console,
        releaseDate: new Date(req.body.releaseDate),
        genre: req.body.genre,
        notes: req.body.notes,
        imageName: fileName
})
try{
    const newGame = await game.save()
    //res.redirect(`games/${newGame.id}`)
    res.redirect(`games`)
} catch{
        renderNewPage(res, game, true)
}
})

async function renderNewPage(res, game, hasError = false) {
    try {
        const consoles = await Console.find({})
        const params = {
            consoles: consoles, 
            game: game
        }
        if (hasError) params.errorMessage = 'Error creating game'
        res.render('games/new', params)
    } catch {
        res.redirect('/games')
    }
}

module.exports = router