import { GoogleGenerativeAI } from "@google/generative-ai";
const APIKey = 'dc73ed7484ccf3858cb10c88bfb9a898';
const geminiAPI = 'AIzaSyAaKRBzlzfEGNgRG04a90-nSi_2JtqKLzs';
document.getElementById('btn').addEventListener("click", searchfunc);

async function searchfunc() {
    const inputtxt = document.getElementById('searchbar').value;
    const unit = document.getElementById('tempUnit').value;

    if (inputtxt === '' || unit === '') {
        alert("Please enter a city and select a unit");
        return;
    }

    try {
        // Fetch weather by city name
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputtxt}&units=${unit}&appid=${APIKey}`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeatherData(data);
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        await forecast(lat, lon, unit);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("statistics").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Function to get weather using user's geolocation
async function getWeatherByGeolocation(lat, lon, unit) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${APIKey}`);
        if (!response.ok) {
            throw new Error('Location not found');
        }
        const data = await response.json();
        displayWeatherData(data);
        await forecast(lat, lon, unit);
    } catch (error) {
        console.error("Error fetching geolocation weather data:", error);
        document.getElementById("statistics").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Function to display fetched weather data in the DOM
function displayWeatherData(data) {
    if (document.getElementById("cityName")) {
        document.getElementById("cityName").innerText = data.name;
        $("#temp").text(`Temperature: ${data.main.temp}°`);
        $("#humid").text(`Humidity: ${data.main.humidity}%`);
        $("#wind").text(`Wind Speed: ${data.wind.speed} m/s`);
        $("#descr").text(`Weather: ${data.weather[0].description}`);
        const iconCode = data.weather[0].icon;
        document.getElementById("Weatherimage").src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
}

// Attempt to get the user's current geolocation when the page loads
document.addEventListener("DOMContentLoaded", function() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };

    const unit = document.getElementById('tempUnit').value || 'metric'; // Default to metric units

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const crd = pos.coords;
            console.log("Your current position is:");
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            getWeatherByGeolocation(crd.latitude, crd.longitude, unit); // Fetch weather for current location
        },
        (err) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        },
        options
    );
});


document.getElementById('drop').addEventListener('change', handleFilter);

async function handleFilter() {
    const filterOption = document.getElementById('drop').value;

    const temps = [];
    const conditions = [];
    for (let i = 0; i < 5; i++) {
        const temp = parseFloat($(`#temp5day${i + 1}`).text().split(' ')[1]);
        const condition = $(`#descr5day${i + 1}`).text().split(': ')[1];
        temps.push(temp);
        conditions.push(condition);
    }
    switch (filterOption) {
        case 'asc':
            showTemperatures(temps.sort((a, b) => a - b));
            break;
        case 'desc':
            showTemperatures(temps.sort((a, b) => b - a));
            break;
        case 'withoutrain':
            const rainDays = filterRainyDays(temps, conditions);
            showTemperatures(rainDays);
            break;
        case 'highttemp':
            const highestTemp = findHighestTemp(temps);
            showTemperatures([highestTemp]);
            break;
    }
}

function showTemperatures(sortedTemps) {
    for (let i = 0; i < sortedTemps.length; i++) {
        $(`#temp5day${i + 1}`).text(`Temperature: ${sortedTemps[i]}°`);
    }
}

function filterRainyDays(temps, conditions) {
    return temps.filter((temp, index) => {
        return conditions[index].toLowerCase().includes('rain');
    });
}

function findHighestTemp(temps) {
    return temps.reduce((max, current) => {
        return current > max ? current : max;
    }, temps[0]);
}

async function forecast(lat, lon, unit) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${APIKey}`);

        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }

        const data = await response.json();

        const temps = [];
        const conditions = [];
        for (let i = 0; i < 5; i++) {
            const item = data.list[i * 8];
            const date = new Date(item.dt_txt).toLocaleDateString();
            const temp = item.main.temp;
            const description = item.weather[0].description;
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

            temps.push(temp);
            conditions.push(item.weather[0].main);
            if (document.getElementById(`date${i + 1}`)) {
                $(`#date${i + 1}`).text(`Date: ${date}`);
                $(`#temp5day${i + 1}`).text(`Temperature: ${temp}°`);
                $(`#descr5day${i + 1}`).text(`Weather: ${description}`);
                $(`#weatherIcon${i + 1}`).attr("src", iconUrl);
            }
        }

        new Chart("barChart", {
            type: "bar",
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                datasets: [{
                    label: 'Temperature (°C)',
                    backgroundColor: "black",
                    borderColor: "white",
                    data: temps
                }]
            },
            options: {
                animation: {
                    duration: 1000
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
          
        new Chart("lineChart", {
            type: "line",
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                datasets: [{
                    label: 'Temperature (°C)',
                    backgroundColor: "black",
                    borderColor: "white",
                    data: temps
                }]
            },
            options: {
                animation: {
                    duration: 1000
                }
            }
        });
        const conditionCounts = countWeatherConditions(conditions);
        const conditionLabels = Object.keys(conditionCounts);
        const conditionData = Object.values(conditionCounts);
        new Chart("donutChart", {
            type: "doughnut",
            data: {
                labels: conditionLabels,
                datasets: [{
                    label: 'Weather Conditions',
                    backgroundColor: ["grey", "blue", "lightblue", "rgba(255, 99, 132, 0.8)"],
                    data: conditionData
                }]
            },
            options: {
                animation: {
                    duration: 1000
                }
            }
        });

    } catch (error) {
        console.error("Error fetching forecast data:", error);
        if (document.getElementById("forecastData")) {
            document.getElementById("forecastData").innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }
}

function countWeatherConditions(conditions) {
    const counts = {};
    conditions.forEach(condition => {
        counts[condition] = (counts[condition] || 0) + 1;
    });
    return counts;
}

document.getElementById('gembtn').addEventListener("click", gemfunc);

async function gemfunc() {
    const txt = document.getElementById('gembar').value;

    if (!txt) {
        alert("Please enter a message");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiAPI);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(txt);
        document.getElementById('gemresponse').innerText = result.response.text();

    } catch (error) {
        console.error("Error fetching chatbot response:", error);
        document.getElementById('gemresponse').innerText = `Error: ${error.message}`;
    }
}
