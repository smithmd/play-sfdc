/**
 * Created by smithmd on 6/19/15.
 */



function getGaugeBounds(dashboard, report_index) {
  var breakpoints = dashboard.dashboardMetadata.components[report_index].properties.visualizationProperties.breakPoints[0].breaks;
  var bounds = [];
  bounds.push(breakpoints[0].lowerBound);
  bounds.push(breakpoints[1].lowerBound);
  bounds.push(breakpoints[2].lowerBound);
  bounds.push(breakpoints[2].upperBound);

  return bounds;
}

function getAggregateByIndex(index, report) {
  return report.reportResult.reportMetadata.aggregates.indexOf('FORMULA' + (index + 1));
}

function getGroupings(arr) {
  var groupings = [];
  for (var i = 0; i < arr.length; i++) {
    groupings.push(arr[i].label);
  }

  return groupings;
}

/*
 Functions to actually render the charts
 */
function drawTable(report_id, groupingInfo, column, dashboard) {

  // grabbing report to make code easier to read
  var report_index = getReportIndex(dashboard, report_id);
  var report = getReportByIndex(dashboard, report_index);

  // init google chart
  var data = new google.visualization.DataTable();

  var columnLabels = getColumnLabelsFromMetadata(report);

  var groupings = getGroupings(report.reportResult.groupingsDown.groupings);
  var colCount = columnLabels.length;

  data.addColumn('string', report.reportResult.reportExtendedMetadata.groupingColumnInfo[groupingInfo].label);
  var i;
  for (i = 0; i < colCount; i++) {
    data.addColumn('number', columnLabels[i]);
  }

  var factMap = report.reportResult.factMap;

  var colsOverOneMil = Array.apply(null, Array(colCount)).map(Number.prototype.valueOf, 0);

  // add data rows
  for (i = 0; i < groupings.length; i++) {
    var row = [groupings[i]];
    for (var j = 0; j < colCount; j++) {
      //var index = getAggregateByIndex(j, report);
      var value = factMap[i + "!T"].aggregates[j].value;
      if (value > 1000) {
        colsOverOneMil[j] = 1;
        value = value / 1000000;
      }
      row.push(value);
    }
    data.addRows([row]);
  }

  // add aggregate data row
  var row = ['Total'];
  for (i = 0; i < colCount; i++) {
    //var index = getAggregateByIndex(i, report);
    var value = factMap["T!T"].aggregates[i].value;
    if (value > 1000) {
      colsOverOneMil[i] = 1;
      value = value / 1000000;
    }
    row.push(value);
  }
  data.addRows([row]);

  // format numbers to dollars
  var millions_formatter = new google.visualization.NumberFormat(
      {prefix: '$', suffix: 'M', pattern: '#,###.#'}
  );
  var percent_formatter = new google.visualization.NumberFormat(
      {prefix: '', suffix: '%', pattern: '###.##'}
  );
  for (i = 0; i < colsOverOneMil.length; i++) {
    if (colsOverOneMil[i] == 1) {
      millions_formatter.format(data, i + 1);
    } else {
      percent_formatter.format(data, i+1);
    }
  }

  var options = {
    'title': dashboard.dashboardMetadata.attributes.dashboardName,
    showRowNumber: false
  };

  appendGoogleChartToColumn(data, options, getReportTitleByIndex(dashboard, report_index), column, 'table', google.visualization.Table);
}

function drawGauge(report_id, dashboard, column) {

  // grabbing report to make code easier to read
  var report_index = getReportIndex(dashboard, report_id);
  var report = getReportByIndex(dashboard, report_index);

  var factMap = report.reportResult.factMap;

  // init google chart
  var data = new google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Total (Millions)', factMap["T!T"].aggregates[0].value / 1000000]
  ]);

  var currency_formatter = new google.visualization.NumberFormat(
      {prefix: '$', suffix: 'M', pattern: '#,###.##'}
  );
  currency_formatter.format(data, 1);

  var bounds = getGaugeBounds(dashboard, report_index);
  var tickSize = (bounds[3] - bounds[0]) / 3 / 1000000;

  var majorTicks = [bounds[0] / 1000000];
  majorTicks.push(tickSize);
  majorTicks.push(tickSize * 2);
  majorTicks.push(tickSize * 3);

  bounds.forEach(function (value, index, array) {
    array[index] = (value / 1000000).toFixed(1);
  });

  majorTicks.forEach(function (value, index, array) {
    array[index] = value.toFixed(1);
  });

  var options = {
    width: 400, height: 300,
    redFrom: bounds[0], redTo: bounds[1],
    yellowFrom: bounds[1], yellowTo: bounds[2],
    minorTicks: 3,
    majorTicks: majorTicks,
    min: bounds[0],
    max: bounds[3],
    animation: {
      startup: true,
      duration: 500,
      easing: 'inAndOut'
    }
  };

  appendGoogleChartToColumn(data, options, getReportTitleByIndex(dashboard, report_index), column, 'gauge', google.visualization.Gauge);
}

/*
 Function to append a chart to the appropriate column on the page.
 */
function appendGoogleChartToColumn(data, options, title, col, chart_type, constructor) {
  // create and append fieldset
  var fs = document.createElement('fieldset');
  // create and append legend
  var legend = document.createElement('legend');
  legend.innerHTML = title;
  fs.appendChild(legend);

  // create and append div that holds chart
  var chart_div = document.createElement('div');
  chart_div.classList.add('chart');
  if (chart_type !== null) {
    chart_div.classList.add(chart_type);
  }

  fs.appendChild(chart_div);

  var chart = new constructor(chart_div);
  chart.draw(data, options);

  // add fieldset to appropriate column
  document.getElementById('col' + col).appendChild(fs);
}