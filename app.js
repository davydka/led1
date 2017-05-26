var SerialPort = require("serialport");
var message;

console.log('starting');
process.stdin.resume();

process.stdin.setEncoding('utf8');

var count = 0;
var rMax = 40;
var r = rMax;
var stripLength = 144;


var handleStdin = function() {
	var position = hex32Array(count);
	count++;
	if(count == stripLength && r == rMax){
		count = 0;
		r = 0;
		rMax = rMax - 1;
		if(rMax == 4)
			rMax = 40;
		//console.log(rMax);
	} else if (count == stripLength && r == 0){
		count = 0;
		r = rMax;
	}

	message = [
		0x3C, //<

		//pixel location
		//position[0],
		count,
		position[1],
		position[2],
		position[3],

		//pixel rgb value
		//decToHex(r),
		r,
		0,
		0,
		0x3E //>
	];
	//console.log('Sending the following over serial: '+message );

	//serialPort.write(Buffer.from(message, "hex"), function(err, results) {
	//serialPort.write(Buffer.from(message), function(err, results) {
	serialPort.write(message, function(err, results) {
		if(err)
			console.log('err ' + err);
		if(results)
			console.log('results ' + results);
	});
};
setInterval(handleStdin, 10);
process.stdin.on('data', handleStdin);



var serialPort = new SerialPort("/dev/ttyACM0", {
	baudrate: 9600
});

serialPort.on("open", function () {
	console.log('open');
	serialPort.on('data', function(data) {
		//console.log('data received: ' + data);
		//console.log(data.toString('utf8'));
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
