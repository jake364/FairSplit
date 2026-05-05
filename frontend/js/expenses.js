let currentExpenses = []
let roommateMap = {}

function loadRoommatesForSplit() {
  $.get(API + "/roommates", function(roommates) {
    const splitOptions = $("#splitOptions")
    const paidBy = $("#paidBy")

    if (paidBy.length) {
      paidBy.find("option:not(:first)").remove()
    }

    if (splitOptions.length) {
      splitOptions.empty()
    }

    if (roommates.length === 0) {
      if (splitOptions.length) {
        splitOptions.append('<p class="empty-state">Add roommates first to create expenses.</p>')
      }
      return
    }

    roommates.forEach(function(roommate) {
      if (paidBy.length) {
        paidBy.append(`<option value="${roommate._id}">${roommate.name}</option>`)
      }

      if (splitOptions.length) {
        splitOptions.append(`
          <label class="split-option">
            <input type="checkbox" class="split-roommate" value="${roommate._id}" data-name="${roommate.name}">
            <span>${roommate.name}</span>
          </label>
        `)
      }
    })
  }).fail(function(error) {
    console.error("Error loading roommates for split:", error)
  })
}

function loadRoommateMap(callback) {
  $.get(API + "/roommates", function(roommates) {
    roommateMap = {}
    roommates.forEach(function(roommate) {
      roommateMap[roommate._id] = roommate.name
    })
    if (typeof callback === "function") callback()
  }).fail(function(error) {
    console.error("Error loading roommate map:", error)
    if (typeof callback === "function") callback()
  })
}

function getSplitNames(expense) {
  const splitNames = []

  if (!expense.splits) {
    return splitNames
  }

  expense.splits.forEach(function(split) {
    if (Array.isArray(split)) {
      split.forEach(function(roommateId) {
        const name = roommateMap[roommateId] || "Unknown"
        if (!splitNames.includes(name)) splitNames.push(name)
      })
      return
    }

    if (split.splitDetails && Array.isArray(split.splitDetails)) {
      split.splitDetails.forEach(function(detail) {
        const name = roommateMap[detail.roommateId] || "Unknown"
        if (!splitNames.includes(name)) splitNames.push(name)
      })
      return
    }

    if (split.roommateId) {
      const name = roommateMap[split.roommateId] || "Unknown"
      if (!splitNames.includes(name)) splitNames.push(name)
    }
  })

  return splitNames
}

function formatExpenseItem(expense) {
  const expenseDate = new Date(expense.date).toLocaleDateString()
  const payerName = expense.paidBy ? (roommateMap[expense.paidBy] || "Unknown") : "Unknown"
  const splitNames = getSplitNames(expense)
  const splitText = splitNames.length > 0 ? `Split with: ${splitNames.join(", ")}` : ""

  return `
    <li class="expense-item">
      <div class="expense-main">
        <div>
          <strong class="expense-title">${expense.title}</strong>
          <p class="expense-meta">${expense.category} &bull; ${expenseDate}</p>
        </div>
        <div>
          <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
        </div>
      </div>
      <div class="expense-detail-row">
        <span>Paid by: ${payerName}</span>
        ${splitText ? `<span>${splitText}</span>` : ""}
      </div>
    </li>
  `
}

function calculatePersonalTotal(expenses, roommateId) {
  let total = 0
  expenses.forEach(function(expense) {
    if (expense.paidBy === roommateId) {
      total += parseFloat(expense.amount || 0)
    }
    if (expense.splits && Array.isArray(expense.splits)) {
      expense.splits.forEach(function(split) {
        if (!split.splitDetails) return
        split.splitDetails.forEach(function(detail) {
          if (detail.roommateId === roommateId) {
            total += parseFloat(detail.amountOwed || 0)
          }
        })
      })
    }
  })
  return total
}

function renderSearchSummary(filteredExpenses, searchTerm) {
  const normalizedTerm = searchTerm.trim().toLowerCase()
  let summaryText = `Showing ${filteredExpenses.length} expense record${filteredExpenses.length === 1 ? "" : "s"}.`
  const matchingRoommates = Object.entries(roommateMap).filter(function([id, name]) {
    return name.toLowerCase().includes(normalizedTerm)
  })

  if (normalizedTerm && matchingRoommates.length === 1) {
    const roommateId = matchingRoommates[0][0]
    const roommateName = matchingRoommates[0][1]
    const personalTotal = calculatePersonalTotal(filteredExpenses, roommateId)
    summaryText = `${summaryText} ${roommateName} personal total: $${personalTotal.toFixed(2)}`
  } else if (normalizedTerm && matchingRoommates.length > 1) {
    summaryText += " Search matched multiple roommates; use a full name for a personal total."
  }

  $("#searchSummary").text(summaryText)
}

