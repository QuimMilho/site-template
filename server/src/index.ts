import Config from "./config";
import { Logger } from "./Logger";
import Server from "./server";
import Database from "./server/Database";

const logger = new Logger(`${process.cwd()}/logs`);

const config = new Config(`${process.cwd()}/config.json`, logger);

const verify = config.verifyConfig();
if (verify[0] === "ok") {
    config.load();
} else if (verify[0] === "no") {
    config.configure();
    config.save();
} else {
    config.correctConfig(verify);
    config.save();
}

const database = new Database(config.getDatabaseConfig(), logger);

const server = new Server(
    config.getServerConfig(),
    `${process.cwd()}/certs`,
    logger
);

async function start() {
    server.start();
}

start();

export default { logger, server, database };
