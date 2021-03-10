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
  user     : 'root',
  password : '',
  database : 'Library_db'
});

// rendering home page from server
app.get("/", function(req, res){
  res.render("home");
});

// rendering search page if requested
app.get("/search", function(req, res){
  res.render("search");
});

// rendering borrow page if requested
app.get("/borrow", function(req, res){
  res.render("borrow");
});

// rendering renew page if requested
app.get("/renew", function(req, res){
  res.render("renew");
});

// rendering return page if requested
app.get("/return", function(req, res){
  res.render("return");
});

// connecting to the server: port 3000
app.listen(3000, function() {
  console.log("Server up and running on port 3000");
});
