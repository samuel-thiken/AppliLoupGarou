import moment from "moment";

export default class Logger {

    private name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public log(message: string): void {
        console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] [${this.name}] - ${message}`);
    }

}
