therapist = null;
$("#activityTable").hide();
$("#addUserButton").hide();
$("#logoutButton").hide();

function tryLogin() {
  name = $("#usernameField").val();
  psw = $("#passwordField").val();
  send = {name : name, psw : psw};
     $.ajax({
        url: '/login',
        type: 'POST',   //type is any HTTP method
        data: JSON.stringify(send),      //Data as js object
        contentType : 'application/json',
      	success: loginSuccess,
        error : loginError
      });
}

function loginSuccess(data, textStatus, jqXHR ){
  therapist =$("#usernameField").val();
  $("#loginModal").modal('toggle');
  $("#activityTable").show();
  $("#addUserButton").show();
  $("#loginButton").hide();
  $("#logoutButton").show();
}

function loginError( jqXHR, textStatus, errorThrown) {
  alert("Login error " + textStatus + "\n " + errorThrown);
}

function logout() {
  $.ajax({
    url: '/logout',
    type: 'POST',   //type is any HTTP method
    data: {name: therapist},      //Data as js object
    success: logoutSuccess,
    error : logoutError
  });
}

function logoutSuccess(){
  therapist = null;
  $("#logoutModal").modal('toggle');
  $("#activityTable").hide();
  $("#addUserButton").hide();
  $("#loginButton").show();
  $("#logoutButton").hide();
}

function logoutError( jqXHR, textStatus, errorThrown) {
  alert("Logout error " + textStatus + "\n " + errorThrown);
}
