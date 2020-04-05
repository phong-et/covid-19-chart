let log = console.log
function getQueryParam(name, queryString) {
    var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
    return match && decodeURIComponent(match[1]);
}
function fetchReview(productId, callback) {
    $.ajax({
        url: '/products/review/' + productId,
        type: 'GET',
        success: function (data) {
            try {
                callback(data.reviews)
            } catch (e) {
                log(e)
            }
        },
        error: function (err) {
            log(err)
        }
    });
}
function drawChart(data, categories, title, subTitle, titleY) {
    return Highcharts.chart('container', {
        chart: {
            type: 'line'
        },
        title: {
            text: title
        },
        subtitle: {
            text: subTitle
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {
                text: titleY
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Total Reviews : ' + _u.sum(data),
            data: data
        }]
    })
}

$().ready(function () {
    try {
        let productId = getQueryParam('id'),
            Chart,
            cfg = opener.window.chartReview.cfg
        fetchReview(productId, function (reviews) {
            reviews.map(review => {
                let d = new Date(review.timeStamp).toLocaleDateString().split('/')
                review.timeStamp = d[0] + '/' + d[2]
                return review
            })
            log(reviews)
            let groups = _u.chain(reviews).groupBy("timeStamp")
                .map((value, key) => {
                    return { "timeStamp": key, reviews: value }
                })
                // view groups original
                //.value()
                //map to data chart
                .map(group => {
                    return { month: group.timeStamp, count: group.reviews.length }
                }).value()
            let categories = groups.map(group => group.month).reverse()
            let data = groups.map(group => group.count).reverse()
            log(groups)
            Chart = drawChart(
                data,
                categories,
                cfg.title,
                cfg.subTitle,
                cfg.titleY
            )
        })
    } catch (error) {
        log(error)
    }

    $('#btnResize').click(function () {
        let width = $('#txtWidth').val()
        $('#container').width(width ? width : '100%')
        Chart.reflow();
    });
})