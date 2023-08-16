var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

// Import Sequelize
const { sequelize } = require('./models')

var app = express()

//Test connection to database and sync the model
sequelize
	.authenticate()
	.then(() => {
		console.log('Connection to the database successful!')
		return sequelize.sync()
	})
	.then(() => {
		console.log('Model successfully sync with database')
	})
	.catch((error) => {
		console.log('Error connecting to the database: ', error)
	})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	//res.status(404).render('page-not-found')
	const err = new Error()
	err.status = 404
	err.message = 'Page not found!'
	next(err)
})

// error handler
app.use(function (error, req, res, next) {
	console.log('Global error handler called')
	console.log(err.status)
	// set locals, only providing error in development

	/* 	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {} */

	// render the error page
	/* 	res.status(err.status || 500)
	res.render('error') */

	if (error.status === 404) {
		res.status(404).render('page-not-found', { error, title: 'Page Not Found!' })
		console.log('404 Error Occured!')
	} else {
		error.message = error.message || 'Uh no! Looks like something went wrong on the server. Return to Homepage.'
		res.status(error.status || 500).render('error', { error, title: 'Server Error!' })
	}
})

module.exports = app
