const puppeteer = require('puppeteer'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    util = require('util'),
    log = console.log;
//const readFile = util.promisify(fs.readFile);

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
async function getTableNow() {
    const url = 'https://www.worldometers.info/coronavirus/'
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    let bodyHtml = await page.evaluate(() => document.body.innerHTML);
    //log(bodyHtml)
    writeFile('body.html', bodyHtml)
    await browser.close();
    genHtmlTableNowToJson(bodyHtml)
}
var json = {
    "20200403": {
        usa: {
            totalCases: 1234,
            newCases: 123,
            totalDeaths: 112,
            newDeaths: 1,
            totalRecovered: '',
            activeCases: 123,
            seriousCritical: 12,
            totalCasesPer1MPop: 12,
            deathsPer1MPop: 123,
        },
        spain: {

        }
    }
}
function writeFile(fileName, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, content, function (err) {
            if (err) reject(err)
            var statusText = 'write file > ' + fileName + ' success'
            log(statusText)
            resolve(statusText)
        })
    })
}
async function genHtmlTableNowToJson(htmlPage) {
    let jsonWorld = {}
    let jsonCountry = {}
    htmlPage = await readFile('body.html')
    //log(htmlPage)
    let $ = cheerio.load(htmlPage)
    let rows = $('#main_table_countries_today tr[class=odd]')
    for (let i = 0; i < rows.length; i++) {
        //let row0 = cheerio.load(rows.eq(4).html().trim(), { xmlMode: true })
        let row = cheerio.load(rows.eq(i).html().trim(), { xmlMode: true })
        jsonCountry = genHtmlRowTableNowToJson(row.html().trim())
        jsonWorld = Object.assign(jsonWorld, jsonCountry)
    }
    log(jsonWorld)

    let d = new Date(),
        y = d.getFullYear(),
        m = (d.getMonth() + 1),
        day = d.getDay(),
        h = d.getHours()
    fileName = `${y}_${m >= 10 ? m : '0' + m}_${day >= 10 ? day : '0' + day}_${h >= 10 ? h : '0' + h}H.json`
    writeFile(fileName, JSON.stringify(jsonWorld))
}
function genHtmlRowTableNowToJson(strHtmlRow) {
    let $ = cheerio.load(strHtmlRow, { xmlMode: true })
    //log($('td').length)
    //log($('td').eq(0).html())
    let jsonRow = {},
        // name country
        rowKeyName = $('td').eq(0).text().trim().replace(/\s+|\n|-|\./g, '_').toLowerCase().replace('__', '_'),
        jsonKeyValue = {
            totalCases: +$('td').eq(1).text().replace(',', ''),
            newCases: +$('td').eq(2).text().replace(',', ''),
            totalDeaths: +$('td').eq(3).text().replace(',', ''),
            newDeaths: +$('td').eq(4).text().replace(',', ''),
            totalRecovered: +$('td').eq(5).text().replace(',', ''),
            activeCases: +$('td').eq(6).text().replace(',', ''),
            seriousCritical: +$('td').eq(7).text().replace(',', ''),
            totalCasesPer1MPop: +$('td').eq(8).text().replace(',', ''),
            deathsPer1MPop: +$('td').eq(9).text().replace(',', ''),
        }
    jsonRow[rowKeyName] = jsonKeyValue
    //log(jsonRow)
    return jsonRow

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
