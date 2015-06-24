/**
 * Created by smithmd on 6/23/15.
 */




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
    legend.innerHTML = getReportTitleByIndex(dashboard, report_index);
    fs.appendChild(legend);
    var div = document.createElement('div');
    div.classList.add('chart');
    div.classList.add('bullet');
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    div.appendChild(svg);
    fs.appendChild(div);
    document.getElementById('col' + column).appendChild(fs);


    var value = [factMap["T!T"].aggregates[0].value / 1000000];
    console.log('value = ' + value);
    console.log('ranges: ' + range_array);
    var graphData = bulletChartData([value],"Revenue",range_array);
    //var graphData = exampleData();

    console.log('graphData: ');
    console.log(graphData);

    nv.addGraph(function () {
        var chart = nv.models.bulletChart();

        d3.select(svg)
            .datum(graphData)
            .transition().duration(1000)
            .call(chart);

        return chart;
    });
}
function bulletChartData(measure, report_title, range_array) {
    return {
        "title": report_title,		//Label the bullet chart
        "subtitle": "US$, in thousands",		//sub-label for bullet chart
        "ranges": range_array,	 //Minimum, mean and maximum values.
        "measures": measure,		 //Value representing current measurement (the thick blue line in the example)
        "markers": [250.0]			 //Place a marker on the chart (the white triangle marker)
    };
}
//getBulletChartData(factMap["T!T"].aggregates[0].value,'Goal', range_array,[])
//getBulletChartData([220.0],'Goal', [150.0, 225.0, 300.0])