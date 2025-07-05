import { pool } from '../configs/db.js';

export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.body;

    const transactionQueryResult = await pool.query({
      text: 'SELECT * FROM tbltransaction WHERE user_id = $1',
      values: [userId],
    });

    const transaction = transactionQueryResult.rows;

    if (transaction.length) {
      return res.status(200).json({
        status: 'success',
        message: 'Transactions fetched successfully',
        data: transaction,
      });
    }

    res.status(404).json({
      status: failed,
      message: 'No Transactions found !',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};
