const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const request = require('request');
const sinon = require('sinon');
require('sinon-mongo');

const server = require('../server-script');

const MongoClient = require('mongodb').MongoClient;
const Collection = require('mongodb/lib/collection');
const urlMongo ='mongodb+srv://admin2:1234@cluster0.4svkt.mongodb.net/<Cluster0>?retryWrites=true&w=majority';
const apiKey = '315bdb45e49dcae9a4a9512b11a04583';
const baseURL = 'https://api.openweathermap.org/data/2.5/weather';


describe('SERVER HTTP-request: GET /weather/city', () => {
    it('Response ok', (done) => {
        const responseObject = {
            statusCode: 200,
        };

        const responseBody = {
            "coord": {
                "lon": 37.62,
                "lat": 55.75
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ]
        };

        city = 'Moscow';

        requestMock = sinon.mock(request);
        requestMock.expects("get")
            .once()
            .withArgs(`${baseURL}?q=${city}&appid=${apiKey}`)
            .yields(null, responseObject, JSON.stringify(responseBody));

        chai.request(server)
            .get('/weather/city?q=' + city)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.eql(responseBody);
                requestMock.verify();
                requestMock.restore();
                done();
            });
    });

    it('Response error', (done) => {
        let city = 'Saint Petersburg';

        requestMock = sinon.mock(request);
        requestMock.expects("get")
            .once()
            .withArgs(`${baseURL}?q=${city}&appid=${apiKey}`)
            .yields(new Error(), null, null);

        chai.request(server)
            .get('/weather/city?q=' + city)
            .end((err, res) => {
                res.should.have.status(500);
                requestMock.verify();
                requestMock.restore();
                done();
            });
    })
});

describe('SERVER HTTP-request: GET /weather/coordinates', () => {
    it('Response ok', (done) => {
        const responseObject = {
            statusCode: 200,
        };

        const responseBody = {
            "coord":{"lon":30.38,"lat":59.85},
            "weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]
        };

        let lon = 30.38;
        let lat= 59.85;

        requestMock = sinon.mock(request);
        requestMock.expects("get")
            .once()
            .withArgs(`${baseURL}?lat=${lat}&lon=${lon}&appid=${apiKey}`)
            .yields(null, responseObject, JSON.stringify(responseBody));

        chai.request(server)
            .get(`/weather/coordinates?lat=${lat}&lon=${lon}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.eql(responseBody);
                requestMock.verify();
                requestMock.restore();
                done();
            });
        request.restore();
    });

    it('Error', (done) => {
        let lon = 30.38;
        let lat= 59.85;

        requestMock = sinon.mock(request);
        requestMock.expects("get")
            .once()
            .withArgs(`${baseURL}?lat=${lat}&lon=${lon}&appid=${apiKey}`)
            .yields(new Error(), null, null);

        chai.request(server)
            .get(`/weather/coordinates?lat=${lat}&lon=${lon}`)
            .end((err, res) => {
                res.should.have.status(500);
                requestMock.verify();
                requestMock.restore();
                done();
            });
        request.restore();
    })
});

describe('SERVER HTTP-request: POST /favourites', () => {
    it('Response ok', (done) => {
        let body = `name=London`;

        let mockCollection = sinon.mongo.collection();
        mockCollection.insertOne
            .yields(null, { ops: [{ name: 'London' }]});

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .post('/favourites')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.insertOne);
                done();
            });
    });

    it('Error', (done) => {
        let body = `name=London`;

        let mockCollection = sinon.mongo.collection();
        mockCollection.insertOne
            .yields(new Error(), null);

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .post('/favourites')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(body)
            .end((err, res) => {
                res.should.have.status(500);
                sinon.assert.calledOnce(mockCollection.insertOne);
                done();
            });
    })
});

describe('SERVER HTTP-request: GET /favourites', () => {
    it('ok response from weather database', (done) => {
        let mockCollection = sinon.mongo.collection();
        let cities = [{name: 'London'}, {name: 'Paris'}];
        mockCollection.find
            .returns(sinon.mongo.documentArray1(null, cities));

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .get('/favourites')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.eql(['London', 'Paris']);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });

    it('error response from weather database', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection.find
            .returns(sinon.mongo.documentArray1(new Error(), null));

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .get('/favourites')
            .end((err, res) => {
                res.should.have.status(500);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    })
});

describe('SERVER HTTP-request: DELETE /favourites', () => {
    it('ok response from weather database', (done) => {
        let mockCollection = sinon.mongo.collection();
        let cities = [{_id: '5aa5aa5a5aa5aa5a5aa5aa5a', name: 'London'}, {_id: '63f63f9963f63f9963f63f99', name: 'Paris'}];
        mockCollection.find
            .returns(sinon.mongo.documentArray1(null, cities));
        mockCollection.deleteOne
            .yields(null, {_id: '63f63f9963f63f9963f63f99', name: 'Paris'});

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        let body = 'num=1';

        chai.request(server)
            .delete('/favourites')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    });

    it('error response from weather database', (done) => {
        let mockCollection = sinon.mongo.collection();
        let cities = [{_id: '5aa5aa5a5aa5aa5a5aa5aa5a', name: 'London'}, {_id: '63f63f9963f63f9963f63f99', name: 'Paris'}]
        mockCollection.find
            .returns(sinon.mongo.documentArray1(null, cities));
        mockCollection.deleteOne
            .yields(new Error(), null);

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        body = 'num=1';

        chai.request(server)
            .delete('/favourites')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(body)
            .end((err, res) => {
                res.should.have.status(500);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    })
});

sinon.mongo.documentArray1 = (err, result) => {
    if (!result) result = [];
    if (result.constructor !== Array) result = [result];

    return {
        sort: sinon.stub().returnsThis(),
        toArray: function f() {
            var callback = arguments[arguments.length - 1];
            if (typeof callback !== "function") {
                throw new TypeError("Expected a function");
            }
            callback.apply(null, [err, result]);
        }
    }
};


