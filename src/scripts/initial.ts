/**
 * 初始化程序脚本
 */
import * as redis from "redis";

const challengeNames = ["中文", "c2"];
const teamNames = [];
const startTime = new Date("2017-12-16 08:00:00");
const endTime = new Date("2017-12-16 20:00:00");

const redisClient = redis.createClient();

let nowStep = 0;
const totalStep = 3;

const checkFinish = () => {
    if (nowStep === totalStep) {
        process.exit(0);
    }
};

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
