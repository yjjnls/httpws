
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

HTTP message eclonsed in websocket message. Large HTTP message may split to several chunk via WS message. the WS message format as below.
```
WS-Message = command-line  CRLF payload

command-line    = ":" cmmand-type SP sequence-number ( chunk-number )
command-type    = "request" | "response" | "message"
sequence-number = 1*OCTET 
chunk-number    = 1*OCTET 

paylaod         =  HTTP-message | ext-message

HTTP-message    = see RFC261

ext-message     = may (to be define)
```

* HTTP-message  </p>
  see RFC2616 [http://www.ietf.org/rfc/rfc2616.txt]
  </p>

* command-line </p> indicate what's the payload type websocket message </p>

* command-type 
  </p>
   request  is the http Request message

   response is the http Response message

   message indicate 
</p>

