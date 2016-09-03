const chance = require('./support/chance');
const EventEmitter = require('events');
const socketServer = require('../app/socketServer');

const expect = require('chai').expect;

describe('socketServer', () => {
  describe('handleConnections', () => {
    const srv = new EventEmitter();
    const storage = new EventEmitter();
    const handleConnections = socketServer._handleConnections; // eslint-disable-line no-underscore-dangle

    let client1;
    let client2;
    let client3;

    const buildMockClient = (num) => Object.create(new EventEmitter(), {
      id: { enumerable: true, value: `client-${num}-${chance.word()}` },
    });

    let req1;
    let req2;

    let res1;
    let res2;

    let handledRequests;
    let handledResponses;

    beforeEach(() => {
      srv.removeAllListeners();
      storage.removeAllListeners();

      client1 = buildMockClient(1);
      client2 = buildMockClient(2);
      client3 = buildMockClient(3);

      handleConnections(srv, storage);

      srv.emit('connection', client1);
      srv.emit('connection', client2);
      srv.emit('connection', client3);

      req1 = { request: chance.data.request() };
      req2 = { request: chance.data.request() };

      res1 = { response: chance.data.response() };
      res2 = { response: chance.data.response() };

      handledRequests = [[], [], []];
      handledResponses = [[], [], []];

      client1.on('request-saved', (data) => { handledRequests[0].push(data); });
      client2.on('request-saved', (data) => { handledRequests[1].push(data); });
      client3.on('request-saved', (data) => { handledRequests[2].push(data); });

      client1.on('response-saved', (data) => { handledResponses[0].push(data); });
      client2.on('response-saved', (data) => { handledResponses[1].push(data); });
      client3.on('response-saved', (data) => { handledResponses[2].push(data); });
    });

    it('should notify connected client that request has been saved', () => {
      storage.emit('request-saved', req1);
      storage.emit('request-saved', req2);

      expect(handledRequests[0]).to.eql([req1, req2]);
      expect(handledRequests[1]).to.eql([req1, req2]);
      expect(handledRequests[2]).to.eql([req1, req2]);
    });

    it('should notify connected client that response has been saved', () => {
      storage.emit('response-saved', res1);
      storage.emit('response-saved', res2);

      expect(handledResponses[0]).to.eql([res1, res2]);
      expect(handledResponses[1]).to.eql([res1, res2]);
      expect(handledResponses[2]).to.eql([res1, res2]);
    });

    it('should not notify disconnected clients', () => {
      client1.emit('disconnect');
      client3.emit('disconnect');

      storage.emit('request-saved', req1);
      storage.emit('request-saved', req2);
      storage.emit('response-saved', res1);
      storage.emit('response-saved', res2);

      expect(handledRequests[0]).to.eql([]);
      expect(handledRequests[2]).to.eql([]);

      expect(handledResponses[0]).to.eql([]);
      expect(handledResponses[2]).to.eql([]);
    });
  });
});
