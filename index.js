const requestLib = require('request');
const Alexa = require('alexa-sdk');
const Promise = require('bluebird');
const { chain } = require('lodash');
const sift = require('sift-distance');

// Constants
const requestPromise = Promise.promisify(requestLib);
const appId = process.env.SKILL_APP_ID;
const normalize = name => name.replace(/\s/g, '').toLowerCase();
const coinWhitelist = ['BTC', 'ETH', 'XRP'];

// Alexa Speech
const launchPrompt = 'Greetings, ask me for the current value of a coin.';
const launchReprompt = 'Go ahead, don\'t be shy.';
const helpPrompt = 'Try saying, what is the price of bitcoin?';
const helpReprompt = 'What can I help you with?';
const unknownCoinOutput = 'Sorry, I could not understand the coin name.';
const unhandledOutput = 'I could not understand your request.';
const goodbyeOutput = 'Goodbye!';
const coinValueOutput = (name, price) => `${name} is worth ${price} dollars`;

// Makes an api request to coincap
function apiRequest(endpoint) {
    return requestPromise(`https://coincap.io${endpoint}`, {
        method: 'get',
        json: true,
    }).then(({ statusCode, body }) => {
        if (statusCode !== 200) {
            throw new Error(`error code ${statusCode}`);
        } else {
            return body;
        }
    });
}

// Intent handlers
const handlers = {
    LaunchRequest: function LaunchRequest() {
        this.emit(':ask', launchPrompt, launchReprompt);
    },
    CoinValue: function ConvertCurrency() {
        const { request } = this.event;
        const coin = request.intent.slots.coin.value;
        if (coin) {
            apiRequest('/front').then((results) => {
                const coinStats = chain(results)
                    .filter(({ short }) => (coinWhitelist.indexOf(short) !== -1))
                    .minBy(({ long }) => sift(normalize(coin), normalize(long)))
                    .value();
                const name = coinStats.long;
                const price = Math.round(100 * coinStats.price) / 100;
                this.emit(':tell', coinValueOutput(name, price));
            });
        } else {
            this.emit(':tell', unknownCoinOutput);
        }
    },
    'AMAZON.HelpIntent': function HelpIntent() {
        this.emit(':ask', helpPrompt, helpReprompt);
    },
    'AMAZON.CancelIntent': function CancelIntent() {
        this.emit(':tell', goodbyeOutput);
    },
    'AMAZON.StopIntent': function StopIntent() {
        this.emit(':tell', goodbyeOutput);
    },
    Unhandled: function Unhandled() {
        this.emit(':tell', unhandledOutput);
    },
};

// Lambda interface
exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = appId;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
