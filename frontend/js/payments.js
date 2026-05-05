function loadPayments() {
  $.get(API + "/payments", function(payments) {
    $("#paymentList").empty()
    for (let i = 0; i < payments.length; i++) {
      let text = payments[i].paidBy + " paid $" + payments[i].amount + " to " + payments[i].paidTo
      $("#paymentList").append("<li>" + text + "</li>")
    }
  })
}

function addPayment() {
  const paidBy = $("#paymentPaidBy").val()
  const paidTo = $("#paymentPaidTo").val()
  const amount = $("#paymentAmount").val()
  if (paidBy === "" || paidTo === "" || amount === "") {
    return
  }
  
  $.ajax({
    url: API + "/payments",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      paidBy: paidBy,
      paidTo: paidTo,
      amount: amount
    }),
    success: function() {
      $("#paymentPaidBy").val("")
      $("#paymentPaidTo").val("")
      $("#paymentAmount").val("")
      loadPayments()
      loadBalances()
    }
  })
}

$("#payment-form").on("submit", function(event) {
  event.preventDefault()
  addPayment()
})
