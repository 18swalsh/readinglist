//library: M1lugvAXKKtUxn_vdAG9JZleS6DrsjUUV


//when selecting a book from goodreads search, the match is not always the first title
//add optional second input variable


//myMessage.replace(/sentence/g, 'message');
function getUrl(title) {
  var url = title.replace("'", "%27");
  url = url.replace(/:/g, "%3A");
  url = url.replace(/#/g, "%23");
  url = url.replace("?", "%3F");
  url = url.replace("$", "%24");
  url = url.replace(/,/g, "%2C");
  url = url.replace("/", "%2F");
  url = url.replace("/", "%2B");
  //url = url.replace(" ","%20");
  url = "https://www.goodreads.com/search?q=" + url;
  //SpreadsheetApp.getUi().alert(url);
  return url;
};




function getISBN(title){
  title = replaceAll(title, " ", "+");
  //var url = "https://isbnsearch.org/search?s=" + title  - they caught my bot
  //var url = "https://www.abebooks.com/servlet/SearchResults?cm_sp=SearchF-_-topnav-_-Results&ds=20&kn=" + title + "&sts=t" - Gets ISBN from AbeBooks - which doesn't seem to be a great source
  var url = "https://isbndb.com/search/books/" + title;
  var fromText = 'ISBN:</strong> ';
  var toText = '</dt>';
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  //scraped = scraped.split(">").pop();
  return scraped; //scraped;
};









function getPageNumber(title) {
  var url = getUrl(title);
  return getPages(getBook(url));
};

function getAuthorName(title) {
  var url = getUrl(title);
  return getAuthor(getBook(url));
};

function getYear(title) {
  var url = getUrl(title);
  return getYearFirstPublished(getBook(url));
};

function getRating(title) {
  var url = getUrl(title);
  return getRatingValue(getBook(url));
};

function getRatingCount(title) {
  var url = getUrl(title);
  return getRatingCountLong(getBook(url));
};

function getDescription(title) {
  return getDescriptionText(getBook(getUrl(title)));
};

function getGenre(title) {
  return getGenreText(getUrl(title));
};

function getTitle(url){
  var fromText = 'id="bookTitle"';
  var toText = 'id="bookSeries"';
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);

  scraped = scraped.match(/[A-Z].+/);
  
  return scraped;
};

/*
function getRec(titleList) {
  var titles = titleList.split(", "); //keywords input by user
  var recLog = [];

  for (var i = 0; i < titles.length; i++){ //loop through titles
    //get recommendations
    var isbn = getISBN(titles[i]);
    var url = "https://www.whatshouldireadnext.com/isbn/" + isbn;
    var fromText = 'class="on recommendations"';
    var toText = 'Search for another book';
    var content = UrlFetchApp.fetch(url).getContentText();
    var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
    
    recLog[i] = url //scraped;
  };
  
  return recLog;

};
*/

function getRecUrl(title) {
  var url = getBook(getUrl(title));
  var fromText = 'actionLink right seeMoreLink" href="';
  var toText = 'See similar books';
  var content = UrlFetchApp.fetch("www.goodreads.com/" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);
  scraped = scraped.substring(0, scraped.length - 2);
  return scraped;
};


function getRecList(title){
  var url = getRecUrl(title);
  var fromText = 'gr-d-lg-none';
  //var fromText = 'Goodreads members who liked this book also liked:';
  var toText = '}}}]}';
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);
  var fromText2 = 'Goodreads members who liked this book also liked:';
  var toText2 = '}}}]}';
  var content2 = UrlFetchApp.fetch(url).getContentText();
  var scraped2 = Parser
                  .data(content2)
                  .from(fromText2)
                  .to(toText2)
                  .build();
  Logger.log(scraped2);
  //scraped = scraped.substring(0,49999) //50,000 character limit writing to spreadsheet
  
  var scrapedComb = scraped2 + scraped;
  var regex = /\/book\/show\/[\w+-]+/g;
  
  var bookMatches = scrapedComb.match(regex);
  var bookList = bookMatches.join(); //titleCase(replaceAll(replaceAll(genreMatches.join(),"show", ""), ",", "").slice(1),"/");
  return bookList;

};


