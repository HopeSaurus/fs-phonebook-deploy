require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')

app.use(express.json())
morgan.token('payload', function (req, res) { return JSON.stringify(req.body)})

app.use(express.static('dist'))

app.use(morgan(':method :url :status :response-time ms :payload'))

const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(personArray => {
    const nRecords = personArray.length
    const time = new Date()
    response.send(`<p>Phonebook has info for ${nRecords} people</p><p>${time}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if(person){
      response.json(person)
    }
    else{
      response.status(404).end()
    }
  })
  .catch(e => next(e))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
  .then(() => {
    response.status(204).end()
  })
  .catch(e => {
    next(e)
  })
})

app.post('/api/persons',(request, response, next) => {
  const data = request.body
  if(!data.name || !data.number){
    response.append('Content-Type','application/json')
    .status(400)
    .json({
      error: 'missing name or number'
    })
    return
  }
  const person = new Person({
      name: data.name,
      number: data.number
    })
  response.status(200)
  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(e => next(e))
})


app.put('/api/persons/:id',(request, response, next) => {
  const id = request.params.id
  const data = request.body
  if(!data.name || !data.number){
    response.append('Content-Type','application/json')
    .status(400)
    .json({
      error: 'missing name or number'
    })
    return
  }

  Person.findById(id).then(record => {
    if(!record){
      response.status(404).json({error: "resource not found"})
    }
    else{
      record.number = data.number
      record.save().then((savedPerson)=>{
        response.status(200).json(savedPerson)
      }).catch(e => next(e))
    }
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  }
  if (error.name === 'ValidationError'){
    return response.status(400).send({error: error.message})
  }

  next(error)
}

app.use(errorHandler)
