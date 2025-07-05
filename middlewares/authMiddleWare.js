import JWT from 'jsonwebtoken';

export const authMiddleWare = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(401)
      .json({ status: 'falied', message: 'No Authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET);
    req.body.userId = userToken.userId;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ status: 'falied', message: 'Authentication Failed' });
  }
};
