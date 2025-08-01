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

export const createAccount = async (req, res) => {
  try {
    const { userId, name, amount, account_number } = req.body;

    const accountExistQuery = {
      text: 'SELECT * FROM tblaccount WHERE account_name = $1 and user_id = $2',
      values: [name, userId],
    };

    const accountExistResult = await pool.query(accountExistQuery);

    const isAccountExist = accountExistResult.rows[0];

    if (isAccountExist) {
      return res
        .status(409)
        .json({ status: 'failed', message: 'Account already created' });
    }

    const createAccountResult = await pool.query({
      text: 'INSERT INTO tblaccount (user_id, account_name, account_number, account_balance) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [userId, name, account_number, amount],
    });

    const account = createAccountResult.rows[0];

    const userAccounts = Array.isArray(name) ? name : [name];

    const updateUserAccountQuery = await pool.query({
      text: 'UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2',
      values: [userAccounts, userId],
    });

    const description = account.account_name + ' (Initial Deposit)';

    await pool.query({
      text: 'INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [
        userId,
        description,
        'income',
        'Completed',
        amount,
        account.account_name,
      ],
    });

    res.status(201).json({
      status: 'success',
      message: account.account_name + ' Account created successfully',
      data: account,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 'failed', error: error, message: error?.message });
  }
};

export const addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const { id: accountId } = req.params;

    const newAmount = Number(amount);

    const accountInfoQuery = await pool.query({
      text: 'UPDATE tblaccount SET account_balance = (account_balance + $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      values: [newAmount, accountId],
    });

    const accountInfo = accountInfoQuery.rows[0];

    if (!accountInfo) {
      return res.status(404).json({
        status: 'failed',
        message: 'No Account found !',
      });
    }

    const description = accountInfo.account_name + ' (Deposit)';

    await pool.query({
      text: 'INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [
        userId,
        description,
        'income',
        'Completed',
        amount,
        accountInfo.account_name,
      ],
    });
    res.status(201).json({
      status: 'success',
      message: 'Transaction completed successfully',
      data: accountInfo,
    });
  } catch (error) {
    res.status(201).json({
      status: 'failed',
      message: 'Transaction failed: ' + error?.message,
    });
  }
};
