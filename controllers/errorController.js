// controllers/errorController.js
exports.triggerServerError = (req, res, next) => {
  try {
    // Intentionally throw an error
    throw new Error('Intentional 500 Server Error');
  } catch (err) {
    err.status = 500;
    next(err);
  }
};
