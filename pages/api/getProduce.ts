import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios';
import dayjs from 'dayjs';
import { getInfluxServer } from '../../control/controller';
import { start } from 'repl';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    const { site, line, area } = req.query;


    if (req.method === "GET") {

        const {server,token} = getInfluxServer(site as String)

        let currentTime = dayjs()
        let currentHour: number = currentTime.hour()
        let shift = 'night'
        let startTime = (dayjs().hour(20).minute(0).second(0).valueOf().toString());
        let endTIme = (dayjs().add(1, 'day').hour(7).minute(59).second(59).valueOf().toString());
        if (currentHour < 8) {
            endTIme = (dayjs().hour(7).minute(59).second(59).valueOf().toString());
        }
        if (currentHour >= 8 && currentHour < 20) {
            shift = 'day'
            startTime = (dayjs().hour(8).minute(0).second(0).valueOf().toString());
            endTIme = (dayjs().hour(19).minute(59).second(59).valueOf().toString());
        }



        let queryProduce = `SELECT sum("lastTime") - first("firstTime") - SUM("pd") FROM (SELECT first("executein") as firstTime , last("executein") as lastTime , last("plan_downtime") as pd FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}')  AND time >= ${startTime}ms and time <= now() GROUP BY time(1s) fill(previous))`;
    

        let dataProduce = {
            method: "post",
            url: `${server}/query?db=smart_factory&q=${queryProduce}`,
            headers: {
                Authorization:
                    `Token ${token}`,
            },
        };

        let getProduce = await axios(dataProduce);
        
        res.status(200).json({
            produceTime: getProduce.data.results[0].series !== undefined ?  getProduce.data.results[0].series[0].values[0][1] != null ? secondsToHms(parseInt(getProduce.data.results[0].series[0].values[0][1]) ) : "00:00:00"  : 'No data' ,

            test: getProduce.data.results
        })

        // res.json(getstatus.data )
    }



}


function secondsToHms(d: number) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);


    const hDisplay = h === 0 ? "00" : h < 10 && h > 0 ? "0" + h.toString() : h.toString();
    const mDisplay = m === 0 ? "00" : m < 10 && m > 0 ? "0" + m.toString() : m.toString();
    const sDisplay = s === 0 ? "00" : s < 10 && s > 0 ? "0" + s.toString() : s.toString();
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}