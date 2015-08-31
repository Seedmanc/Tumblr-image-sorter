 

self.port.on("my-addon-message", handleMessage);

function handleMessage(message) {
  var amount=$('div').length;
   
  self.port.emit("my-script-response", amount);
}