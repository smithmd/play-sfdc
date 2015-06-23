/**
 * Created by smithmd on 6/23/15.
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

function getReportMetadataByIndex(dashboard, report_index) {
    return dashboard.dashboardMetadata.components[report_index];
}