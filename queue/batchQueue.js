import Queue  from 'bull';
import { connection } from '../redisClient.js';


export const processBatchQr = new Queue('processBatchQr', { connection });

processBatchQr.on("completed", (job) => {
    console.log("All Jobs finished", job)
})