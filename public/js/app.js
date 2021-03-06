var jsonData = {
  objects: [],
  tempObjects: [],
  activeUsers: [],
	error: []
};

//spinner options
var opts = {
lines: 13 // The number of lines to draw
, length: 28 // The length of each line
, width: 14 // The line thickness
, radius: 42 // The radius of the inner circle
, scale: 0.15 // Scales overall size of the spinner
, corners: 1 // Corner roundness (0..1)
, color: '#000' // #rgb or #rrggbb or array of colors
, opacity: 0.25 // Opacity of the lines
, rotate: 0 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 1 // Rounds per second
, trail: 60 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: 'spinner' // The CSS class to assign to the spinner
, top: '50px' // Top position relative to parent
, left: '50%' // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: false // Whether to use hardware acceleration
, position: 'absolute' // Element positioning
}

//Displays chatroom messages and users
var dataOrganize = function(rawData) {
  if (rawData.length != 0) {
    for (i=0; i < rawData.length; i++) {
      $("#chatroom").append('<form id="form' + rawData[i]['id'] + '" action="/message/' + rawData[i]['id'] + '/delete" method="post">' +
      '<input type="hidden" name="_method" value="delete">');

      $("#chatroom").append('<li><span class="redx"><a href="#" onclick="document.getElementById(\'form' + rawData[i]['id'] + '\').submit();">&#10005; </a></span> ' +
      '<span class="time-span">' + rawData[i]['display_time'] + " ></span> " + '<span class="name-span">' + rawData[i]['username'] + ': </span> ' + rawData[i]['content'] +
      '<input type="hidden" name="remove-message" value="' + rawData[i]['id'] + '"/>' +
      '</li>');

      $("#chatroom").append('</form>');
    }
  }

  jsonData.objects = jsonData.objects.concat(jsonData.tempObjects);
  jsonData.tempObjects = [];
};

//displays online users
var displayUsers = function(userData) {
  $("#users").text("");
  userData.forEach(function(user) {
    user_a = [user['username'], user['profile_picture'], user['about_me'].replace('"', '&quote')];
    $("#users").append("<a onclick='userModal([" + "\"" + user_a[0] + "\"," + "\"" + user_a[1] + "\"," + "\"" + user_a[2] + "\"" + "]);' href='#' id='" + user['username'] + "'>" + user['username'] + "</a><br>");
  });
};

var userModal = function(input) {
  $('#user-modal-image-div').html(
    "<div class='profile-picture-wrapper' style='margin: auto; background-image: url(" + input[1] + "); border-radius: 50%; width: 150px; height: 150px; background-size: cover; background-position: center;'></div>");
  $('#user-modal-name-div').html(input[0]);
  $('#user-modal-about-div').html("<em>" + input[2] + "</em>");
  $('#user-modal').show();
};

var modalHide = function() {
  $('#user-modal').hide();
}

var getLastMessageId = function() {
  console.log("objects", jsonData.objects)
  if (jsonData.objects.length === 0) {
    return "0";
  } else {
    return jsonData.objects.slice(-1).pop().id;
  }
};

$(document).ready(function() {
  var target = document.getElementById("load");
  var spinner = new Spinner(opts).spin(target);

  // async call for information
  var async = function() {

   var lastMessageId = getLastMessageId();
	 console.log("lastmessageid", lastMessageId)

    fetch('/data', {
      method: 'post', redirect: 'follow',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(lastMessageId)
    })
		.then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText
          });
        }
      })
      .then(data => {
        if (data.ok === undefined) { //data.ok only exists if there is an error and will always eval to false.
          if (data.length !== 0) {
					  jsonData.tempObjects = data;
          }
        } else {
          jsonData.error = data;
        }
      })
      .catch(error => {
        if (error.status !== 200) {
          $("body").text(`Something isn't quite right with the message get request: ${error.status} ${error.statusText}`);
          console.log(error.status);
        }
      })
      .then(function() {
        if (jsonData.tempObjects.length != 0) {
          $("#chatroom").animate({ scrollTop: $('#chatroom').prop("scrollHeight")}, 500);
        }
        dataOrganize(jsonData.tempObjects);
        spinner.stop();
        spinner2.stop();
      });

    fetch("/active-users")
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText
          });
        }
      })
      .then(data => {
        jsonData.activeUsers = data;
      })
      .catch(error => {
        if (error.status !== 200) {
          $("body").text(`Something isn't quite right with the user get request: ${error.status} ${error.statusText}`);
        }
      })
      .then(function() {
        displayUsers(jsonData.activeUsers);
      });
  };

  var target2 = document.getElementById("load-below");
  var spinner2 = new Spinner(opts)

  $("#new-msg-form").submit(function(e){
    e.preventDefault();

    spinner2.spin(target2)
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
