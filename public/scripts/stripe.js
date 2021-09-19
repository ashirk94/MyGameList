const button = document.querySelector("#donate-stripe")
button.addEventListener('click', () => {
    fetch('/donate/create-checkout-session', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer pk_live_51JbCZFBNmTxXVxUhShKn9ICsEY1m6CkbBgFapDOFrpBh7RWn3hI7IFxf3FfxrO3Kj28qG8SOtE1oKR3LPPOokcaZ00rA4PVi6l',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            items: [
                { id: 1, quantity: 1}
            ],
        }),
    }).then(res => {
        if (res.ok) return res.json()
        return res.json().then(json => Promise.reject(json))
    }).then(({ url }) => {
        window.location = url
    }).catch(e => {
        console.error(e.error)
    })
})