import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    const { site, line, area } = req.query;


    if (req.method === "GET") {
        let query = `SELECT last("status") FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}') AND time >= now() - 10s AND time <= now() GROUP BY time(1s) fill(none)`;
        let status = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${query}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };

        let getstatus = await axios(status);


        let queryPart = `SELECT last("part_name") FROM "Performance"  WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site)}') AND  ("Line" = '${(line)}') AND time >= now() - 10s AND time <= now() GROUP BY time(1s) fill(none)`;

        // let queryPart = `SELECT last("part_name") FROM "Performance" WHERE ("Area" = '${(area)}') AND  ("Site" = '${(site as string)}') AND  ("Line" = '${(line as string)}') AND time >= now() - 10s AND time <= now() GROUP BY time(1s) fill(none)`;
        let part = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${queryPart}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };

        let getPart = await axios(part);
        
        res.status(200).json({
            status: getstatus.data.results[0].series !== undefined ? getstatus.data.results[0].series[0].values[0][1] : 'No data',
            part: getPart.data.results[0].series !== undefined ? getPart.data.results[0].series[0].values[0][1] : 'No data'
        })

        // res.json(getstatus.data )
    }



}
