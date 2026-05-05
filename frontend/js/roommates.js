// Load all roommates from the backend API and display them as cards
function loadRoommates() {
  $.get(API + "/roommates", function(roommates) {
    $("#roommateList").empty()
    
    // Also update the paid-by dropdown on expense pages
    if ($("#paidBy").length) {
      $("#paidBy").find("option:not(:first)").remove()
    }
    
    if (roommates.length === 0) {
      $("#roommateList").append("<p style='text-align: center; color: var(--muted); padding: 2rem;'>No roommates yet. Add one to get started!</p>")
      return
    }
    
    roommates.forEach(function(roommate) {
      // Create roommate card with avatar, name, and delete button
      const roommateCard = `
        <div class="roommate-card">
          <div class="roommate-avatar">${roommate.name.charAt(0).toUpperCase()}</div>
          <div class="roommate-info">
            <h3>${roommate.name}</h3>
            <p class="roommate-status">Active</p>
          </div>
          <button class="roommate-remove" data-id="${roommate._id}" data-name="${roommate.name}">✕</button>
        </div>
      `
      $("#roommateList").append(roommateCard)
      
      // Add to expense form dropdown
      if ($("#paidBy").length) {
        $("#paidBy").append(`<option value="${roommate._id}">${roommate.name}</option>`)
      }
    })
  }).fail(function(error) {
    console.error("Error loading roommates:", error)
    $("#roommateList").html("<p style='color: red; padding: 2rem;'>Error loading roommates</p>")
  })
}

// Add a new roommate to the database via POST request
function addRoommate() {
  const name = $("#roommateName").val().trim()
  
  if (name === "") {
    alert("Please enter a roommate name")
    return
  }

  $.ajax({
    url: API + "/roommates",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      householdId: null
    }),
    success: function(response) {
      console.log("Roommate added successfully:", response)
      $("#roommateName").val("")
      loadRoommates()
    },
    error: function(xhr, status, error) {
      console.error("Error adding roommate:", error)
      alert("Error adding roommate. Please try again.")
    }
  })
}

// Delete a roommate from the database via DELETE request
function deleteRoommate(roommateId, roommateName) {
  if (confirm(`Are you sure you want to delete ${roommateName} from the household?`)) {
    $.ajax({
      url: API + "/roommates/" + roommateId,
      method: "DELETE",
      success: function(response) {
        console.log("Roommate deleted successfully:", response)
        loadRoommates()
      },
      error: function(xhr, status, error) {
        console.error("Error deleting roommate:", error)
        alert("Error deleting roommate. Please try again.")
      }
    })
  }
}

// Search and filter roommates in real-time
function filterRoommates(searchTerm) {
  const term = searchTerm.toLowerCase()
  $(".roommate-card").each(function() {
    const roommateName = $(this).find(".roommate-info h3").text().toLowerCase()
    if (roommateName.includes(term)) {
      $(this).show()
    } else {
      $(this).hide()
    }
  })
}

// Event: Add Roommate button click
$("#addRoommateBtn").on("click", function() {
  addRoommate()
})

// Event: Enter key on input field
$("#roommateName").on("keypress", function(e) {
  if (e.which == 13) { // 13 is Enter key
    addRoommate()
  }
})

// Event: Delete Roommate button click
$(document).on("click", ".roommate-remove", function() {
  const roommateId = $(this).data("id")
  const roommateName = $(this).data("name")
  deleteRoommate(roommateId, roommateName)
})

// Event: Search roommates in real-time
$("#roommateSearch").on("keyup", function() {
  filterRoommates($(this).val())
})

// Initialize on page load
$(document).ready(function() {
  loadRoommates()
})
