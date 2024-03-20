//API Key: APIKEY
// lat: 3.509247 long: 101.524803 (Example Selangor)

/*
http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={APIkey} - current;
http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat={lat}&lon={lon}&appid={APIkey} - forecasted;
http://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start}&end={end}&appid={APIkey} - historical. 

*/

function fetchAirPollutionData() {
  var apiKey = 'APIKEY';
  var latitude = '3.509247'; // Replace with the latitude of the location
  var longitude = '101.524803'; // Replace with the longitude of the location
  var apiUrl = 'http://api.openweathermap.org/data/2.5/air_pollution?lat=' + latitude + '&lon=' + longitude + '&appid=' + apiKey;

  var sheetName = 'Air Pollution Data';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  // Check if the sheet exists
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    // Add headers to the new sheet
    sheet.appendRow(['Date', 'Time', 'Datetime', 'CO', 'NO', 'NO2', 'O3', 'SO2', 'NH3', 'PM2.5', 'PM10']);
  }

  var response = UrlFetchApp.fetch(apiUrl);
  var json = response.getContentText();
  var data = JSON.parse(json);

  var datetime = new Date(data.list[0].dt * 1000); // Convert timestamp to datetime

  var airPollutionData = [
    [datetime.toDateString(), datetime.toLocaleTimeString(), datetime,
      data.list[0].components.co, data.list[0].components.no,
      data.list[0].components.no2, data.list[0].components.o3,
      data.list[0].components.so2, data.list[0].components.nh3,
      data.list[0].components.pm2_5, data.list[0].components.pm10,data.list[0].main.aqi]
  ];

  // Append data to the sheet
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, airPollutionData[0].length).setValues(airPollutionData);
}
