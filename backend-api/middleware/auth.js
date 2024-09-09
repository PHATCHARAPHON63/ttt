// const jwt = require('jsonwebtoken')


// exports.auth = async (req, res, next) => {
//     try {
//         //code
//         const token = req.headers["authtoken"]
//         if (!token) {
//             return res.status(401).send('No token')
//         }
//         const decoded = jwt.verify(token, 'jwtsecret')
//         req.user = decoded.user
        
//         next();
//     } catch (err) {
//         // err
//         console.log(err)
//         res.send('Token Invalid').status(500)
//     }
// }
const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};