const notFound = (req, res, next) => {
  res.status(404).send({ success: false, message: `Route ${req.originalUrl} not found` });
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).send({ success: false, message: err.message || "Server Error" });
};

const handleMulterError = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE")
    return next(createError(400, "File too large. Maximum size exceeded."));
  if (err.code === "LIMIT_UNEXPECTED_FILE")
    return next(createError(400, `Unexpected field: ${err.field}`));
  next(err);
};

module.exports = { notFound, errorHandler, handleMulterError };