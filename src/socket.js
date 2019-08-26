var WebSocket = require('ws')
var wss = new WebSocket.Server({ port: 8080 })
var webSocket;
wss.on('connection', ws => {
  webSocket = ws;
  ws.on('message', message => {
   // console.log(`Received message => ${message}`)
  })
  //ws.send('Hello! Message From Server!!')

  eventEmitter.on('sendNotification', onSendNotification);

  function onSendNotification(data){
      console.log('Received message => ' + data.strategy.symbol);
      webSocket.send(JSON.stringify({data}));
  }
})

