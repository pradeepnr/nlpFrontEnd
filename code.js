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
var delay=500;
var synth;

var response = [
[/* 0	Welcome strings	*/	"Hi Welcome to Bob Evans, The finest and freshest food. To begin press the speak button and ask for our menu.", "Hi I'm your food assistant today. Ask for menu whenever you are ready.", "Welcome to Bob Evans. I would be at your service. Just ask for the menu when you are ready."],
[/* 1	Menu strings	*/ 	"Sure, Menu is displayed above. Please use speak button to order.", "My pleasure, Please have a look at menu. Use the speak button to order.", "I'm delighted to present our delicious offerings. Use the speak button to order.", "Sure, the available items are displayed. Please use speak button to order."],
[/*	Order strings	*/ 	"I will take down that order. What other delicacies can I serve?", "That's a great choice. What else would you like to have?", "Excellent, What can I serve next?", "That is a fabulous choice! What more can I serve?", "That is our special. I'm sure you are going to love it"],
[/*	3 Info strings	*/ 	"Sure here is some more information."],
[/*	4 Cancel Confirmation	*/ 	"Are you sure you want to cancel the order? Please use speak button to confirm."],
[/* 5 modify */ "order is modified as per your requirement"],
[/* 6 show capability */ "Hi, I can guide you with available menu items and take your order. To begin just say show me the menu"],
[/* 7 Bill order */ ""],
[/* 8 Close order */ ""],
[/* 9 generic */ ""],    
[/* 10 Finalize Order */ "Your order is confirmed."],
[/*	11 Cancel Strings] */ 	"Your order has been cancelled."],
[/* 12 Water */ " Sure, It will be served soon"],
[/* 13 Restroom */ "It's on right end of the corridor"],
[/* 14 salt */ "Sure, I'll request salt and pepper to be served on table"],
[/* 15 grounding */ "ok"],
[/* 16 empty */ ""]
];

response[100] = [/*	100 Default strings	*/ 	"I'm sorry, I couldn't get that. Can you repeat it?", "My apologies, Can you repeat that last statement", "I'm afraid I couldn't get that last statement", "Unfortunately I couldn't get that last statement.", "I beg your pardon", "I'm not sure I follow. Can you repeat that?"]

function randomSpeak(index) {
	var arr_len = response[index].length;
	str_idx = Math.floor(Math.random() * arr_len);
	speak(response[index][str_idx]);
}

var resetBtn = false;

function onLoad() {
    orderContainer = document.getElementById("orders");
    menuContainer = document.getElementById("menu");
    intro = document.getElementById("intro");
	buttonelem = document.getElementById("TalkTo");
    
    orderContainer.style.visibility = 'hidden';
    menuContainer.style.visibility = 'hidden';

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
   // console.log("onresult");
    resetBtn = false;
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
    DisplayStr(final_transcript);
    sleep(2000).then(() => {
        sendText(final_transcript);
        final_transcript='';
    });

    //final_span.innerHTML = linebreak(final_transcript);
    //interim_span.innerHTML = linebreak(interim_transcript);
  };
    
    recognition.onaudiostart = function() {
        console.log("onaudiostart");
        resetBtn = true;
    };
    
    recognition.onaudioend = function() {
        
        console.log("onaudioend");
        if(true == resetBtn ) {
            console.log("onaudioend did reset");
            resetBtn = false;
            resetStopBtn();
        }
        else {
            console.log("onaudioend didn't reset");
        }
    };
    
}
	initTable();
	//speak("Hi! Welcome to Bob Evans – the finest and freshest food! To begin press the speak button and ask for our menu.");
	randomSpeak(0);
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
    var utterText = new SpeechSynthesisUtterance(text);
    utterText.lang = 'en-US';
    utterText.pitch = 1.1; // 0 to 2
    utterText.rate = 1.0; // 0.1 t0 10
    utterText.volume = 1 // range 0 to 1
    var disableBtnHack = true;
	utterText.onend = function() {
        console.log("onend() called");
		buttonelem.disabled = false;
	};
    utterText.onstart = function() {
        buttonelem.disabled = true;
        console.log("onstart() called");
	};
    var i = 0;
    var wc = WordCount(text);
    var words = text.split(" ");
    
    utterText.onboundary = function() {
        if(i<wc) {
            DisplayStr(words[i]);
            i++;
        }
	};
    
    console.log("utterance", utterText); 
    synth.speak(utterText);
    
}

function DisplayStr(str, clear=false) {
    if(clear) {
        interimSpan.innerHTML = "";
    }
    interimSpan.innerHTML= interimSpan.innerHTML+" " +str;
}

