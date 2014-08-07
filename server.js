var express = require("express");
var logfmt = require("logfmt");

var app = express();
app.use(express.static('views'));
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/foo.html');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});