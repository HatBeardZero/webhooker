// Begin Server Implementation
// ---------------------------

// Dependencies
var spawn = require('child_process').spawn;
var express = require('express');
var bodyParser = require('body-parser');
var instance
var IP_ADDRESS = '127.0.0.1';
var sys = require('sys')
var exec = require('child_process').exec;
var rpio = require('rpio');

rpio.open(12, rpio.OUTPUT, rpio.LOW);

// Log server output to stdout
function log(data) {
    process.stdout.write(data.toString());
}
// Create an express web app
var app = express();
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/restart',    function(request, response) {

    var command = request.body.command;
        var yourscript = exec('sh /opt/talker/talker.sh ' + command,
        (error, stdout, stderr) => {
			//console.log(request.body.command);
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });

	for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        rpio.write(21, rpio.HIGH);
        rpio.sleep(1);

        /* Off for half a second (500ms) */
        rpio.write(21, rpio.LOW);
        rpio.msleep(500);
}
		
    // buffer output for a quarter of a second, then reply to HTTP request
    var buffer = [];
    var collector = function(data) {
        data = data.toString();
        buffer.push(data.split(']: ')[1]);
    };
	
    // Delay for a bit, then send a response with the latest server output
    requestAsJson = JSON.stringify(request.body);

    //set the appropriate HTTP header
    response.setHeader('Content-Type', 'application/json');

    //log the output
    console.log('The POST data received was: ' + requestAsJson);

    //send the POST data back as JSON
    response.end(requestAsJson);
});

// Listen for incoming HTTP requests on port 3000
app.listen(3000);

process.on('exit', function() {
});

