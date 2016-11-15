var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
const TABLE_NO = 101;
var recognition;
var intro;
var orderContainer;
var menuContainer;
var buttonelem;
var delay=8000;
var synth;

var response = [
[/*	Welcome strings	*/	"Hi Welcome to Bob Evans, The finest and freshest food. To begin press the speak button and ask for our menu.", "Hi I'm your food assistant today. Ask for menu whenever you are ready.", "Welcome to Bob Evans. I would be at your service. Just ask for the menu when you are ready."],
[/*	Menu strings	*/ 	"Sure, Here is the menu. Please use speak button to order.", "My pleasure, Please have a look at menu.", "I'm delighted to present our delicious offerings.", "Sure, Here are the available items."],
[/*	Order strings	*/ 	"I will take down that order. Can I serve with some more delicacies?", "That's a great choice. What else would you like to have?", "Excellent, Can I serve something else?", "That is a fabulous choice", "That is our special. I'm sure you are going to love it"],
[/*	Info strings	*/ 	"Sure here is some more information."],
[/* Cancel Strings] */ "Your order has been cancelled."],
[/*	Default strings	*/ 	"I'm sorry, I couldn't get that. Can you repeat it?", "My apologies, Can you repeat that last statement", "I'm afraid I couldn't get that last statement", "Unfortunately I couldn't get that last statement.", "I beg your pardon", "I'm not sure I follow. Can you repeat that?"]
];

function randomSpeak(index) {
	var arr_len = response[index].length;
	str_idx = Math.floor(Math.random() * arr_len);
	speak(response[index][str_idx]);
}

function onLoad(){
    orderContainer = document.getElementById("orders");
    menuContainer = document.getElementById("menu");
    intro = document.getElementById("intro");
	buttonelem = document.getElementById("TalkTo");
    
    orderContainer.style.visibility = 'hidden';
    menuContainer.style.visibility = 'hidden';
	buttonelem.disabled = true;

    synth = window.speechSynthesis;
    
    if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
    };

    recognition.onerror = function(event) {
        if (event.error == 'no-speech' || event.error == 'audio-capture' || event.error == 'not-allowed') {
          ignore_onend = true;
        }
    };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  recognition.onresult = function(event) {
    //var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
        recognition.onend = null;
        upgrade();
        stopListening();
        return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        //interim_transcript += event.results[i][0].transcript;
      }
    }  
    final_transcript = capitalize(final_transcript);
    console.log(final_transcript);
    sendText(final_transcript);
    final_transcript='';
    //final_span.innerHTML = linebreak(final_transcript);
    //interim_span.innerHTML = linebreak(interim_transcript);
  };
}
	initTable();
	//speak("Hi! Welcome to Bob Evans – the finest and freshest food! To begin press the speak button and ask for our menu.");
	randomSpeak(0);
	setTimeout(function() {
		buttonelem.disabled = false;
	}, delay);	

}
    


function upgrade() {
    console.log("upgrage chrome browser!!");
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}


const API_INIT = "https://scary-spirit-73076.herokuapp.com/ratatouille/init/";
const API_SEND = "https://scary-spirit-73076.herokuapp.com/ratatouille/listen/";

function speak(text) {
	buttonelem.value = "Speak"
    
    var utterText = new SpeechSynthesisUtterance(text);
    utterText.lang = 'en-US';
    utterText.pitch = 1.1; // 0 to 2
    utterText.rate = 0.7; // 0.1 t0 10
    utterText.volume = 1 // range 0 to 1
	utterText.onend = function() {
		buttonelem.disabled = false;
	};
    synth.speak(utterText);
    interimSpan.innerHTML=text;
}

var orderId = 0;
var init = false;

var listenAni;
var interimSpan;
//var TalkToBtn;
var orderTable;
var menuTable;

function initTable() {
    var data = new FormData();
    data.append('tbNo', TABLE_NO);
    
    final_transcript = '';
    recognition.lang = 'en-IN';
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_timestamp = event.timeStamp;
    
    interimSpan = document.getElementById("interim_span");
    //TalkToBtn = document.getElementById("TalkTo");
    orderTable = document.getElementById("orders");
    menuTable = document.getElementById("menu");
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_INIT, true);
    xhr.onload = function () {
        // do something to response
	   if(xhr.status == 200) {
           var parseResponse = JSON.parse(xhr.response);
           orderId = parseResponse.orderId;
           console.log("Receiced orderId = "+orderId);
 //          startListening();
	   }
    };
    xhr.send(data);
