  function Myfunction() {
    var response = UrlFetchApp.fetch("https://www.yahoo.co.jp");
    var text = response.getContentText("utf-8");
    //console.log(text);

    //トップニュースのブロックを抽出
    var topic_block = Parser.data(text).from('class="_2jjSS8r_I9Zd6O9NFJtDN-"').to('class="_3sm0x0pVyxLkf4q9ubmXSL"').build();
    // console.log(topic_block);

    //ulタグで囲まれている記述（トップニュース）を抽出
    var content_block = Parser.data(topic_block).from('<ul>').to('</ul>').build();
    // console.log(content_block);

    // ニュースリスト用の配列変数を宣言
    var newsList= new Array();
    // console.log(newsList)
   


    // content_blockの要素のうち、aタグに囲まれている記述を抽出
      topics=Parser.data(content_block).from('<a class=').to('</div></a>').iterate();
      // topics = Parser.data(content_block).from('<span').to('</span>').iterate();
      // topics = Parser.data(content_block).from('<span').to('</span>').iterate();

      // console.log(topics);
  

    // aタグに囲まれた記述の回数分、順位／タイトル／URLを抽出する
    for(news of topics){

      //配列内のインデックス番号+1を取得（ニュース掲載順位として利用）
      var newsRank = topics.indexOf(news) + 1;

      //URL取得
      let newsUrl = news.replace(/.*href="/,"").replace(/".*/,"");
      // console.log(newsUrl);
      //タイトル取得
      var newsTitle = news.replace(/.*class="fQMqQTGJTbIMxjQwZA2zk _1alzSpTqJzvSVUWqpx82d4">/,"").replace(/<.*>/,"");
      // console.log(newsTitle)
      
      

      // 各ニュースページからカテゴリを取得
        var newsResponse = UrlFetchApp.fetch(newsUrl);
        var newsText = newsResponse.getContentText("utf-8");

        var newsCategory = Parser.data(newsText).from('トピックス（').to('）').build();



      // ニュース順位、URL、タイトルの組を作成
      var newsInfo = [newsRank, newsUrl, newsTitle, newsCategory];
      // console.log(newsInfo);

      // ニュースリストに格納
      newsList.push(newsInfo);
    }
    return newsList;
  }

 function postSlackbot(message) {
  // SlackAPIで登録したボットのトークンを設定する
  let token = "token";
  // ライブラリから導入したSlackAppを定義し、トークンを設定する
  let slackApp = SlackApp.create(token);
  // Slackボットがメッセージを投稿するチャンネルを定義する
  let channelId = "C05FV6KMB2Q";

  // SlackAppオブジェクトのpostMessageメソッドでボット投稿を行う
  const error = slackApp.postMessage(channelId, message);
  // console.log(error);
 }
 function formatNewsListForSlack(newsList) {
  let message = '';
  for (const newsInfo of newsList) {
    const [newsRank, newsUrl, newsTitle, newsCategory] = newsInfo;
    message += `*${newsRank}. ${newsTitle}*\n`;
    message += `カテゴリー: ${newsCategory}\n`;
    message += `URL: ${newsUrl}\n\n`;
  }
  return message;
}


 function main() {
    const newsList=Myfunction();
    console.log(newsList);
    const formattedMessage = formatNewsListForSlack(newsList);
    console.log(formattedMessage);
    // postSlackbot(formattedMessage);
 }
