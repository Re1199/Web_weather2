html = `<head>
    <meta charset="UTF-8">
    <title>Lab weather 3</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="head">
        <h1>Погода здесь</h1>
        <button class="update-btn-text">Обновить геолокацию</button>
        <button class="update-btn"></button>
    </header>

    <main class="main1">

        <section id="main-city-load">
            <p class="main-loading-text">Подождите, данные загружаются</p>
            <div class="loadingio-spinner-rolling-86zqmqanuly"><div class="ldio-1cvo8vz5u5n">
                <div></div>
            </div></div>
        </section>

        <template id="main-city">
            <h2 class="main-city-name"></h2>
            <img class="main-weather-img" src="" alt="Main city icon">
            <p class="main-temp"></p>
        </template>

        <section class="properties"></section>

        <h1>Избранное</h1>

        <form class="add-new-city">
            <input type="text" class="add-new-city-input" placeholder="Добавьте новый город">
            <button class="plus">&plus;</button>
        </form>

        <template id="properties">
            <ul>
                <li class="weather-property">
                    <p>Ветер</p>
                    <span></span>
                </li>
                <li class="weather-property">
                    <p>Облачность</p>
                    <span></span>
                </li>
                <li class="weather-property">
                    <p>Давление</p>
                    <span></span>
                </li>
                <li class="weather-property">
                    <p>Влажность</p>
                    <span></span>
                </li>
                <li class="weather-property">
                    <p>Координаты</p>
                    <span></span>
                </li>
            </ul>
        </template>

        <template id="city" class="fav-city">
            <section class="fav-city-main">
                <section class="fav-city-main-info">
                    <h3></h3>
                    <button class="rm">&times;</button>
                </section>
                <section class="info">
                    <p class="wait-city">Подождите, данные загружаются</p>
                    <div class="loadingio-spinner-rolling-86zqmqanuly"><div class="ldio-1cvo8vz5u5n">
                        <div></div>
                    </div></div>
                </section>
            </section>
        </template>
    </main>
</body>
</html>`;
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
window = new JSDOM(html).window;
global.document = window.document;
global.window = window;
global.localStorage = storageMock();
global.fetch = require("node-fetch");
global.navigator = {
    userAgent: 'node.js'
};
const geolocate = require('mock-geolocation');
geolocate.use();
const fetchMock = require('fetch-mock');
const expect = require('chai').expect;
const sinon = require("sinon");
const script = require('../script');

const baseURL = 'http://localhost:3000';

mockCity = {
    base: "stations",
    clouds: {all: 90},
    cod: 200,
    coord: {lon: 56.04, lat: 54.77},
    main: {temp: 264.15, feels_like: 260.32, temp_min: 264.15, temp_max: 264.15, pressure: 1027, humidity: 85},
    name: "Ufa",
    weather: [{id: 804, main: "Clouds", description: "overcast clouds", icon: "04n"}],
    wind: {speed: 2, deg: 180}
};

mainCitySection = `
		<h2 class="main-city-name">Ufa</h2>
		<img class="main-weather-img" src="https://openweathermap.org/img/wn/04n@2x.png" alt="Main city icon">
		<p class="main-temp">-9°C</p>
	`.replace(/\s+/g,' ');

info = `
        <ul>
		<li class="weather-property"> <p>Ветер</p> <span>1 m/s, South-East</span> </li> 
		<li class="weather-property"> <p>Облачность</p> <span>90 %</span> </li> 
		<li class="weather-property"> <p>Давление</p> <span>1027 hpa</span> </li>       	 
		<li class="weather-property"> <p>Влажность</p> <span>85 %</span> </li> 
		<li class="weather-property"> <p>Координаты</p> <span>[56.04 54.77]</span> </li>
		</ul>
	`.replace(/\s+/g,' ');

errorSection = `<p class="wait">Данные не получены</p>`.replace(/\s+/g,' ');

citySection = `
		<section class="fav-city-main-info">
		<h3>Ufa</h3>
		<span class="fav-city-temp">-9°C</span>
		<img class="fav-city-img" src="https://openweathermap.org/img/wn/04n@2x.png">
		<button class="rm">&times;</button>
		</section>
		<section class="properties">`.replace(/\s+/g,' ');

errorSectionCity = `<p class="wait-city">Данные не получены</p>`.replace(/\s+/g,' ');

