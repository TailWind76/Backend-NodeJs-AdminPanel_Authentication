// app.js
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'admin_panel';
const collectionName = 'items';
const usersCollectionName = 'users';
const secretKey = 'mysecretkey';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
  if (err) throw err;
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const usersCollection = db.collection(usersCollectionName);

  // User authentication middleware
  const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Unauthorized' });
      req.user = decoded;
      next();
    });
  };

  // User registration
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    usersCollection.insertOne({ username, password: hashedPassword }, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Registration successful' });
    });
  });

  // User login
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    usersCollection.findOne({ username }, async (err, user) => {
      if (err) throw err;
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ username }, secretKey);
      res.json({ token });
    });
  });

  // Protected route: Create a new item
  app.post('/items', authenticateUser, (req, res) => {
    
  });

 
});
