const logAndThrowError = (errorMessage, logger) => {
  logger.error(errorMessage)
  throw new Error(errorMessage)
}

module.exports = { logAndThrowError }
