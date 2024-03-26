function aggregateData() {
  var sourceSpreadsheetURL1 = "https://docs.google.com/spreadsheets/d/XXXXXXXXXXXZv4byGPaWPqY-OHW4Cbo/edit?usp=sharing";
  var sourceSpreadsheetURL2 = "https://docs.google.com/spreadsheets/d/XXXXXXXXXXXy2uOqXXabmEqXOvY/edit#gid=0";
  var targetSpreadsheetURL = "https://docs.google.com/spreadsheets/d/XXXXXXXXXXgw_XC79ZAttLvXJj4/edit#gid=0";

  // Open the source and target spreadsheets
  var sourceSpreadsheet1 = SpreadsheetApp.openByUrl(sourceSpreadsheetURL1);
  var sourceSpreadsheet2 = SpreadsheetApp.openByUrl(sourceSpreadsheetURL2);
  var targetSpreadsheet = SpreadsheetApp.openByUrl(targetSpreadsheetURL);

  // Get the source sheets
  var sourceSheet1 = sourceSpreadsheet1.getSheetByName("Sheet1");
  var sourceSheet2 = sourceSpreadsheet2.getSheetByName("Sheet1");

  // Read data from the source sheets
  var sourceData1 = sourceSheet1.getDataRange().getValues();
  var sourceData2 = sourceSheet2.getDataRange().getValues();

  var aggregatedData = [];
  var headers = ["DateTime", "Temperature", "Humidity", "Pressure", "UV", "Latlong", "Location"];

  // Aggregate data from the first source sheet
  var aggregatedData1 = aggregateDataFromSheet(sourceData1, "Sungai Buloh");

  // Aggregate data from the second source sheet
  var aggregatedData2 = aggregateDataFromSheet(sourceData2, "Rawang");

  // Combine aggregated data from both sheets
  aggregatedData = aggregatedData.concat(aggregatedData1, aggregatedData2);

  // Get the target sheet by name, or create a new one if it doesn't exist
  var targetSheet = targetSpreadsheet.getSheetByName("Combined Aggregated Data");
  if (targetSheet) {
    // Clear existing data in the target sheet
    targetSheet.clear();
  } else {
    // Create a new sheet if it doesn't exist
    targetSheet = targetSpreadsheet.insertSheet("Combined Aggregated Data");
  }

  // Write headers
  targetSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Write aggregated data
  targetSheet.getRange(2, 1, aggregatedData.length, headers.length).setValues(aggregatedData);
}

function aggregateDataFromSheet(sourceData, locationName) {
  var aggregatedData = [];

  // Loop through source data to aggregate and format
  for (var i = 1; i < sourceData.length; i++) { // Start from the second row
    var row = sourceData[i];
    var dateTime = row[0]; // Assuming DateTime is in the first column (index 0)
    var temperature = row[1];
    var humidity = row[2];
    var pressure = row[3];
    var uv = row[4];
    var latlong = row[5]; // Assuming Latlong is in the sixth column (index 5)

    // Check if any data is missing or invalid
    if (dateTime && temperature && humidity && pressure && uv && latlong) {
      var location = locationName; // Variable for location
      var rowData = [dateTime, temperature, humidity, pressure, uv, latlong, location];
      aggregatedData.push(rowData);
    }
  }

  return aggregatedData;
}
