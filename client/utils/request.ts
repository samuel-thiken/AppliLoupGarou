export type RequestError = {
    message: string;
    status: number;
    response?: Response;
    error?: any;
};

export default function request(input: string, init?: RequestInit | undefined): Promise<Response> {
    return new Promise((resolve, reject) => {
        fetch(input, init)
            .then(async (res) => {
                if (res.ok) {
                    resolve(res);
                } else {
                    reject({
                        message: await res.text(),
                        status: res.status,
                        response: res
                    });
                }
            })
            .catch((e) => {
                console.log("Request error:", e);
                console.log(input);
                reject({
                    message: e.message,
                    status: -1,
                    error: e
                });
            });
    });
}
