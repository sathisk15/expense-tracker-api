import { pool } from '../configs/db.js';
import { getMonthName } from '../utils/utils.js';

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
    const { userId, description, source, amount } = req.body;
    const { account_id } = req.query;

    if (!(description && source && amount)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Provide required Fields',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Amount should be greater than 0 !',
      });
    }

    const accountInfoResult = await pool.query({
      text: `SELECT * FROM tblaccount WHERE id = $1`,
      values: [account_id],
    });

    const accountInfo = accountInfoResult.rows[0];

    if (!accountInfo) {
      return res.status(404).json({
        status: 'failed',
        message: 'No Account !',
      });
    }

    if (
      accountInfo.account_balance <= 0 ||
      accountInfo.account_balance < Number(amount)
    ) {
      return res.status(403).json({
        status: 'failed',
        message: 'Transaction failed. Insufficient funds !',
      });
    }
    await pool.query('BEGIN');
    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
      values: [amount, account_id],
    });
    await pool.query({
      text: `INSERT INTO tbltransaction (user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [userId, description, 'expense', 'Completed', amount, source],
    });
    await pool.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Transaction completed successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};

export const transerMoneyToAccount = async (req, res) => {
  try {
    const { userId, fromAccountId, toAccountId, amount } = req.body;

    if (!(fromAccountId && toAccountId && amount)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Provide required Fields',
      });
    }

    const newAmount = Number(amount);

    if (Number(newAmount) <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Amount should be greater than 0 !',
      });
    }

    const fromAccountResult = await pool.query({
      text: `SELECT * FROM tblaccount WHERE id = $1`,
      values: [Number(fromAccountId)],
    });

    const fromAccount = fromAccountResult.rows[0];

    if (newAmount > fromAccount.account_balance) {
      return res.status(403).json({
        status: 'failed',
        message: 'Transer failed. Insufficient funds !',
      });
    }

    await pool.query('BEGIN');
    await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
      values: [newAmount, fromAccountId],
    });
    const toAccount = await pool.query({
      text: `UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      values: [newAmount, toAccountId],
    });

    const transactionDetails = `(${fromAccount.account_name} - ${toAccount.rows[0].account_name})`;

    await pool.query({
      text: `INSERT INTO tbltransaction (user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [
        userId,
        `Transfer ${transactionDetails}`,
        'expense',
        'Completed',
        amount,
        fromAccount.account_name,
      ],
    });

    await pool.query({
      text: `INSERT INTO tbltransaction (user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [
        userId,
        `Received ${transactionDetails}`,
        'income',
        'Completed',
        amount,
        toAccount.rows[0].account_name,
      ],
    });

    await pool.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Transfer completed successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};

export const getDashboardInformation = async (req, res) => {
  try {
    const { userId } = req.body;

    let totalIncome = 0;
    let totalExpense = 0;

    const transactionsResult = await pool.query({
      text: 'SELECT type, sum(amount) AS totalAmount FROM tbltransaction WHERE user_id = $1 GROUP BY type',
      values: [userId],
    });

    const transactions = transactionsResult.rows;

    transactions.forEach(({ type, totalamount }) => {
      if (type === 'income') totalIncome += +totalamount;
      else totalExpense += +totalamount;
    });

    const availableBalance = totalIncome - totalExpense;

    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

    const result = await pool.query({
      text: 'SELECT EXTRACT(MONTH FROM createdat) AS month, type, SUM(amount) AS totalAmount FROM tbltransaction WHERE user_id = $1 AND createdat BETWEEN $2 AND $3 GROUP BY EXTRACT(MONTH FROM createdat), type',
      values: [userId, startDate, endDate],
    });

    const data = new Array(12).fill().map((_, index) => {
      const monthData = result.rows.filter(({ month }) => +month === index + 1);

      const income =
        monthData.find((item) => item.type === 'income')?.totalamount || 0;
      const expense =
        monthData.find((item) => item.type === 'expense')?.totalamount || 0;

      return { label: getMonthName(index), income: +income, expense: +expense };
    });

    const lastTransactionsResult = await pool.query({
      text: 'SELECT * FROM tbltransaction WHERE user_id = $1 ORDER BY id DESC LIMIT 5',
      values: [userId],
    });

    const lastTransaction = lastTransactionsResult.rows;

    const lastAccountResult = await pool.query({
      text: 'SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY id DESC LIMIT 5',
      values: [userId],
    });

    const lastAccount = lastAccountResult.rows;

    res.status(200).json({
      status: 'success',
      availableBalance,
      totalIncome,
      totalExpense,
      chartData: data,
      lastTransaction,
      lastAccount,
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: error?.message,
    });
  }
};
