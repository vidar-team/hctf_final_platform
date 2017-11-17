class APIResponse {
    public static error(name: string = "unknown_error", message: string = "") {
        return {
            error: {
                name,
                message,
            },
        };
    }
    public static success(data: { [key: string]: string }) {
        return data;
    }
}

export default APIResponse;
