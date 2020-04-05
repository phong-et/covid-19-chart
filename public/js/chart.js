let chart = opener.window.chart,
    data = chart.data,
    cfg = chart.cfg,
    Chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
        },
        title: {
            text: cfg.title,
        },
        subtitle: {
            text: cfg.subTitle
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category',
            title: {
                text: cfg.titleX
            }
        },
        yAxis: {
            title: {
                text: cfg.titleY
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
                    format: '{point.percent:.1f} %<br/>{point.y}'
                }
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.percent:.1f} %</b> of total<br/>'
        // },
        tootip:false,
        series: [
            {
                name: 'Chart Statistic',
                colorByPoint: true,
                data: data
            }
        ]
    })
