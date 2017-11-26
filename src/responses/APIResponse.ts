class APIResponse {
    /**
     * 错误 返回
     * @param name 错误名
     * @param message 错误信息
     */
    public static error(name: string = "unknown_error", message: string = "") {
        return {
            error: {
                name,
                message,
            },
        };
    }
    /**
     * 成功 返回
     * @param data 返回数据
     */
    public static success(data: { [key: string]: number | string | object }) {
        return data;
    }
}

export default APIResponse;
