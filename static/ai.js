var username = "";
var id = "";
var emoticons = {}
var emoDir = "/ai/static/emoticons/"

emoticons[":D"] = "big_smile.gif"
emoticons[":d"] = "big_smile.gif"
emoticons[":-?"] = "confused.gif" 
emoticons[":*"] = "kiss.gif"
emoticons[":-*"] = "kiss.gif"
emoticons[":x"] = "love.gif"
emoticons[":("] = "sad.gif"
emoticons[":o"] = "surprised.gif"
emoticons[":-p"] = "tongue.gif"
emoticons[":|"] = "undecided.gif"
emoticons[":))"] = "very_happy.gif"
emoticons[":)"] = "happy.gif"
emoticons[";)"] = "wink.gif"

// Used by speech recognition and speech synthesis
var recognition;
var utterance; 
var nextMessage;
var isSpeaking;
var isRecognizing;
var speechLang = "en-US";

function setCookie(name, value, exdays)
{
    var exday = new Date();
    exday.setDate(exday.getDate() + exdays);

    var c_value = escape(value) + ((exdays==null) ? "" : "; expires=" + exday.toUTCString());
    
    document.cookie = name + "=" + c_value;
}

function getCookie(c_name)
{
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++)
  {
    x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g,"");

    if (x==c_name)
    {
      return unescape(y);
    }
  }
}

function checkCookie()
{
    username = ''
    username = getCookie("username");
    
    if (username!=null && username!="")
    {
        //alert("Welcome again boss " + username);
    }
    else
    {
      while (username == null || username == "")
	      username=prompt("Please enter your name:","");
        setCookie("username",username,1);
    }
    
    id = Math.random()
    $.ajax({
	      url: "/ai/send",
        data: {
          "lang": speechLang,
          "user": id,
          "text": "Hi, my name is " + username,
        },
        type: "post",
	      success: function(text){
            receiveText(text)
        },
        
        error: function(html) {
            console.debug(html)
        }
    });
}

function receiveText(text)
{
  if ('speechSynthesis' in window) {
    // Synthesis support. Make Jessica talk!
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.onend = function(event) {
      setTimeout(function() {
        startListening();
      }, 400);
    }
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }
  else {
    console.log("cannot talk!");
  }

  for(var emo in emoticons)
  for(var i = 0;i < 10;++i)
  	text = text.replace(emo, '<img src = "' + emoDir + emoticons[emo] + '" >')

  setTimeout(function() {
    appendText('Jessica', text);
  }, 300);
}

function startListening() {
  if (typeof recognition == 'undefined' || recognition == null) {
    nextMessage = 0;
    recognition = new webkitSpeechRecognition();
    recognition.lang = speechLang;
    recognition.continuous = true;
    $("#notifications").show();
    recognition.onsoundstart = function(event) {
      isRecognizing = true;
      $("#mic").css('background-image', 'url("static/mic-slash.gif")');
    }
    recognition.onaudiostart = function(event) {
      $("#notifications").hide();
    }
  
    recognition.onresult = function(event) {
      //console.log("heard: " + event.results[nextMessage][0].transcript)
      if (window.speechSynthesis.speaking == true || isSpeaking == true) {
        ++nextMessage;
        return;
      }

      // Send the first result, ignore accuracy
      sendText(event.results[nextMessage++][0].transcript);
      $("#mic").css('background-image', 'url("static/mic.gif")');
    }
    recognition.start();
  } else {
    console.log("start listening...")
    isSpeaking = false;
    if (isRecognizing == true)
      $("#mic").css('background-image', 'url("static/mic-slash.gif")');
  }
}

function sendText(text)
{
  if (typeof text == 'undefined') {
    text = $("#input-box > form > input").val()
    $("#input-box > form > input").val('');
  }

  var mess = text;
  for(var emo in emoticons)
  for(var i = 0;i < 10;++i)
  	text = text.replace(emo, '<img src = "' + emoDir + emoticons[emo] + '" >')
  
  appendText(username, text);
  $.ajax({
    url: "/ai/send",
    data: {
      "lang": speechLang,
      "user": id,
      "text": mess,
    },
    type: "post",
    success: function(response){
      receiveText(response);
    },
        
    error: function(html) {
      console.debug(html)
    }
  });

  // Important to prevent form post send
  return false;
}

function appendText(user, text) {
  $("#text-box").append('<p><span class="user"> <font color=black >' +
    user + '></font></span> <font color="black"><span class="message"> '+
    text + '</span></font></p>')
  $("#text-box").scrollTop(10000)
}

function updateLanguage(langauge) {
  speechLang = langauge
  recognition = null
  startListening()
}
