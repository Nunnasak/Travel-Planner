const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // optional, only if you make a test page

const books = [
  { id: 1, title: 'Learn backend' }
];
let nextId = 2;

app.get('/', (req, res) => {
  res.send('Hello backend!');
});

// Read the list
app.get('/books', (req, res) => {
  res.json(books);
});

// Create a book
app.post('/books', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title required' });
  }
  const book = { id: nextId++, title: title.trim() };
  books.push(book);
  res.status(201).json(book);
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});