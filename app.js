//jshint esversion:6

// getting all required packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mysql = require("mysql");

// setting up express server
const app = express();

// setting ejs template
app.set('view engine', 'ejs');

// using body-parser to parse through json
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// setting up mysql connection
const connection = mysql.createConnection({
  host     : 'localhost',
  port: '3306',
  user     : 'root',
  password : 'libpassword',
  database : 'librarydb'
});

// connecting
connection.connect(function(error){
  if(error){
    console.log(error);
  }
  else{
    console.log("Successful connection to DB");
  }
});

// usersname and password for the user
var username = "";
var password = "";
var books = [{}];

// rendering log-in homepage from server
app.get("/", function(req, res){
  res.render("homeEntry");
});

// rendering home page
app.get("/", function(req, res){
  res.render("home");
});

// rendering signup and login pages
app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

// rendering home page from server
app.get("/home", function(req, res){
  res.render("home");
});

// rendering search page if requested
app.get("/search", function(req, res){
  res.render("search",);
});

// rendering borrow page if requested
app.get("/borrow", function(req, res){
  res.render("borrow",);
});

// rendering renew page if requested
app.get("/renew", function(req, res){
  res.render("renew");
});

// rendering return page if requested
app.get("/return", function(req, res){
  res.render("return");
});

// rendering results
app.get("/searchresult", function(req, res){
  res.render("searchresult", {failure: 0, books: books});
});

app.get("/borrowresult", function(req, res){
  res.render("borrowresult", {failure: 1});
});

app.get("/renewresult", function(req, res){
  res.render("renewresult", {failure: 1});
});

app.get("/returnresult", function(req, res){
  res.render("returnresult", {failure: 1});
});

// post requests
// post request to the signup page
app.post("/signup", function(req, res){
  username = req.body.username;
  password = req.body.password;

  connection.query("INSERT INTO users (user_name,password) VALUES (?,?)", [username,password], function (error, results) {
    if(error){
      throw error;
    }
    else{
      console.log("Success");
    }
  });
  console.log(username);
  console.log(password);

  res.redirect("/home");
});

// post request to the login page
app.post("/login", function(req, res){
  username = req.body.username;
  password = req.body.password;

  console.log(username);
  console.log(password);

  res.redirect("/home");
});

// post request to the login page
app.post("/search", function(req, res){
  books = [{}];
  let data = req.body.searchData;

  console.log(data);

  books.push({
    title: data,
    author: data
  });

  res.redirect("/searchresult");
});

// post request to the login page
app.post("/borrow", function(req, res){

  let bookID = req.body.bookID;

  console.log(bookID);

  res.redirect("/borrowresult");
});

// post request to the login page
app.post("/renew", function(req, res){

  let bookID = req.body.bookID;

  console.log(bookID);

  res.redirect("/renewresult");
});

// post request to the login page
app.post("/return", function(req, res){

  let bookID = req.body.bookID;

  console.log(bookID);

  res.redirect("/returnresult");
});

// connecting to the server: port 3000
app.listen(3000, function() {
  console.log("Server up and running on port 3000");
});
