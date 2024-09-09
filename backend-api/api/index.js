const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const {swaggerUi,swaggerSpec} = require('./config/swaggerConfig');
const UpdateScheduler = require('./schedulers/renewScheduler');
require("dotenv").config();
const fs = require("fs")
var path = require('path')
const {readdirSync} = require('fs');

var path = require('path')
const connectDB = require('./config/db');

connectDB().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error('Could not connect to MongoDB:', err));

app.use(bodyParser.json());
app.use(bodyParser.json({limit:'1000MB'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
app.use('/public', express.static(__dirname + '/public'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// เพิ่ม route สำหรับ path หลัก
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Backend API is running on Vercel"
  });
});

readdirSync('./routes')
.map((r)=> app.use('/api', require('./routes/' + r)))

const port = process.env.PORT || 3301;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;