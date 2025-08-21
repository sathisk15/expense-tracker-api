import { pool } from '../configs/db.js';
import { hashPassword } from '../utils/utils.js';

export const getUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await pool.query({
      text: 'SELECT * FROM tbluser WHERE id = $1',
      values: [userId],
    });

    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: 'failed', message: 'No user found !' });
    }

    delete user.password;

    return res
      .status(200)
      .json({ status: 'success', message: 'User found successfully', user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'failed', message: error?.message });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { userId, confirmPassword, newPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: 'failed', message: 'Password is not same' });
    }

    const result = await pool.query({
      text: 'SELECT * FROM tbluser WHERE id = $1',
      values: [userId],
    });

    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: 'failed', message: 'No user found !' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query({
      text: `UPDATE tbluser SET password = $1 WHERE id = $2`,
      values: [hashedPassword, userId],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'failed', message: error?.message });
  }
};

export const updateUserinfo = async (req, res) => {
  try {
    const { userId, firstName, lastName, country, currency, contact } =
      req.body;
    if (!firstName) {
      return res.status(400).json({
        status: 'failed',
        message: 'Provide required fields!',
      });
    }
    const result = await pool.query({
      text: 'SELECT * FROM tbluser WHERE id = $1',
      values: [userId],
    });

    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: 'failed', message: 'No user found !' });
    }

    const updatedUser = await pool.query({
      text: `UPDATE tbluser SET firstname = $1, lastname = $2, country = $3, currency = $4, contact = $5, updatedat = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
      values: [firstName, lastName, country, currency, contact, userId],
    });
    delete updatedUser.rows[0].password;
    return res.status(200).json({
      status: 'success',
      message: 'User Details updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.log({ error });
    res
      .status(500)
      .json({ status: 'failed', error: error, message: error?.message });
  }
};
