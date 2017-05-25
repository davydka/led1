var SerialPort = require("serialport");
var message;

console.log('starting');
process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (text) {
	var position = hex32Array(256);
	console.log(position);

	message = [
		0x3C, //<

		position[0],
		position[1],
		position[2],
		position[3],

		decToHex(0),
		decToHex(0),
		decToHex(1),
		0x3E //>
	];
	console.log('Sending the following over serial: '+message );

	//serialPort.write(Buffer.from(message, "hex"), function(err, results) {
	//serialPort.write(Buffer.from(message), function(err, results) {
	serialPort.write(message, function(err, results) {
		if(err)
			console.log('err ' + err);
		if(results)
			console.log('results ' + results);
	});
});



var serialPort = new SerialPort("/dev/ttyACM0", {
	baudrate: 9600
});

serialPort.on("open", function () {
	console.log('open');
	serialPort.on('data', function(data) {
		console.log('data received: ' + data);
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

function toBytesInt32 (num) {
	arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
	view = new DataView(arr);
	view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
	return arr;
}

function hex32Array(val) {
	val &= 0xFFFFFFFF;
	var hex = val.toString(16).toUpperCase();
	hex = ("00000000" + hex).slice(-8);
	return hex.match(/.{2}/g);
}
