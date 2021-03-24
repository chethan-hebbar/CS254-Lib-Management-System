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
var searchBooks = [{}];
var user_info = [{}];

// rendering log-in homepage from server
app.get("/", function(req, res){
  res.render("homeEntry");
});

// rendering signup and login pages
app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

// rendering home-result page from server
app.get("/homeresult", function(req, res){
  let failure = req.query.valid;
  failure = parseInt(failure);

  res.render("homeresult", {failure: failure});
});

// rendering home page
app.get("/home", function(req, res){

  let infoQuery = "select * from users where user_name = ?;";
  connection.query(infoQuery, [username], function(error, results){
    if(error){
      throw error;
    }
    else{
        user_info = results;
        res.render("home", {user_info: user_info});
    }
  });
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

// rendering results
app.get("/searchresult", function(req, res){
  let failure = req.query.valid;
  failure = parseInt(failure);

  res.render("searchresult", {failure: failure, books: searchBooks});
});

app.get("/borrowresult", function(req, res){
  let failure = req.query.valid;
  failure = parseInt(failure);

  res.render("borrowresult", {failure: failure});
});

app.get("/renewresult", function(req, res){
  let failure = req.query.valid;
  failure = parseInt(failure);

  res.render("renewresult", {failure: failure});
});

app.get("/returnresult", function(req, res){
  let failure = req.query.valid;
  failure = parseInt(failure);

  res.render("returnresult", {failure: failure});
});

// post requests
// post request to the signup page
app.post("/signup", function(req, res){
  username = req.body.username;
  password = req.body.password;

  let checkQuery = "select user_name from users where user_name = ?";

  connection.query(checkQuery, [username], function (error, results) {
    if(error){
      throw error;
    }

    else{
      if(results.length === 0){

        let query = "insert into users values (?,?,null,null);";

        connection.query(query, [username,password], function (error, results){
          if(error){
            throw error;
          }
        });

        let failure = encodeURIComponent("0");
        res.redirect("/homeresult?valid=" + failure);
      }

      else{
        let failure = encodeURIComponent("1");
        res.redirect("/homeresult?valid=" + failure);
      }
    }
  });
});


// post request to the login page
app.post("/login", function(req, res){
  username = req.body.username;
  password = req.body.password;

  let query = "select user_name from users where user_name = ? and password = ?;";

  connection.query(query, [username, password], function (error, results) {
    if(error){
      throw error;
    }

    else{
      if(results.length === 1){
        let failure = encodeURIComponent("0");
        res.redirect("/homeresult?valid=" + failure);
      }

      else{
        let failure = encodeURIComponent("1");
        res.redirect("/homeresult?valid=" + failure);
      }
    }
  });
});


// post request to the search page
app.post("/search", function(req, res){

  let data = req.body.searchData;

  let query = "select books.b_id,books.title,authors.author_name,books.edition,publishers.publisher,books.published_date,if(books.count_of_books > 0,\"Yes\",\"No\") as availability from books natural join authors natural join publishers where title like ? or author_name like ?;";

  connection.query(query, [data,data], function (error, results){
    if(error){
      throw error;
    }

    else{
      if(results.length === 0){
        let failure = encodeURIComponent("1");
        res.redirect("/searchresult?valid=" + failure);
      }

      else{
        searchBooks = results;
        let failure = encodeURIComponent("0");
        res.redirect("/searchresult?valid=" + failure);
      }
    }
  });
});


// post request to the borrow page
app.post("/borrow", function(req, res){

  let bookID = req.body.bookID;

  let query1 = "select b_id, if(count_of_books > 0, 1, 0) as count from books where b_id = ?;";

  connection.query(query1, [bookID], function(error, results){
    if(error){
      throw error;
    }

    else{
      console.log(results);
      if(results.length === 1 && results[0].count === 1){
        console.log("success: outer");
        let query2 = "select user_name, if(book1 is not null, 1, 0) as b1, if(book2 is not null, 1, 0) as b2 from users where user_name = ?;";

        connection.query(query2, [username], function(error, results){
          if(error){
            throw error;
          }

          else{
            console.log(results);
            if(results.length === 1 && results[0].b1 === 1 && results[0].b2 === 0){
              console.log("success: inner");
              let query3 = "update users set book2 = ? where user_name = ?;";
              let query4 = "insert into borrowed_books (b_id,user_name,borrowed_date) values (?,?,current_date());";
              let query5 = "update books set count_of_books = count_of_books - 1 where b_id = ?;";

              connection.query(query3, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query4, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query5, [bookID], function(error, results){
                if(error){
                  throw error;
                }
              });

              let failure = encodeURIComponent("0");
              res.redirect("/borrowresult?valid=" + failure);
            }

            else if(results.length === 1 && results[0].b1 === 0 && results[0].b2 === 1){
              let query3 = "update users set book1 = ? where user_name = ?;";
              let query4 = "insert into borrowed_books (b_id,user_name,borrowed_date) values (?,?,current_date());";
              let query5 = "update books set count_of_books = count_of_books - 1 where b_id = ?;";

              connection.query(query3, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query4, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query5, [bookID], function(error, results){
                if(error){
                  throw error;
                }
              });

              let failure = encodeURIComponent("0");
              res.redirect("/borrowresult?valid=" + failure);
            }

            else if(results.length === 1 && results[0].b1 === 0 && results[0].b2 === 0){
              let query3 = "update users set book1 = ? where user_name = ?;";
              let query4 = "insert into borrowed_books (b_id,user_name,borrowed_date) values (?,?,current_date());";
              let query5 = "update books set count_of_books = count_of_books - 1 where b_id = ?;";

              connection.query(query3, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query4, [bookID,username], function(error, results){
                if(error){
                  throw error;
                }
              });

              connection.query(query5, [bookID], function(error, results){
                if(error){
                  throw error;
                }
              });

              let failure = encodeURIComponent("0");
              res.redirect("/borrowresult?valid=" + failure);
            }

          else{
            console.log("failure: inner");
            let failure = encodeURIComponent("1");
            res.redirect("/borrowresult?valid=" + failure);
          }
        }
        });
      }

      else{
        console.log("failure: outer");
        let failure = encodeURIComponent("1");
        res.redirect("/borrowresult?valid=" + failure);
      }
    }
  });
});


// post request to the renew page
app.post("/renew", function(req, res){

  let bookID = req.body.bookID;
  let check_query = "select b_id from borrowed_books where b_id = ? and user_name = ?;"

  connection.query(check_query, [bookID, username], function (error, results){
    if(error){
      throw error;
    }

    else{

      if(results.length === 1){
        let query = "update borrowed_books set borrowed_date = current_date() where b_id = ? and user_name = ?;";

        connection.query(query, [bookID, username], function (error, secondResults){
          if(error){
            throw error;
          }
        });

        let failure = encodeURIComponent("0");
        res.redirect("/renewresult?valid=" + failure);
      }

      else{
        let failure = encodeURIComponent("1");
        res.redirect("/renewresult?valid=" + failure);
      }
    }
  });
});


// post request to the login page
app.post("/return", function(req, res){

  let bookID = req.body.bookID;

  let check_query = "select user_name, if(book1 = ?, 1, 0) as cond from users where (user_name = ?) and (book1 = ? or book2 = ?);";
  connection.query(check_query, [bookID,username,bookID,bookID], function(error, results){
    if(error){
      throw error;
    }

    else{
      if(results.length === 1 && results[0].cond === 1){
        let query1 = "update users set book1 = null where user_name = ? and book1 = ?;";
        let query2 = "delete from borrowed_books where user_name = ? and b_id = ?;";
        let query3 = "update books set count_of_books = count_of_books + 1 where b_id = ?;";

        connection.query(query1, [username,bookID], function(error, results){
          if(error){
            throw error;
          }
        });

        connection.query(query2, [username,bookID], function(error, results){
          if(error){
            throw error;
          }
        });

        connection.query(query3, [bookID], function(error, results){
          if(error){
            throw error;
          }
        });

        let failure = encodeURIComponent("0");
        res.redirect("/returnresult?valid=" + failure);
    }

    else if(results.length === 1 && results[0].cond === 0){
      let query1 = "update users set book2 = null where user_name = ? and book2 = ?;";
      let query2 = "delete from borrowed_books where user_name = ? and b_id = ?;";
      let query3 = "update books set count_of_books = count_of_books + 1 where b_id = ?;";

      connection.query(query1, [username,bookID], function(error, results){
        if(error){
          throw error;
        }
      });

      connection.query(query2, [username,bookID], function(error, results){
        if(error){
          throw error;
        }
      });

      connection.query(query3, [bookID], function(error, results){
        if(error){
          throw error;
        }
      });

      let failure = encodeURIComponent("0");
      res.redirect("/returnresult?valid=" + failure);
    }

    else{
      let failure = encodeURIComponent("1");
      res.redirect("/returnresult?valid=" + failure);
    }
    }
  });
});


// connecting to the server: port 3000
app.listen(3000, function() {
  console.log("Server up and running on port 3000");
});
