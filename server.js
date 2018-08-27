const os = require('os');
const opcua = require('node-opcua');

// Let's create an instance of OPCUAServer
const server = new opcua.OPCUAServer({
	port: 4334, // the port of the listening socket of the server
	resourcePath: 'ua/server', // this path will be added to the endpoint resource name
	buildInfo : {
		productName: 'ServerSample',
		buildNumber: '7658',
		buildDate: new Date(2014,5,2)
	}
});

server.initialize(_ => {
	console.log('initialized');

	const addressSpace = server.engine.addressSpace;
	
	// declare a new object
	var device = addressSpace.getOwnNamespace().addFolder('ObjectsFolder', { browseName: 'Device' });
	
	// add a variable named Variable1 to the newly created folder 'Device'
	let variable1 = 1;

	// emulate variable1 changing every 500 ms
	setInterval(function() {  variable1 += 1; }, 500);

	addressSpace.getOwnNamespace().addVariable({
		componentOf: device,
		nodeId: 'ns=1;s=var1', // some opaque NodeId in namespace 4		
		browseName: 'Variable1',
		dataType: 'Double',
		value: {
			get: function () {
				return new opcua.Variant({dataType: opcua.DataType.Double, value: variable1 });
			}
		}
	});

	// add a variable named Variable2 to the newly created folder 'Device'
	let variable2 = 10.0;

	addressSpace.getOwnNamespace().addVariable({			
		componentOf: device,
		nodeId: 'ns=1;b=1020FFAA', // some opaque NodeId in namespace 4			
		browseName: 'Variable2',			
		dataType: 'Double',    			
		value: {
			get: function () {
				return new opcua.Variant({dataType: opcua.DataType.Double, value: variable2 });
			},
			set: function (variant) {
				variable2 = parseFloat(variant.value);
				return opcua.StatusCodes.Good;
			}
		}
	});

	/**
	 * returns the percentage of free memory on the running machine
	 * @return {double}
	 */
	function availableMemory() {
		const percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
		return percentageMemUsed;
	}

	addressSpace.getOwnNamespace().addVariable({    
		componentOf: device,
		nodeId: 's=free_memory', // a string nodeID
		browseName: 'FreeMemory',
		dataType: 'Double',
		value: {
			get: function () {return new opcua.Variant({dataType: opcua.DataType.Double, value: availableMemory() });}
		}
	});

	server.start(function() {
		console.log('Server is now listening ... ( press CTRL+C to stop)');
		console.log('port ', server.endpoints[0].port);
		const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
		console.log(' the primary server endpoint url is ', endpointUrl);
	});
});
