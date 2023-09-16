const winston = require("winston");

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  },
);

const loggerConfiguration = (label = "custom") => ({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.label({ label: label }),
    customFormat,
  ),
  expressFormat: true,
  colorize: true,
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({
      filename: `logs/${label.replace(/\s+/gi, "_")}.log`,
    }),
  ],
});

const appLogger = winston.createLogger(loggerConfiguration("app"));
const ioLogger = winston.createLogger(loggerConfiguration("socket.io"));

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  [
    [appLogger, "app"],
    [ioLogger, "socket.io"],
  ].map(([logger, label]) =>
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.label({ label }),
          customFormat,
        ),
      }),
    ),
  );
}

module.exports = {
  loggerConfiguration,
  appLogger,
  ioLogger,
};
