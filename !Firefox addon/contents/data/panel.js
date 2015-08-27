self.port.on("message", showm)
function showm(message) { 
  $(".edit-box")[0].value=message[0];
  $(".edit-box")[1].value=message[1];
}


self.port.once("show", function onShow() {
 
});