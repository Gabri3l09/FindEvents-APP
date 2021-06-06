#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(e0, connection) {
    if (e0) {
        throw e0;
    }
    connection.createChannel(function(e1, channel) {    // creazione del canale
        if (e1) {
            throw e1;
        }

        var queue = 'Messaggi';     // coda da cui leggo

        channel.assertQueue(queue, {    // definisco l'idempotenza della coda
            durable: false
        });

        console.log("--- Messaggi in coda ---");

        channel.consume(queue, function(msg) {      // prelevo le informazioni dalla cosa
            console.log(msg.content.toString());
        }, {
            noAck: true
        });
    });
});
