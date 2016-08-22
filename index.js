//map the port, bring up the server
// Ads express to our project
const express = require('express');
//Adds express handlears to our project
const exphbs = require('express-handlebars');
//turn on express tools
const app = express();
//put everything (images,etc) in public
app.use(express.static('public'));

//set the view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//
app.get('/', function (req, res) {
  res.render('home');
});
  app.get('/dept', function (req, res) {
    res.render('dept');
  });
////
//start the server
const port = 3000;
app.listen(port, function () {
  console.log("Example app listening on port " + port + "!");
});
