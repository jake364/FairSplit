function loadHouseholds() {
  $.get(API + "/households", function(households) {
    $("#householdList").empty()
    for (let i = 0; i < households.length; i++) {
      $("#householdList").append("<li>" + households[i].name + "</li>")
    }
  })
}

function addHousehold() {
  const name = $("#householdName").val()
  if (name === "") {
    return
  }

  $.ajax({
    url: API + "/households",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: name
    }),
    success: function() {
      $("#householdName").val("")
      loadHouseholds()
    }
  })
}

$("#addHouseholdBtn").on("click", function() {
  addHousehold()
})
