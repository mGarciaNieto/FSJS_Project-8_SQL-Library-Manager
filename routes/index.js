var express = require('express')
var router = express.Router()
const { Book } = require('../models')
const { Op } = require('sequelize')

/* Handler function to wrap each route. */
function asyncHandler(cb) {
	return async (req, res, next) => {
		try {
			await cb(req, res, next)
		} catch (error) {
			// Forward error to the global error handler
			next(error)
		}
	}
}

/* Home route should redirect to the /books route */
router.get('/', (req, res) => res.redirect('/books'))

/* Shows the full list of books */
router.get(
	'/books',
	asyncHandler(async (req, res) => {
		let books = await Book.findAll({ order: [['createdAt', 'DESC']] })

		const limit = 10
		const totalBooks = await Book.count()
		const totalPages = Math.ceil(totalBooks / limit)

		const page = req.query.page ? (books = books.slice(req.query.page * limit - limit, req.query.page * limit)) : (books = books.slice(0, limit))

		limit > totalBooks ? res.render('index', { books, title: 'Library Books' }) : res.render('index', { books, page: 1, limit, totalPages, title: 'Library Books' })
	})
)

/* Show list of books based on terms defined in the search form */
router.post(
	'/books',
	asyncHandler(async (req, res) => {
		const searchTerm = req.body.search
		if (searchTerm === '') {
			// Redirect to the GET /books route
			return res.redirect('/books')
		}
		const whereClause = {
			[Op.or]: [{ title: { [Op.like]: `%${searchTerm}%` } }, { author: { [Op.like]: `%${searchTerm}%` } }, { genre: { [Op.like]: `%${searchTerm}%` } }, { year: { [Op.like]: `%${searchTerm}%` } }]
		}
		const books = await Book.findAll({ where: whereClause, order: [['createdAt', 'DESC']] })
		res.render('index', { books, title: 'Library Books' })
	})
)

/* Shows the create new book form */
router.get('/books/new', (req, res) => {
	res.render('new-book', { book: {}, title: 'Add New Book' })
})

/* Posts a new book to the database */
router.post(
	'/books/new',
	asyncHandler(async (req, res) => {
		let book
		try {
			book = await Book.create(req.body)
			res.redirect('/books')
		} catch (error) {
			if (error.name === 'SequelizeValidationError') {
				book = await Book.build(req.body)
				res.render('new-book', { book, errors: error.errors, title: 'New Book' })
			} else {
				throw error
			}
		}
	})
)

/* Shows book detail form */
router.get(
	'/books/:id',
	asyncHandler(async (req, res, next) => {
		const book = await Book.findByPk(req.params.id)
		if (book) {
			res.render('update-book', { book, title: book.title })
		} else {
			const err = new Error()
			err.status = 404
			err.message = "Looks like the book you requested doesn't exist."
			next(err)
		}
	})
)

/* Updates book info in the database */
router.post(
	'/books/:id',
	asyncHandler(async (req, res) => {
		let book
		try {
			book = await Book.findByPk(req.params.id)
			if (book) {
				await book.update(req.body)
				res.redirect('/books')
			} else {
				res.sendStatus(404)
			}
		} catch (error) {
			if (error.name === 'SequelizeValidationError') {
				book = await Book.build(req.body)
				book.id = req.params.id
				res.render('update-book', {
					book,
					errors: error.errors,
					title: 'Update Book'
				})
			} else {
				throw error
			}
		}
	})
)

/* Deletes a book. Careful, this can’t be undone. */
router.post(
	'/books/:id/delete',
	asyncHandler(async (req, res) => {
		const book = await Book.findByPk(req.params.id)
		if (book) {
			await book.destroy()
			res.redirect('/books')
		} else {
			res.sendStatus(404)
		}
	})
)

router.get('/error-test', (req, res, next) => {
	const err = new Error('This is an intentional error.')
	err.status = 500
	next(err)
})

module.exports = router
