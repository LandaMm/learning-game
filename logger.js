const winston = require("winston");

const customFormat = winston.format.printf((info) => {
  const { level, message, label, timestamp, ...meta } = info;
  const splat = meta[Symbol.for("splat")];
  return `${timestamp} [${label}] ${level}: ${message} ${
    splat ? JSON.stringify(splat) : ""
  }`;
});

const loggerConfiguration = (label = "custom") => ({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.label({ label: label }),
    customFormat,
  ),
  meta: true,
  colorize: true,
  transports: [
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
