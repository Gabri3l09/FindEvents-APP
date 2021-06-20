# ProgettoRC.2021 - FindEvents
Brunetti Jacopo <br> Domenico Meconi <br> Topllari Fatjon

## Requisiti richiesti
1. Il servizio REST deve offrire a terze parti delle API documentate.
2. SERV si deve interfacciare con almeno due servizi REST di terze parti.
3. Almeno uno dei servizi REST esterni deve essere “commerciale”.
4. Almeno uno dei servizi REST esterni deve richiedere oauth.
5. La soluzione deve prevedere l'uso di protocolli asincroni.
6. Il progetto deve essere su GIT.

## Breve descrizione del progetto
**FindEvent** è un'applicazione web che può essere utilizzata, come suggerisce il nome, per la ricerca di eventi in un determinato un luogo, in una determinata una data o per la ricerca di eventi che si svolgono nella giornata odierna intorno all'utente. Quest'applicazione è nata con l'intento voler aiutare gli utenti nella ricerca di eventi futuri di qualsiasi genere (sportivi, musicali, teatrali, ...) o per agevolare la ricerca di eventi intorno a se.
 
## Servizi utilizzati
- Google (Autenticazion) - REST
- Google Maps (Localizzazione)
- Google Calendar (Memorizzare evento sul calendario) - REST
- Ticket Master (Eventi) - REST
- RabbitMQ (Message queue) - Async protocol

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
Per far partire l'istanza *Docker* bisogna inserire da console la seguente istruzione:
```
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-managment 
```
###### Qual'ora non partissero i comandi come scritti, usare *sudo* per eseguire i comandi come amministratore

## Come muoversi nell'applicazione
L'avvio dell'applicazione, sulla porta 5000, avviene facendo partire il programma *server.js* ➝ 'node server.js'

Andando sul browser, digitando 'http://localhost:5000', verremo reindirizzato nella pagina di *index.ejs* da cui è possibile fare il login, utilizzando il proprio account google, per accedere al servizio. Una volta acceduti, ci si trova nella pagina *dashboard.ejs*, pagina che può esser definita come hub della nostra applicazione.

Da qui è possibile inserire una città ed una data per cercare un evento in base ai parametri passati, da qui verremo reindirizzati sulla pagina *listevents.ejs* in cui possiamo trovare una tabella con le informazioni relative agli eventi (Nome, Link per l'acquisto del biglietto, Data, Ora). Al di sotto di questa tabella possiamo inserire le informazioni relative all'evento di interesse che possiamo memorizzae nel proprio calendario di google. Compilati i campi e inviato il form si aprirà la schermata di google in cui poter scegliere rispetto quale calendario si vuol memorizzare l'evento. Una volta effettuato l'inserimento, si può ritornare sulla dashboard.

Dalla pagina di *dashboard.ejs* è possibile andare a vedere gli eventi odierni, infatti, cliccando sul link 'Vedi gli eventi odierni intorno a te', si verrà reindirizzati sulla pagina *today.ejs* in cui possiamo trovare una mappa in cui è presente un marker che indica la posizione dell'utente; qual'ora l'utente venisse mappato in modo errato, potrebbe cliccare sul link 'Rimappami' per ricaricare la pagina. Cliccando sul botone di conferma, si verrà reindirizzati sulla pagina *todaylist.ejs* in cui possiamo trovare una pagina molto simile alla pagine di *listevent.ejs*.

Da *dashboard.ejs*, è possibile anche inviare un messaggio agli amministratori cliccando sul relativo link. Da qui verremo reindirizzati sulla pagina *chat.ejs* in cui è possibile scrivere ed inviare il messaggio agli amministratori.

Per visualizzare i messaggi ricevuti, gli amministratori, possono inserire dalla pagina di *dashboard.ejs* una password, che gli permetterà di arrivare sulla pagina *logad.ejs*, in cui è possibile trovare tutti i messaggi non letti dall'amministratore.

