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
  return dashboard.dashboardMetadata.components[report_index].title;
}

function getColumnLabels(obj) {
  var columnLabels = [];
  var index = 0;
  for (var columnInfo in obj) {
    if (obj.hasOwnProperty(columnInfo)) {
      columnLabels[index++] = obj[columnInfo].label;
    }
  }

  return columnLabels;
}

function getReportMetadataByIndex(dashboard, report_index) {
  return dashboard.dashboardMetadata.components[report_index];
}

function getChartType(dashboard, report_index) {
  return dashboard.dashboardMetadata.components[report_index].properties.visualizationType;
}

function getChartColumn(dashboard,report_index) {
  var col = null;

  column:for (var i = 0; i < dashboard.dashboardMetadata.layout.columns.length; i++) {
    component:for (var j = 0; j < dashboard.dashboardMetadata.layout.columns[i].components.length; j++) {
      if (report_index == dashboard.dashboardMetadata.layout.columns[i].components[j]) {
        col = i;
        break column;
      }
    }
  }

  return col;
}

function getGroupingName(report) {
  return report.reportResult.reportMetadata.groupingsDown[0];
}