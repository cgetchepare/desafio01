const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  };

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json({ todo });
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const dl = new Date(deadline + " 00:00");

  const idExists = user.todos.find(todo => todo.id === id);

  if (idExists) {

    const index = user.todos.indexOf(idExists);

    user.todos[index].deadline = dl;
    user.todos[index].title = title;

    return response.status(201).send();

  } else {
    return response.status(400).json({ error: "Task not found!" });
  };

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  

  if (idExists) {

    const index = user.todos.indexOf(idExists);

    user.todos[index].done = true;

    return response.status(201).send();
  } else {
    return response.status(400).json({ error: "Task not found!" });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const idExists = user.todos.find(todo => todo.id === id);

  if (idExists) {
    const index = user.todos.indexOf(idExists);
  
    user.todos.splice(index, 1);

    return response.json({ message: "Register deleted!" });
  } else {
    return response.status(400).json({ error: "Register not found!"})
  }

});

module.exports = app;