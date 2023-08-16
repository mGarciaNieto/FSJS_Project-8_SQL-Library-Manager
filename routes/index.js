var express = require('express')
var router = express.Router()
const { Book } = require('../models')

/* GET home page. */
router.get('/', async function (req, res, next) {
	// res.render('index', { title: 'Express' })
	//res.send('respond with a resource');
	try {
    const books = await Book.findAll();
    console.log(books);
    res.json(books);
  } catch (error) {
    next(error);
  }
})

module.exports = router
