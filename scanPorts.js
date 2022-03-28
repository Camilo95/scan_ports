const net = require('net');
const host = ['142.250.78.14', '157.240.6.35' ]; // google: 142.250.78.14, facebook: 157.240.6.35
const timeout = 10000;

let parte1 = 0, parte2 = 0, parte3 = 0, parte4 = 0;
let finish = false;

function generateNextIP(){
  if (parte4 === 255) {
    parte3++;
  }

  if (parte3 === 255) {
    parte3 = 0;
    parte2++;
  }

  if (parte2 === 255) {
    parte2 = 0;
    parte1++;
  }

  if (parte1 === 255) {
    finish = true;
  }

  if(parte4 === 255) {
    parte4 = 0;
  }else{
    parte4++;
  }
  return `${parte1}.${parte2}.${parte3}.${parte4}`;
}

async function startScanner(host) {
  let results = { host: host, ports: { opens: [] } };
  let start = false;

  function result(result) {
    if (result.status === 'connect') {
      results.ports.opens.push(result.port);
    }
  }

  async function connectToHost(host, port, callback) {
    return new Promise((resolve) => {
      let socket = new net.Socket();

      socket._scanner = {};
      socket._scanner.host = host;
      socket._scanner.port = port;
      socket._scanner.status = 'initialized';
      socket._scanner._events = { complete: callback };

      // Events
      socket.on('error', () => {
        socket._scanner.status = 'error';
        socket.destroy();
      });

      socket.on('listening', () => {
        socket._scanner.status = 'listening';
        socket.destroy();
      });

      socket.on('connect', () => {
        socket._scanner.status = 'connect';
        socket.destroy();
      });

      socket.on('data', () => {
        socket._scanner.status = 'data';
        socket.destroy();
      });

      socket.on('end', () => {
        socket._scanner.status = 'end';
        socket.destroy();
      });

      socket.on('lookup', () => {
        socket._scanner.status = 'lookup';
        socket.destroy();
      });

      socket.on('timeout', () => {
        socket._scanner.status = 'timeout';
        socket.destroy();
      });

      socket.on('close', (close) => {
        socket._scanner._events.complete(socket._scanner);
        resolve(socket._scanner);
      });

      if(timeout){
        socket.setTimeout(timeout);
      }

      let reloj = setInterval(() => {
        if (start) {
          socket.connect(port, host);
        }
        clearInterval(reloj);
      }, 10);
    });
  }

  const allPorts = Array.from({ length: 65535 }, (_, i) => { return connectToHost(host, i + 1, result) });
  start = true;
  await Promise.all(allPorts);
  
  return results;
}

async function runAll(host) {
  if(Array.isArray(host)){
    const data = await startScanner(host.shift());
    
    console.log(data);
    
    if(host.length){
      runAll(host)
    }
  }else{
    const data = await startScanner(host);
    console.log(data);
  }
}

(() => {
  runAll(host);
})();
