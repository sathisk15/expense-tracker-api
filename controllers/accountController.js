import { pool } from '../configs/db.js';

export const getAccounts = async (req, res) => {
  try {
    const { userId } = req.body;
    const accounts = await pool.query({
      text: 'SELECT * FROM tblaccount WHERE user_id = $1',
      values: [userId],
    });
    res.status(200).json({
      status: 'success',
      message: 'User Accounts',
      data: accounts.rows,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 'failed', error: error, message: error?.message });
  }
};
