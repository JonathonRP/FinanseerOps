import { createLogger, transports, format } from 'winston';
import winston from 'winston/lib/winston/config';
import { dev } from '$app/environment';
import { LOG_LEVEL } from '$env/static/private';

const colorizer = format.colorize();

const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		debug: 4,
	},
	colors: {
		error: 'bold red',
		warn: 'bold yellow',
		info: 'bold green',
		http: 'white',
		debug: 'bold green',
	},
};

winston.addColors(customLevels.colors);

const devFormat = format.combine(
	format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS' }),
	format.printf(({ level, message, timestamp }) => colorizer.colorize(level, `${timestamp} ${level}: ${message}`))
);

const logger = createLogger({
	levels: customLevels.levels,
	level: LOG_LEVEL ?? dev ? 'debug' : 'warn',
	format: devFormat,
	transports: [new transports.Console()],
});

export { logger };
