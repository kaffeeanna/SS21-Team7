# WS21-Team7

Repository für Team 7

um den code auszuführen, wird nodejs benötigt

Betriebsanleitung

1. öffne den Terminal und gehe in /Case
2. öffne einen zweiten Terminal und gehe in /Ring
3. führe in beiden Terminals npm install aus
4. gehe in /Ring/main.js und gebe dort deine IP adresse (bei windows im terminal ipconfig eingeben) für den Client ein
5. führe in beiden Terminals node main.js aus
6. öffne den Browser in Terminal1(Server) und gehe auf http://localhost:3001 (Case)
7. öffne den Browser in Terminal2(Client) und gehe auf http://localhost:3002 (Ring)

Bugs:
man kann ein Training ohne Namen erstellen, indem man direkt auf den Button klickt. Das bringt allerdings nichts, weil man nicht auf die "Leere" Route zugreifen kann.

wenn man ein vorinstalliertes training macht und mehr objekte scannt, als vorgesehen sind, friert der Ring ein.
