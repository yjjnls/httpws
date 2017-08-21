
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

function tohttpstr(buf){
    var n = buf.indexOf('\n\n');
    var header = buf.value;
    var body = null;
    if( n !== -1 ){
        header = buf.slice(0,n);
        body = buf.slice(n+2);
    }
    var lines = header.split('\n');
    header='';
    for(var i = 0; i < lines.length; i++){
        var line =lines[i];
        header +=line + '\r\n';
    }
    header +='Content-Lenght: ' + (body ? body.length : 0)+'\r\n';
    header +='\r\n';
    return body ? header+body : header;

}
tohttpstr(messageElement.value );




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
	label.innerText ="";
}

function Send(){
    if( socket){
        var msg = tohttpstr(messageElement.value)
        socket.send( msg );
        console.log(msg);
    }

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