const express = require('express')
const router = express.Router()
const paypal = require('@paypal/checkout-server-sdk')

let clientId = process.env.PAYPAL_CLIENT_ID
let clientSecret = process.env.PAYPAL_SECRET
const environment = paypal.core.LiveEnvironment

const client = new paypal.core.PayPalHttpClient(environment)

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

router.get('/', (req, res) => {
    res.render('donate', {
        paypalClientId: process.env.PAYPAL_CLIENT_ID
    })
})
const storeItems = new Map([
    [1, { priceInCents: 100, name: "Tier 1 Donation" }],
    [2, { priceInCents: 500, name: "Tier 2 Donation" }],
    [3, { priceInCents: 1000, name: "Tier 3 Donation" }],
])

router.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount:storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/donate/success`,
            cancel_url: `${process.env.SERVER_URL}/donate/cancel`
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})
router.get('/cancel', (req, res) => {
    res.render('cancel')
})

router.get('/success', (req, res) => {
    res.render('success')
})


module.exports = router