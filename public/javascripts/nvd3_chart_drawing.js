/**
 * Created by smithmd on 6/23/15.
 */


function getBulletChartData(factMap, report_title, range_array, range_label_array) {
    return {
        "title": report_title,
        "subtitle": "Total (Millions)",
        "ranges":[150,200,300], // range_array,
        "measures":[220], //[(factMap["T!T"].aggregates[0].value / 1000000).toFixed(2)],
        "markers": []
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
    legend.innerHTML = getReportTitleByIndex(dashboard,report_index);
    fs.appendChild(legend);
    var div = document.createElement('div');
    div.classList.add('chart');
    fs.appendChild(div);

    nv.addGraph(function() {
                      var chart = nv.models.bulletChart();

                      d3.select(div)
                          .datum(exampleData())
                          .transition().duration(1000)
                          .call(chart);

                      return chart;
                    });


                    function exampleData() {
                      return {
                        "title":"Revenue",		//Label the bullet chart
                        "subtitle":"US$, in thousands",		//sub-label for bullet chart
                        "ranges":[150,225,300],	 //Minimum, mean and maximum values.
                        "measures":[220],		 //Value representing current measurement (the thick blue line in the example)
                        "markers":[250]			 //Place a marker on the chart (the white triangle marker)
                      };
                    }
            }

    document.getElementById('col'+column).appendChild(fs);
}

