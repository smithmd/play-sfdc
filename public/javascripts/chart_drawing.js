/**
 * Created by smithmd on 6/19/15.
 */

// helper functions to get the reports from the huge disgusting json
function getReportIndex(dashboard, report_id) {
    var report_index = -1;

    dashboard.componentData.forEach(function (element, index) {
        if (element.componentId == report_id) {
            report_index = index;
        }
    });

    return report_index;
}

function getReport(dashboard, report_id) {
    var report = null;

    dashboard.componentData.forEach(function (element, index) {
        if (element.componentId == report_id) {
            report = dashboard.componentData[index];
        }
    });

    return report;
}

function getReportByIndex(dashboard, report_index) {
    return dashboard.componentData[report_index];
}

function getReportTitleByIndex(dashboard, report_index) {
    return dashboard.dashboardMetadata.components[report_index].header;
}

function getColumnLabels(obj) {
    var columnLabels = [];
    for (var columnInfo in obj) {
        if (obj.hasOwnProperty(columnInfo)) {
            var index = columnInfo.replace(/FORMULA/, '');
            columnLabels[index - 1] = obj[columnInfo].label;
        }
    }

    return columnLabels;
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

function drawTable(report_id, groupingInfo, column, dashboard) {

    // grabbing report to make code easier to read
    var report_index = getReportIndex(dashboard,report_id);
    var report = getReportByIndex(dashboard,report_index);

    // init google chart
    var data = new google.visualization.DataTable();

    var columnLabels = getColumnLabels(report.reportResult.reportExtendedMetadata.aggregateColumnInfo);

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
            var index = getAggregateByIndex(j, report);
            var value = factMap[i + "!T"].aggregates[index].value;
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
        var index = getAggregateByIndex(i, report);
        var value = factMap["T!T"].aggregates[index].value;
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
//                var thousands_formatter = new google.visualization.NumberFormat(
//                    {prefix: '$', suffix: 'K', pattern: '#,###.#'}
//                );
    for (i = 0; i < colsOverOneMil.length; i++) {
        if (colsOverOneMil[i] == 1) {
            millions_formatter.format(data, i + 1);
        }
    }

    var options = {
        'title': dashboard.dashboardMetadata.attributes.dashboardName,
        showRowNumber: false
    };

    appendChartToColumn(data, options, getReportTitleByIndex(dashboard,report_index), column, 'table');
}

function appendChartToColumn(data, options, title, col, chart_type) {
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

    var chart = new google.visualization.Table(chart_div);
    chart.draw(data, options);

    // add fieldset to appropriate column
    document.getElementById('col' + col).appendChild(fs);
}
