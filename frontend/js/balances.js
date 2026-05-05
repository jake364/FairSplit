function loadBalances() 
{
  $.get(API + "/balances", function(balancesObj) {
    $("#balanceList").empty()

    // Convert object to array and sort by balance
    const balancesArray = Object.keys(balancesObj).map(function(key) {
      return {
        id: key,
        name: balancesObj[key].name,
        paid: balancesObj[key].paid,
        owed: balancesObj[key].owed,
        balance: balancesObj[key].balance
      }
    }).sort(function(a, b) {
      return b.balance - a.balance // Sort by balance descending
    })

    if (balancesArray.length === 0) {
      $("#balanceList").append("<p style='text-align: center; color: var(--muted); padding: 2rem; grid-column: 1 / -1;'>No roommates or balances yet.</p>")
      return
    }
    
  }).fail(function(error) {
    console.error("Error loading balances:", error)
    $("#balanceList").html("<p style='color: red; padding: 2rem;'>Error loading balances</p>")
  })
}

// Reload balances every 5 seconds to keep data fresh
function startBalanceRefresh() {
  setInterval(function() {
    loadBalances()
  }, 5000)
}

// Initialize on page load
$(document).ready(function() {
  loadBalances()
  startBalanceRefresh()
})
