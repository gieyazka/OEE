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


let where = ` ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}')  AND time >= ${startTime}ms and time <= now() `
        let queryOee = `SELECT SUM(A) * SUM(P) FROM (SELECT SUM("runTime") / SUM("totalTime") as A FROM (SELECT last("execute")  -(- last("idle"))  AS runTime , last("executein") -(- last("idlein"))  -(- last("stoppedin")) - last(plan_downtime) as totalTime FROM "Performance" WHERE ${where} GROUP BY time(1s) fill(previous))) , (SELECT last(accumulator) / SUM(Runtime) as P FROM (SELECT SUM("acc") as accumulator FROM (SELECT last("accumulator") as acc FROM "Performance" WHERE accumulator > 0 AND ${where}  GROUP BY time(10s) fill(none))) , (SELECT (SUM("totalTime") / last("cycleTime")) as Runtime FROM (SELECT last("execute") as totalTime , last("planned_rate")  as cycleTime FROM "Performance" WHERE ${where} GROUP BY time(1s) fill(previous))))
        `;
        // let queryOee = `SELECT sum("execute") -(- sum("idle")) -(- sum("stopped")) FROM (SELECT last("execute") as execute, last("idle") as idle , last(stopped) as stopped , last("plan_downtime") as pd FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}')  AND time >= ${startTime}ms and time <= now() GROUP BY time(1s) fill(previous))`;
  
        // console.log(queryOee);

        let dataOee = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${queryOee}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };

        let getOee = await axios(dataOee);
        res.status(200).json({
            oee: getOee.data.results[0].series !== undefined ? !getOee.data.results[0].series[0].values[0][1]? "N/A" : Math.round(getOee.data.results[0].series[0].values[0][1] * 100 ) : '-',

            test: getOee.data.results
        })

        // res.json(getstatus.data )
    }



}
