
# introduction
The intentions of 'httpws' is to exchange WebRTC Endpoint media description, another potention needs is to call an intranet WebService via internet. So we initiated the idea - take the websocket as an http tunnel.  The topologic like this

                  
                [ Proxy( http over web socket) ]@internet
                    /                   \
                   /                     \
  (intranet)----  / --------+   +-------- \-------(intranet)
              [Endpoint1]    |   |      [Endpoint2]
                             |   |
      
Endpoints deploy in intranet, will interactive with another one via Proxy (on internet).


A question here is how do Enpoint1 send request to Endpoint2, since IP addres of Endpint2 is unvisiable(or not unique). Current solution is to manage the virtual address by Proxy. for example, Endpoint2 connect to Proxy by ws://Proxy.ip/Endpoint2address, the Proxy will record the connection and mark his virtual adress as 'Endpoint2address'.Thus Endpoint1 will be able to access Endpoint2 with 'Endpoint2adress' by simply put the 'Endpoint2address' in http header host.

There will be 2 kinds of message exchanged in websocket, HTTP(RFC 2616) which is the leading role and WS-Indication which use to notify client status or some exception.

httpws message package define

`message-line  CRLF payload `
message-line describe what payload is. syntax 

message-line:
:(request|response) `sequence-id` continue
request and response indicate the paylaod is HTTP request line or status line, The sequence id is used to paire the request and response. If http message is send by trunck 'continue' will be add untill the last one. for now chunk is not supported.


:error
{
    "errno": 409, //use HTTP status code
    "reason":'Conflict',
    "appinfo":"Only one connect permmition IP alreay connected."
}