function filterExpenses(searchTerm) {
  const normalizedTerm = searchTerm.trim().toLowerCase()

  const filtered = currentExpenses.filter(function(expense) {
    const titleMatch = expense.title.toLowerCase().includes(normalizedTerm)
    const categoryMatch = expense.category.toLowerCase().includes(normalizedTerm)
    const payerName = expense.paidBy ? (roommateMap[expense.paidBy] || "").toLowerCase() : ""
    const payerMatch = payerName.includes(normalizedTerm)
    const splitMatch = (expense.splits || []).some(function(split) {
      return (split.splitDetails || []).some(function(detail) {
        const name = roommateMap[detail.roommateId] || ""
        return name.toLowerCase().includes(normalizedTerm)
      })
    })
    return normalizedTerm === "" || titleMatch || categoryMatch || payerMatch || splitMatch
  })

  $("#expenseHistory").empty()

  if (filtered.length === 0) {
    $("#expenseHistory").append('<li class="empty-state">No matching expenses found.</li>')
  } else {
    filtered.forEach(function(expense) {
      $("#expenseHistory").append(formatExpenseItem(expense))
    })
  }

  renderSearchSummary(filtered, searchTerm)
}

function loadExpenses() {
  $.get(API + "/expenses", function(expenses) {
    currentExpenses = expenses.slice()

    if (currentExpenses.length === 0) {
      $("#expenseHistory").empty()
      $("#expenseHistory").append('<li class="empty-state">No expenses yet.</li>')
      $("#searchSummary").text("Search a roommate name to see personal expense totals.")
      return
    }

    currentExpenses.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date)
    })

    filterExpenses($("#expenseSearch").val() || "")
  }).fail(function(error) {
    console.error("Error loading expenses:", error)
    $("#expenseHistory").html('<li class="error-state">Error loading expenses.</li>')
  })
}

function addExpense() {
  const description = $("#description").val().trim()
  const amount = $("#amount").val().trim()
  const paidBy = $("#paidBy").val()
  const selectedRoommates = []

  $(".split-roommate:checked").each(function() {
    selectedRoommates.push($(this).val())
  })

  if (description === "" || amount === "" || !paidBy) {
    alert("Please fill in all fields")
    return
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount")
    return
  }

  if (selectedRoommates.length === 0) {
    alert("Please select at least one roommate to split the expense")
    return
  }

  const splitAmount = parseFloat(amount) / selectedRoommates.length
  const splitDetails = selectedRoommates.map(function(roommateId) {
    return {
      roommateId: roommateId,
      amountOwed: Number(splitAmount.toFixed(2))
    }
  })

  $.ajax({
    url: API + "/expenses",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      title: description,
      amount: parseFloat(amount),
      category: "General",
      paidBy: paidBy,
      splitWith: selectedRoommates
    }),
    success: function(response) {
      $.ajax({
        url: API + "/expenses/" + response._id + "/splits",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          week: new Date().toISOString().slice(0, 10),
          splitDetails: splitDetails
        }),
        success: function() {
          console.log("Expense added successfully:", response)
          $("#description").val("")
          $("#amount").val("")
          $("#paidBy").val("")
          $(".split-roommate").prop("checked", false)
          loadExpenses()
          if (typeof loadBalances === "function") {
            loadBalances()
          }
          alert("Expense added successfully!")
        },
        error: function(xhr, status, error) {
          console.error("Error saving split details:", error, xhr.responseJSON)
          alert("Expense was created, but split details could not be saved.")
        }
      })
    },
    error: function(xhr, status, error) {
      console.error("Error adding expense:", error, xhr.responseJSON)
      alert("Error adding expense. Please try again.")
    }
  })
}

$("#expense-form").on("submit", function(event) {
  event.preventDefault()
  addExpense()
})

$(document).on("input", "#expenseSearch", function() {
  filterExpenses($(this).val())
})

$(document).ready(function() {
  loadRoommateMap(loadExpenses)
  loadRoommatesForSplit()
})
