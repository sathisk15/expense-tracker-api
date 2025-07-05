import { pool } from '../configs/db.js';

export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.body;
    const { df, dt, s } = req.query;

    const formatDBDate = (date) => date.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sevenDaysAgo = new Date(tomorrow);
    sevenDaysAgo.setDate(tomorrow.getDate() - 7);
    
    const startDate = formatDBDate(df || sevenDaysAgo);
    const endDate = formatDBDate(dt || tomorrow);

    const transactionQueryResult = await pool.query({
      text: `SELECT * FROM tbltransaction 
WHERE user_id = $1 
  AND createdat BETWEEN $2 AND $3 
  OR (
    description ILIKE '%' || $4 || '%' 
    OR status ILIKE '%' || $4 || '%' 
    OR source ILIKE '%' || $4 || '%'
  ) 
ORDER BY id DESC`,
      values: [userId, startDate, endDate, s],
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
      status: 'failed',
      message: 'No Transactions found !',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { userId, description, source, amount, type } = req.body;
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};
