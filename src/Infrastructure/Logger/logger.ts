import winston from 'winston'
import {SeqTransport} from "@datalust/winston-seq";

const transports = [
    new winston.transports.Console(),
    new SeqTransport({
        serverUrl: process.env.SEQ_URL || "http://seq:5341",
        onError: (e => { console.error("[SEQ LOGGER ERROR]", e.message); }),
        handleExceptions: true,
        handleRejections: true,
    })
]

const Logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(  /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    defaultMeta: {application: "webapi hestia"},
    transports,
})

export default Logger

