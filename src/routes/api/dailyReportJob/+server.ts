import { CronJob } from "quirrel/sveltekit";

const cronJob = CronJob(
  "api/dailyReportJob", // the route that it's reachable on
  "1 * * * *", // every 5 min. // "0 8 * * *", // every day at 8AM. you can also write @weekly or @daily!
  async () => {
    console.log('email triggered')
  }
);

export const POST = cronJob;
export default cronJob; 