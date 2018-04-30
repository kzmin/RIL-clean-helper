var username = "";
var tag = "";
var fetchNum = 10;

function outputListMain() {
  // fetch URL list
  var fetcher = new HatebuFetcher(username, tag);
  var endOfOffset = fetcher.getItemsNum();
  var offsetList = getRandomNumbers(0, endOfOffset, fetchNum);
  var urlList = getHatebuUrlList(fetcher, offsetList);
  
  // write to spreadsheet
  var sheetWriter = new OutputListSheetController();
  sheetWriter.writeList(urlList);
}

function getHatebuUrlList(fetcher, offsetList) {
  const MAX_FETCH_NUM_AT_ONCE = 20;
  
  // offsetList => {quot, rem} List
  var divList = offsetList.map(function(e) {
    return [Math.floor(e / MAX_FETCH_NUM_AT_ONCE), e % MAX_FETCH_NUM_AT_ONCE];
  });
  
  // fetch Hatebu list by quot
  var quotSet = divList.reduce(function(a, e) {
    return a.indexOf(e[0]) < 0 ? a.concat(e[0]) : a;
  }, []);
  var hatebuList = {};
  quotSet.forEach(function(e) {
    hatebuList[e] = fetcher.getUrlList(e * MAX_FETCH_NUM_AT_ONCE);
  });
  
  // extract from the fetched list
  var resultList = [];
  divList.forEach(function(e) {
    resultList.push(hatebuList[e[0]][e[1]]);
  });
  return resultList;
}

function getRandomNumbers(start, end, num) {
  var array = Array(end - start + 1).join().split(",").map(function(e, i){ return start + i;});
  var shuffledArray = shuffle(array);
  return shuffledArray.slice(0, num);
}

function shuffle(array) {
  // Fisher–Yates shuffle
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  var a = array;
  for(var i = a.length - 1; i > 0; --i) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}
