const express = require('express')
const multer = require('multer')
const Game = require('../models/game')
const Console = require('../models/console')
const fs = require('fs')

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const router = express.Router()
const path = require('path')
const uploadPath = path.join('public', Game.imageBasePath)


const upload = multer({ dest: uploadPath })
const { uploadFile } = require('../s3')
const { getFileStream } = require('../s3')

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
//images
router.get('/images/:key', (req, res) => {
    const key = req.params.key
    const readStream = getFileStream(key)

    readStream.pipe(res)
})

//create game route
router.post('/', upload.single('image'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const file = req.file
    //console.log(file)
    
    const game = new Game({
        title: req.body.title,
        console: req.body.console,
        releaseDate: new Date(req.body.releaseDate),
        genre: req.body.genre,
        notes: req.body.notes,
        imageName: fileName
    })
    try{
        await uploadFile(file)
        await unlinkFile(file.path)

        const newGame = await game.save()
        res.redirect(`games/${newGame.id}`)
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
    renderFormPage(res, game, 'new', hasError)
}
async function renderEditPage(res, game, hasError = false) {
    renderFormPage(res, game, 'edit', hasError)
}
async function renderFormPage(res, game, form, hasError = false) {
    try {
        const consoles = await Console.find({})
        const params = {
            consoles: consoles, 
            game: game
        }
        if (hasError) {
            if (form === 'edit') {
            params.errorMessage = 'Error updating game'
            } else {
                params.errorMessage = 'Error creating game'
            }
        }
        res.render(`games/${form}`, params)
    } catch {
        res.redirect('/games')
    }
}
//show game
router.get('/:id', async (req, res) => {
    try{
        const game = await Game.findById(req.params.id)
        .populate('console').exec()
        res.render('games/show', { game: game })
    } catch {
        res.redirect('/')
    }
})
router.delete('/:id', async (req, res) => {
    let game
    try {
        game = await Game.findById(req.params.id)
        await game.remove()
        res.redirect('/games')
     } catch(err) {
         console.log(err)
         if (game != null) {
             res.render('games/show', {
                 game: game,
                 errorMessage: 'Error removing book'
                })
        } else {
            res.redirect('/')
        }
    }
})
         
//edit game
router.get('/:id/edit', async (req, res) => {
    try{
        const game = await Game.findById(req.params.id)
        renderEditPage(res, game)
    } catch {
        res.redirect('/')
    }
})

router.put('/:id', async (req, res) => {
    let game
    try{
        game = await Game.findById(req.params.id)
        game.title = req.body.title
        game.releaseDate = new Date(req.body.releaseDate)
        game.console = req.body.console
        game.genre = req.body.genre
        game.notes = req.body.notes

        await game.save()
        res.redirect(`/games/${game.id}`)
    } 
    catch{
        if (game != null) {
            renderEditPage(res, game, true)
        } else {
            redirect('/')
        }
    }
})
module.exports = router