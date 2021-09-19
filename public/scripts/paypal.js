const amountElement = document.getElementById('amount')

async function twoDecimal(event)
{
    amountElement.value = parseFloat(amountElement.value).toFixed(2)
}

paypal.Buttons({
    createOrder: function(data, actions) {
      // This function sets up the details of the transaction, including the amount and line item details.
      return fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
          body: JSON.stringify({
            items: [
              {
                id: 1,
                quantity: 1
              }
            ],
            }),
          }).then(res => {
            if (res.ok) return res.json()
            return res.json().then(json => Promise.reject(json))
          }).then(({ id }) => { return id
          }).catch(e => {
            console.error(e.error)
          })
    },
    onApprove: function(data, actions) {
      // This function captures the funds from the transaction.
      return actions.order.capture().then(function(details) {
        // This function shows a transaction success message to your buyer.
        alert('Transaction completed by ' + details.payer.name.given_name);
      });
    }
  }).render("#paypal-button-container")
  //This function displays payment buttons on your web page.
