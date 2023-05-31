import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};


export default authenticateToken;
