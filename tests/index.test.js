const test = require('tape');
const mockContext = require('aws-lambda-mock-context');

process.env.SKILL_APP_ID = 'amzn1.ask.skill.abc';
const index = require('../index.js');

test('launch request', (t) => {
    t.plan(1);
    const input = {
        session: {
            sessionId: 'SessionId.abc',
            application: {
                applicationId: 'amzn1.ask.skill.abc',
            },
            attributes: {},
            user: {
                userId: 'amzn1.ask.account.abc',
            },
            new: true,
        },
        request: {
            type: 'LaunchRequest',
            requestId: 'EdwRequestId.abc',
            locale: 'en-US',
            timestamp: '2016-12-26T15:11:20Z',
        },
        version: '1.0',
    };
    const context = mockContext();
    index.handler(input, context);
    context.Promise.then(() => {
        t.pass();
    }).catch((error) => {
        t.error(error);
    });
});
