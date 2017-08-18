
var socket=null;
if(typeof(WebSocket) == "undefined") {
    alert("your browser not support WebSocket");
}


var labelElement   = document.getElementById('in_message');
var urlElement     = document.getElementById('url');
var messageElement = document.getElementById('out_message');
var btnConnect     = document.getElementById('btnConnect');
var btnDisconnect  = document.getElementById('btnDisconnect');
labelElement.innerText="========    "+getNowFormatDate()+"    ========";
btnDisconnect.disabled= true;

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}
function print(txt){
    labelElement.innerText +='\n'
    for( var i =0; i < arguments.length; i++){
        var value =arguments[i];
        if( !typeof value === 'string'){
            value = JSON.stringify(value)
        }
        labelElement.innerText += ' ' + value +' ';
    }
}
function log(txt){
    
    labelElement.innerText +="\n["+getNowFormatDate()+"] "
    for( var i =0; i < arguments.length; i++){
        var value =arguments[i];
        if( !typeof value === 'string'){
            value = JSON.stringify(value)
        }
        labelElement.innerText += ' ' + value +' ';
    }
}


function Clear()
{
	
    var label = document.getElementById('in_message');
	label.innerText ="$"

    //let header_elements = document.getElementsByName('request_header');
    //
    //let body_elements = document.getElementsByName('request_body');
    //
    //fetch(url_elements[0].value, {
    //    method: "POST",
    //    headers: header_elements[0].value,
    //    body: body_elements[0].value
    //}).then(function(res) {
    //    if (res.ok) {
    //        document.getElementById('res').innerText = res;
    //    } else if (res.status == 401) {
    //        alert("Oops! You are not authorized.");
    //    }
    //}, function(e) {
    //    alert("Error submitting form!");
    //});


}

function Send(){
    if( socket){
        socket.send( messageElement.value );
    }
	console.log(socket, messageElement.value);

}

function OnButtonConnect(){
    Connect()
}

function OnButtonDisconnect(){
    Disconnect()

}

function Connect(){
    var url = urlElement.value;
    socket = new WebSocket(url);
    btnConnect.disabled= true;
    btnDisconnect.disabled= true;
    urlElement.disabled= true;
    log("connecting to "+ url);
    
    socket.onopen = function() {
        log("connect OK!")
        btnConnect.disabled = false;
        btnDisconnect.disabled = false;
    };

    socket.onmessage = function(msg) {
        log("got message from peer.");
        print(msg.data);
    };
    
    socket.onclose = function() {
        log("socket closed !");
        delete socket;
        Disconnect();
    };
    //发生了错误事件
    socket.onerror = function() {
        log("socket error !");
    }
}

function Disconnect(){
    if( socket ){
        socket.close();
        delete socket;
    }
    btnConnect.disabled = false;
    btnDisconnect.disabled = true;
    urlElement.disabled= false;
    

}