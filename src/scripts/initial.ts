/**
 * 初始化程序脚本
 */
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as redis from "redis";
import Logger from "../services/Logger";

// tslint:disable-next-line:max-line-length
const challengeNames = ["HYPERION", "pwn0", "pwn1", "EASYCMS", "BIGBROTHER", "DELIVER"];  // 题目名列表
// tslint:disable-next-line:max-line-length
const teamNames = ["Team01", "Team02", "Team03", "Team04", "Team05", "Team06", "Team07", "Team08", "Team09", "Team10"]; // 队伍名列表
const startTime = new Date("2017-12-16T01:00:00.000Z"); // 比赛开始时间
const endTime = new Date("2017-12-17T06:00:00.000Z"); // 比赛结束时间
const flagRefreshInterval = 15 * 60 * 1000; // Flag 刷新间隔 毫秒
const tokens = [];

const redisClient = redis.createClient();

let nowStep = 0;
const totalStep = 7;

const checkFinish = () => {
    if (nowStep === totalStep) {
        console.log(`初始化在 ${new Date().valueOf() - initialStartTime.valueOf()} ms 内完成`);
        console.log(JSON.stringify(tokens, null, 2));
        process.exit(0);
    }
};
/**
 * 插入一个新的 Flag
 * @param flag Flag
 * @param teamName 队伍名
 * @param challengeName 问题名
 */
// tslint:disable-next-line:max-line-length
function insertFlag(flag: string, teamName: string, challengeName: string, validFrom: string, validUntil: string): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
        redisClient.hmset(`flag:${flag}`, {
            teamName,
            challengeName,
            validFrom,
            validUntil,
        }, (error) => {
            resolve();
        });
    });
}
/**
 * 生成 Flag
 */
async function generateFlags(): Promise<{}> {
    return new Promise<{}>(async (resolve, reject) => {
        for (const teamName of teamNames) {
            for (const challengeName of challengeNames) {
                let counter = 0;
                for (let t = startTime.valueOf(); t < endTime.valueOf(); t += flagRefreshInterval) {
                    counter++;
                    const sha256 = crypto.createHash("sha256");
                    sha256.update(`${counter}${challengeName}${teamName}uSXSknXXxwH9NGYx77IR06AHnKzUky0l`);
                    const flag = sha256.digest("hex");
                    // tslint:disable-next-line:max-line-length
                    await insertFlag(`hctf{${flag}}`, teamName, challengeName, new Date(t + 1).toISOString(), new Date(t + flagRefreshInterval).toISOString());
                }
            }
        }
        resolve();
    });
}
/**
 * 生成单条服务器状态记录
 * @param teamName 队伍名
 * @param challengeName 题目名
 */
async function generateServerStatus(teamName: string, challengeName: string): Promise<{}> {
    return new Promise(async (resolve, reject) => {
        redisClient.set(`status:${teamName}:${challengeName}`, "up", (error, result) => {
            resolve();
        });
    });
}

/**
 * 生成初始分记录
 * @param teamName
 */
async function generateScoreRecord(teamName: string, time: number): Promise<{}> {
    return new Promise((resolve, reject) => {
        redisClient.set(`log:public:${time.toString()}`, JSON.stringify({
            type: "team:score",
            level: 2,
            data: {
                teamName,
                inc: 50000,
                time: startTime.toISOString(),
            },
        }), (err) => {
            resolve();
        });
    });
}

const initialStartTime = new Date();

redisClient.rpush("challenges", challengeNames, (error) => {
    if (error) {
        console.log("初始化题目列表失败");
    } else {
        console.log(`初始化题目列表完成 [${++nowStep} / ${totalStep}]`);
        checkFinish();
    }
});

redisClient.set("time:start", startTime.toISOString(), (error) => {
    if (error) {
        console.log("设定开始时间失败");
    } else {
        console.log(`设定开始时间完成 [${++nowStep} / ${totalStep}]`);
        checkFinish();
    }
});

redisClient.set("time:end", endTime.toISOString(), (error) => {
    if (error) {
        console.log("设定结束时间失败");
    } else {
        console.log(`设定结束时间完成 [${++nowStep} / ${totalStep}]`);
        checkFinish();
    }
});

/**
 * 生成队伍数据
 */
if (teamNames.length > 0) {
    for (const teamName of teamNames) {
        const password = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"));
        const token = crypto.randomBytes(32).toString("hex");
        tokens.push({
            teamName,
            token,
        });
        redisClient.hget("name.team.mapping", teamName, (hgetError, result) => {
            if (result !== null) {
                console.log("有队伍名已经被注册");
            } else {
                redisClient.incr("teams:count", (incrError, teamId) => {
                    redisClient.hmset(`team:${teamId}`, {
                        name: teamName,
                        password,
                        token,
                        score: 50000,
                    }, () => {
                        redisClient.hset("name.team.mapping", teamName, teamId.toString(), () => {
                            redisClient.hset("token.teamname.mapping", token, teamName, () => {
                                if (teamName === teamNames[teamNames.length - 1]) {
                                    console.log(`初始化队伍数据完成 [${++nowStep} / ${totalStep}]`);
                                    // 生成 Flag
                                    generateFlags().then(() => {
                                        console.log(`初始化 Flag 数据完成 [${++nowStep} / ${totalStep}]`);
                                        checkFinish();
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });
    }
    (async () => {
        const nowTime = startTime.valueOf();
        let counter = 0;
        for (const teamName of teamNames) {
            await generateScoreRecord(teamName, nowTime + counter++);
        }
    })().then(() => {
        console.log(`初始化队伍初始分完成 [${++nowStep} / ${totalStep}]`);
    });
} else {
    console.log(`初始化队伍数据完成 [${++nowStep} / ${totalStep}]`);
    console.log(`初始化队伍初始分完成 [${++nowStep} / ${totalStep}]`);
    checkFinish();
}

(async () => {
    for (const challengeName of challengeNames) {
        for (const teamName of teamNames) {
            await generateServerStatus(teamName, challengeName);
        }
    }
})().then(() => {
    console.log(`初始化服务器状态数据完成 [${++nowStep} / ${totalStep}]`);
    checkFinish();
});
