const winston = require("winston");
const moment = require("moment");

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `${moment(info.timestamp).format("DD. MM. YYYY HH:mm:ss")} | [${info.level}] ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: "log/bot-" + moment().format("YYYY-MM-DD-HH-mm-ss") + ".log", handleExceptions: true }),
    ]
});

logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.cli(),
        winston.format.printf((info) => {
            return `${moment(info.timestamp).format("DD. MM. YYYY HH:mm:ss")} | [${info.level}] ${info.message}`;
        })
    ),
    handleExceptions: true
}));

logger.info("Logger initialized.");

module.exports = logger;
