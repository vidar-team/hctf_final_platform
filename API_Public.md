# API 参考

平台所有需要`POST`请求的接口，参数请使用`application/x-www-form-urlencoded`编码，将参数包含在 URL 中将不起作用！

## 提交 Flag

`POST http://192.168.1.107:3000/Flag/submit`

**参数说明**

| 参数名 | 参数类型 | 参数说明 | 备注 |
| -----|-----|-----| --- |
| token | string | 队伍 Token | 必须 |
| flag | string | Flag  | 必须 |

**成功返回示例**

```json
{
    "teamName": "Team06",
    "challengeName": "HYPERION",
    "validFrom": "2017-12-01T14:00:00.001Z",
    "validUntil": "2017-12-21T14:15:00.000Z"
}
```

**成功返回参数说明**

| 参数名 | 参数类型 | 参数说明 | 备注 |
| ---- | ----| -----| --- |
| `teamName` | string | 被攻击的队伍名 | |
| `challengeName` | string | 题目名 | |
| `validFrom` | string | 有效时间起始点 |  |
| `validUntil` | string | 有效时间结束点 | |

**失败返回示例**

```json
{
    "error": {
        "name": "duplicated_flag",
        "message": "Flag 已经提交过"
    }
}
```


**失败返回参数说明**
| 参数名 | 参数类型 | 参数说明 | 备注 |
| ---- | ----| -----| --- |
| `error.name` | string | 错误名 | |
| `error.message` | string | 错误详细说明 | |


## 查询题目状态

`GET http://192.168.1.107:3000/Team/status?token={token}`

**参数说明**

| 参数名 | 参数类型 | 参数说明 | 备注 |
| -----|-----|-----| --- |
| token | string | 队伍 Token | 必须 |

**成功返回示例**

```
[
    {
        "challengeName": "HYPERION",
        "status": "up"
    }
]
```

**成功返回参数说明**

| 参数名 | 参数类型 | 参数说明 | 备注 |
| ---- | ----| -----| --- |
| `challengeName` | string | 题目名 | |
| `status` | string | 状态 | `up`表示服务正常，`down`表示服务不正常|