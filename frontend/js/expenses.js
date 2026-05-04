function loadExpenses() {
  $.get(API + "/expenses", function(expenses) {
    $("#expenseHistory").empty()
    for (let i = 0; i < expenses.length; i++) {
      let text = expenses[i].description + " $" + expenses[i].amount + " " + expenses[i].paidBy
      $("#expenseHistory").append("<li>" + text + "</li>")
    }
  })
}

function addExpense() {
  const description = $("#description").val()
  const amount = $("#amount").val()
  const paidBy = $("#paidBy").val()

  if (description === "" || amount === "" || paidBy === "") {
    return
  }

  $.ajax({
    url: API + "/expenses",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      description: description,
      amount: amount,
      paidBy: paidBy
    }),
    success: function() {
      $("#description").val("")
      $("#amount").val("")
      $("#paidBy").val("")
      loadExpenses()
      loadBalances()
    }
  })
}

$("#expense-form").on("submit", function(event) {
  event.preventDefault()
  addExpense()
})

$(document).ready(function() {
  loadExpenses()
})
