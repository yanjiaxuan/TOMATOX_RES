const fs = require('fs')
const https = require('https')
const url='https://www.kuaibozy.com/api.php/provide/vod/from/kbm3u8?ac=list&pg='
let page = 1

const finalData = {}

function queryData(curPage) {
    https.get(url + page, { timeout: 5000 }, res => {
        let result = ''
        res.on('data', data => {
            result += data
        })
        res.on("end", () => {
            let obj
            try {
                obj = JSON.parse(result)
            } catch (e) {
                console.log(`>>>>>>>>>>>>>>>>>>>> json解析失败, ${e.message}`)
                queryData(curPage)
                return
            }
            obj.list.forEach(item => {
                finalData[item.vod_name] = item.vod_id
            })
            console.log(`第${curPage}页数据写入完成，当前最大页: ${page}`)
            if (page < obj.pagecount + 10) {
                page++
                queryData(page)
            } else if (page === obj.pagecount + 10) {
                const oldRes = JSON.parse(fs.readFileSync('./result.json', {encoding: "utf-8"}))
                const newRes = {
                    ...oldRes,
                    ...finalData
                }
                fs.writeFileSync('./result.json', JSON.stringify(newRes), {encoding: "utf-8"})
                console.log('写入完成')
                process.exit(0)
            }
        })
    }).on("error", e => console.log(e.message))
}

queryData(page);
