const express = require('express')
const console = require('../models/game')
const Console = require('../models/game')
const router = express.Router()

//all games
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
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
    try {
        const consoles = await Console.find({})
        const game = new Game()
        res.render('games/new', {
            consoles: consoles, 
            game: game
        })
    } catch {
        res.redirect('/games')
    }
})

//create game route
router.post('/', async (req, res) => {
    const game = new Game({
        name: req.body.name
})
try{
    const newGame = await game.save()
    //res.redirect(`games/${newGame.id}`)
    res.redirect(`games`)
} catch{
    res.render('games/new', {
        game: game,
        errorMessage: 'Error creating game'
    })
}
})

module.exports = router