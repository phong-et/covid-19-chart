let log = console.log
$().ready(function () {
    let options = {
        format: 'dd/mm/yyyy',
        setDate: new Date(),
        defaultViewDate: new Date(),
        autoclose: true,
        todayHighlight: true,
    }
    $('#datepickerReview').datepicker(options).datepicker("setDate", 'now')

    $('#btnResize').click(function () {
        let width = $('#txtWidth').val()
        $('#container').width(width ? width : '100%')
        Chart.reflow();
    });

    $('#btnViewChart').click(function () {
        let caseType = $('#ddlCaseType option:selected'),
            condition = caseType.val(),
            fileName = genFileName($('#datepickerReview').datepicker('getDate'))

        chartTitle = caseType.text()
        loadData(fileName, data => {
            drawChart(mutateDataByCondition(data, condition))
        })
        Chart.reflow();
    });

    // load chart as default conditions
    loadData(genFileName(new Date()), data => {
        drawChart(mutateDataByCondition(data, 'newCases'))
    })
})
//date is a Date() object
function genFileName(date) {
    y = date.getFullYear(),
        m = (date.getMonth() + 1),
        day = date.getDate()
    return `${y}${m >= 10 ? m : '0' + m}${day >= 10 ? day : '0' + day}.json`
}
function loadData(fileName, callback) {
    $.getJSON('data/' + fileName, function (json) {
        //log(json)
        callback(json)
    })
}
/**
 * @param {*} data input format :
 * {
 *   "usa":[0,1,2,3,4,5,6,7,8,9]
 * }
 * @param {*} condition has 10 condition :
 *  //totalCases: 
    //newCases: 
    //totalDeaths: 
    //newDeaths: 
    //totalRecovered: 
    //activeCases: 
    //seriousCritical: 
    //totalCasesPer1MPop: 
    //deathsPer1MPop: 
    //totalTests: 
    //testsPer1MPop: 
 */
function mutateDataByCondition(data, condition) {
    let mutatedData = [],
        indexCondition = 0
    switch (condition) {
        case 'totalCases': indexCondition = 0; break
        case 'newCases': indexCondition = 1; break
        case 'totalDeaths': indexCondition = 2; break
        case 'newDeaths': indexCondition = 3; break
        case 'totalRecovered': indexCondition = 4; break
        case 'activeCases': indexCondition = 5; break
        case 'seriousCritical': indexCondition = 6; break
    }
    let countries = data
    var sum = countries["world"][indexCondition]
    for (var countryName in countries) {
        var number = countries[countryName][indexCondition]
        if (number > 0)
            mutatedData.push({
                name: countryName.toUpperCase().replace(/_/g, ' '),
                y: number,
                percent: countryName === 'world' ? 100 : (number / sum) * 100
            })
    }
    log(mutatedData)
    return sort(mutatedData).reverse()
}
function sort(array, order) {
    return _u.orderBy(array, ['y'], [order ? 'asc' : order])
}
let Chart,
    chartTitle,
    chartSubTitle
log(chartTitle)
function drawChart(data) {
    Chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
        },
        title: {
            text: chartTitle ? 'Ca Nhiễm Mới' : chartTitle,
        },
        subtitle: {
            text: chartSubTitle
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Quốc gia'
            }
        },
        yAxis: {
            title: {
                text: 'Số người'
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.percent:.2f}%<br/>{point.y}'
                }
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.percent:.1f} %</b> of total<br/>'
        // },
        tootip: false,
        series: [
            {
                name: 'Chart Statistic',
                colorByPoint: true,
                data: data
            }
        ]
    })
}
