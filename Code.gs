// Function to fetch the Bearer Token
function getBearerToken() {
  const url = "some url";

  var access = "some value";
  var secret = "some value";

  const payload = {
    grant_type: "client_creds",
    audience: "API",
    client_id: access,
    client_secret: secret
  };

  const headers = {
    accept: "application/json",
    content: "application/x-www-form-urlencoded"
  };

  const options = {
    method: "post",
    headers: headers,
    muteHttpExceptions: true,
    payload: payload
  };

  var response = UrlFetchApp.fetch(url, options);
  var jsonData = response.getContentText();
  var data = JSON.parse(jsonData);
  var token = data.access_token;
  return token;
}

// Function to log data to a Google Sheet
function logToSheet(sheetName, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  sheet.clear(); // Clear the sheet before logging
  if (typeof data === "object") {
    data = JSON.stringify(data, null, 2); // Pretty-print JSON for readability
  }
  sheet.getRange(1, 1).setValue(data); // Write the data to cell A1
}

// Function to write JSON data to a Google Sheet in tabular format
function writeToSheet(data, sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);

  // Append new data without clearing existing data
  const lastRow = sheet.getLastRow();
  const headers = Object.keys(data[0]); // Get headers from the first object

  // Add headers only if the sheet is empty
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Prepare rows of data
  const rows = data.map(obj => headers.map(header => obj[header] || ""));
  sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(rows);
}

// Function to fetch and process the report
function getReport() {
  const url = "some url";
  var bearerToken = getBearerToken();

  const variables = {
    first: 1,
    filterBy: {
      status: ["OPEN"],
      resource: {
        subscriptionId: ["some ID", "some ID"]
      }
    },
    fetchTotalCount: true,
    orderBy: {
      field: "SEVERITY",
      direction: "DESC"
    }
  };

  const query = `your big query here`;

  const payload = JSON.stringify({
    query: query,
    variables: variables
  });

  const headers = {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  const options = {
    method: "post",
    headers: headers,
    payload: payload,
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var jsonData = response.getContentText();
  var data = JSON.parse(jsonData);

  // Log data to a dedicated sheet for debugging
  logToSheet("LogData", data);

  // Write the report to a sheet if findings exist
  if (data && data.findings) { // Adjust `data.findings` based on actual JSON structure
    writeToSheet(data.findings, "Report");
  } else {
    Logger.log("No findings in the response");
  }
}