//    speak("Hi! Welcome to Bob Evans – the finest and freshest food! To begin press the speak button and ask for our menu.");
}

var prevText="";
function sendText(text) {
    if(prevText == text || text=="" || orderId == 0) {
        return;
    }
    console.log(text);
    prevText = text;
    var data = new FormData();
    console.log("orderID in sendText->"+orderId);
    data.append('orderId', orderId);
    data.append('reqText',text);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_SEND, true);
    xhr.onload = function () {
        // do something to response
	   if(xhr.status == 200) {
           var reply = JSON.parse(xhr.responseText);
           stopListening();
           var id = reply['pre'];
           console.log("id->"+id);
           console.log("reply->"+reply['message']);
           if(id==1) { // show menu
			   
			   //speak("Sure! Here is the menu!! When you are ready, please use speak button to let me know the item you would like to order.");
			   ShowMenu(id, reply['message']);
           }
           else if(id==2) { // add order
               ShowOrders(id, reply['message']);
           }
           else if(id==3) { // item info
               var str="Sure! here is some more information on";
			   intro.style.visibility = 'hidden';
               str.concat(reply['key']);
               str.concat(". ");
               str.concat(reply['value']);
               speak(str);
           }
           else if(id==4) { // cancel order
              //speak(reply['message']);
               cancelOrders(id);
           }
           else {
            //speak("I'm sorry I couldn't get that! Can you repeat it?");
			randomSpeak(5);
           }
	   }
        else {
            //speak("I'm sorry I couldn't get that! Can you repeat it?");
			randomSpeak(5);
            speak(reply['message']);
        }
    };
    console.log(data);
    xhr.send(data);
}

function animateListening() {
  //TalkToBtn.disabled = true;
  var pos = 0;
  listenAni = setInterval(frame, 500);
  interimSpan.style.fontSize = "xx-large";
  function frame() {
      if(pos == 0) {
		  buttonelem.value = "Listening";
          //interimSpan.innerHTML="Listening";
          pos=1;
      }
      else if(pos == 1) {
		  buttonelem.value = "Listening.";
          //interimSpan.innerHTML="Listening.";
          pos=2;
      }
      else if(pos == 2) {
		  buttonelem.value = "Listening..";
          //interimSpan.innerHTML="Listening..";
          pos=3;
      }
      else {
 		  buttonelem.value = "Listening...";
         //interimSpan.innerHTML="Listening...";
          pos=0
      }
  }
}

function toggleButton() {
    if(recognizing) {
        stopListening();
        return;
    }
    else {
        startListening();
    }
}


var menuDisplayed = false;

function ShowMenu(id, menuReply) {
    if(menuDisplayed) {
        return;
    }

    intro.style.visibility = 'hidden';
    randomSpeak(id);
    menuDisplayed = true;

    menuContainer.style.visibility = 'visible';
    for(i=0; i<menuReply.length; i++) {
        var rowPos = menuTable.rows.length;
        var row = menuTable.insertRow(rowPos);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        cell1.innerHTML = rowPos;
        cell2.innerHTML = menuReply[i];
        console.log(menuReply[i]);
        cell3.innerHTML = '5$';    
    }
    
}

var OrdersDisplayed = false;

function ShowOrders(id, orderReply) {
    intro.style.visibility = 'hidden';
    randomSpeak(id);
    //speak("I have taken down that order. What else would you like to have?");
    OrdersDisplayed = true;
    orderContainer.style.visibility = 'visible';
    for(var key in orderReply) {
        var rowPos = orderTable.rows.length;
        var row = orderTable.insertRow(rowPos);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        cell1.innerHTML = rowPos;
        cell2.innerHTML = key;
       // console.log("->"+orderReply);
        cell3.innerHTML = orderReply[key];
    }
}

function cancelOrders(id) {
    if(OrdersDisplayed == false) {
        return;
    }
    intro.style.visibility = 'hidden';
    randomSpeak(id);
    OrdersDisplayed = false;
    var rowLen = orderTable.rows.length;
    console.log("rowLen->"+rowLen);
    for(var i=rowLen-1; i>0; i--) {
        orderTable.deleteRow(i);
    }
    orderContainer.style.visibility = 'hidden';
}

function startListening() {
    buttonelem.disabled = true;
    interimSpan.innerHTML="";
    animateListening();
    recognition.start();
}

function stopListening() {
    buttonelem.disabled = false;
    recognition.stop();
    clearInterval(listenAni);
    interimSpan.innerHTML="";
    //TalkToBtn.disabled = false;
    interimSpan.style.fontSize = "medium";
    
}