//Bug: title in getRec function only gets letters, not numbers - added "Arch" to function title and replaced
function getRecArch(title) {
  var arrBL = [];
  var arrBookInfo = [];
  var bookList = getRecList(title);
  var nRec = (bookList.match(/,/g) || []).length + 1;
  arrBL = bookList.split(",");

  //return arrBL
  
  /* returns a list of urls for the recommended books
  for (var i = 0; i < nRec; i++) {
    arrBL[i] = "www.goodreads.com" + arrBL[i];
    
  }; 
  */
  //returns a list after /book/show - mostly titles, but some do not have title
  //for (var i = 0; i < nRec; i++) {
  //  arrBL[i] = arrBL[i].match(/-.*/g);
  //}
  
  for (var i = 0; i < 5; i++) {
    var iRecURL = "www.goodreads.com" + arrBL[i];
    var recTitle = getTitle(iRecURL).toString();
    var genre = getGenre(recTitle);
    var author = getAuthorName(recTitle);
    var rating = getRating(recTitle);
    //var recCoverURL = getRecCover(iRecURL, arrBL[i], recTitle);
    
    arrBookInfo[i] = [recTitle,author,rating,genre,iRecURL]; //, recCoverURL];
  };
  //return iRecURL + " " + arrBL[i] + " " + recTitle;
  //return recCoverURL;
  return arrBookInfo;
  
  
};


function getRec(title) {
  var arrBLd = [];
  var arrBookInfo = [];
  var bookList = getRecList(title);
  //var nRec = (bookList.match(/,/g) || []).length + 1;
  arrBLd = bookList.split(",");
  var arrBL = [...new Set(arrBLd)];
  var j = 0;
  
  for (var i = 0; i < Math.min(arrBL.length, 15); i++) {
    var iRecURL = "www.goodreads.com" + arrBL[i];
    var recTitle = ""
    try {
      recTitle = getTitle(iRecURL).toString().trim();
      arrBookInfo[j] = [recTitle];
      j += 1;
    }
    catch(e) {
      console.log(e)
    }
    
  };

  var flatArray = [].concat(...arrBookInfo);
  var results = Array.from(new Set(flatArray));
  //var results = [...new Set(arrBookInfo)];
  return results;
  
  
  
};


function getRecCover(title){ //(url, bookExt, bookTitle){ //book extension
  //var fromText = 'href="/book/show/136251.Harry_Potter_and_the_Deathly_Hallows" data-reactid';
  //var toText = 'Harry Potter and the Deathly Hallows (Harry Potter, #7)" class="gr-box--withShadow';
  var url = "www.goodreads.com" + getBook(getUrl(title));

  
  //var bookExt = "/book/show/171066"
  //var bookTitle = "Harry Potter and the Deathly Hallows"
  var fromText = 'BookCover'; 
  var toText = 'BookActions';
   
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  //scraped = scraped.match(/https:\/\/.*\.jpg/)
  //Logger.log(scraped);
  return scraped;
  //return insertImage(scraped);
  
};



function getBook(url) {
    var fromText = 'class="bookTitle" itemprop="url" href="';
    var toText = '">';
   
    var content = UrlFetchApp.fetch(url).getContentText();
    var scraped = Parser
                    .data(content)
                    .from(fromText)
                    .to(toText)
                    .build();
    Logger.log(scraped);
    //return getPages(scraped);
    return scraped;
};

function getPages(url) {
    var fromText = '"numberOfPages">';
    var toText = ' pages<';
    var content = UrlFetchApp.fetch("www.goodreads.com/" + url).getContentText();
    var scraped = Parser
                    .data(content)
                    .from(fromText)
                    .to(toText)
                    .build();
    Logger.log(scraped);
    return scraped;
};



function getAuthor(url) {
  var fromText = 'span itemprop="name">';
  var toText = '<';
   
  var content = UrlFetchApp.fetch("www.goodreads.com" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);
  scraped = scraped.replace("&#39;", "'");
  return scraped;
};


function getGenreText(url) {  
  var fromText = 'bigBoxContent containerWithHeaderContent">';
  var toText = 'More shelves...';
  
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);
  var regex = /show\/\w+[-]?\w+?-?\w+/g //lazy
  //var regex = /show\/\w+-?/g;
  var genreMatches = scraped.match(regex);
  var genreList = titleCase(replaceAll(replaceAll(genreMatches.join(),"show", ""), ",", "").slice(1),"/");
  return genreList;
};


