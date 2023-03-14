const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String },
		avatar: {
			type: Object,
		},
		firstName: { type: String },
		lastName: { type: String },
		birthday: { type: Date },
		gender: { type: String }, // male, female
		verify: { type: Boolean, default: false },
		balance: { type: Number, default: 0 }, // usd
		watch_balance: { type: Number, default: 0 }, // usd
		invite_balance: { type: Number, default: 0 }, // usd
		views: { type: Number, default: 0 },
		shared: { type: Number, default: 0 },
		isAdmin: { type: Boolean, default: false },
		subscriptionId: { type: String, default: null },
	},
	{
		timestamps: true,
	},
);

userSchema.pre('save', function (next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(Number(process.env.SALT_WORK_FACTOR), function (err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);
			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

const User = mongoose.model('User', userSchema);

module.exports = User;
