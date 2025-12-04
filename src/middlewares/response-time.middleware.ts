import responseTime from 'response-time';

export const responseTimeLogger = responseTime((req, res, time) => {
  // Optionally log with winston
  // logger.info(`[${req.id}] ${req.method} ${req.originalUrl} - ${time}ms`);
});