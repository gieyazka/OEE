import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios';
import dayjs from 'dayjs';
import { start } from 'repl';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    const { site, line, area } = req.query;


    if (req.method === "GET") {


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
        // let queryProduce = `SELECT sum("execute") -(- sum("idle")) -(- sum("stopped")) FROM (SELECT last("execute") as execute, last("idle") as idle , last(stopped) as stopped , last("plan_downtime") as pd FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}')  AND time >= ${startTime}ms and time <= now() GROUP BY time(1s) fill(previous))`;
        // console.log(queryProduce);
        // console.log(queryProduce);

        let dataProduce = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${queryProduce}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };

        let getProduce = await axios(dataProduce);
        res.status(200).json({
            produceTime: getProduce.data.results[0].series !== undefined ? secondsToHms(parseInt(getProduce.data.results[0].series[0].values[0][1])) : 'No data',

            test: getProduce.data.results
        })

        // res.json(getstatus.data )
    }



}


function secondsToHms(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);


    var hDisplay = h == 0 ? "00" : h < 10 && h > 0 ? "0" + h.toString() : h.toString();
    var mDisplay = m == 0 ? "00" : m < 10 && m > 0 ? "0" + m.toString() : m.toString();
    var sDisplay = s == 0 ? "00" : s < 10 && s > 0 ? "0" + s.toString() : s.toString();
    // return h + ":" + m + ":" + s;
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}