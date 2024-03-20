function aggregateData() {
  var sourceSpreadsheetURL = "https://docs.google.com/spreadsheets/d/XXXXXXXXXXXZv4byGPaWPqY-OHW4Cbo/edit?usp=sharing";
  var targetSpreadsheetURL = "https://docs.google.com/spreadsheets/d/XXXXXXXXXXgw_XC79ZAttLvXJj4/edit#gid=0";
  
  // Open the source and target spreadsheets
  var sourceSpreadsheet = SpreadsheetApp.openByUrl(sourceSpreadsheetURL);
  var targetSpreadsheet = SpreadsheetApp.openByUrl(targetSpreadsheetURL);
  
  // Get the source sheet
  var sourceSheet = sourceSpreadsheet.getSheetByName("Sheet1"); // Change "Sheet1" to the actual sheet name
  
  // Read data from the source sheet
  var sourceData = sourceSheet.getDataRange().getValues();
  var sourceNumRows = sourceData.length;
  
  var aggregatedData = [];
  var headers = ["Date", "Time", "Temperature", "Humidity"]; // Adjust headers as needed
  
  // Initialize variables to keep track of date and data
  var currentDate = null;
  var currentHour = 0;
  var tempThreshold = -242.019534; // Set your temperature threshold here
  var humidityThreshold = -1; // Set your humidity threshold here
  
  for (var i = 1; i < sourceNumRows; i++) { // Start from the second row
    var row = sourceData[i];
    var rowTime = new Date(row[0]); // Assuming "Now" is in the first column (index 0)
    
    // Check if the date has changed
    if (!currentDate || rowTime.getDate() !== currentDate.getDate()) {
      // Update the current date and reset the current hour
      currentDate = rowTime;
      currentHour = 0;
    }
    
    // Calculate the time difference between the current row and the start of the hour
    var timeDiffMinutes = rowTime.getMinutes();
    var timeDiffSeconds = rowTime.getSeconds();
    var timeDiff = (timeDiffMinutes * 60 + timeDiffSeconds) / 3600; // Convert to hours
    
    // Check if the time has changed to the next hour or beyond
    while (currentHour + timeDiff <= rowTime.getHours()) {
      var hourStartTime = new Date(currentDate);
      hourStartTime.setHours(currentHour, 0, 0, 0);
      var hourEndTime = new Date(currentDate);
      hourEndTime.setHours(currentHour + 1, 0, 0, 0);
      
      var filteredData = sourceData.filter(function(row) {
        var rowTime = new Date(row[0]);
        var temp = parseFloat(row[2]); // Temperature column
        var humidity = parseFloat(row[3]); // Humidity column
        return (
          rowTime >= hourStartTime &&
          rowTime < hourEndTime &&
          temp !== tempThreshold &&
          temp >= 0 &&
          humidity !== humidityThreshold &&
          humidity >= 0
        );
      });
      
      if (filteredData.length > 0) {
        var tempSum = filteredData.reduce(function(sum, row) {
          return sum + parseFloat(row[2]); // Temperature column
        }, 0);
        var humiditySum = filteredData.reduce(function(sum, row) {
          return sum + parseFloat(row[3]); // Humidity column
        }, 0);
        var averageTemp = (tempSum / filteredData.length).toFixed(2);
        var averageHumidity = (humiditySum / filteredData.length).toFixed(2);
        var dateStr = Utilities.formatDate(currentDate, "GMT+0800", "dd/MM/yyyy");
        var timeStr = Utilities.formatDate(hourStartTime, "GMT+0800", "HH:mm:ss");
        var rowData = [dateStr, timeStr, averageTemp, averageHumidity];
        aggregatedData.push(rowData);
      }
      
      // Move to the next hour
      currentHour++;
    }
  }
  
  // Get the target sheet by name, or create a new one if it doesn't exist
  var targetSheet = targetSpreadsheet.getSheetByName("Daily Hourly Aggregated Data");
  if (targetSheet) {
    // Clear existing data in the target sheet
    targetSheet.clear();
  } else {
    // Create a new sheet if it doesn't exist
    targetSheet = targetSpreadsheet.insertSheet("Daily Hourly Aggregated Data"); // Change the sheet name as needed
  }
  
  // Write headers
  targetSheet.getRange(1, 1, 1, 4).setValues([headers]);
  
  // Write aggregated data
  targetSheet.getRange(2, 1, aggregatedData.length, 4).setValues(aggregatedData);
}
