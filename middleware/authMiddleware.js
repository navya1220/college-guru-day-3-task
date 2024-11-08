import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      console.error('Authorization header is missing');
      return res.status(401).json({ message: 'Authorization header is missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Authorization token is missing');
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateJWT middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
