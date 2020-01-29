var http = require('http');
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
var url = require('url');
var turf = require('@turf/turf');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://getmybus-e8c7d.firebaseio.com"
});
var db = admin.firestore();
var dbsnapshot;
// receiving the database at the start 
db.collection("users").onSnapshot((snapshot) => {
    dbsnapshot = snapshot;
    console.log("db received");
  }, (error) => {
    //...
    console.log("some error occured "+error);
  });

exports.Mycloud = http.createServer(function (req, res) {
  var q =  url.parse(req.url, true).query;
  var check_array = new Array();

      var src = q.src;
      var dest = q.dest;
      if(src !=null && dest != null){
        src = src.split(",").map(Number);
      dest = dest.split(",").map(Number);
      console.log(dbsnapshot , src , dest);
      var i =0;
      dbsnapshot.forEach(function(snap){
        var route_array = new Array();
        var stops = snap.data().stops;
        var routes = snap.data().route;
        routes.forEach(points => {
          route_array.push([points.latitude,points.longitude]);
          
        });
        
        // converting the arrays into turf array
        var line = turf.lineString(route_array);

        // new point in our project it is the wifi points from the bus location
        var source = turf.point(src);
        var destination = turf.point(dest);

        // finding the nearest point on the line to the line
        var snapped = turf.nearestPointOnLine(line, source, {units: 'meters'});
        var snapped_ = turf.nearestPointOnLine(line, destination, {units: 'meters'});
        res.write("snapped");
        res.write("snapped_");

        console.log(snapped_.properties.dist, snapped.properties.dist,i++);
        if(snapped.properties.dist <=20.00){
          if(snapped_.properties.dist <=20.00){
            check_array.push(snap.id.toString());
          }
        }
      });
      }

      console.log(check_array.toString());
      res.write(check_array.toString());
      res.end();

}).listen(process.env.PORT || 5000);
