const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
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

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  return await res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function(req, res) {
    //Write your code here
    const isbn = await req.params.isbn;
    let filtered_isbn = books.filter((book) => book.isbn === isbn);
    res.send(filtered_isbn);
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const author = await req.params.author;
  let filtered_author = books.filter((book) => book.author === author);
  res.send(filtered_author);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = await req.params.title;
  let filtered_title = books.filter((book) => book.title === title);
  res.send(filtered_title);
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  //Write your code here
  const isbn = await req.params.isbn;
    let filtered_isbn = books.filter((book) => book.reviews[isbn]);
    res.send(filtered_isbn);
});

module.exports.general = public_users;
