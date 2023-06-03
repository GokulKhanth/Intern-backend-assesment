// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 5000;
const IP_ADDRESS = '192.168.1.10';
var mail='null';
var userId='null';
var userName='null';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12623217',
  password: 'vRCJCZl6tz',
  database: 'sql12623217',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Signup route
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (error) throw error;

      if (results.length > 0) {
        res.status(409).json({ message: 'Email already exists' });
      } else {
        
        connection.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, password],
          (error) => {
            if (error) throw error;
            res.status(200).json({ message: 'Signup successful' });
          }
        );
      }
    }
  );
});


app.post('/api/login', (req, res) => {
  const { email, password } = req.body;


  connection.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (error, results) => {
         if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    if (results.length) {
      const user = results[0];
      mail=user.email;
     userId=user.id;
     userName=user.name;
      console.log(mail);
      res.status(200).json({ message: 'Login successful' });
    }
else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  );
});



app.get('/api/profile', (req, res) => {

  connection.query('SELECT * FROM user_details WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error retrieving user profile: ' + err.stack);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'User profile not found' });
      return;
    }

    const userProfile = results[0];
    res.json(userProfile);
  });
});



app.post('/api/profile', (req, res) => {
  const updatedUser = req.body;
  

  connection.query(
    'SELECT * FROM user_details WHERE user_id = ?',
    [userId],
    (error, results) => {
      if (error) throw error;

      if (results.length > 0) {
       
        connection.query(
          'UPDATE user_details SET age = ?, gender = ?, dob = ?, mobile = ? WHERE user_id = ?',
          [updatedUser.age, updatedUser.gender, updatedUser.dob, updatedUser.mobile, userId],
          (err, results) => {
            if (err) {
              console.error('Error updating user profile: ' + err.stack);
              res.status(500).json({ message: 'Internal Server Error' });
              return;
            }

            res.json({ message: 'User profile updated successfully' });
          }
        );
      } else {
       
        connection.query(
          'INSERT INTO user_details (age, gender, dob, mobile, user_id) VALUES (?, ?, ?, ?, ?)',
          [updatedUser.age, updatedUser.gender, updatedUser.dob, updatedUser.mobile, userId],
          (err, results) => {
            if (err) {
              console.error('Error inserting user details: ' + err.stack);
              res.status(500).json({ message: 'Internal Server Error' });
              return;
            }

            res.json({ message: 'User details inserted successfully' });
          }
        );
      }
    }
  );
});



app.listen(port, IP_ADDRESS, () => {
  console.log(`Server is running on ${IP_ADDRESS}:${port}`);
});
