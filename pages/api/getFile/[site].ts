// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'

import fs from 'fs'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {

    let { site } = req.query
    site = ((site as string).toUpperCase());
    let jsonData;
    if (!fs.existsSync(`${site}.json`)) {
        fs.writeFileSync(`${site}.json`, JSON.stringify({}))
    }
    fs.readFile(`${site}.json`, 'utf8', function (err, data) {

        // Display the file content
        // console.log(JSON.parse(data));
        jsonData = JSON.parse(data)
        res.status(200).json(jsonData )
        if(err){
            res.status(400).json({ "err": 'err read file' })
            
        }
    });
    

}
