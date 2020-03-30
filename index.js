const express = require('express');
const morgan = require('morgan');
const app = express();

const port = 3001;
app.listen(port);
console.log(`Server running on port ${port}`);

morgan.token('data',(req, res) => {
    return req.method === 'POST'
        ? JSON.stringify(req.body)
        : null;
});

app.use(express.json());
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.data(req, res)
    ].join(' ')
}));


let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
})

app.get('/info', (req, res) => {
    const date = new Date();
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`);
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(person => person.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id !== id);

    res.status(204).end();
});

const generateId = () => {
    let id = Math.floor(Math.random() * 1001);
    const usedIds = persons.map(person => person.id);
    
    while (usedIds.find(usedId => usedId === id)) {
        id = Math.floor(Math.random() * 1001);
    }
    return id;
}

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        return res.status(404).json({
            error: 'missing name or number'
        });
    }
    else if (persons.find(person => person.name.toLowerCase() === req.body.name.toLowerCase())) {
        return res.status(404).json({
            error: 'name must be unique'
        });
    }
    const person = {
        name: req.body.name,
        number: req.body.number,
        id: generateId()
    }

    persons = persons.concat(person);
    res.json(person);
});


