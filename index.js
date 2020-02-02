var http = require('http');
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
var url = require('url');
var turf = require('@turf/turf');
const lineSlice = require('@turf/line-slice');
const lineDistance = require('@turf/line-distance');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://getmybus-e8c7d.firebaseio.com"
});
var db = admin.firestore();
var dbsnapshot;
// receiving the database at the start 
db.collection("rides").onSnapshot((snapshot) => {
    dbsnapshot = snapshot;
    console.log("db received");
  }, (error) => {
    //...
    console.log("some error occured "+error);
  });

http.createServer(function (req, res) {
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
        var start_point = snap.data().starting_point;
        console.log("starting point is", start_point);
        
        routes.forEach(points => {
          route_array.push([points.latitude,points.longitude]);
          
        });

        // converting the arrays into turf array
        var line = turf.lineString(route_array);

        // new point in our project it is the wifi points from the bus location
        var start_point_p = turf.point([start_point.latitude, start_point.longitude])
        var source = turf.point(src);
        var destination = turf.point(dest);

        var snapped = turf.nearestPointOnLine(line, source, {units: 'meters'});
        var snapped_ = turf.nearestPointOnLine(line, destination, {units: 'meters'});
        console.log(snapped_.properties.dist, snapped.properties.dist,i++);
        if(snapped.properties.dist <=100.00){
          if(snapped_.properties.dist <=100.00){

                  // todo get the currect starting point of the bus
                  // not the routest starting point this is a test
            var sliced_src = lineSlice(start_point_p, snapped, line);
            var sliced_dest = lineSlice(start_point_p, snapped_, line);
            var length_src = lineDistance(sliced_src, 'meters');
            var length_dest = lineDistance(sliced_dest, 'meters');
            console.log(length_src, length_dest,"this is the length");
            if(length_src<length_dest){
              // select these bus because these are running in same location as customer expect
              // assume that the current posion of the bus is in the 15th coordinate in polyline route then
              var sliced_current = lineSlice(start_point_p, line.geometry.coordinates[15], line);
              var length_current = lineDistance(sliced_current, 'meters');
              console.log(length_current,"value");
              
              if (length_dest > length_current) {
                check_array.push(snap.id.toString());
              }
            }
          }
        }
      });
      }

      console.log(check_array.toString());
      res.write(check_array.toString());
      res.end();

}).listen(process.env.PORT || 5000);
