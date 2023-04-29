const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:  "eu-central-1"
  });
  

function verifyAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  const { firstName, lastName, birthdate, username, email, password } = req.body;

  // Check if the user already exists in the database
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a unique ID for the user
  const id = uuid.v4();

  // Create the user object to be stored in DynamoDB
  const user = {
    id, // Add the ID property
    firstName,
    lastName,
    birthdate,
    username,
    email,
    password: hashedPassword
  };

  console.log(user)
  // Save the user to the database
  const result = await saveUser(user);

  // Generate an access token for the user
  const accessToken = jwt.sign({ username: result.username }, process.env.JWT_SECRET);

  // Send the access token to the client
  res.json({ accessToken });
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Get the user from the database
  const user = await getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Check if the password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate an access token for the user
  const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET);

  // Send the access token to the client
  res.json({ accessToken });
});

// Helper functions
async function getUserByUsername(username) {
    const params = {
      TableName: process.env.USERS_TABLE_NAME,
      Key: {
        "username": username
      }
    };
  
    const result = await dynamodb.get(params).promise();
    return result.Item;
  }

async function saveUser(user) {
  const params = {
    TableName: process.env.USERS_TABLE_NAME,
    Item: user
  };

  await dynamodb.put(params).promise();
  return user;
}
module.exports = {verifyAuth,router};