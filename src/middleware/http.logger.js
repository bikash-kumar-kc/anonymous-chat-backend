import { logger } from "../config/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  try {
    res.on("finish", () => {
      const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  
      const loggerObject = {
        method: req.method,
        url: fullUrl,
        status: res.statusCode,
        timeOfRequest: new Date(), // yyyy-mm-dd[time]hr:min:sec[timezone]
        duration: Date.now() - start,
      };

      if (res.statusCode >= 400) {
        logger.error({
          type: "HTTP_FAILURE",
          ...loggerObject,
        });
      }
      logger.info({
        type: "HTTP",
        ...loggerObject,
      });
    });

    next();
  } catch (error) {
    next(error);
  }
};
