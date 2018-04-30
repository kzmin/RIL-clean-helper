(function(global) {
  var HatebuFetcher = (function() {
    // constructor
    function HatebuFetcher(username, tag) {
      this.username = username;
      this.tag = tag;
    }
  
    // private method
    function getFeedsXml_(pageOffset, this_) {
      const FEED_URL_BASE = "http://b.hatena.ne.jp/" + this_.username + "/atomfeed?";
      const FEED_TAG = encodeURIComponent(this_.tag);
      var fetchUrl = FEED_URL_BASE + "tag=" + FEED_TAG + "&of=" + pageOffset;
      var response = UrlFetchApp.fetch(fetchUrl);
      var result = XmlService.parse(response.getContentText());
      // Logger.log("xml: " + result);
      return result;
    }
  
    // public method
    // get registered URL list
    // returns array of {'title', 'url'} elements
    HatebuFetcher.prototype.getUrlList = function(pageOffset) {
      // get 'entry' nodes from XML document
      var feedsXml = getFeedsXml_(pageOffset, this);
      var root = feedsXml.getRootElement();
      var rss = XmlService.getNamespace("http://purl.org/atom/ns#");
      var entries = root.getChildren("entry", rss);
    
      // no entries
      if (!entries.length) {
        Logger.log("Not found any entries. offset: " + pageOffset);
        return [];
      }
      
      // convert 'entry' nodes to array
      var resultList = [];
      entries.forEach(function(entry) {
        var title = entry.getChild("title", rss).getValue();
        var url = entry.getChildren("link", rss)[0].getAttribute("href").getValue();
        resultList.push({"title": title, "url": url});
        //Logger.log("title: " + title + ", url: " + url);
      });
      return resultList;
    }
  
    // get number of registered URL
    HatebuFetcher.prototype.getItemsNum = function() {
      // get feeds
      var feedsXml = getFeedsXml_(0, this);
      var root = feedsXml.getRootElement();
      var rss = XmlService.getNamespace("http://purl.org/atom/ns#");
      
      // get number from 'title' node
      var title = root.getChild("title", rss).getValue(); // => <TAG_WORD>に関する<USER_NAME>のブックマーク（<num>）
      Logger.log("title: " + title);
      var num = parseInt(title.replace(/,/g, '').substring(title.lastIndexOf("(") + 1, title.lastIndexOf(")") - 1));
      Logger.log("items num: " + num);
      return num;
    }
    return HatebuFetcher;
  })();
  return global.HatebuFetcher = HatebuFetcher;
})(this);

