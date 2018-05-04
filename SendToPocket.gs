var POCKET_CONSUMER_KEY = "";
var properties = PropertiesService.getUserProperties();

function sendToPocketMain() {
  // get URL list from sheet
  var spreadsheet_id = PropertiesService.getScriptProperties().getProperty("spreadsheet_id");
  if(!spreadsheet_id.length) {
    throw new Error("Cannot get 'spreadsheet_id' from PropertiesService");
    return;
  }
  var sheet = SpreadsheetApp.openById(spreadsheet_id).getSheets()[0];
  var sheetWriter = new OutputListSheetController(sheet);
  var urlList = sheetWriter.readList();
  Logger.log("urlList: " + urlList.toSource());
  
  // request to add to Pocket
  const REQUEST_URL_ADD = "https://getpocket.com/v3/add";
  var requestParam = {
    method: "post",
    muteHttpExceptions: true,
    payload:{
      consumer_key: properties.getProperty('pocket_consumer_key'),
      access_token: properties.getProperty('pocket_access_token')
    }
  };
  urlList.forEach(function(e) {
    requestParam["payload"]["url"] = e["url"];
    requestParam["payload"]["title"] = e["title"];
    var response = UrlFetchApp.fetch(REQUEST_URL_ADD, requestParam);
    Logger.log("response code: " + response.getResponseCode());
  });
}

function pocket_oauth() {
  const AUTH_URL_BASE = "https://getpocket.com/auth/authorize";
  const TOKEN_URL = "https://getpocket.com/v3/oauth/request";

  var response = UrlFetchApp.fetch(TOKEN_URL, {
    method: "post",
    muteHttpExceptions: true,
    headers: {
      "X-Accept": "application/json"
    },
    payload: {
      consumer_key: POCKET_CONSUMER_KEY,
      redirect_uri: getRedirectUri(ScriptApp.getScriptId())
    }
  });
  if(response.getResponseCode() != 200) {
    // Fail
    properties.deleteAllProperties();
    Logger.log("Failed to get the request token");
  } else {
    // Success
    var code = JSON.parse(response.getContentText())["code"];
    var params = {
      request_token: code,
      redirect_uri: getRedirectUri(ScriptApp.getScriptId())
    };
    properties.setProperties({
      pocket_consumer_key: POCKET_CONSUMER_KEY,
      pocket_request_token_code: code
    });
    Logger.log("Open below url: " + buildUrl(AUTH_URL_BASE, params));
  }
}

function pocket_authorize() {
  const ACCESS_TOKEN_URL = "https://getpocket.com/v3/oauth/authorize";
  var consumer_key = properties.getProperty("pocket_consumer_key");
  var code = properties.getProperty("pocket_request_token_code");

  var response = UrlFetchApp.fetch(ACCESS_TOKEN_URL, {
    method: "post",
    headers: {
      "X-Accept": "application/json"
    },
    payload: {
      consumer_key: consumer_key,
      code: code
    }
  });
  if(response.getResponseCode() != 200) {
    // Fail
    //properties.deleteAllProperties();
    Logger.log("Failed to authorize");
    Logger.log("Header: " + response.getHeaders().toSource());
    Logger.log("Content: " + response.getContentText());
  } else {
    // Success
    var access_token = JSON.parse(response.getContentText())["access_token"];
    properties.setProperties({
      pocket_access_token: access_token
    });
    Logger.log("Access Token: " + access_token);
  }
}

function getRedirectUri(scriptId) {
  return Utilities.formatString(
    'https://script.google.com/macros/d/%s/usercallback', scriptId);
}

function buildUrl(url, params) {
  var paramString = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}