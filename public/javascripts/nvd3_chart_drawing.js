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

  var value = [(factMap["T!T"].aggregates[0].value / 1000000).toFixed(2)];
  var graphData = bulletChartData(value, "Goal", range_array, [null]);
  nv.addGraph(function () {
    var chart = nv.models.bulletChart();

    d3.select(svg)
        .datum(graphData)
        .transition().duration(1000)
        .call(chart);

    return chart;
  });
}
function bulletChartData(measure, report_title, range_array, markers) {
  return {
    "title": report_title,		//Label the bullet chart
    "subtitle": "Millions of US$",		//sub-label for bullet chart
    "ranges": range_array,	 //Minimum, mean and maximum values.
    "measures": measure,		 //Value representing current measurement (the thick blue line in the example)
    "markers": markers			 //Place a marker on the chart (the white triangle marker)
  };
}

function drawDonut(dashboard, report_id, column) {
  // grabbing report to make code easier to read
  var report_index = getReportIndex(dashboard, report_id);
  var report = getReportByIndex(dashboard, report_index);
  var factMap = report.reportResult.factMap;

  var data_array = [];

  for (var i = 0; i < report.reportResult.groupingsDown.groupings.length; i++) {
    data_obj = {
      "label": report.reportResult.groupingsDown.groupings[i].label,
      "value": factMap[i + "!T"].aggregates[0].value
    };
    data_array.push(data_obj);
  }

  // create and append fieldset
  var fs = document.createElement('fieldset');
  // create and append legend
  var legend = document.createElement('legend');
  legend.innerHTML = getReportTitleByIndex(dashboard, report_index);
  fs.appendChild(legend);
  var div = document.createElement('div');
  div.classList.add('chart');
  div.classList.add('donut');
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

  div.appendChild(svg);
  fs.appendChild(div);
  document.getElementById('col' + column).appendChild(fs);

  nv.addGraph(function () {
    var chart = nv.models.pieChart()
            .x(function (d) {
              return d.label
            })
            .y(function (d) {
              return d.value
            })
            .showLabels(true)     //Display pie labels
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.4)     //Configure how big you want the donut hole size to be.
        ;

    var addText = function (selection) {
      selection.append("text")
          .attr("y", "200px")
          .attr("x", "200px")
          .style("text-anchor", "middle")
          .text(function (d) {return "Total:\n" + factMap["T!T"].aggregates[0].label;});
    };

    var addTotalValue = function (selection) {
      selection
          .append("text")
          .attr("y", "220px")
          .attr("x", "200px")
          .style("text-anchor", "middle")
          .text(function (d) {return factMap["T!T"].aggregates[0].label;});
    };

    d3.select(svg)
        .datum(data_array)
        .call(addText)
        //.call(addTotalValue)
        .transition().duration(350)
        .call(chart);

    return chart;
  });
}

function drawColumn(dashboard, report_id, column) {
  // grabbing report to make code easier to read
  var report_index = getReportIndex(dashboard, report_id);
  var report = getReportByIndex(dashboard, report_index);
  var factMap = report.reportResult.factMap;

  var values_array = [];

  for (var i = 0; i < factMap["T!T"].aggregates.length; i++) {
    data_obj = {
      "label": report.reportResult.groupingsDown.groupings[i].label,
      "value": factMap["T!T"].aggregates[i].value
    };
    values_array.push(data_obj);
  }

  var data = [
    {
      key: dashboard.dashboardMetadata.components[report_index].title,
      values: values_array
    }];

  // create and append fieldset
  var fs = document.createElement('fieldset');
  // create and append legend
  var legend = document.createElement('legend');
  legend.innerHTML = getReportTitleByIndex(dashboard, report_index);
  fs.appendChild(legend);
  var div = document.createElement('div');
  div.classList.add('chart');
  div.classList.add('barChart');
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

  div.appendChild(svg);
  fs.appendChild(div);
  document.getElementById('col' + column).appendChild(fs);

  nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
            .x(function (d) {
              return d.label
            })    //Specify the data accessors.
            .y(function (d) {
              return d.value
            })
            .staggerLabels(false)    //Too many bars and not enough room? Try staggering labels.
            .tooltips(false)        //Don't show tooltips
            .showValues(true)       //...instead, show the bar value right on top of each bar.
        ;

    d3.select(svg)
        .datum(data)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}