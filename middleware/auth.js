const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const { User } = require('../models/User');


const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Invalid or missing Authorization header");
        return res.status(401).json({ success: false, message: 'Invalid or missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const userObj = jwt.verify(token, process.env.TOKEN);
        const userId = userObj.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            console.log("No user found");
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};


module.exports = { authenticate };