var http = require('http');
var url = require('url');
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://getmybus-e8c7d.firebaseio.com"
});
var db = admin.firestore();
var dbsnapshot;
// receiving the database at the start 
db.collection("test").onSnapshot((snapshot) => {
    dbsnapshot = snapshot;
    console.log("db received");
  }, (error) => {
    //...
    console.log("some error occured "+error);
  });

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
//   var txt = q.name[0] + " " + q.name[1];
dbsnapshot.forEach(function(snap){
  console.log(snap.data());
  
    
  });
  res.end();
}).listen(8080);
