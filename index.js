var http = require('http');
const mbxClient = require('@mapbox/mapbox-sdk');
var polyline = require('@mapbox/polyline');
const mbxDirection = require('@mapbox/mapbox-sdk/services/directions');


    // creating mapbox client
    const baseClient = mbxClient({ accessToken: "pk.eyJ1IjoiYW5hbmQ5Mjg4IiwiYSI6ImNrNHk2dHJpdDA3dHEzZm82Y2hnY252cjEifQ.W-3fm0taJg_noVA_zzJO7g" });
    const direction_service = mbxDirection(baseClient);

exports.Mycloud = http.createServer(function (req, res) {
    direction_service.getDirections({
        profile: 'driving-traffic',
        waypoints: [
          {
            coordinates: [13.4301, 52.5109],
            approach: 'unrestricted'
          },
          {
            coordinates: [13.4265, 52.508]
          },
          {
            coordinates: [13.4194, 52.5072],
            bearing: [100, 60]
          }
        ]
      })
        .send()
        .then(responses => {
          // response.send("hai");
          const directions = responses.body;
          var ans = polyline.toGeoJSON(directions.routes[0].geometry);
          console.log(ans);
          res.write(JSON.stringify(ans));
          res.end();
          // // need to be send to the Android application for display routes in google maps android phone
          // console.log(polyline.toGeoJSON(directions.routes[0].geometry).coordinates);
          // response.send(polyline.toGeoJSON(directions.routes[0].geometry))
        })
        .catch(() => {
          console.error('Do that');
      })
  // res.write('Hello World!');
  // res.end();
}).listen(8080);