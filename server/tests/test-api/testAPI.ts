import colors from "colors";

export let nbSuccess = 0;
export let nbFailed = 0;

export class Assert {

    private nbErrors: number;
    private nbTests: number;

    constructor() {
        this.nbErrors = 0;
        this.nbTests = 0;
    }

    public getNbErrors(): number {
        return this.nbErrors;
    }

    public getNbTests(): number {
        return this.nbTests;
    }

    public equal(object1: any, object2: any, message = ""): void {
        this.nbTests += 1;
        if (typeof object1 === "object" && typeof object2 === "object") {
            object1 = JSON.stringify(object1);
            object2 = JSON.stringify(object2);
        }
        if (object1 === object2) return;
        this.nbErrors += 1;
        console.log(colors.grey(`ERROR assertion: equal - ${object1} is different from ${object2} - ${message}`));
    }

    public assert(object: any, message = ""): void {
        this.nbTests += 1;
        if (object) return;
        this.nbErrors += 1;
        console.log(colors.grey(`ERROR assertion: assert - ${object} is not true - ${message}`));
    }

    // public async testOrTimeout(func: Promise<boolean>, timeout = 5000): Promise<void> {
    //     this.nbTests += 1;
    //     try {
    //         await new Promise<boolean>(async (resolve, reject) => {
    //             const id: NodeJS.Timeout = setTimeout(() => {
    //                 reject(false);
    //             }, timeout);
    //             // Test
    //             func.then((retval) => {
    //                 resolve(retval);
    //                 if (!retval) {
    //                     this.nbErrors += 1;
    //                     console.log(colors.grey(`ERROR assertion: assert - return value is false`));
    //                 }
    //                 clearTimeout(id);
    //             }).catch(reject);
    //         });
    //     } catch (e) {
    //         this.nbErrors += 1;
    //         console.log(colors.grey(`ERROR timeout - ${timeout} ms`));
    //     }
    // }

    public async testOrTimeout(func: Promise<boolean>, timeout = 5000, message = ""): Promise<void> {
        this.nbTests += 1;
        try {
            const result = await Promise.race([new Promise((resolve, reject) => setTimeout(reject, timeout)), func]);
            if (!result) {
                this.nbErrors += 1;
                console.log(colors.grey(`ERROR assertion: assert - return value is false - ${message}`));
            }
        } catch (e) {
            this.nbErrors += 1;
            console.log(colors.grey(`ERROR timeout - ${timeout} ms - ${message}`));
        }
    }

    public async timeout(func: Promise<void>, timeout = 5000, message = ""): Promise<void> {
        this.nbTests += 1;
        try {
            await Promise.race([new Promise((resolve, reject) => setTimeout(reject, timeout)), func]);
        } catch (e) {
            this.nbErrors += 1;
            console.log(colors.grey(`ERROR timeout - ${timeout} ms - ${message}`));
        }
    }

}

export const test = async (message: string, func: (assert: Assert) => Promise<void>): Promise<void> => {
    console.log();
    console.log(colors.yellow(`#### ${message} ####`));

    const assert: Assert = new Assert();
    await func(assert);
    if (assert.getNbErrors() > 0) {
        console.log(colors.red("Failed"));
        nbFailed += 1;
    } else if (assert.getNbTests() > 0) {
        console.log(colors.green("Succeed"));
        nbSuccess += 1;
    } else {
        console.log(colors.blue("No test in this section"));
    }
};
