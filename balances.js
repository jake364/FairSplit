let balancesArray = []
let balanceChart = null
let balanceBarChart = null
let chartHasAnimated = false
let barChartHasAnimated = false

function balanceStatusClass(balance) {
  return balance > 0 ? "status-positive" : "status-negative"
}

function balanceStatusText(balance) {
  return balance > 0 ? "is owed" : "owes"
}

function balanceCardTemplate(balance) {
  return `
    <div class="balance-card ${balanceStatusClass(balance.balance)}">
      <div class="balance-card-inner">
        <div>
          <strong class="roommate-name">${balance.name}</strong>
          <p class="balance-line">Paid: $${balance.paid.toFixed(2)}</p>
          <p class="balance-line">Due: $${balance.owed.toFixed(2)}</p>
        </div>
        <div class="balance-amount">
          <span class="amount">$${Math.abs(balance.balance).toFixed(2)}</span>
          <span class="label">${balanceStatusText(balance.balance)}</span>
        </div>
      </div>
    </div>
  `
}

function loadBalances() {
  $.when($.get(API + "/roommates"), $.get(API + "/expenses")).done(function(roommatesResponse, expensesResponse) {
    $("#balanceList").empty()

    const roommates = roommatesResponse[0]
    const expenses = expensesResponse[0]
    const balancesObj = {}

    roommates.forEach(function(roommate) {
      balancesObj[roommate._id] = {
        id: roommate._id,
        name: roommate.name,
        paid: 0,
        owed: 0,
        balance: 0
      }
    })

    expenses.forEach(function(expense) {
      if (expense.paidBy && balancesObj[expense.paidBy]) {
        balancesObj[expense.paidBy].paid += Number(expense.amount || 0)
      }

      if (expense.splits && expense.splits.length > 0) {
        expense.splits.forEach(function(split) {
          if (!split.splitDetails) return
          split.splitDetails.forEach(function(detail) {
            const roommateId = detail.roommateId
            if (roommateId && balancesObj[roommateId]) {
              balancesObj[roommateId].owed += Number(detail.amountOwed || 0)
            }
          })
        })
      }
    })

    balancesArray = Object.keys(balancesObj).map(function(key) {
      const balance = balancesObj[key]
      balance.balance = balance.paid - balance.owed
      return balance
    }).sort(function(a, b) {
      return b.balance - a.balance
    })

    if (balancesArray.length === 0) {
      $("#balanceList").append('<p class="empty-state">No roommates or balances yet.</p>')
      $("#chartContainer").hide()
      return
    }

    renderBalanceCards(balancesArray)
    updateBalanceCharts(balancesArray)
  }).fail(function(error) {
    console.error("Error loading balances:", error)
    $("#balanceList").html('<p class="error-state">Error loading balances.</p>')
  })
}

function renderBalanceCards(data) {
  $("#balanceList").empty()

  if (data.length === 0) {
    $("#balanceList").append('<p class="empty-state">No roommate matches your search.</p>')
    return
  }

  data.forEach(function(balance) {
    $("#balanceList").append(balanceCardTemplate(balance))
  })
}

function updateBalanceCharts(data) {
  const pieCanvas = document.getElementById("balanceChart")
  const barCanvas = document.getElementById("balanceBarChart")
  if (!pieCanvas || !barCanvas) return

  const labels = data.map(item => item.name)
  const owedAmounts = data.map(item => item.owed)
  const netAmounts = data.map(item => item.balance)
  const totalOwed = owedAmounts.reduce((sum, value) => sum + value, 0)
  const hasNetBalance = netAmounts.some(value => value !== 0)

  if (totalOwed <= 0 && !hasNetBalance) {
    $("#chartContainer").hide()
    if (balanceChart) {
      balanceChart.destroy()
      balanceChart = null
    }
    if (balanceBarChart) {
      balanceBarChart.destroy()
      balanceBarChart = null
    }
    return
  }

  const pieColors = [
    "#146c43",
    "#c65f3d",
    "#2f80ed",
    "#8a5cf6",
    "#12a594",
    "#f2994a",
    "#667085",
    "#0f5132"
  ]
  const barColors = netAmounts.map(value => value >= 0 ? "#146c43" : "#c03221")

  if (balanceChart) {
    balanceChart.data.labels = labels
    balanceChart.data.datasets[0].data = owedAmounts
    balanceChart.data.datasets[0].backgroundColor = pieColors.slice(0, labels.length)
    balanceChart.update("none")
  } else if (totalOwed > 0) {
    balanceChart = new Chart(pieCanvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: owedAmounts,
          backgroundColor: pieColors.slice(0, labels.length),
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: chartHasAnimated ? false : {
          animateRotate: true,
          duration: 900
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 12 },
              color: "#667085",
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ": $" + context.parsed.toFixed(2) + " due"
              }
            }
          }
        }
      }
    })
    chartHasAnimated = true
  }

  if (balanceBarChart) {
    balanceBarChart.data.labels = labels
    balanceBarChart.data.datasets[0].data = netAmounts
    balanceBarChart.data.datasets[0].backgroundColor = barColors
    balanceBarChart.update("none")
  } else {
    balanceBarChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Net balance",
          data: netAmounts,
          backgroundColor: barColors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: barChartHasAnimated ? false : {
          duration: 800
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y
                const label = value >= 0 ? "is owed" : "owes"
                return "$" + Math.abs(value).toFixed(2) + " " + label
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#667085"
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              color: "#667085",
              callback: function(value) {
                return "$" + value
              }
            },
            grid: {
              color: function(context) {
                return context.tick.value === 0 ? "#1d2939" : "#e5ebe7"
              },
              lineWidth: function(context) {
                return context.tick.value === 0 ? 3 : 1
              }
            }
          }
        }
      }
    })
    barChartHasAnimated = true
  }

  $("#chartContainer").css("display", "grid")
}

function searchBalances(searchTerm) {
  const normalizedTerm = searchTerm.trim().toLowerCase()

  const filtered = balancesArray.filter(function(balance) {
    return balance.name.toLowerCase().includes(normalizedTerm)
  })

  renderBalanceCards(filtered)

  if (filtered.length > 0) {
    updateBalanceCharts(filtered)
  } else {
    $("#chartContainer").hide()
  }
}

$(document).on("input", "#balanceSearch", function() {
  searchBalances($(this).val())
})

$(document).on("click", "#clearBalanceSearch", function() {
  $("#balanceSearch").val("")
  searchBalances("")
})

function startBalanceRefresh() {
  setInterval(function() {
    loadBalances()
  }, 5000)
}

$(document).ready(function() {
  loadBalances()
  startBalanceRefresh()
})
