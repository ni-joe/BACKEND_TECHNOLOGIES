const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
const bcrypt = require('bcrypt');  // For password hashing

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB URL
const dbName = 'signupApp';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

MongoClient.connect(mongoUrl)
    .then(client => {
        console.log('Connected to Database');
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // Handle signup
        app.post('/signup', async (req, res) => {
            const { username, email, password, confirm_password } = req.body;

            // Basic validation
            if (!username || !email || !password || !confirm_password) {
                return res.status(400).send('All fields are required');
            }

            if (password !== confirm_password) {
                return res.status(400).send('Passwords do not match');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            const userData = {
                username: username,
                email: email,
                password: hashedPassword,
            };

            usersCollection.insertOne(userData)
                .then(result => {
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Signup Successful</title>
                            <style>
                                body {
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    font-family: Arial, sans-serif;
                                    background-color: #e0f7e9;
                                    margin: 0;
                                }
                                .message {
                                    text-align: center;
                                    background: white;
                                    padding: 20px;
                                    border-radius: 10px;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                    font-size: 18px;
                                    color: #333;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="message">
                                Signup successful! Welcome, ${username}.
                            </div>
                        </body>
                        </html>
                    `);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error saving data');
                });
        });

        // Handle login
        app.post('/login', (req, res) => {
            const { username, password } = req.body;

            usersCollection.findOne({ username: username })
                .then(user => {
                    if (!user) {
                        return res.status(400).send('User not found');
                    }

                    bcrypt.compare(password, user.password)
                        .then(match => {
                            if (match) {
                                res.send(`
                                    <!DOCTYPE html>
                                    <html lang="en">
                                    <head>
                                        <meta charset="UTF-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <title>Login Successful</title>
                                        <style>
                                            body {
                                                display: flex;
                                                justify-content: center;
                                                align-items: center;
                                                height: 100vh;
                                                font-family: Arial, sans-serif;
                                                background-color: #e0f7e9;
                                                margin: 0;
                                            }
                                            .message {
                                                text-align: center;
                                                background: white;
                                                padding: 20px;
                                                border-radius: 10px;
                                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                                font-size: 18px;
                                                color: #333;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="message">
                                            Login successful! Welcome back, ${username}.
                                        </div>
                                    </body>
                                    </html>
                                `);
                            } else {
                                res.status(400).send('Incorrect password');
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(500).send('Error comparing passwords');
                        });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error finding user');
                });
        });

        // Handle forgot password
        app.post('/forgot-password', (req, res) => {
            const { email } = req.body;

            usersCollection.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return res.status(400).send('No account with that email found');
                    }

                    // Here you would normally send an email with a password reset link
                    // For simplicity, we'll just send a success message
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Password Reset</title>
                            <style>
                                body {
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    font-family: Arial, sans-serif;
                                    background-color: #e0f7e9;
                                    margin: 0;
                                }
                                .message {
                                    text-align: center;
                                    background: white;
                                    padding: 20px;
                                    border-radius: 10px;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                    font-size: 18px;
                                    color: #333;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="message">
                                If an account with that email exists, a password reset link has been sent.
                            </div>
                        </body>
                        </html>
                    `);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error checking email');
                });
        });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(error => console.error(error));




// const express = require('express');
// const bodyParser = require('body-parser');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const bcrypt = require('bcrypt');  // For password hashing

// const app = express();
// const port = process.env.PORT || 3000;
// const mongoUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB URL
// const dbName = 'signupApp';

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(client => {
//         console.log('Connected to Database');
//         const db = client.db(dbName);
//         const usersCollection = db.collection('users');

//         app.get('/', (req, res) => {
//             res.sendFile(path.join(__dirname, 'public', 'index.html'));
//         });

//         // Handle signup
//         app.post('/signup', async (req, res) => {
//             const { username, email, password, confirm_password } = req.body;

//             // Basic validation
//             if (!username || !email || !password || !confirm_password) {
//                 return res.status(400).send('All fields are required');
//             }

//             if (password !== confirm_password) {
//                 return res.status(400).send('Passwords do not match');
//             }

//             // Hash the password
//             const hashedPassword = await bcrypt.hash(password, 10);

//             const userData = {
//                 username: username,
//                 email: email,
//                 password: hashedPassword,
//             };

//             usersCollection.insertOne(userData)
//                 .then(result => {
//                     res.send(`
//                         <!DOCTYPE html>
//                         <html lang="en">
//                         <head>
//                             <meta charset="UTF-8">
//                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                             <title>Signup Successful</title>
//                             <style>
//                                 body {
//                                     display: flex;
//                                     justify-content: center;
//                                     align-items: center;
//                                     height: 100vh;
//                                     font-family: Arial, sans-serif;
//                                     background-color: #e0f7e9;
//                                     margin: 0;
//                                 }
//                                 .message {
//                                     text-align: center;
//                                     background: white;
//                                     padding: 20px;
//                                     border-radius: 10px;
//                                     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                                     font-size: 18px;
//                                     color: #333;
//                                 }
//                             </style>
//                         </head>
//                         <body>
//                             <div class="message">
//                                 Signup successful! Welcome, ${username}.
//                             </div>
//                         </body>
//                         </html>
//                     `);
//                 })
//                 .catch(error => {
//                     console.error(error);
//                     res.status(500).send('Error saving data');
//                 });
//         });

//         // Handle login
//         app.post('/login', (req, res) => {
//             const { username, password } = req.body;

//             usersCollection.findOne({ username: username })
//                 .then(user => {
//                     if (!user) {
//                         return res.status(400).send('User not found');
//                     }

//                     bcrypt.compare(password, user.password)
//                         .then(match => {
//                             if (match) {
//                                 res.send(`
//                                     <!DOCTYPE html>
//                                     <html lang="en">
//                                     <head>
//                                         <meta charset="UTF-8">
//                                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                                         <title>Login Successful</title>
//                                         <style>
//                                             body {
//                                                 display: flex;
//                                                 justify-content: center;
//                                                 align-items: center;
//                                                 height: 100vh;
//                                                 font-family: Arial, sans-serif;
//                                                 background-color: #e0f7e9;
//                                                 margin: 0;
//                                             }
//                                             .message {
//                                                 text-align: center;
//                                                 background: white;
//                                                 padding: 20px;
//                                                 border-radius: 10px;
//                                                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                                                 font-size: 18px;
//                                                 color: #333;
//                                             }
//                                         </style>
//                                     </head>
//                                     <body>
//                                         <div class="message">
//                                             Login successful! Welcome back, ${username}.
//                                         </div>
//                                     </body>
//                                     </html>
//                                 `);
//                             } else {
//                                 res.status(400).send('Incorrect password');
//                             }
//                         })
//                         .catch(error => {
//                             console.error(error);
//                             res.status(500).send('Error comparing passwords');
//                         });
//                 })
//                 .catch(error => {
//                     console.error(error);
//                     res.status(500).send('Error finding user');
//                 });
//         });

//         // Handle forgot password
//         app.post('/forgot-password', (req, res) => {
//             const { email } = req.body;

//             usersCollection.findOne({ email: email })
//                 .then(user => {
//                     if (!user) {
//                         return res.status(400).send('No account with that email found');
//                     }

//                     // Here you would normally send an email with a password reset link
//                     // For simplicity, we'll just send a success message
//                     res.send(`
//                         <!DOCTYPE html>
//                         <html lang="en">
//                         <head>
//                             <meta charset="UTF-8">
//                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                             <title>Password Reset</title>
//                             <style>
//                                 body {
//                                     display: flex;
//                                     justify-content: center;
//                                     align-items: center;
//                                     height: 100vh;
//                                     font-family: Arial, sans-serif;
//                                     background-color: #e0f7e9;
//                                     margin: 0;
//                                 }
//                                 .message {
//                                     text-align: center;
//                                     background: white;
//                                     padding: 20px;
//                                     border-radius: 10px;
//                                     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                                     font-size: 18px;
//                                     color: #333;
//                                 }
//                             </style>
//                         </head>
//                         <body>
//                             <div class="message">
//                                 If an account with that email exists, a password reset link has been sent.
//                             </div>
//                         </body>
//                         </html>
//                     `);
//                 })
//                 .catch(error => {
//                     console.error(error);
//                     res.status(500).send('Error checking email');
//                 });
//         });

//         app.listen(port, () => {
//             console.log(`Server running at http://localhost:${port}`);
//         });
//     })
//     .catch(error => console.error(error));
