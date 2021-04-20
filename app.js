const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 
const passport = require('passport')
const PORT = process.env.PORT || 5000; 

const app = express()

// Middlewares
// bodyParse middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// cors middleware
app.use(cors());

// Set passport middleware
app.use(passport.initialize());
// Passport Strategy
require('./config/passport')(passport)


// set static directory
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', function (req, res) {
  res.send('Hello World')
})

// Bring in the database config
const db = require('./config/kyes').mongoURL
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Database connected`);
}).catch(err => {
    console.log(`Database error ${err}`);
})

// Users route 
const users = require('./routes/api/users');
app.use('/api/users', users)


// Server Port 
app.listen(PORT, () => {
    console.log(`Server started ${PORT}`);
})