const router = require("express").Router();
const { body, oneOf, validationResult } = require('express-validator');
const { DBconnection } = require("../config/database");

router.get('/', (req, res) => {
    const errors = [];
    res.render('donations', {
        title: "Donate",
        style: "donations",
        errors
    });
});

router.post('/', [
    body('fullname', 'Fullname must only contain letters and spaces').custom((value => value.match(/^[A-Za-z ]+$/))),
    body('fullname', 'Full Name must be between 5 and 50 characters long').isLength({ min: 2, max: 50 }),
    body('fullname', 'Full Name must be entered').notEmpty(),
    body('country', 'You must choose a country').notEmpty(),
    body('address', 'Address must not be empty').notEmpty(),
    body('address', 'Make sure your address is correct').isLength({ min: 5, max: 100 }),
    body('zipCode', 'Please enter a valid ZIP Code').isLength({ min: 5, max: 5 }),
    body('email', 'Email not valid').isEmail(),
    body('donation_amount', 'Please choose a donation amount').notEmpty(),
    body('payment_method', 'Please choose a payment method').notEmpty(),
    oneOf([
        [
            body('credit_number', "Card number is required").notEmpty(),
            body('credit_expiration', "Expiration date is required").notEmpty(),
            body('credit_cvv', "CVV is required").notEmpty(),
            body('credit_number', "Please enter a valid card number").isLength({ min: 16, max: 16 }),
            body('credit_expiration', "Please enter a valid expiration date").custom(value =>
                value.match(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)
            ),
            body('credit_cvv', "Please enter a valid CVV").isLength({ min: 3, max: 3 }),
        ],
        body('payment_method').equals('paypal'),
    ], "Please fill out all fields of your card details"),
    body('checkTerms', 'You must agree to the terms and conditions').isIn(['terms&conditions'])
], (req, res) => {
    console.log(req.body);
    let errors = validationResult(req).errors;
    const {
        fullname,
        country,
        address,
        zipCode,
        email,
        donation_amount,
        credit_number,
        credit_expiration,
        credit_cvv,
        payment_method
    } = req.body;

    if (email == '')
        errors = errors.filter(err => err.param !== 'email');

    if (zipCode == '')
        errors = errors.filter(err => err.param !== 'zipCode');

    console.log(errors);
    if (errors.length)
        return res.render('donations', {
            title: 'Donate',
            style: 'donations',
            fullname,
            country,
            address,
            zipCode,
            email,
            donation_amount,
            credit_number,
            credit_expiration,
            credit_cvv,
            payment_method,
            errors
        });

    const query = `INSERT INTO dbproject.donation VALUES (${donation_amount}, '${payment_method}', '${fullname}', '${country}', '${address}', ${zipCode !== '' ? zipCode : null}, '${email !== '' ? email : null}' );`;
    DBconnection.query(query, err => {
        if (err) return console.error(err);
        if (email !== '')
            DBconnection.query(`SELECT `)
        req.flash('success', `Thank you for your kind donation and support ${fullname}`);
        res.redirect('back');
    });
});

module.exports = router;