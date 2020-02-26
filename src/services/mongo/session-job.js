const mongoose = require('mongoose');

const { CustomHttpError } = require('../../errors');

const createSession = async () => await mongoose.startSession();
 
const sessionJob = async (session, jobs) => {
  session.startTransaction();
  try {
    jobs.forEach(async job => {
      await job;
    });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new CustomHttpError('Something went wrong', 500);
  } finally {
    session.endSession();
  }
};

module.exports.createSession = createSession;
module.exports.sessionJob = sessionJob;
