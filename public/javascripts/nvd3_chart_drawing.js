/**
 * Created by smithmd on 6/23/15.
 */


function getBulletChartData(factMap, report_title, range_array, range_label_array) {
    return {
        "title": report_title,
        "subtitle": "Total (Millions)",
        "ranges": range_array,
        "measures": [(factMap["T!T"].aggregates[0].value / 1000000).toFixed(2)],
        "markers": [],
        "rangeLabels": range_label_array,
        "forceX": [range_array[0], range_array[2]],
        "tickFormat": d3.format(".02f")
    };
}

function drawBullet(dashboard, report_id, column) {
    // grabbing report to make code easier to read
    var report_index = getReportIndex(dashboard, report_id);
    var report = getReportByIndex(dashboard, report_index);
    var factMap = report.reportResult.factMap;

    var range_label_array = ['Goal', null, null];

    var report_metadata = getReportMetadataByIndex(dashboard, report_index);
    var range_array = [
        report_metadata.properties.visualizationProperties.breakPoints[0].breaks[0].upperBound / 1000000,
        report_metadata.properties.visualizationProperties.breakPoints[0].breaks[1].upperBound / 1000000,
        report_metadata.properties.visualizationProperties.breakPoints[0].breaks[2].upperBound / 1000000
    ];

    // create and append fieldset
    var fs = document.createElement('fieldset');
    // create and append legend
    var legend = document.createElement('legend');
    legend.innerHTML = getReportTitleByIndex(report_index);
    fs.appendChild(legend);
    var div = document.createElement('div');
    div.classList.add('chart');
    fs.appendChild(div);

    nv.addGraph(function () {
        var chart = nv.models.bulletChart();

        d3.select(div)
            .append('svg')
            .datum(getBulletChartData(factMap, '', range_array, range_label_array))
            .attr("height", 60)
            .attr("width", 400)
            .transition().duration(1000)
            .call(chart);

        return chart;
    });

    document.getElementById('col'+column).appendChild(fs);
}