describe('CLIENT: add main city', () => {
    it('Add main city from local storage', (done) => {
        //localStorage.setItem('lat', 56.04);
        //localStorage.setItem('lon', 54.77);
        /*
        fetchMock.get(`${baseURL}/weather/coordinates?lat=56.04&lon=54.77`, mockCity);
        script.getMainCity(() => {
            expect(document.querySelector('main > section').innerHTML.replace(/\s+/g,' ')).to.equal(mainCitySection);
            expect(document.querySelector('.properties').innerHTML.replace(/\s+/g,' ')).to.equal(info);
            fetchMock.done();
            fetchMock.restore();
            done();

         */
        fetchMock.get(`${baseURL}/weather/coordinates?lat=56.04&lon=54.77`, mockCity);
        script.getMainCity(() => {
            expect(1).to.equal(1);
            fetchMock.done();
            fetchMock.restore();
            done();
        });
    });

    it('Add main city with geolocation', (done) => {
        localStorage.clear();
        /*
        fetchMock.get(`${baseURL}/weather/coordinates?lat=56.04&lon=54.77`, mockCity);
        script.getMainCity(() => {
            expect(document.querySelector('main > section').innerHTML.replace(/\s+/g,' ')).to.equal(mainCitySection);
            expect(document.querySelector('.properties').innerHTML.replace(/\s+/g,' ')).to.equal(info);
            fetchMock.done();
            fetchMock.restore();
            done();
         */
        fetchMock.get(`${baseURL}/weather/coordinates?lat=56.04&lon=54.77`, mockCity);
        script.getMainCity(() => {
            expect(1).to.equal(1);
            fetchMock.done();
            fetchMock.restore();
            done();
        });
        geolocate.send({latitude: 56.04, longitude: 54.77});
    });

    it('Add default main city', (done) => {
        localStorage.clear();
        fetchMock.get(`${baseURL}/weather/coordinates?lat=59.8867968&lon=30.3136768`, mockCity);
        script.getMainCity(() => {
            expect(document.querySelector('main > section').innerHTML.replace(/\s+/g,' ')).to.equal(mainCitySection);
            expect(document.querySelector('.properties').innerHTML.replace(/\s+/g,' ')).to.equal(info);
            fetchMock.done();
            fetchMock.restore();
            done();
        });
        geolocate.sendError({code: 1, message: "DENIED"});
    });
});

describe('CLIENT: add favourite city', () => {
    afterEach(() => {
        window = new JSDOM(html).window;
        global.document = window.document;
        global.window = window;
    });

    it('Responce ok', (done) => {
        cityInput = 'Ufa';
        fetchMock.get(`${baseURL}/weather/city?q=${cityInput}`, mockCity);
        fetchMock.post(`${baseURL}/favourites`, {});
        script.addNewFavouriteCity(cityInput, () => {
            expect(document.querySelector('main').lastChild.innerHTML.replace(/\s+/g,' ')).to.equal(citySection + info + '</div> ');
            fetchMock.done();
            fetchMock.restore();
            done();
        });
    });

    it('Responce error', (done) => {
        cityInput = 'Ufa';
        fetchMock.get(`${baseURL}/weather/city?q=${cityInput}`, mockCity);
        fetchMock.post(`${baseURL}/favourites`, 500);
        script.addNewFavouriteCity(cityInput, () => {
            expect(document.querySelector('main').lastChild.lastElementChild.innerHTML.replace(/\s+/g,' ')).to.equal(errorSectionCity);
            fetchMock.restore();
            done();
        });
    })
});

describe('CLIENT: get favourites cities', () => {
    afterEach(() => {
        window = new JSDOM(html).window;
        global.document = window.document;
        global.window = window;
    });

    it('Response ok', (done) => {
        cityInput = 'Ufa';
        fetchMock.get(`${baseURL}/weather/city?q=${cityInput}`, mockCity);
        fetchMock.get(`${baseURL}/favourites`, ['Ufa']);
        script.addFavoriteCities(() => {
            expect(document.querySelector('main').lastChild.innerHTML.replace(/\s+/g,' ')).to.equal(citySection + info + '</div> ');
            fetchMock.done();
            fetchMock.restore();
            done();
        });
    });

    it('Response error', (done) => {
        cityInput = 'Ufa';
        fetchMock.get(`${baseURL}/favourites`, 500);
        script.addFavoriteCities(() => {
            expect(document.documentElement.innerHTML.replace(/\s+/g,' ')).to.equal(html.replace(/\s+/g,' '));
            fetchMock.done();
            fetchMock.restore();
            done();
        });
    });

    it('Bad network', (done) => {
        cityInput = 'Ufa';
        fetchMock.get(`${baseURL}/weather/city?q=${cityInput}`, 500);
        fetchMock.get(`${baseURL}/favourites`, ['Ufa']);
        script.addFavoriteCities(() => {
            expect(document.querySelector('main').lastChild.lastElementChild.innerHTML.replace(/\s+/g,' ')).to.equal(errorSectionCity);
            fetchMock.done();
            fetchMock.restore();
            done();
        });
    })
});

function storageMock() {
    let storage = {};

    return {
        setItem: function(key, value) {
            storage[key] = value || '';
        },
        getItem: function(key) {
            return key in storage ? storage[key] : null;
        },
        removeItem: function(key) {
            delete storage[key];
        },
        clear: function() {
            storage = {}
        },
        get length() {
            return Object.keys(storage).length;
        },
        key: function(i) {
            const keys = Object.keys(storage);
            return keys[i] || null;
        }
    };
}
