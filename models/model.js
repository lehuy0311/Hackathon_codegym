var mysql = require('mysql');
var db = mysql.createPool({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'final'
});
db.getConnection(() => console.log('Da ket noi database !'));
module.exports = db;
