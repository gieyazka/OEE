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
        // let query = `SELECT last("status") as status FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}')  `;
        let query = `SELECT last("status") as status, last("part_name") as part_name,last("actual_rate") as actual_rate ,last("target") as target , last("planrate") as plan ,  last("part_no") as part_no FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}') `;
        let data = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${query}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };
        let getData = await axios(data);
        res.status(200).json({
            status: getData.data.results[0].series !== undefined ? getData.data.results[0].series[0].values[0][1] : '-',
            part: getData.data.results[0].series !== undefined ? (getData.data.results[0].series[0].values[0][6] === null ? "" : getData.data.results[0].series[0].values[0][6]) + " " + (getData.data.results[0].series[0].values[0][2] === null ? "" : getData.data.results[0].series[0].values[0][2]) : '-',
            actual: getData.data.results[0].series !== undefined ? getData.data.results[0].series[0].values[0][3] : '-',
            target: getData.data.results[0].series !== undefined ? getData.data.results[0].series[0].values[0][4] : '-',
            plan: getData.data.results[0].series !== undefined ? Math.round(parseInt(getData.data.results[0].series[0].values[0][5])) : '-',

            test: getData.data.results
        })

        // res.json(getstatus.data )
    }



}
