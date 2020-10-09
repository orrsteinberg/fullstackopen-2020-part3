// Imports
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

// Instantiate the app
const app = express()

// Set up port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Custom log via morgan
morgan.token('data', (req) => {
  return req.method === 'POST'
    ? JSON.stringify(req.body)
    : null
})

// Set up middleware
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.data(req, res)
  ].join(' ')
}))

app.get('/info', (req, res) => {
  const date = new Date()

  Person.find({}).then(persons => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person.toJSON()))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {

  // Check for proper usage
  if (!req.body.name || !req.body.number) {
    return res.status(404).json({
      error: 'missing name or number'
    })
  }

  // Create new person and save to DB
  const person = new Person({
    name: req.body.name,
    number: req.body.number
  })

  person.save()
    .then(savedPerson => { res.json(savedPerson.toJSON()) })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => res.json(updatedPerson.toJSON()))
    .catch(error => next(error))
})


// Handler for requests with unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Handler for request errors
const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'Improper id format' })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)



