const puppeteer = require('puppeteer'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    log = console.log,
    dataPath = 'data',
    isSaveToFile = true

async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) reject(err)
            resolve(data)
        })
    })
}
async function writeFile(fileName, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, content, function (err) {
            if (err) reject(err)
            var statusText = 'write file > ' + fileName + ' success'
            log(statusText)
            resolve(true)
        })
    })
}

async function fetchHtmlTableNow() {
    const url = 'https://www.worldometers.info/coronavirus/'
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    let bodyHtml = await page.evaluate(() => document.body.innerHTML);
    //log(bodyHtml)
    if (isSaveToFile) writeFile(genFileName(dataPath, 'body', '.html'), bodyHtml)
    await browser.close();
    return bodyHtml
}

function genFileName(path, prefixName, extentionName) {
    let d = new Date(),
        y = d.getFullYear(),
        m = (d.getMonth() + 1),
        day = d.getDate()
    return `${path}/${prefixName}_${y}_${m >= 10 ? m : '0' + m}_${day >= 10 ? day : '0' + day}${extentionName}`
}
function genHtmlTableNowToJson(htmlPage) {
    let jsonWorld = {}
    let jsonCountry = {}
    //htmlPage = await readFile('body.html')
    //log(htmlPage)
    let $ = cheerio.load(htmlPage)
    let rows = $('#main_table_countries_today tr[role=row]')
    for (let i = 1; i < rows.length; i++) {
        let row = cheerio.load(rows.eq(i).html().trim(), { xmlMode: true })
        jsonCountry = genHtmlRowTableNowToJson(row.html().trim())
        jsonWorld = Object.assign(jsonWorld, jsonCountry)
    }
    log(jsonWorld)
    writeFile(genFileName(dataPath, 'data', '.json'), JSON.stringify(jsonWorld))
}
const delComma = (obj) => obj.text().trim().replace(',', '')
function genHtmlRowTableNowToJson(strHtmlRow) {
    let $ = cheerio.load(strHtmlRow, { xmlMode: true })
    //log($('td').length)
    //log($('td').eq(0).html())
    let jsonRow = {},
        // name country
        rowKeyName = $('td').eq(0).text().trim().replace(/\s+|\n|-|\./g, '_').replace('__', '_').toLowerCase(),
        jsonKeyValue = {
            totalCases: +delComma($('td').eq(1)),
            newCases: +delComma($('td').eq(2)),
            totalDeaths: +delComma($('td').eq(3)),
            newDeaths: +delComma($('td').eq(4)),
            totalRecovered: +delComma($('td').eq(5)),
            activeCases: +delComma($('td').eq(6)),
            seriousCritical: +delComma($('td').eq(7)),
            totalCasesPer1MPop: +delComma($('td').eq(8)),
            deathsPer1MPop: +delComma($('td').eq(9)),
            totalTests: +delComma($('td').eq(10)),
            testsPer1MPop: +delComma($('td').eq(11)),
        }
    jsonRow[rowKeyName] = jsonKeyValue
    //log(jsonRow)
    return jsonRow
}
(async function () {
    let html = await fetchHtmlTableNow()
    genHtmlTableNowToJson(html)
})()
