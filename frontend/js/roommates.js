function loadRoommates() {
  $.get(API + "/roommates", function(roommates) {
    $("#roommateList").empty()
    
    for (let i = 0; i < roommates.length; i++) {
      $("#roommateList").append("<li>" + roommates[i].name + "</li>")
    }
  })
}

function addRoommate() {
  const name = $("#roommateName").val()
  
  if (name === "") {
    return
  }

  $.ajax({
    url: API + "/roommates",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: name
    }),
    success: function() {
      $("#roommateName").val("")
      loadRoommates()
    }
  })
}

$("#addRoommateBtn").on("click", function() {
  addRoommate()
})

$(document).ready(function() {
  loadRoommates()
})
