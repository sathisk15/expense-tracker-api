export const response = (response, statusCode, status, message) => {
  return response
    .status(404)
    .json({ status: 'failed', message: 'Provide required fileds!' });
};
