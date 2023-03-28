import { Express } from "express-serve-static-core";
import express, { Request, Response } from "express";
import apiRouter from "./api";
import https from "https";
import fs from "fs";
import { Logger } from "../Logger";
import { ServerConfiguration } from "../config";

export class Server {
    private app: Express;
    private publicPath: string;
    private certsPath: string;
    private logger: Logger;
    private config: ServerConfiguration;

    constructor(config: ServerConfiguration, certsPath: string, logger: Logger) {
        this.publicPath = `${process.cwd()}/public`;
        this.certsPath = certsPath;
        this.logger = logger;
        this.config = config;
    }

    start() {
        this.app = express();

        if (!fs.existsSync(this.publicPath)) {
            this.logger.error("No public directory! Creating...");
            fs.mkdirSync(this.publicPath);
        }
        if (this.config.https && !fs.existsSync(this.certsPath)) {
            this.logger.error("No certs directory! Creating...");
            fs.mkdirSync(this.certsPath);
            this.logger.error(
                "Please copy the certificates to the following directory:"
            );
            this.logger.info(`${this.certsPath}`);
            this.logger.error("Consider this a crash!");
            process.exit(1);
        }

        if (
            this.config.https &&
            !fs.existsSync(`${this.certsPath}/ssl.pem`) &&
            !fs.existsSync(`${this.certsPath}/key.pem`)
        ) {
            this.logger.error(
                "Certificates not found! Please copy the certificates to the following directory:"
            );
            this.logger.info(`${this.certsPath}`);
            this.logger.info(
                `The certificates must be called ssl.pem and key.pem`
            );
            this.logger.error("Consider this a crash!");
            process.exit(1);
        }
        if (this.config.https && !fs.existsSync(`${this.certsPath}/ssl.pem`)) {
            this.logger.error(
                "Certificate ssl.pem not found! Please copy the certificate to the following directory:"
            );
            this.logger.info(`${this.certsPath}`);
            this.logger.info(`The certificates must be called ssl.pem`);
            this.logger.error("Consider this a crash!");
            process.exit(1);
        }
        if (this.config.https && !fs.existsSync(`${this.certsPath}/key.pem`)) {
            this.logger.error(
                "Certificate key.pem not found! Please copy the certificate to the following directory:"
            );
            this.logger.info(`${this.certsPath}`);
            this.logger.info(`The certificates must be called key.pem`);
            this.logger.error("Consider this a crash!");
            process.exit(1);
        }

        this.logger.info(
            `Starting server on ${this.config.https ? "https" : "http"}://localhost:${
                this.config.port
            }`
        );
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use("/api", apiRouter);
        this.app.get("/", (req, res) => this.sendIndexHTML(req, res));
        this.app.get(
            "*",
            (req, res, next) => this.sendPublicFiles(req, res, next),
            (req, res) => this.sendIndexHTML(req, res)
        );

        if (this.config.https) this.startHTTPS(this.config);
        else this.startHTTP(this.config);
    }

    private startHTTPS(conf: ServerConfiguration) {
        const certs = {
            cert: fs.readFileSync(`${this.certsPath}/ssl.pem`),
            key: fs.readFileSync(`${this.certsPath}/key.pem`),
        };
        https
            .createServer(certs, this.app)
            .listen(this.config.port, () => {
                this.logger.info(
                    `Started server on https://localhost:${conf.port}`
                );
            });
    }

    private startHTTP(conf: ServerConfiguration) {
        this.app.listen(this.config.port, () =>
            this.logger.info(
                `Started server on http://localhost:${conf.port}`
            )
        );
    }

    private sendPublicFiles(req: Request, res: Response, next: Function) {
        const path = `${this.publicPath}${req.originalUrl}`;
        if (!fs.existsSync(path)) return next();
        res.status(200).sendFile(path);
    }

    private sendIndexHTML(req: Request, res: Response) {
        res.sendFile(`${this.publicPath}/index.html`);
    }
}

export default Server;
