import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    const { site, line, area } = req.query;
    if (req.method === "GET") {
        let query = `SELECT last("status") FROM "Performance" WHERE ("Area" = '${(area as string).toUpperCase()}') AND  ("Site" = '${(site as string).toUpperCase()}') AND  ("Line" = '${(line as string).toUpperCase()}') AND time >= now() - 10s AND time <= now() GROUP BY time(1s) fill(none)`;
        let status = {
            method: "post",
            url: `http://10.20.10.209:8086/query?db=smart_factory&q=${query}`,
            headers: {
                Authorization:
                    "Token 4GES3Ky0_YZujUlsEEwpJ3lXdlqkfSyOJShxy9LOOE6FvDpQUZexbPmivibaFY8yeGQVbHEMvkQNFfzcWeuNNg==",
            },
        };

        let getstatus = await axios(status);
        res.json(getstatus.data )
    }
 


}
