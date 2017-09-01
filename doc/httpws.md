
# introduction
The intentions of 'httpws' is to exchange WebRTC Endpoint media description, another potention needs is to call an intranet WebService via internet. So we initiated the idea - take the websocket as an http tunnel.  The topologic like this

                  
                [ Proxy( http over web socket) ]@internet
                    /                   \
                   /                     \
  (intranet)----  / --------+   +-------- \-------(intranet)
              [Endpoint1]    |   |      [Endpoint2]
                             |   |
      
Endpoints deploy in intranet, will interactive with another one via Proxy (on internet).

A question here is how do Enpoint1 send request to Endpoint2, since IP addres of Endpint2 is unvisiable(or not unique). Current solution is managed by Proxy, for example Endpoint2 connect to Proxy by ws://Proxy.ip/Endpoint2address, we will mark



A question here is how do Enpoint1 send request to Endpoint2, since IP addres of Endpint2 is unvisiable(or not unique). Current solution is to manage the virtual address by Proxy. for example, Endpoint2 connect to Proxy by ws://Proxy.ip/Endpoint2address, the Proxy will record the connection and mark his virtual adress as 'Endpoint2address'.Thus Endpoint1 will be able to access Endpoint2 with 'Endpoint2adress' by simply put the 'Endpoint2address' in http header host.

There will be 2 kinds of message exchanged in websocket, HTTP(RFC 2616) which is the leading role and WS-Indication which use to notify client status or some exception.

HTTP messages are unvarnished tranmit in websocket, we only add 'CSeq: number'  for request/response paire.

WS-Indication is start with ':' and the format is as below
* :host < virtual name >
   <p>
   notify client whose virtual address, if not send his virtual address will be the connect url path part
   </p>

* :error < error_token  > < reason (utf8 text with quotation) >
   <p>
   indicate some error occurred.
   </p>
