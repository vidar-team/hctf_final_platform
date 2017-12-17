# HCTF Final Platform

HCTF 2017 线下赛平台后端。仅提供有限支持。

已知问题：运行一段时间后会因为`redis`连接`client`超过上限而崩溃。

## Deployment

1. Installing dependencies
```bash
npm install
npm install -g typescript
```

2. Compiling TypeScript
```bash
npm run build
```

3. Starting Server
```bash
node ./dist/index.js
node ./dist/messageServer.js
```
Or using pm2:

```bash
pm2 start ./pm2.config.js
```

## Setup database

仅需要一个`Redis`服务器。

修改 `./src/scripts/inital.ts` 中配置并运行，别忘了编译`TypeScript`。

该脚本会生成用户、设定Token、生成Flag。

Flag由回合数、队伍名、题目名连接后加盐做`SHA256`哈希生成，记得换盐。