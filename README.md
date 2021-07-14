# WS21-Team7

Repository für Team 7
https://github.com/kaffeeanna/SS21-Team7

Um den Code ausführen zu können, wird nodejs benötigt.

Betriebsanleitung

1. Öffne das Terminal und gehe in /Case
2. Öffne einen zweiten Terminal und gehe in /Ring
3. Führe in beiden Terminals npm install aus
4. Gehe in /Ring/main.js und gebe dort deine IP Adresse (bei windows im terminal ipconfig eingeben) für den Client ein
5. Führe in beiden Terminals node main.js aus
6. Öffne den Browser in Terminal1(Server) und gehe auf http://localhost:3001 (Case)
7. Öffne den Browser in Terminal2(Client) und gehe auf http://localhost:3002 (Ring)

Wir haben Tutorials/Libraries, die uns geholfen haben, verlinkt. Wenn eine Stelle 1:1 kopiert wurde, wurde dies im Code kenntlich gemacht.
Alle NPM Packages sind in den package-lock.txt Dateien notiert.

Bugs:

- Man kann ein Training ohne Namen erstellen, indem man direkt auf den Button klickt. Das bringt allerdings nichts, weil man nicht auf die "leere" Route zugreifen kann.

- Wenn man ein vorinstalliertes Training macht und mehr Objekte scannt, als vorgesehen sind, friert der Ring ein.

- Wenn man zu schnell auf >weiter< drückt, kann die Audio/Bilddatei fehlerhaft sein und dann funktioniert das Training nicht mehr richtig. Dann einfach resetten und weiter gehts.

VIEL SPAß!
