therapist = null;
$("#activityTable").hide();
$("#addUserButton").hide();
$("#logoutButton").hide();

Handlebars.registerHelper("formatDate", function(datetime, format) {
  if (moment) {
    return moment(datetime).format(format);
  }
  else {
    return datetime;
  }
});

Handlebars.registerHelper("formatTime", function(time) {
  const min = parseInt(time / 60);
  const sec = parseInt(time % 60);
  return `${min}':${sec<10? "0"+sec : sec}" `;
});

Handlebars.registerHelper("formatMetric", function(val) {
  const inte = parseInt(val)
  const rem = parseInt((val % 1) * 100);
  return `${inte}${rem == 0 ? "" : ","+rem}`;
});

Handlebars.registerHelper("formatPain", function(pain) {
  return pain? "Sì" : "No";
});

Handlebars.registerHelper("formatScene", function(n) {
  switch (n) {
    case 1: return "Bosco - 1"
    case 2: return "Bosco - 2"
    case 3: return "Spazio - 1"
    case 4: return "Spazio - 2"
    case 5: return "Tempio"
      break;
    default: return "No scena"
  }
});

window.addEventListener("unload", checkLogout)

function checkLogout(){
  if (therapist != null){
    $.ajax({
      url: '/logout',
      type: 'POST',
      data: {name: therapist},
    });
  }
}

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
  $("#loginButton").hide();
  $("#signinButton").hide();
  $("#addUserButton").show();
  $("#logoutButton").show();
  showActivityTable();
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
  $("#tableContainer").html("");
  $("#addUserButton").hide();
  $("#logoutButton").hide();
  $("#loginButton").show();
  $("#signinButton").show();
}

function logoutError( jqXHR, textStatus, errorThrown) {
  alert("Logout error " + textStatus + "\n " + errorThrown);
}

function showActivityTable() {
  $("#tableContainer").html("");
  $.ajax({
    url: '/therapist/' + therapist,
    type: 'GET',   //type is any HTTP method
    //data: {id : therapist},      //Data as js object
    success: activityTableSuccess,
    error : activityTableSuccess
  });
}

function activityTableSuccess(data, textStatus, jqXHR) {
  renderTable(data);
}

function renderTable(data){
  var table = `<input type="text" id="idFilter" onkeyup="filter()" placeholder="Filtra per ID">
              <table class="table table-striped table-bordered table-hover table-responsive" id="activityTable">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Numero scena</th>
                    <th scope="col">Tempo</th>
                    <th scope="col">Seconda metrica</th>
                    <th scope="col">Dolore</th>
                    <th scope="col">Soddisfazione</th>
                    <th scope="col">Data</th>
                  </tr>
                </thead>
                <tbody id="tableBody">
                  {{#each data}}
                  <tr>
                    <th scope="row" class="uid">{{this.uid}}</th>
                    <td>{{formatScene this.scene}}</td>
                    <td>{{formatTime this.time}}</td>
                    <td>{{formatMetric this.metric}}</td>
                    <td>{{formatPain this.pain}}</td>
                    <td>{{this.satisfaction}}</td>
                    <td>{{formatDate this.date "HH:mm, dddd DD/MM/YYYY" }}</td>
                  </tr>
                  {{/each}}
                </tbody>
              </table>`;
    var template = Handlebars.compile(table);
    $("#tableContainer").append(template({data : data}));

}

function activityTableError( jqXHR, textStatus, errorThrown) {
  alert("Activity table error " + textStatus + "\n " + errorThrown);
}

function filter() {
    var value = $(idFilter).val().toLowerCase();
    $("#tableBody th.uid:contains('" + value + "')").parent().show();
    $("#tableBody th.uid:not(:contains('" + value + "'))").parent().hide();
}

function tryAddUser() {
  uid = $("#userId").val();
  thid = therapist;
  send = {uid : uid, thid : thid};
     $.ajax({
        url: '/newWatch',
        type: 'POST',   //type is any HTTP method
        data: JSON.stringify(send),      //Data as js object
        contentType : 'application/json',
      	success: addUserSuccess,
        error : addUserError
      });
}

function addUserSuccess() {
  $("#addUserModal").modal('toggle');
  showActivityTable();
}

function addUserError() {
  alert("Add user error " + textStatus + "\n " + errorThrown);
}

function tryAddTherapist() {
  name = $("#newUsernameField").val();
  psw = $("#newPasswordField").val();
  send = {name : name, psw : psw};
     $.ajax({
        url: '/newTherapist',
        type: 'POST',   //type is any HTTP method
        data: JSON.stringify(send),      //Data as js object
        contentType : 'application/json',
      	success: function () {
          addTherapistSuccess(name, psw)
        },
        error : addTherapistError
      });
}

function addTherapistSuccess(name, psw) {
  $("#signinModal").modal('toggle');
  directLogin(name, psw);
}

function addTherapistError() {
  alert("Add therapist error " + textStatus + "\n " + errorThrown);
}

function directLogin(name, psw) {
  send = {name : name, psw : psw};
  $.ajax({
    url: '/login',
    type: 'POST',   //type is any HTTP method
    data: JSON.stringify(send),      //Data as js object
    contentType : 'application/json',
    success: directLoginSuccess,
    error : directLoginError
  });
}

function directLoginSuccess(data, textStatus, jqXHR ){
  therapist =$("#newUsernameField").val();
  $("#loginButton").hide();
  $("#signinButton").hide();
  $("#addUserButton").show();
  $("#logoutButton").show();
  showActivityTable();
}

function directLoginError( jqXHR, textStatus, errorThrown) {
  alert("Login error " + textStatus + "\n " + errorThrown);
}
