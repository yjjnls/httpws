
# introduction
The intentions of 'httpws' to echange WebRTC Endpoint media description exachange, another potention needs is to call an intranet WebService from internet. So we initiated the idea - take the websocket as an http tunnel.  The topologic like this

            [Proxy( http over web socket)]
              /                   \
             /                     \
      ----  / --------+   +-------- \-------
        [Endpoint]    |   |      [Endpoint]
                      |   |

Endpoints in intranet, will interactive with another one  via Proxy.


