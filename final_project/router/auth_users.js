const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')

let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
 // Filter the users array for any user with the same username
 let userswithsamename = users.filter((user) => {
  return user.username === username;
});
// Return true if any user with the same username is found, otherwise false
if (userswithsamename.length > 0) {
  return true;
} else {
  return false;
}
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

regd_users.use(session({secret:"fingerpint"},resave=true,saveUninitialized=true));

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 20 });

    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
} else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
}
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });

        if (req.body.username) {
            const book = books.filter((item) => item.isbn === req.params.isbn)[0];
            if (!book.reviews) {
                book.reviews = [];
            }
            book.reviews.push({
                username: req.body.username,
                isbn: req.body.isbn,
            });
            console.log(books);
        }
    res.send("The Book with the" + (' ') + (req.params.isbn) + " Has been added a review!");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (req.session.authorization) {
          let token = req.session.authorization['accessToken'];
          jwt.verify(token, "access", (err, user) => {
              if (!err) {
                  req.user = user;
              } else {
                  return res.status(403).json({ message: "User not authenticated" });
              }
          });
  
          const book = books.filter((item) => item.isbn === req.params.isbn)[0];

            if (book && book.reviews) {
            const reviewIndex = book.reviews.findIndex((review) => review.username === req.body.username);

            if (reviewIndex !== -1) {
                book.reviews.splice(reviewIndex, 1);
                console.log(books);
                res.send(`The review from ${req.body.username} for ISBN ${req.params.isbn} has been deleted!`
                );
            } else {
                res.status(404).json({ message: "Review not found" });
            }
            } else {
            res.status(404).json({ message: "Book not found" });
            }
        } else {
            return res.status(403).json({ message: "User not authenticated" });
        }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
