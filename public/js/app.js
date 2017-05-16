var jsonData = {
  objects: []
}

var dataOrganize = function(rawData) {
  $("#chatroom").text("");
  for (i=0; i < rawData.length; i++) {
    $("#chatroom").append('<li>' + rawData[i]['username'] + " | " + rawData[i]['created_at']+ " | " + rawData[i]['content'] + '</li>');
  }
}
$(document).ready(function() {
  var async = function() {
    $.getJSON("/data", function(data) {
      jsonData.objects = data;
    });
    dataOrganize(jsonData.objects)
  }

  $("#new-msg-form").submit(function(e){
    e.preventDefault();
    var newMessage = $("#new-message").val();
    var user_id = $("#id").val();
    fetch('/chat/messages/new', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMessage + "~||~" + user_id)
    });
    $("#new-message").val("");
  });

  setInterval(async , 2000);
});