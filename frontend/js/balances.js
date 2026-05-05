let balancesArray = []
let balanceChart = null

// Load balances from the backend API and display as cards
// Backend logic: Calculates balances by:
// 1. Getting all roommates, expenses, and payments
// 2. For each expense, adding to paidBy roommate's "paid" and to owed roommates' "owed"
// 3. Subtracting payments from the "paid" amount
// 4. Calculating final balance = paid - owed
function loadBalances() {
  $.get(API + "/balances", function(balancesObj) {
    $("#balanceList").empty()

    // Convert object to array and sort by balance
    balancesArray = Object.keys(balancesObj).map(function(key) {
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
      $("#chartContainer").hide()
      return
    }

    // Render balance cards
    balancesArray.forEach(function(balance) {
      let statusColor = balance.balance > 0 ? "#4fa870" : "#e74c3c"
      let statusText = balance.balance > 0 ? "is owed" : "owes"
      
      const balanceCard = `
        <div class="balance-card" style="border-left: 4px solid ${statusColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
              <strong style="display: block; margin-bottom: 0.5rem; color: var(--muted);">${balance.name}</strong>
              <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
                Paid: $${balance.paid.toFixed(2)}
              </p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--muted);">
                Due: $${balance.owed.toFixed(2)}
              </p>
            </div>
            <div style="text-align: right; min-width: 120px;">
              <span style="font-size: 1.5rem; font-weight: 700; color: ${statusColor};">$${Math.abs(balance.balance).toFixed(2)}</span>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--muted);">${statusText}</p>
            </div>
          </div>
        </div>
      `
      $("#balanceList").append(balanceCard)
    })

    // Initialize chart with all roommates
    updateBalanceChart(balancesArray)
    $("#chartContainer").show()
  }).fail(function(error) {
    console.error("Error loading balances:", error)
    $("#balanceList").html("<p style='color: red; padding: 2rem;'>Error loading balances</p>")
  })
}

function renderBalanceCards(data) {
  $("#balanceList").empty()

  if (data.length === 0) {
    $("#balanceList").append("<p style='text-align: center; color: var(--muted); padding: 2rem; grid-column: 1 / -1;'>No roommate matches your search.</p>")
    return
  }

  data.forEach(function(balance) {
    let statusColor = balance.balance > 0 ? "#4fa870" : "#e74c3c"
    let statusText = balance.balance > 0 ? "is owed" : "owes"
    
    const balanceCard = `
      <div class="balance-card" style="border-left: 4px solid ${statusColor};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="display: block; margin-bottom: 0.5rem; color: var(--muted);">${balance.name}</strong>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              Paid: $${balance.paid.toFixed(2)} | Owes: $${balance.owed.toFixed(2)}
            </p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.5rem; font-weight: 700; color: ${statusColor};">$${Math.abs(balance.balance).toFixed(2)}</span>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--muted);">${statusText}</p>
          </div>
        </div>
      </div>
    `
    $("#balanceList").append(balanceCard)
  })
}

function updateBalanceChart(data) {
  const canvas = document.getElementById("balanceChart")
  if (!canvas) return

  const labels = data.map(item => item.name)
  const amounts = data.map(item => item.owed)
  const totalOwed = amounts.reduce((sum, value) => sum + value, 0)

  if (totalOwed <= 0) {
    $("#chartContainer").hide()
    if (balanceChart) {
      balanceChart.destroy()
      balanceChart = null
    }
    return
  }

  const colors = [
    '#2d7a45',
    '#5cb85c',
    '#8bc34a',
    '#74b27f',
    '#4fa870',
    '#486a55',
    '#3a5a37',
    '#6dc266'
  ]

  if (balanceChart) {
    balanceChart.destroy()
  }

  balanceChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: amounts,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            color: '#486a55',
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': $' + context.parsed.toFixed(2)
            }
          }
        }
      }
    }
  })
  $("#chartContainer").show()
}

function searchBalances(searchTerm) {
  const normalizedTerm = searchTerm.trim().toLowerCase()

  const filtered = balancesArray.filter(function(balance) {
    return balance.name.toLowerCase().includes(normalizedTerm)
  })

  renderBalanceCards(filtered)

  if (filtered.length > 0) {
    updateBalanceChart(filtered)
    $("#chartContainer").show()
  } else {
    $("#chartContainer").hide()
  }
}

// Event: Search input
$(document).on("input", "#balanceSearch", function() {
  searchBalances($(this).val())
})

// Event: Clear button
$(document).on("click", "#clearBalanceSearch", function() {
  $("#balanceSearch").val("")
  searchBalances("")
})

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
