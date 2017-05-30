var SerialPort = require("serialport");
var message;
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

console.log('starting');
process.stdin.resume();

process.stdin.setEncoding('utf8');


var count = 0;
var rMax = 4;
var r = rMax;
var stripLength = 144;

var portOpen = false;
var busy = false;

server.on('message', function(msg, rinfo){
	if(!portOpen){
		console.log('port not open');
		return;
	}
	/*
	if(busy){
		console.log('busy');
		return;
	}
	*/
	//busy = true;
	//console.log(msg.toString('utf8'));
	var data = msg.toString('utf8').split(';');
	//console.log(data);

	data.map(function(pixel, index){
		pixel = pixel.split(',');
		index = index + 1;

		if(pixel == '')
			return;

		var max = 20;
		var r = parseInt(mapRange(
			parseInt(pixel[0]),
			0,
			255,
			0,
			max
		));
		var g = parseInt(mapRange(
			parseInt(pixel[1]),
			0,
			255,
			0,
			max
		));
		var b = parseInt(mapRange(
			parseInt(pixel[2]),
			0,
			255,
			0,
			max
		));

		message = [
			0x3C, //<
			//pixel location
			index,
			0,
			0,
			0,

			//pixel rgb value
			r,
			g,
			b,
			0x3E //>
		]
		//console.log(message);
		serialPort.write(message, function(err, results) {
			if(err)
				console.log('err ' + err);
			if(results)
				console.log('results ' + results);
		});
	});
	//busy = false;
	//process.exit();

});

server.on('listening', () => {
	  const address = server.address();
	  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(11999, '0.0.0.0');





//var serialPort = new SerialPort("/dev/ttyACM0", {
var serialPort = new SerialPort("/dev/cu.usbmodem2809741", {
	baudrate: 9600
});

serialPort.on("open", function () {
	console.log('open');
	portOpen = true;
	serialPort.on('data', function(data) {
		//console.log('data received: ' + data);
		console.log(data.toString('utf8'));
		//console.log(data);
	});
});

var decToHex = function(num){
	if(num == 60 || num == 62)
		num = 61;
	var newVal = Number(num).toString(16).toUpperCase();

	return '0x' + newVal;
}

function hex32Array(val) {
	val &= 0xFFFFFFFF;
	var hex = val.toString(16).toUpperCase();
	hex = ("00000000" + hex).slice(-8);
	return hex.match(/.{2}/g);
}

function mapRange(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
