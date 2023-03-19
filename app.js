var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var bodyParser = require('body-parser');
var app = express();
var ctrl = require('./routes/controller');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// var server = app.listen(3000,  "127.0.0.1", function () {
//   var host = server.address().address
//   var port = server.address().port
//   console.log("Example app listening at http://%s:%s", host, port)
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/controller', ctrl);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// io.on("connection", function(socket){
//     socket.on("newuser",function(username){
//         socket.broadcast.emit("update", username + " joined the conversation");
//     });
//     socket.on("exituser",function(username){
//         socket.broadcast.emit("update", username + " left the conversation");
//     });
//     socket.on("chat",function(message){
//         socket.broadcast.emit("chat", message);
//     });
// });
//server.listen(5000);
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
