const apikey = "8dc6b1c305f4af3a406e00164a278f82";

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let lon = position.coords.longitude;
            let lat = position.coords.latitude;
            const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&` + `lon=${lon}&appid=${apikey}`;

            fetch(url)
                // 🛠️ ERROR HANDLING ADDED
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Weather data not available (${res.status})`);
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    weatherReport(data);
                })
                // 🛠️ ERROR HANDLING ADDED
                .catch(error => {
                    console.error("Error fetching weather by location:", error);
                    alert("Could not fetch weather for your location. Please search manually.");
                });

        // 🛠️ ERROR HANDLING ADDED for geolocation failure
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Geolocation permission denied or unavailable. Please search for a city manually.");
        });
    }
});

// Event listener for the Enter key on the input field
document.getElementById('input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        searchByCity();
    }
});

function searchByCity() {
    var place = document.getElementById('input').value;
    // Input validation (already existed)
    if (place.trim() === '') {
        alert('Please enter a city name.');
        return;
    }

    var urlsearch = `http://api.openweathermap.org/data/2.5/weather?q=${place}&` + `appid=${apikey}`;

    fetch(urlsearch)
        // 🛠️ ERROR HANDLING ADDED
        .then(res => {
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("City not found. Please check the spelling.");
                } else {
                    throw new Error(`API error: ${res.status}`);
                }
            }
            return res.json();
        })
        .then((data) => {
            console.log(data);
            weatherReport(data);
        })
        // 🛠️ ERROR HANDLING ADDED
        .catch(error => {
            console.error("Error searching by city:", error);
            alert(error.message); // e.g., "City not found."
        });

    document.getElementById('input').value = '';
}

function weatherReport(data) {
    var urlcast = `http://api.openweathermap.org/data/2.5/forecast?q=${data.name}&` + `appid=${apikey}`;

    fetch(urlcast)
        // 🛠️ ERROR HANDLING ADDED
        .then(res => {
            if (!res.ok) {
                throw new Error(`Forecast data not available (${res.status})`);
            }
            return res.json();
        })
        .then((forecast) => {
            console.log(forecast.city);
            hourForecast(forecast);
            dayForecast(forecast);

            // This code runs only if forecast fetch is successful
            console.log(data);
            document.getElementById('city').innerText = data.name + ', ' + data.sys.country;
            document.getElementById('temperature').innerText = Math.floor(data.main.temp - 273) + ' °C';
            document.getElementById('clouds').innerText = data.weather[0].description;
            
            let icon1 = data.weather[0].icon;
            let iconurl = "http://api.openweathermap.org/img/w/" + icon1 + ".png";
            document.getElementById('img').src = iconurl;
        })
        // 🛠️ ERROR HANDLING ADDED
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            // Alert user but don't break the app. Main weather might still be shown
            // from the *previous* successful search if the forecast part fails.
            alert("Could not load forecast data.");
            // Clear forecast sections to avoid showing stale data
            document.querySelector('.templist').innerHTML = '<p>Forecast data unavailable.</p>';
            document.querySelector('.weekF').innerHTML = '';
        });
}

function hourForecast(forecast) {
    document.querySelector('.templist').innerHTML = '';
    for (let i = 0; i < 5; i++) {
        var date = new Date(forecast.list[i].dt * 1000);
        let hourR = document.createElement('div');
        hourR.setAttribute('class', 'next');

        let div = document.createElement('div');
        let time = document.createElement('p');
        time.setAttribute('class', 'time');
        time.innerText = (date.toLocaleTimeString(undefined, 'Asia/Kolkata')).replace(':00', '');
        let temp = document.createElement('p');
        temp.innerText = Math.floor((forecast.list[i].main.temp_max - 273)) + ' °C' + ' / ' + Math.floor((forecast.list[i].main.temp_min - 273)) + ' °C';
        div.appendChild(time);
        div.appendChild(temp);

        let desc = document.createElement('p');
        desc.setAttribute('class', 'desc');
        desc.innerText = forecast.list[i].weather[0].description;

        hourR.appendChild(div);
        hourR.appendChild(desc);
        document.querySelector('.templist').appendChild(hourR);
    }
}

function dayForecast(forecast) {
    document.querySelector('.weekF').innerHTML = '';
    for (let i = 8; i < forecast.list.length; i += 8) {
        let div = document.createElement('div');
        div.setAttribute('class', 'dayF');
        
        let day = document.createElement('p');
        day.setAttribute('class', 'date');
        day.innerText = new Date(forecast.list[i].dt * 1000).toDateString(undefined, 'Asia/Kolkata');
        div.appendChild(day);

        let temp = document.createElement('p');
        temp.innerText = Math.floor((forecast.list[i].main.temp_max - 273)) + ' °C' + ' / ' + Math.floor((forecast.list[i].main.temp_min - 273)) + ' °C';
        div.appendChild(temp);

        let description = document.createElement('p');
        description.setAttribute('class', 'desc');
        description.innerText = forecast.list[i].weather[0].description;
        div.appendChild(description);

        document.querySelector('.weekF').appendChild(div);
    }
}