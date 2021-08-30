const express = require('express')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')


const Game = require('../models/game')
const Console = require('../models/console')
const fs = require('fs')

const router = express.Router()
const path = require('path')
const uploadPath = path.join('public', Game.imageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    bucket: process.env.AWS_BUCKET_NAME
  })

  const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        console.log(file)
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const upload = multer({
    storage: multerS3Config,
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