function getYearFirstPublished(url) {
  var fromText = 'id="details"';//' ublished ' to fix
  var toText = 'bookDataBox'; //')' to fix
   
  var content = UrlFetchApp.fetch("www.goodreads.com" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  Logger.log(scraped);
  var scrapedLong = scraped;
  scraped = scraped.match(/\d{4}/)
  if (scraped.length < 1){
    scrapedLong
  } else {
    return scraped;
  }
};


function getRatingValue(url) {
  var fromText = 'itemprop="ratingValue">';
  var toText = '<';
   
  var content = UrlFetchApp.fetch("www.goodreads.com" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  scraped = replaceAll(scraped," ","");
  Logger.log(scraped);
  return scraped;
};

function getRatingCountLong(url) {
  var fromText = 'meta itemprop="ratingCount">';
  var toText = '<';
   
  var content = UrlFetchApp.fetch("www.goodreads.com" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  scraped = scraped.replace(" ","");
  Logger.log(scraped);
  return scraped;
};

function getDescriptionText(url) {
  var fromText = 'freeTextContainer';
  var toText = '<br>';
   
  var content = UrlFetchApp.fetch("www.goodreads.com" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  
  return scraped.substring(0,1000);
};


function getAmazonUrl(title) {
  var url = title.replace("'", "%27");
  url = url.replace(":", "%3A");
  url = url.replace("#", "%23");
  url = url.replace("?", "%3F");
  url = url.replace("$", "%24");
  url = url.replace(",", "%2C");
  url = url.replace("/", "%2F");
  url = url.replace("/", "%2B");
  url = url.replace(" ","+");
  url = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Dstripbooks&field-keywords=" + url;
  return url;
};


function getInfo(title) {
  var url = getAmazonUrl(title);
  return getAmazonBook(url, title)
};


function getSomeInfo(url) {
  

};


function getAmazonBook(url, title) {
  var fromText = 'data-attribute="' + title + '"';
  var toText = '<';
   
  var content = UrlFetchApp.fetch("https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Dstripbooks&field-keywords=" + url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  scraped = scraped.replace(" ","");
  Logger.log(scraped);
  return scraped;
};





function getAudibleUrl(title) {

  var rmv = "https://www.goodreads.com/search?q="
  var url = getUrl(title);
  url = url.replace(rmv, "https://www.audible.com/search?keywords=");
  return url;
  
};



function getAudiblePrice(title) {

  var url = getAudibleUrl(title);
  var fromText = "/pd/" + title;
  var toText = title + '</a>';
  var content = UrlFetchApp.fetch(url).getContentText();
  var scraped = Parser
                  .data(content)
                  .from(fromText)
                  .to(toText)
                  .build();
  return scraped.slice(1,40000);
};



/* Originally made for Add Book tab - function name now used on SJW
function addBook() { 
  var bookName = SpreadsheetApp.getActiveSheet().getRange(12,3).getValue();
  return bookName;
};
*/

function doTest() { //val) {
  var val = SpreadsheetApp.getActiveSheet().getRange('G2').getBackground();
  SpreadsheetApp.getActiveSheet().getRange('F2').setValue(val); //val);
};


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

function titleCase(str, delimeter) {
  str = str.toLowerCase().split(delimeter);
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  };
  return str.join(delimeter);
};



//Book Search

/*  
    input Keywords
    output list of books with matches
*/


function searchByKeyword(keywordList) {
  var keywords = keywordList.split(", "); //keywords input by user
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SJW");
  var col = "Y"; //keyword column
  var nRow = sheet.getRange(col + ":" + col).getValues().filter(String).length;
  var bookKeywords = sheet.getRange(6, 25, nRow).getValues(); //keywords for all books column=25
  var bookInfo = sheet.getRange(6, 6, nRow, 8).getValues(); 
  var matches = [];
  var k = -1;
  var j = 0;
  var found = 0;
   
  
  
  //search by keywords
  for (var i = 0; i < nRow; i++){ //loop through bookKeywords
    found = 0;
    for (var j = 0; j < keywords.length; j++) { //loop though keywords
      if (bookKeywords[i][0].toLowerCase().replace("-"," ").search(keywords[j].toLowerCase().replace("-"," ")) > -1) { //if found
        if (found == 0){ //if first match
          k = k + 1;
          matches[k] = bookInfo[i]; //add the matching record
          matches[k].unshift(keywords[j]); //add the keyword that matched to the resulting record
          found = 1;
        } else {
          matches[k][0] = matches[k][0] + ", " + keywords[j]; //add another keyword to resulting record
        };
      };
    };
  };
  
 
  matches.sort(function(a, b) {
    
    var resultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Book Search");
    var sortCol = resultSheet.getRange("F6").getValue();
    var sortColIndex = -1;

    //get sortCol index
    switch (sortCol) {
      case 'Keyword(s) Matched':
        sortColIndex = 0;
        break;
      case 'Goodreads Shelves (sourced)':
        sortColIndex = 1;
        break;
      case 'Genre/Topic':
        sortColIndex = 2;
        break;
      case 'Title':
        sortColIndex = 3;
        break;
      case 'Author':
        sortColIndex = 4;
        break;
      case 'Year':
        sortColIndex = 5;
        break;
      case 'My Rating':
        sortColIndex = 6;
        break;
      case 'Goodreads Rating (x20)':
        sortColIndex = 7;
        break;
      case 'Own?':
        sortColIndex = 8;
        break;
      default:
        sortColIndex = -1;
    };
    
    if (sortColIndex > -1){ //sort by selected column
      if (b[sortColIndex] < a[sortColIndex]) return  -1;
      if (b[sortColIndex] > a[sortColIndex]) return 1;    
      return 0;
    } else { //sort by number of keywords matched
      if (b[0].length < a[0].length) return  -1;
      if (b[0].length > a[0].length) return 1;
      return 0;
    };
      
  });
  
  
  
  return matches;
};





function test1(){
  var arr = ["www.goodreads.com/book/show/8834784-all-the-devils-are-here","www.goodreads.com/book/show/7354453-i-o-u","www.goodreads.com/book/show/7510517-13-bankers","www.goodreads.com/book/show/7513594-crisis-economics","www.goodreads.com/book/show/6025160-lords-of-finance"];
  var results = [];
  
  for (var i = 0; i < arr.length; i++){
    var genre = getGenreText(arr[i]);
    //var title = 
    var author = getAuthor(arr[i].replace("www.goodreads.com",""));
    var rating = getRatingValue(arr[i].replace("www.goodreads.com",""));
    
    results[i] = [arr[i],genre,author,rating];
    
  };
  
  return results[0];
  
};




function insertImage(url) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Recommendations (work in progress)');
  var cell = sheet.getRange("J11");
  cell.setFormula('=IMAGE("' + url + '")');
};



//last edited
function onEdit(e) {
  Logger.log(Session.getActiveUser().getEmail());
  //var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
  var sheet = e.source.getActiveSheet();
  var cell = sheet.getRange('B2')
  var date = new Date();
  if (sheet.getName().length < 4) {
    cell.setValue(date);
  }
  
  //log to change log
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Change Log');
  var i = sheet.getRange("A:H").getValues();
  var lastRow = i.filter(String).length;
  cell = sheet.getRange('A' + lastRow)
  cell.setValue(date)
  
  
};

//addBook

function addBook(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
  var title = sheet.getRange("J2").getValue();
  var recommender = sheet.getRange("K3").getValue();
  var author =getAuthorName(title);
  var year = getYear(title);
  var rating = Math.round(getRating(title) * 20);
  var pages = getPageNumber(title);
  var shelves = getGenre(title);
  var i = sheet.getRange("H6:H").getValues();
  var lastRow = i.filter(String).length + 5;
  
  
  //batch input approach
  //var arr = new Array();
  //var data = [shelves, "", title, author, year.toString(), "", trimLines(rating), "", "", "", "", "", pages, "0"];
  //arr[0] = data;
  //return arr;
  
  //brute force approach  
  sheet.getRange("F" + (lastRow + 1).toString()).setValue(shelves);
  sheet.getRange("H" + (lastRow + 1).toString()).setValue(title);
  sheet.getRange("I" + (lastRow + 1).toString()).setValue(author);
  sheet.getRange("J" + (lastRow + 1).toString()).setValue(year);
  sheet.getRange("L" + (lastRow + 1).toString()).setValue(rating);
  sheet.getRange("R" + (lastRow + 1).toString()).setValue(pages);
  sheet.getRange("S" + (lastRow + 1).toString()).setValue(0);
  sheet.getRange("X" + (lastRow + 1).toString()).setValue(recommender);
};



function trimLines(str){
  str = str.replace(/\s+/g, ' ').trim();
  return str
};


function getHexValue(range) {
 return SpreadsheetApp.getActive().getRange(range).getBackground();
}

//sort by Status
function statusSort(stat){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
  sheet.getRange("BL5").activate();
  var criteria = SpreadsheetApp.newFilterCriteria()
  .setVisibleValues(stat)
  .build();
 
  spreadsheet.getActiveSheet().getFilter().setColumnFilterCriteria(38, criteria);

}


//sort by color

function getHex() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
  var rng = sheet.getRange("H6:H")
  var arrColors = [];
  
  //get cell colors
  var bgColors = rng.getBackgrounds();
  
  /*log in array with titles
  for (var i = 0; i < bgColors.length; i++){
    arrColors[i] = [sheet.getRange("H" + (parseInt(i) + 6).toString()).getValue() , bgColors[i][1] ];
   
    console.log(bgColors);
  };
  */
  
  return bgColors;
  
  /*
  sheet.getRange("H5").activate();
  
  var criteria = SpreadsheetApp.newFilterCriteria()
  .setHiddenValues(['', '#AskGaryVee', '1984', 'A Cry in the Night', 'A Field Guide To Lies', 'A Fine and Pleasant Misery', 'A Handmaid\'s Tale', 'A Long Way Gone', 'A Man Called Ove', 'A Million Miles in a Thousand Years', 'A Short History of Nearly Everything', 'A Stranger is Watching', 'A Tale of Two Cities', 'A Walk in the Woods', 'A Widow for One Year', 'Abraham Lincoln: Vampire Hunter', 'Alexander Hamilton', 'Algorithms to Live By', 'All We Ever Wanted', 'America America', 'America\'s Bitter Pill', 'American Sniper', 'An Invisible Thread', 'And the Dark Sacred Night', 'And the Mountains Echoed', 'Artful Arpeggios BK/CD REH PROLESSONS', 'Astrophysics for People in a Hurry', 'At Home', 'At the Existentialist Cafe', 'Bad Blood: Secrets and Lies in a Silicon Valley Startup', 'Barbarians at the Gate', 'Becoming', 'Bed', 'Beneath a Scarlet Sky', 'Beneath the Marble Sky', 'Bittersweet', 'Black Edge: Inside Information, Dirty Money, and the Quest to Bring Down the Most Wanted Man on Wall Street', 'Blink: The Power of Thinking Without Thinking', 'Boomerang: Travels in the New Third World', 'Born a Crime', 'Breakfast for Champions', 'Brief Answers to the Big Questions', 'Bryson\'s Dictionary of Troublesome Words', 'Building a Story Brand', 'Built: The Hidden Stories Behind our Structures', 'Burial Rites', 'Business Model Generation', 'Capital in the Twenty-First Century', 'Capitalism and Freedom', 'Cat\'s Cradle', 'Celeb\'s Crossing', 'Chasing Rainbows', 'Close Your Eyes', 'Cod: A Biography of the Fish that Changed the World', 'Copenhagen', 'Creating the Twentieth Century: Technical Innovations of 1867-1914 and Their Lasting Impact', 'Creative Quest', 'Creative Schools', 'Creativity, Inc', 'Crucial Conversations', 'Cutting for Stone', 'Das Kapital', 'Data Visualization: A Handbook for Data Driven Design', 'David and Goliath', 'Dead Wake: The Last Crossing of the Lusitania', 'Dear Ijeawele, or A Feminist Manifesto in Fifteen Suggestions', 'Deep Work', 'Defending Jacob', 'Draw to Win', 'Drive: The Surprising Truth About What Motivates Us', 'Dune', 'Educated: A Memoir', 'Effective Data Visualization', 'Einstein’s Dreams', 'Eleanor Oliphant is Completely Fine', 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future', 'Energy and Civilization: A History', 'Essentialism', 'Every Word', 'Extremely Loud & Incredibly Close', 'Factfulness', 'Fahrenheit 451', 'Faith', 'Fear and Loathing in Las Vegas: A Savage Journey to the Heart of the American Dream', 'Feeding the Dragon', 'Fermat\'s Enigma: The Epic Quest to Solve the World\'s Greatest Mathematical Problem', 'Finishing the Hat: Collected Lyrics, 1954-1981, With Attendant Comments, Principles, Heresies, Grudges, Whines, and Anecdotes', 'Flash Boys', 'Following Atticus', 'Freakonomics', 'Getting the Right Things Done', 'Girl in Translation', 'Go Pro: 7 Steps to Becoming a Network Marketing Professional', 'Gone Girl', 'Good Charts', 'Good to Great: Why Some Companies Make the Leap and Others Don\'t', 'Got Your Attention?: How to Create Intrigue and Connect with Anyone', 'Great Expectations', 'Grinding It Out: The Making of McDonald\'s', 'Guitar Grimoire', 'Harry Potter and the Chamber of Secrets', 'Harry Potter and the Deathly Hallows', 'Harry Potter and the Goblet of Fire', 'Harry Potter and the Half-Blood Prince', 'Harry Potter and the Order of the Phoenix', 'Harry Potter and the Prisoner of Azkaban', 'Harry Potter and the Sorcerer\'s Stone', 'Hillbilly Elegy', 'Homo Deus', 'Honolulu', 'Hooked: How to Build Habit Forming Products', 'Hotel On the Corner of Bitter and Sweet', 'How Asia Works', 'How Google Works', 'How to Develop a Super Power Memory', 'How to Lie with Statistics', 'How To Speak Money', 'How to Win Friends and Influence People', 'How To: Absurd Scientific Advice for Common Real-World Problems', 'Humans of New York: Stories', 'Hustle: The Life Changing Effects of Constant Motion', 'Hyperbole and a Half', 'I Am Malala', 'I\'ll Walk Alone', 'If Mayors Ruled the World', 'In a Sunburned Country', 'In the Garden of Beasts: Love, Terror, and an American Family in Hitler\'s Berlin', 'Influence: The Psychology of Persuasion', 'Innocents Abroad', 'Innovation Thinking Methods for the Modern Entrepreneur', 'Innovation Tools', 'Insane City', 'Inside the O\'Briens', 'Insights: Reflections From 101 of Yale\'s Most Successful Entrepreneurs', 'Ishmael', 'Jab, Jab, Jab, Right Hook', 'Jane Eyre', 'Journal of Economic Perspectives', 'Jurassic Park', 'Keep Quiet', 'Keeping the House', 'Kings of the Earth', 'Kitchen Confidential', 'Last Stand of Fox Company', 'Leaves of Grass', 'Leaving Time', 'Leonardo da Vinci', 'Les Miserables', 'Let My People Go Surfing', 'Let the Great World Spin', 'Letters From a Self-Made Merchant to His Son', 'Liar\'s Poker: Rising Through the Wreckage on Wall Street', 'Life of Pi', 'Lilac Girls', 'Liminal Thinking: Create the Change you Want by Changing the Way You Think', 'Live by Night', 'Lone Survivor', 'Look Again', 'Love Anthony', 'Made to Stick', 'Magic of Impromptu Speaking', 'Making the Modern World', 'Manifest der Kommunistischen Partei (Communist Manifesto)', 'Mapping Experiences', 'Maude', 'Me Before You', 'Misbehaving: The Making of Behavioral Economics', 'Moloka\'i', 'Moneyball', 'More Than Good Intentions: Improving the Ways the World\'s Poor Borrow, Save, Farm, Learn, and Stay Healthy', 'Mother Night', 'Mrs. Kimble', 'Mrs. Somebody Somebody', 'Mudbound', 'Musicophilia', 'My Antonia', 'My Inventions: The Autobiography of Nikola Tesla', 'Narrative and Numbers: The Value of Stories in Business', 'Never Split the Difference', 'Next', 'Next: The Future Just Happened', 'No Ordinary Genius: The Illustrated Richard Feynman', 'Notes From a Small Island', 'Nudge', 'On Immunity', 'Once We Were Brothers', 'One Plus One', 'One Summer: America, 1927', 'Onward: How Starbucks Fought for Its Life Without Losing Its Soul', 'Options: The Secret Life of Steve Jobs', 'Orange is the New Black: My Year in a Women\'s Prison', 'Ordinary Grace', 'Orphan Train', 'Orphan\'s Inheritance', 'Out of Poverty: What Works When Traditional Approaches Fail', 'Outliers: The Story of Success', 'Outside Insight: Navigating a World Drowning in Data', 'Palisades Park', 'People Over Profit', 'Plutocrats', 'Poor Economics: A Radical Rethinking of the Way to Fight Global Poverty', 'Power Moves: Lessons From Davos', 'Prep', 'Pride and Prejudice', 'Prisoners of Geography', 'Profit Over People', 'Proof of Heaven: A Neurosurgeon\'s Journey into the Afterlife', 'Quench Your Own Thirst: Business Lessons Learned Over a Beer or Two', 'Remember Everything You Want and Manage the Rest', 'Reminiscences of a Stock Operator', 'Reset: My Fight for Inclusion and Lasting Change', 'Reverse Innovation: Create Far From Home, Win Everywhere', 'Richistan', 'Robert Frost\'s Poems', 'Room', 'Rules of Civility', 'Running Randomized Evaluations: A Practical Guide', 'Sam Walton: Made In America', 'Sapiens: A Brief History of Humankind', 'Second Honeymoon', 'Secrets of the Millionaire Mind', 'Shadow of the Wind', 'Shark Tales: How I Turned $1,000 into a Billion Dollar Business', 'Sharp Objects', 'Shoe Dog: A Memoir by the Creator of Nike', 'Should We Eat Meat?', 'Show and Tell', 'Show Your Work', 'Sister', 'Slapstick', 'Slaughterhouse-Five', 'Sleep Toward Heaven', 'Smart Power', 'Smoke Gets in Your Eyes: And Other Lessons from the Crematory', 'Social Limits to Growth', 'Someone Knows My Name', 'Spam Nation', 'Speak Like Churchill, Stand Like Lincoln', 'Start Something That Matters', 'Start With No', 'Steal Like An Artist', 'Steel Wave', 'Still Alice', 'Still Missing', 'Stillhouse Lake', 'Stone Cold', 'Storytelling with Data', 'Structures: Or Why Things Don\'t Fall Down', 'Stuff Matters', 'Surely You\'re Joking Mr. Feynman!', 'Sustainable Materials - With Both Eyes Open', 'Talk Like TED: 9 Public Speaking Secrets from the World\'s Top Minds', 'Talking to Humans', 'Ten Thousand Saints', 'Terrorist', 'The 10 Pillars of Wealth: Mindsets of the World\'s Richest People', 'The 19th Wife', 'The 7 Habits of Highly Successful People', 'The Achievement Factory', 'The Addiction Formula', 'The Adventures of Huckleberry Finn', 'The Airbnb Story', 'The Alchemist', 'The Amazon Way to IoT', 'The Amazon Way: 14 Leadership Principles Behind the World\'s Most Disruptive Company', 'The Art Forger', 'The Art of Hearing Heartbeats', 'The Art of War', 'The Bartender\'s Tale', 'The Beloved Daughter', 'The Better Angels of Our Nature: Why Violence Has Declined', 'The Big Short', 'The Big Store: Inside the Crisis and Revolution at Sears', 'The Book of General Ignorance', 'The Book Thief', 'The Bottom Billion: Why the Poorest Countries are Failing and What Can Be Done About It', 'The Boys in the Boat', 'The Bully Pulpit', 'The Business Idea Factory', 'The Business Solution to Poverty: Designing Products and Services for Three Billion New Customers', 'The Call of the Wild', 'The Camel Club', 'The Catcher in the Rye', 'The Chaperone', 'The Code Book', 'The Coming Storm', 'The Compound Effect', 'The Connection Algorithm', 'The Conscience of a Conservative', 'The Conscience of a Liberal', 'The Cradle Will Fall', 'The Creative\'s Curse', 'The Dark Tower I: The Gunslinger', 'The Dealmaker\'s Ten Commandments', 'The Devil in the White City', 'The Disappearing Spoon', 'The Dispatcher', 'The End of Jobs: Money, Meaning and Freedom Without the 9-5', 'The Essays of Warren Buffet', 'The Everything Store: Jeff Bezos and the Age of Amazon', 'The Fault in Our Stars', 'The Fifth Risk', 'The Flight of Gemma Hardy', 'The Girl on the Train', 'The Girl Who Kicked the Hornet\'s Nest', 'The Girl with the Dragon Tattoo', 'The Girl You Left Behind', 'The Go Giver', 'The Gods of Gotham', 'The Goldfinch', 'The Good Girl', 'The Good Lawyer', 'The Great Gatsby', 'The Guernsey Literary and Potato Peel Pie', 'The Headmaster\'s Wife', 'The Heartbreaking Work Of Staggering', 'The Hit (Will Robie Book 2)', 'The Hunt', 'The Husband\'s Secret', 'The Idea Factory: Bell Labs and the Great Age of American Innovation', 'The Illustrated Man', 'The Immortal Life of Henrietta Lacks', 'The Intelligent Investor', 'The Invention of Wings', 'The Invisible Bridge', 'The Invisible Man', 'The Kitchen House', 'The Kite Runner', 'The Language of Flowers', 'The Last Lecture', 'The Last Letter From Your Lover', 'The Light Between Oceans', 'The Little Green Book of Getting Your Way', 'The Little Stranger', 'The Long and Short of It', 'The Lord of the Rings', 'The Magic of Reality', 'The Magician\'s Assistant', 'The Memoirs of Sherlock Holmes', 'The Mill River Recluse', 'The Mother Tongue - English and How it Got That Way', 'The New New Thing: A Silicon Valley Story', 'The Other Half of My Soul', 'The Other Side of Innovation: Solving the Execution Challenge (Harvard Business Review)', 'The Painted Bridge', 'The Paris Architect', 'The Paris Wife', 'The Particular Sadness of Lemon Cake', 'The Paying Guests', 'The Pearl Diver', 'The Perfectionists: How Precision Engineers Created the Modern World', 'The Power Broker', 'The Power of Broke: How Empty Pockets, a Tight Budget, and a Hunger for Success Can Become Your Greatest Competitive Advantage', 'The Power of Habit', 'The Power of KM', 'The Prosperity Paradox', 'The Real Book', 'The Red Coat: A Novel of Boston', 'The Return of Sherlock Holmes', 'The River of Doubt', 'The Road to Little Dribbing: More Notes from a Small Island', 'The Rosie Effect', 'The Rosie Project', 'The Rosie Result', 'The Round House', 'The Rumor', 'The Sandcastle Girls', 'The Scarlett Letter', 'The Science Book: 250 Milestones in the History of Science', 'The Secret Keeper', 'The Secret Life of CeeCee Wilkes', 'The Secrets of Mary Bowser', 'The Sense of an Ending', 'The Shoemaker\'s Wife', 'The Silent Wife', 'The Sixth Extinction', 'The Snowball', 'The Song Machine: Inside the Hit Factory', 'The Storied Life of A. J. Fikry', 'The Strategy of Conflict', 'The Structure of Scientific Revolutions', 'The Subtle Art of Not Giving a F*ck', 'The Sun Does Shine: How I Found Life and Freedom on Death Row', 'The Thank You Economy', 'The Theory of Moral Sentiments', 'The Things They Carried', 'The Three-Box Solution: A Strategy For Leading Innovation', 'The Time Keeper', 'The Time Machine', 'The Tipping Point: How Little Things Can Make a Big Difference', 'The True Story Of Kill Or Be Killed In The Real Old West', 'The Truth Machine', 'The Truthful Art: Data, Charts, and Maps for Communication', 'The Undercover Economist', 'The Undoing Project', 'The Unfinished Work of Elizabeth D.', 'The Unwinding', 'The Upstarts: Uber, Airbnb, and the Battle for the New Silicon Valley', 'The Violinist\'s Thumb', 'The War of the Worlds', 'The Wealth of Nations', 'The Wedding Gift', 'The Will to Win', 'The Winter People', 'The Works of Edgar Allen Poe - Volume 1', 'Then Came You', 'These Things Hidden', 'Thing Explainer', 'Thinking, Fast and Slow', 'This Is How You Lose Her', 'Tinkers', 'Tom Sawyer', 'Tools of Titans', 'Townie: A Memoir', 'Trail of Broken Wings', 'Trans-Sister Radio', 'Twain’s Feast', 'Unbroken', 'Unbroken\\', 'Uncle Tom\'s Cabin', 'Under the Banner of Heaven', 'Under the Wide and Starry Sky', 'Unlimited Memory', 'Unshakeable', 'Vagabonding', 'Value Proposition Design', 'Wagner: The Terrible Man and His Truthful Art', 'Walden', 'We Are Not Ourselves', 'Welcome to the Monkey House', 'What If?', 'What The CEO Wants You To Know', 'Who Owns the Future?', 'Who Owns the Ice House?', 'Why Nations Fail: The Origins of Power, Prosperity, and Poverty', 'Wife by Wednesday', 'XKCD', 'You Are Not So Smart', 'Zero to One'])
  .build();
  spreadsheet.getActiveSheet().getFilter().setColumnFilterCriteria(8, criteria);
  
  
  for (var i in bgColors) {
    for (var j in bgColors[i]) {
      Logger.log(bgColors[i][j]);
    }
  }
  Logger.log(bgColors.length)
  */
  
}


//changes on edit of any cell when a specific cell's value is checked against
//checkboxes for status
/*
function onCheck(e) {
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
var r  = sheet.getRange("F1").getValue();
  if (r == true){
    statusSort("Finished");
  }
}
*/

function currentlyReading() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
  var rngCR = sheet.getRange("G2");
  var bgCR = rngCR.getBackground();

  sheet.getRange('F2').setValue(bgCR);

};


//hide mom's books - doesn't work
function toggleKindle(){
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SJW');
var kindleHex = "#d9d2e9";
var arrHex = getHex();
var nRow = sheet.getLastRow();

console.log(nRow);
for (var i = 0; i < parseInt(nRow) + 1; i++){
  if (arrHex[i][0] = kindleHex) {
    sheet.hideRows(parseInt(i));
  }
};

};



function filterPrompt(){
var ui = SpreadsheetApp.getUi();

var response = ui.prompt("Search Filters",ui.ButtonSet.YES_NO_CANCEL);

// Process the user's response.
if (response.getSelectedButton() == ui.Button.YES) {
  Logger.log('The user\'s name is %s.', response.getResponseText());
} else if (response.getSelectedButton() == ui.Button.NO) {
  Logger.log('The user didn\'t want to provide a name.');
} else {
  Logger.log('The user clicked the close button in the dialog\'s title bar.');
}

}


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var htmlOutput = HtmlService
  
  ui
      .createMenu('Filter')
      .addItem('Currently Reading...', 'currentlyReading')
      .addToUi();
  showDialog();
      
}

function showAlert() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.alert(
     'Please confirm',
     'Are you sure you want to continue?',
      ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    ui.alert('Confirmation received.');
  } else {
    // User clicked "No" or X in the title bar.
    ui.alert('Permission denied.');
  }
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('prompt')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Custom Filter');
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function mySleep (sec)
{
  SpreadsheetApp.flush();
  Utilities.sleep(sec*1000);
  SpreadsheetApp.flush();
}



