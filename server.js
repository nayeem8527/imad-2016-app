var express = require('express');   //creating the web server so to avoid how to listen on ports
var morgan = require('morgan');     // output logs of the server
var path = require('path');
var Pool = require('pg').Pool
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user:'nayeem8527',
    database:'nayeem8527',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password: process.env.DB_PASSWORD
}

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:'soneRandomSecretValue',
    cookie: {maxAge : 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate(data){
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
        <head>
            <title>
                ${title}
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link href="/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date.toDateString()}
                </div>
                <div>
                    ${content}
                </div>
            </div>
        </body>
    </html>
    `;
    
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input,salt){
    // creating hash
    var hashed = crypto.pbkdf2Sync(input,salt,10000,512,'sha512');  //password based key derivative function
    return ['pbkdf2','10000',salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
   var hashedString = hash(req.params.input,'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user',function(req,res){
   //username and password taken as input
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password,salt);
   pool.query('INSERT INTO "user" (username,password) VALUES ($1,$2)', [username,dbString],function(err,result){
      if(err){
          res.status(500).send(err.toString());
      } else
      {
          res.send('User successfully created : '+username);
      } 
   });
});

app.post('/login',function(req,res){
    
   var username = req.body.username;
   var password = req.body.password;
  
   pool.query('SELECT * FROM "user" WHERE username=$1',[username],function(err,result){
      if(err){
          res.status(500).send(err.toString());
      } else
      {
          if(result.rows.length === 0){
              res.send(400).send('username/password invalid');
          }
          else{
              //matching the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password,salt);
              if(hashedPassword === dbString){
                  
                    // set the session
                    req.session.auth = {userId: result.rows[0].id};
                    //set cookie with a session id
                    //internally on the server side it maps the seddio id with object
                  
                    res.send('credential correct!');       
              }
              else{
                  res.send(400).send('username/password invalid');
              }
          }
      } 
   });
});

app.get('/check-login',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId){
        res.send('You are logged in :' + req.session.auth.userId.toString());
    }
    else{
        res.send('You are not logged in');
    }
})

var pool = new Pool(config)
app.get('/test-db', function(req,res){
   //make a select request
   pool.query('SELECT * FROM test',function(err,result){
      if(err){
          res.status(500).send(err.toString());
      } else
      {
          res.send(JSON.stringify(result.rows));
      }
   });
   //return a response with the results
});

var counter=0;
app.get('/counter', function(req,res){
    counter = counter+1;
    res.send(counter.toString());  
});

var names = [];
app.get('/submit-name', function(req,res){ //URL = /submit-name?name=sdvfd
    //get the current name
    var name = req.query.name;
    names.push(name);
    res.send(JSON.stringify(names));
});

app.get('/articles/:articleName', function (req, res) {
  
  pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName],function(err,result){
      if(err){
          res.status(500).send(err.toString());
      }else{
          if(result.rows.length === 0){
              res.status(400).send('Article not Found');
          }
          else{
              var articleData = result.rows[0];
              res.send(createTemplate(articleData));
          }
      }
  });
});


app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
