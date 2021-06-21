# API fornite

* Richiesta degli eventi per luogo e data:
  * GET
```
'http://localhost:5000/findbyplace?luogo={luogo-ricerca}&data={data:yyyy/mm/dd}&size={numero_massimo_eventi_risposta}
```
------------------------


* Richiesta degli eventi nella giornata odierna per coordinate:
  * GET
```
'http://localhost:5000/findtodayevents?longitudine={longitudine}&latitudine={latitudine}&size={numero_massimo_eventi_risposta}
```
