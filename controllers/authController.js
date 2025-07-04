import { pool } from '../configs/db.js';
import { comparePassword, createJWT, hashPassword } from '../utils/utils.js';

export const signUpUser = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    if (!(firstName && email && password)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Provide required fields!',
      });
    }

    const userExist = await pool.query({
      text: 'SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)',
      values: [email],
    });

    if (userExist.rows[0].exists) {
      return res.status(404).json({
        status: 'failed',
        message: 'Email is already exists. Try Login',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await pool.query({
      text: `INSERT INTO tbluser (firstname, email, password) VALUES ($1, $2, $3) RETURNING *`,
      values: [firstName, email, hashedPassword],
    });

    delete user.rows[0].password;

    res.status(201).json({
      status: 'success',
      message: 'User Account created successfully',
      user: user.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'failed', message: error?.message });
  }
};

export const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query({
      text: 'SELECT * FROM tbluser WHERE email = $1',
      values: [email],
    });

    const user = result?.rows[0];

    if (!user?.email) {
      return res.status(404).json({
        status: 'failed',
        message: 'No user found. Please Sign up !',
      });
    }
    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 'failed', message: 'Invalid Password !' });
    }
    const token = await createJWT(user?.id);

    delete user.password;

    res.status(200).json({
      status: 'success',
      message: 'Loggin Successfull !',
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'failed', message: error?.message });
  }
};

// const signInUser = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ status: 'failed', message: error?.message });
//   }
// };
