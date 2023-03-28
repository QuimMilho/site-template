import fs from "fs";
import prompt from "prompt-sync";

export class Logger {
    private logsFilePath: string;

    constructor(logsPath: string) {
        this.createLogFile(logsPath);
    }

    private createLogFile(logsPath: string) {
        if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath);
        const now = new Date();
        let filePath = `${logsPath}\\${now.toDateString()}.log`;
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
        } else {
            let k = 0;
            do {
                filePath = `${logsPath}/${now.toDateString()}_${k}.log`;
                k++;
            } while (fs.existsSync(filePath));
            fs.writeFileSync(filePath, "");
        }
        this.logsFilePath = filePath;
        return this.info("Created log file!");
    }

    info(info: string) {
        const t = new Date();
        console.log(`[Info] ${info}`);
        fs.appendFileSync(
            this.logsFilePath,
            `[Info] ${t.toUTCString()}: ${info}\n`
        );
    }

    error(error: string) {
        const t = new Date();
        console.log(`[Erro] ${error}`);
        fs.appendFileSync(
            this.logsFilePath,
            `[Error] ${t.toUTCString()}: ${error}\n`
        );
    }

    getInfo(str: string) {
        const t = new Date();
        const txt = prompt()(`[Input] ${str}:`);
        fs.appendFileSync(
            this.logsFilePath,
            `[Input] ${t.toUTCString()}: ${str}: ${txt}\n`
        );
        return txt;
    }
}
