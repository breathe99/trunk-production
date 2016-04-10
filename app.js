var express = require('express'),
  app = express(),
  http = require('http'),
  httpServer = http.Server(app);

// Be able to serve static files from public directory
app.use(express.static('public'));

// Return index.html at root 
app.get('/', function(req, res) {
  res.sendFile('public/index.html' , { root : __dirname});
});
app.listen(3000);
