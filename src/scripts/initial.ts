/**
 * 初始化程序脚本
 */
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as redis from "redis";

const challengeNames = ["中文", "c2"];  // 题目名列表
const teamNames = ["Team1", "Team2", "Team3"]; // 队伍名列表
const startTime = new Date("2017-12-16 08:00:00"); // 比赛开始时间
const endTime = new Date("2017-12-16 20:00:00"); // 比赛结束时间
const flagRefreshInterval = 15 * 60 * 1000; // Flag 刷新间隔 毫秒

const redisClient = redis.createClient();

let nowStep = 0;
const totalStep = 5;

const checkFinish = () => {
    if (nowStep === totalStep) {
        console.log(`初始化在 ${new Date().valueOf() - initialStartTime.valueOf()} ms 内完成`);
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
                for (let t = startTime.valueOf(); t < endTime.valueOf(); t += flagRefreshInterval) {
                    const flag = crypto.randomBytes(32).toString("hex");
                    // tslint:disable-next-line:max-line-length
                    await insertFlag(flag, teamName, challengeName, new Date(t + 1).toISOString(), new Date(t + flagRefreshInterval).toISOString());
                }
            }
        }
        resolve();
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

if (teamNames.length > 0) {
    for (const teamName of teamNames) {
        const password = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"));
        const token = crypto.randomBytes(32).toString("hex");
        redisClient.hget("name.team.mapping", teamName, (hgetError, result) => {
            if (result !== null) {
                console.log("有队伍名已经被注册");
            } else {
                redisClient.incr("teams:count", (incrError, teamId) => {
                    redisClient.hmset(`team:${teamId}`, {
                        name: teamName,
                        password,
                        token,
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
} else {
    console.log(`初始化队伍数据完成 [${++nowStep} / ${totalStep}]`);
    checkFinish();
}
