# ProgettoRC.2021 - FindEvents

## Requisiti richiesti
1. Il servizio REST deve offrire a terze parti delle API documentate.
2. SERV si deve interfacciare con almeno due servizi REST di terze parti.
3. Almeno uno dei servizi REST esterni deve essere “commerciale”.
4. Almeno uno dei servizi REST esterni deve richiedere oauth.
5. La soluzione deve prevedere l'uso di protocolli asincroni.
6. Il progetto deve essere su GIT.

## Breve descrizione del progetto
**FindEvent** è un'applicazione web che può essere utilizzata, come suggerisce il nome, per la ricerca di eventi in un determinato un luogo, in una determinata una data o per la ricerca di eventi che si svolgono nella giornata odierna intorno all'utente. Quest'applicazione è nata con l'intento voler aiutare gli utenti nella ricerca di eventi futuri di qualsiasi genere (sportivi, musicali, teatrali, ...) o per agevolare la ricerca di eventi intorno a se.
 
## Servizi esterni utilizzati
- Google (Autenticazion) - REST
- Google Maps (Localizzazione) - REST
- Google Calendar (Memorizzare evento sul calendario) -REST
- RabbitMQ (Message queue) / WebSocket (Chat) - Async protocol

## Predisporre la macchina per supportare l'applicazione
L'applicazione è prevista per il funzionamento su sistemi operativi Linux. Il server è basato sul linguaggio *Node.js* e prevede l'utilizzo di contenitori *Docker* per supportare l'applicazione *RabbitMQ*. Inoltre per il corretto funzionamento dell'applicazione è necessario installare alcuni *node modules*:
```
npm install express
npm install cookie-parser
npm install request
npm install amqplib
npm install google-auth-library
npm install ejs
npm install dotenv
```
Qual'ora non partissero i comandi come scritti, usare *sudo* per eseguire i comandi come amministratore

## Come muoversi nell'applicazione
L'avvio dell'applicazione, sulla porta 5000, avviene facendo partire il programma *server.js* ➝ 'node server.js'

