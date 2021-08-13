const express = require('express')
const multer = require('multer')

const Game = require('../models/game')
const Console = require('../models/console')
const fs = require('fs')

const router = express.Router()
const path = require('path')
const uploadPath = path.join('public', Game.imageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//all games
router.get('/', async (req, res) => {
    let query = Game.find()
    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try {
        const games = await query.exec()
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
    } 
    catch{
        if (game.imageName != null) {
        removeImage(game.imageName)
        }
        renderNewPage(res, game, true)
    }
})

function removeImage(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
})
}

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