function WordCount(str) { 
  return str.split(" ").length;
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
    orderTable = document.getElementById("orders");
    menuTable = document.getElementById("menu");

    interimSpan.style.fontSize = "large";
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

function sendText(text) {
    if(text=="" || orderId == 0) {
        //stopListening();
        return;
    }
    console.log(text);
    var data = new FormData();
    console.log("orderID in sendText->"+orderId);
    data.append('orderId', orderId);
    data.append('reqText',text);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_SEND, true);
    xhr.onload = function () {
        // do something to response
       var reply = JSON.parse(xhr.responseText);
       console.log("Received Response from backend errorcode->"+reply['errorCode']);
       stopListening();
	   if(xhr.status == 200 && reply['errorCode'] == 200) {

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
               var desc = reply['message'];
               for(var key in desc) {
                   str = str.concat(key);
                   str = str.concat(". ");
                   str = str.concat(desc[key]);
               }
               speak(str);
           }
           else if(id==4) { // cancel order - request confirmation
               cancelConfirmation(id);
           }
           else if(id==5) { // modify
            ShowOrders(id, reply['message']);
           }
           else if(id == 6) { // show capability
               randomSpeak(id);
               resetStopBtn();
           }
           else if(id == 7 ) { // Bill order
               
           }
           else if(id == 8) { // close order
               
           }
           else if(id == 9) { // generic
               var str = reply['message'];
               var generic_id = id;
               if(str.localeCompare('water') == 0) {
                   generic_id += 3;
               }
               else if(str.localeCompare('restroom') == 0) {
                   generic_id += 4;
               }
               else if(str.localeCompare('salt') == 0) {
                   generic_id += 5;
               }
               randomSpeak(generic_id);
               resetStopBtn();
           }
           else if(id==10) { // finalize order
               randomSpeak(id);
               resetStopBtn();
           }
           else if(id==11) { // cancel order - confirmed
               if(reply['message'] == 1000) {
                   cancelOrders(id);
               }
               else {
                   randomSpeak(15);
               }
           }
           else if(id==12) {
               speak(reply['message']);
           }
           else if(id==13) {
               removeOrderItem(reply['message']);
           }
           else {
			randomSpeak(100);
           }
	   }
        else {
            //speak("I'm sorry I couldn't get that! Can you repeat it?");
			randomSpeak(100);
            //speak(reply['message']);
        }
    };
    console.log("Request sent to server");
    xhr.send(data);
}

function animateListening() {
  var pos = 0;
  listenAni = setInterval(frame, 500);
  function frame() {
      if(pos == 0) {
		  buttonelem.value = "Listening";
          pos=1;
      }
      else if(pos == 1) {
		  buttonelem.value = "Listening.";
          pos=2;
      }
      else if(pos == 2) {
		  buttonelem.value = "Listening..";
          pos=3;
      }
      else {
 		  buttonelem.value = "Listening...";
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

function ShowMenu(id, menuReply) {
	randomSpeak(id);
    intro.style.visibility = 'hidden';
    menuContainer.style.visibility = 'visible';

    var rowsToDel = menuTable.rows.length;
    for(i=rowsToDel-1; i>=0; i--) {
        menuTable.deleteRow(i);
    }
    for(i=0; i<menuReply.length; i++) {
        var rowPos = menuTable.rows.length;
        var row = menuTable.insertRow(rowPos);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        cell1.innerHTML = i+1;
        cell2.innerHTML = menuReply[i];
        cell3.innerHTML = '5$';    
    }
    
}

var OrdersDisplayed = false;

function ShowOrders(id, orderReply) {
    intro.style.visibility = 'hidden';
    randomSpeak(id);
    OrdersDisplayed = true;
    orderContainer.style.visibility = 'visible';
        
    for(var key in orderReply) {
        var rowPos = orderTable.rows.length;
        var done = false;
        for(i=1;!done && i<rowPos;i++) {
            if(key == orderTable.rows[i].cells[1].innerHTML) {
                orderTable.rows[i].cells[2].innerHTML = Number(orderReply[key]);
                done = true;
            }
        }
        if(!done) {
            console.log("first time");
            var row = orderTable.insertRow(rowPos);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            cell1.innerHTML = rowPos;
            cell2.innerHTML = key;
            cell3.innerHTML = orderReply[key];
			cell3.align = 'center';
        }
    }
}

function removeOrderItem(item) {
    console.log("remove order item->"+item)
    var found = false;
    var len = orderTable.rows.length;
    var i=0
    for(; !found && i<len; i++) {
        console.log(orderTable.rows[i].cells[1]);
        if(orderTable.rows[i].cells[1].innerHTML == item) {
            found = true;
            break;
        }
    }
    if(found) {
        if(len == 2) {
            cancelOrders(16);
        }else {
            for(j=i+1;j<len;j++) {
                var num = Number(orderTable.rows[j].cells[0].innerHTML);
                orderTable.rows[j].cells[0].innerHTML = Number(num-1);
            }
            orderTable.deleteRow(i);
        }
    }
}

function cancelConfirmation(id) {
    randomSpeak(id);
}

function cancelOrders(id) {
    if(OrdersDisplayed == false) {
        resetStopBtn();
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
    console.log("start listening");
    buttonelem.disabled = true;
    interimSpan.innerHTML="";
    animateListening();
    recognition.start();
}

function stopListening() {
    console.log("stop listening");
    recognition.stop();
    resetStopBtn();
}

function resetStopBtn() {
    buttonelem.disabled = false;
    clearInterval(listenAni);
    interimSpan.innerHTML="";
    buttonelem.value = "Speak"
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
