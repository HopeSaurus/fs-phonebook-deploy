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
  const nRecords = phonebook.length
  const time = new Date()
  response.send(`<p>Phonebook has info for ${nRecords} people</p><p>${time}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
  response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  phonebook = phonebook.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons',(request, response) => {
  const id = Math.round(Math.random()*10000)
  const data = request.body
  if(!data.name || !data.number){
    response.append('Content-Type','application/json')
    .status(400)
    .json({
      error: 'missing name or number'
    })
    .end()
    return
  }
  if(phonebook.find(person => person.name === data.name)){
    response.append('Content-Type','application/json')
    .status(400)
    .json({
      error: 'name must be unique'
    })
    .end()
    return
  }
  const record = {id, ...data}
  phonebook = phonebook.concat(record)
  response.status(200).json(record)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})