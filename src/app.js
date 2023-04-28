const express = require('express');
const auth = require('./routes/auth');
const uploadRouter = require('./routes/upload');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, './config.env');
dotenv.config({ path: envPath });


const app = express();


app.use(express.json());

app.use('/auth', auth.router);
app.use('/upload', auth.verifyAuth,uploadRouter);


module.exports = app;