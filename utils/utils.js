import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (userPassword, password) => {
  try {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
  } catch (error) {
    console.log(error);
  }
};

export const createJWT = async (id) => {
  return JWT.sign(
    {
      userId: id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const getMonthName = (index) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[index];
};
