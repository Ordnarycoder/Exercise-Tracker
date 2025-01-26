const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.json({ error: "Username is required" });

  const newUser = {
      username,
      _id: uuidv4(),
  };

  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((user) => user._id === _id);
  if (!user) {
      return res.json({ error: 'User not found' });
  }

  const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      _id,
  };

  exercises.push(exercise);

  res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: user._id,
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((user) => user._id === _id);
  if (!user) {
      return res.json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((ex) => ex._id === _id);

  // Filtering by date
  if (from) {
      userExercises = userExercises.filter((ex) => new Date(ex.date) >= new Date(from));
  }
  if (to) {
      userExercises = userExercises.filter((ex) => new Date(ex.date) <= new Date(to));
  }

  // Limiting results
  if (limit) {
      userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
      username: user.username,
      count: userExercises.length,
      _id: user._id,
      log: userExercises.map(({ description, duration, date }) => ({
          description,
          duration,
          date,
      })),
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
