(function(global) {
  var OutputListSheetController = (function() {
    // constructor
    function OutputListSheetController() {
      this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      updateLastRow_(this);
    }
    
    // private method
    function updateLastRow_(this_) {
      this_.lastRow = this_.sheet.getRange("A:A").getValues().filter(String).length;
    }
    
    // public method
    OutputListSheetController.prototype.writeList = function(list) {
      var sheet = this.sheet;
      var lastRow = this.lastRow;
      list.forEach(function(item) {
        var title = item["title"];
        var url = item["url"];
        if(!title || !url) return;

        var eid = item["eid"] || "";
        var fetchDate = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd HH:mm");
        var writeItem = [title, url, eid, fetchDate];
        
        sheet.getRange(lastRow + 1, 1, 1, writeItem.length).setValues([writeItem]);
        ++lastRow;
      });
      updateLastRow_(this);
    }
    
    OutputListSheetController.prototype.readList = function() {
      const LIST_RANGE = "A2:D" + this.lastRow;
      var sheet = this.sheet;
      var valueList = sheet.getRange(LIST_RANGE).getValues();
      var resultList = [];
      valueList.forEach(function(e) {
        resultList.push({
          "title": e[0],
          "url": e[1],
          "eid": e[2],
          "fetchDate": new Date(e[3])
        });
      });
      return resultList;
    }
    
    OutputListSheetController.prototype.clear = function() {
      const HEADER_RANGE = "A1:D1";
      var headerValues = this.sheet.getRange(HEADER_RANGE).getValues();
      this.sheet.clearContents();
      this.sheet.getRange(HEADER_RANGE).setValues(headerValues);
      updateLastRow_(this);
    }
      
    return OutputListSheetController;
  })();
  return global.OutputListSheetController = OutputListSheetController;
})(this);
