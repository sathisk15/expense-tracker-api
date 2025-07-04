import { pool } from '../configs/db.js';

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
