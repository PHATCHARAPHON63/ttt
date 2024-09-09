const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const {swaggerUi,swaggerSpec} = require('./config/swaggerConfig');
const UpdateScheduler = require('./schedulers/renewScheduler');
require("dotenv").config();
// const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
var path = require('path')
const {readdirSync} = require('fs');


var path = require('path')
const connectDB = require('./config/db');

// const initializeSchedulers = () => {
//   console.log('เริ่มต้น schedulers');
//   const scheduler = new UpdateScheduler();
//   scheduler.initScheduledJobs();
// };

connectDB().then(() => {
  console.log('Connected to MongoDB');
  // initializeSchedulers();
}).catch(err => console.error('Could not connect to MongoDB:', err));

app.use(bodyParser.json());
app.use(bodyParser.json({limit:'1000MB'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
app.use('/public', express.static(__dirname + '/public'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


readdirSync('./routes')
.map((r)=> app.use('/', require('./routes/' + r)))




const port = process.env.PORT;
  app.listen(port, () => {
    console.log("running on port 3301");
  });


  
module.exports = app;