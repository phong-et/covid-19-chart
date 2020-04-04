const cheerio = require('cheerio'),
    fs = require('fs'),
    log = console.log;

async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

async function genHtmlTableNowToJson2() {
    let htmlPage = await readFile('body.html')
    //log(htmlPage)
    let $ = cheerio.load(htmlPage)
    let rows = $('#main_table_countries_today tr[class=odd]')
    log('rows.length:%s', rows.length)
    let row0 = rows.eq(0).html().trim()
    log(row0)
    let cols = cheerio.load(row0, { xmlMode: true })
    log(cols.html().trim())
    // log(rows('td').length)
}

(async function () {
    //getTableNow()
    //genHtmlTableNowToJson2('');
    genHtmlTableNowToJson()
})()
