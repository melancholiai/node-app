const mongoose = require('mongoose');

const { CustomHttpError } = require('../../errors');

const transactionOperations = async operations => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const operation of operations) {
      await operation(session); 
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new CustomHttpError('Something went wrong', 500);
  } finally {
    session.endSession();
  }
};

exports.transactionOperations = transactionOperations;
