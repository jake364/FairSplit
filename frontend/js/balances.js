function loadBalances() {
  $.get(API + "/balances", function(balances) {
    $("#balanceList").empty()

    for (let i = 0; i < balances.length; i++) {
      let text = balances[i].name + ": $" + balances[i].balance
      $("#balanceList").append("<li>" + text + "</li>")
    }
  })
}

$(document).ready(function() {
  loadBalances()
})
