const User = require('../models/User');

const { Stripe } = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeCustomerAndSubscription = async (req, res) => {
	try {
		const { _id, email } = req.user.use;
		const { name_on_card, payment_method_id } = req.body;

		const customer = await stripe.customers.create({
			email,
			payment_method: payment_method_id,
			name: name_on_card,
			metadata: {
				user_id: _id,
			},
			invoice_settings: {
				default_payment_method: payment_method_id,
			},
		});

		const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);

		const paymentIntent = await stripe.paymentIntents.create({
			customer: customer.id,
			currency: 'usd',
			amount: price.unit_amount,
			payment_method_types: ['card'],
			metadata: {
				user_id: _id,
			},
			payment_method: payment_method_id,
		});

		const confirmPaymentIntent = await stripe.paymentIntents.confirm(
			paymentIntent.id,
		);

		const user = await User.findById(_id).exec();
		user.subscriptionId = paymentIntent.id;
		await user.save();

		res.status(200).json({ message: 'Subscribed', data: confirmPaymentIntent });
	} catch (error) {
		res.status(400).json({ message: error });
	}
};

module.exports = { createStripeCustomerAndSubscription };