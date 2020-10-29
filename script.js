apiKey = 'f44383d3d3092878d5f25d2805cbf23b';
baseURL = 'https://api.openweathermap.org/data/2.5/weather';

function addListeners() {
	document.querySelector('.add-new-city').addEventListener('submit', (event) => {
		event.preventDefault();
		cityInputValue = document.querySelector('.add-new-city-input').value;
		city = addCity(cityInputValue);
		fetch(`${baseURL}?q=${cityInputValue}&appid=${apiKey}`).then(response => response.json()).then(data => {
			if (data.name !== undefined) {
				cities = localStorage.getItem('favourites') ? JSON.parse(localStorage.getItem('favourites')) : [];
				cities.push(data.name);
				localStorage.setItem('favourites', JSON.stringify(cities));
				addCityInfo(data);
			} else {
				alert('Город не найден');
				city.remove();
			}
		})
			.catch(function () {
				city.lastElementChild.innerHTML = `<p class="wait-city">Данные не получены</p>`
			});
		document.querySelector('.add-new-city-input').value = "";
	});
	document.querySelector('.update-btn-text').addEventListener('click', (event) => {
		updateGeolocation();
	});
	document.querySelector('.update-btn').addEventListener('click', (event) => {
		updateGeolocation();
	});
}

function getMainCity() {
	latitude = localStorage.getItem('lat');
	longitude = localStorage.getItem('lon');
	(latitude == null || longitude == null) ? updateGeolocation() : addMainCity(latitude, longitude)
}

function updateGeolocation() {
	geolocation = navigator.geolocation;
	geolocation.getCurrentPosition( position => {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		addMainCity(latitude, longitude);
		},
		positionError => {
			addMainCity(59.894444, 30.264168); //spb
		});
}

function addMainCity(latitude, longitude) {
	localStorage.setItem('lat', latitude);
	localStorage.setItem('lon', longitude);
	fetch(`${baseURL}?lat=${latitude}&lon=${longitude}&appid=${apiKey}`).then(response => response.json()).then(data => {
		temp = Math.round(data.main.temp - 273) + '°C';
		document.querySelector('main > section').innerHTML = '';
		document.querySelector('main > section').appendChild(mainCityHtml(data.name, data.weather[0]['icon'], temp));
		document.querySelector('.properties').innerHTML = '';
		document.querySelector('.properties').appendChild(infoHTML(data));
	})
		.catch(function () {
			document.querySelector('#main-loading').innerHTML = `<p class="main-loading-text">Данные не получены</p>`
		});
}

function addFavouriteCities() {
	if (localStorage.getItem('favourites') == null && localStorage.getItem('default') == null) {
		localStorage.setItem('favourites', JSON.stringify(['Moscow', 'Helsinki', 'London', 'Paris', 'Berlin', 'Dublin']));
		localStorage.setItem('default', 'true');
	}

	favouriteCities = localStorage.getItem('favourites') ? JSON.parse(localStorage.getItem('favourites')) : [];
	for (i = 0; i < favouriteCities.length; i++) {
		addCity(favouriteCities[i]);
	}

	favoritesCitiesSet = new Set(favouriteCities);
	for (favouriteCity of favoritesCitiesSet) {
		fetch(`${baseURL}?q=${favouriteCity}&appid=${apiKey}`).then(resp => resp.json()).then(data => {
			addCityInfo(data);
		})
			.catch(err => {
				document.querySelectorAll(`.${favouriteCity} > .info`).forEach( item => {
					item.innerHTML = `<p class="wait-city">Данные не получены</p>`;
				});
			});
	}
}

function addCity(cityName) {
	template = document.querySelector('#city');
	template.content.firstElementChild.setAttribute('class', cityName);
	template.content.querySelector('h3').textContent = cityName;
	elem = template.content.cloneNode(true).firstElementChild;
	city = document.querySelector('main').appendChild(elem);
	btn = city.firstElementChild.lastElementChild;
	btn.addEventListener( 'click' , (event) => {
		city = event.currentTarget.parentNode.parentNode;
		cityName = city.getAttribute('class');
		i = 0;
		prevSibling = city;
		while (prevSibling.previousElementSibling.getAttribute('class') !== 'add-new-city') {
			prevSibling = prevSibling.previousElementSibling;
			i++;
		}
		cities = localStorage.getItem('favourites') ? JSON.parse(localStorage.getItem('favourites')) : [];
		cities.splice(i, 1);
		localStorage.setItem('favourites', JSON.stringify(cities));
		city.remove();
	});
	return elem;
}

function addCityInfo(data) {
	temp = Math.round(data.main.temp - 273) + '&deg;' + 'C';
	cityNameClass = data.name;
	document.querySelectorAll(`.${cityNameClass} > .fav-city-main-info > h3`).forEach( item => {
		if (item.parentNode.children.length === 2) {
			item.insertAdjacentHTML('afterend', `
   				<span class="fav-city-temp">${temp}</span>
   				<img class="fav-city-img" src="https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png">
   			`);
		}
	});
	document.querySelectorAll(`.${cityNameClass} > .info`).forEach(item => {
		item.innerHTML = '';
		item.appendChild(infoHTML(data));
	});
}

function mainCityHtml(name, icon, temp) {
	template = document.querySelector('#main-city');
	template.content.querySelector('h2').textContent = name;
	template.content.querySelector('.main-weather-img')
		.setAttribute('src', `https://openweathermap.org/img/wn/${icon}@2x.png`);
	template.content.querySelector('.main-temp').textContent = temp;
	return template.content.cloneNode(true);
}

function infoHTML(data) {
	template = document.querySelector('#properties');
	span = template.content.querySelectorAll('span');
	span[0].textContent = `${data.wind.speed} m/s, ${windDirection(data.wind.deg)}`;
	span[1].textContent = data.clouds.all + ' %';
	span[2].textContent = data.main.pressure + ' hpa';
	span[3].textContent = data.main.humidity + ' %';
	span[4].textContent = `[${data.coord.lon} ${data.coord.lat}]`;
	return template.content.cloneNode(true);
}

function windDirection(deg) {
	if (deg < 22.5 || deg >= 337.5) {
		return 'North';
	}
	if (deg < 67.5) {
		return 'North-East';
	}
	if (deg < 112.5) {
		return 'East';
	}
	if (deg < 157.5) {
		return 'South-East';
	}
	if (deg < 202.5) {
		return 'South';
	}
	if (deg < 247.5) {
		return 'South-West';
	}
	if (deg < 292.5) {
		return 'West';
	}
	else return 'North-West'
}


addListeners();
getMainCity();
addFavouriteCities();