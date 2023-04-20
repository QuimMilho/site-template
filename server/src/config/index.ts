import fs from "fs";
import { Logger } from "../Logger";

export interface Configuration {
    server: ServerConfiguration;
    db: DatabaseConfiguration;
}

export interface ServerConfiguration {
    url: string;
    port: number;
    https: boolean;
}

export interface DatabaseConfiguration {
    user: string;
    host: string;
    database: string;
    port: number;
    password: string;
}

export class Config {
    private config: Configuration;
    private configPath: string;
    private logger: Logger;

    constructor(configPath: string, logger: Logger) {
        this.configPath = configPath;
        this.logger = logger;
    }

    // Config verifications

    private verifyString(str: string, min?: number, max?: number): boolean {
        if (!str) return false;
        return str.length !== 0 && min
            ? str.length >= min
            : true && max
            ? str.length <= max
            : true;
    }

    private verifyNumber(
        num: number,
        property?: ("negative" | "positive" | "zero" | "nonzero")[],
        min?: number,
        max?: number
    ): boolean {
        if (!num) return false;
        if (property.includes("negative") && num > 0) return false;
        if (property.includes("nonzero") && num === 0) return false;
        if (property.includes("zero") && num !== 0) return false;
        if (property.includes("positive") && num < 0) return false;
        if (min && num < min) return false;
        if (max && num > max) return false;
        return true;
    }

    private verifyServerConfig(): boolean {
        if (!this.verifyString(this.config.server.url, 5)) return false;
        if (
            !this.verifyNumber(this.config.server.port, ["positive", "nonzero"])
        )
            return false;
        return true;
    }

    private verifyDatabaseConfig(): boolean {
        if (!this.verifyString(this.config.db.database, 1)) return false;
        if (!this.verifyString(this.config.db.host, 5)) return false;
        if (!this.verifyString(this.config.db.password, 4)) return false;
        if (!this.verifyString(this.config.db.user, 1)) return false;
        if (!this.verifyNumber(this.config.db.port, ["nonzero", "positive"]))
            return false;
        return true;
    }

    //Correction Methods

    correctConfig(
        errors: ("ok" | "no" | "server" | "db")[]
    ) {
        if (errors.includes("server")) {
            this.logger.error("Invalid Server's config!");
            this.configureServer();
        }
        if (errors.includes("db")) {
            this.logger.error("Invalid Database's config!");
            this.configureDatabase();
        }
    }

    //Verify whole config

    verifyConfig(): ("ok" | "no" | "server" | "db")[] {
        if (!fs.existsSync(this.configPath)) return ["no"];
        this.load();
        const err: ("ok" | "no" | "server" | "db")[] = [];
        if (!this.verifyServerConfig()) err.push("server");
        if (!this.verifyDatabaseConfig()) err.push("db");
        if (err.length === 0) err.push("ok");
        return err;
    }

    //Setup initial config

    configure() {
        this.config = {
            db: { database: "", host: "", password: "", port: 0, user: "" },
            server: { https: false, port: 80, url: "" },
        };
        this.logger.info("Starting server configuration!");
        this.logger.info("Configure server's info");
        this.configureServer();
        this.logger.info("Configure database's info");
        this.configureDatabase();
        this.save();
    }

    private configureServer() {
        let url = this.logger.getInfo(
            "Insert server url [http://localhost:3000]"
        );
        if (url.length === 0) {
            url = "http://localhost:3000";
            this.logger.info("Using default server url");
        }
        let port = this.logger.getInfo("Insert server port [3000]");
        if (port.length === 0) {
            port = "3000";
            this.logger.info("Using default server port");
        }
        const httpsStr = this.logger.getInfo("HTTPS? [y/N]");
        let https: boolean;
        if (httpsStr.length === 0) {
            this.logger.info("Using http server protocol");
            https = false;
        } else if (httpsStr === "Y" || httpsStr === "y") {
            https = true;
        } else {
            https = false;
        }
        this.config.server = { https, port: parseInt(port), url };
    }

    private configureDatabase() {
        let host = this.logger.getInfo("Insert database host url [localhost]");
        if (host.length === 0) {
            host = "localhost";
            this.logger.info("Using default database host url");
        }
        let port = this.logger.getInfo("Insert database port [3306]");
        if (port.length === 0) {
            port = "3306";
            this.logger.info("Using default database port");
        }
        let database = this.logger.getInfo("Insert database name [server]");
        if (database.length === 0) {
            database = "server";
            this.logger.info("Using default database name");
        }
        let user = this.logger.getInfo("Insert database username [server]");
        if (user.length === 0) {
            user = "server";
            this.logger.info("Using default database username");
        }
        let password = this.logger.getInfo("Insert database password");
        this.config.db = {
            database,
            host,
            password,
            user,
            port: parseInt(port),
        };
    }

    //Load and Save configs

    load() {
        this.logger.info("Loading server configuration!");
        this.config = JSON.parse(fs.readFileSync(this.configPath).toString());
    }

    save() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4));
    }

    //Getters

    getDatabaseConfig(): DatabaseConfiguration {
        return this.config.db;
    }

    getServerConfig(): ServerConfiguration {
        return this.config.server;
    }
}

export default Config;
