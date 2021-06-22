define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./docs/main.js",
    "group": "/home/fatjon/Desktop/ProgettoRC.2021/docs/main.js",
    "groupTitle": "/home/fatjon/Desktop/ProgettoRC.2021/docs/main.js",
    "name": ""
  },
  {
    "type": "get",
    "url": "/findbyplace?luogo={location}&data={date}&size={nrEvents}",
    "title": "by location/date",
    "name": "GetEventsLocDate",
    "group": "FindEvent_API",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "location",
            "description": "<p>Città dell'evento</p>"
          },
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Data formato aaaa-mm-gg</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "nrEvents",
            "description": "<p>Quanti eventi si vuol vedere</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "event",
            "description": "<p>Array di data dei eventi</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n'json eventi in risposta'",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "FindEvent_API"
  },
  {
    "type": "get",
    "url": "/findtodayevents?longitudine={long}&latitudine={lat}&size={nrEvents}",
    "title": "by long/lat",
    "name": "GetEventsLonLat",
    "group": "FindEvent_API",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "long",
            "description": "<p>Longitudine</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lat",
            "description": "<p>Latitudine</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "nrEvents",
            "description": "<p>Quanti eventi si vuol vedere</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "event",
            "description": "<p>Array di data dei eventi</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n'json eventi in risposta'",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./server.js",
    "groupTitle": "FindEvent_API"
  }
] });
