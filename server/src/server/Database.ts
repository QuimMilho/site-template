import mariadb from "mariadb";
import { DatabaseConfiguration } from "../config";
import { Logger } from "../Logger";

export class Database {
    private pool: mariadb.Pool;
    private logger: Logger;

    constructor(config: DatabaseConfiguration, logger: Logger) {
        this.logger = logger;
        logger.info("Starting database pool");
        this.pool = mariadb.createPool({
            host: config.host,
            database: config.database,
            user: config.user,
            port: config.port,
            password: config.password,
            connectionLimit: 10,
        });
    }

    private async query(qry: string, args?: any[]) {
        const conn = await this.pool.getConnection();
        this.logger.info(
            `Queried ${qry} with${
                args ? ` args: ${this.arrayToString(args)}` : "out args"
            }`
        );
        const res = await conn.query(qry, args);
        conn.release();
        return res;
    }

    private arrayToString(array: string[], inBetween?: string) {
        let txt = "";
        for (let i = 0; i < array.length; i++) {
            if (i !== 0) {
                txt += inBetween ? inBetween : ", ";
            }
            txt += array[i];
        }
        return txt;
    }

    private equalize(columns: string[], values: any[]): string[] {
        const txt: string[] = [];
        if (columns.length !== values.length || columns.length === 0) return [];
        for (let i = 0; i < columns.length; i++) {
            txt.push(`${columns[i]} = ${values[i]}`);
        }
        return txt;
    }

    insert(table: string, columns: string[], values: any[], args?: any[]) {
        return this.query(
            `insert into ${table} (${this.arrayToString(
                columns
            )}) values (${this.arrayToString(values)});`,
            args
        );
    }

    update(
        table: string,
        columns: string[],
        values: any[],
        where?: string[],
        args?: any[]
    ) {
        const equalized = this.equalize(columns, values);
        if (equalized.length === 0) return undefined;
        return this.query(
            `update ${table} set ${this.arrayToString(equalized)} ${
                where ? `where ${this.arrayToString(where, " and ")}` : ""
            };`,
            args
        );
    }

    delete(table: string, where?: string[], args?: any[]) {
        return this.query(
            `delete from ${table} ${
                where ? `where ${this.arrayToString(where, " and ")}` : ""
            };`,
            args
        );
    }

    select(
        columns: string[],
        tables: string[],
        where?: string[],
        orderBy?: string[],
        args?: any[]
    ) {
        return this.query(
            `select ${this.arrayToString(columns)} from ${this.arrayToString(
                tables
            )} ${where ? `where ${this.arrayToString(where, " and ")}` : ""} ${
                orderBy ? `order by ${this.arrayToString(orderBy)}` : ""
            };`,
            args
        );
    }

    customQuery(qry: string, args?: any[]) {
        return this.query(qry, args);
    }
}

export default Database;
