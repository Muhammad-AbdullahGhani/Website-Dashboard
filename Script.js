import { GoogleGenerativeAI } from "@google/generative-ai";
const APIKey = 'dc73ed7484ccf3858cb10c88bfb9a898';
const geminiAPI = 'AIzaSyAz98maC18FUMebRvZPype0XluzSgKg4MQ';
document.getElementById('btn').addEventListener("click", searchfunc);



document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('btn').addEventListener("click", searchfunc);
    document.getElementById('gembtn').addEventListener("click", gemfunc);
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const crd = pos.coords;
            getWeatherByGeolocation(crd.latitude, crd.longitude, 'metric');
        },
        (err) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        },
        options
    );
});

async function searchfunc() {
    const inputtxt = document.getElementById('searchbar').value;
    const unit = document.getElementById('tempUnit').value;

    if (inputtxt === '' || unit === '') {
        alert("Please enter a city and select a unit");
        return;
    }

    try {
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
            const hightemp = findHighestTemp(temps);
            showTemperatures([hightemp]);
            break;
        case 'lowhigh':
            showTemperatures(temps.sort((a, b) => a - b));
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
        if (current > max) {
            return current;
        } else {
            return max;
        }
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
        for (let hour = 0; hour < 8; hour++) {
            const hourData = data.list[hour];
            const hourTimestamp = hourData.dt;
            const hourTime = (hourTimestamp / 3600) % 24;
            const hourTemp = hourData.main.temp;
            $(`#Hour${hour + 1}dis`).text(`Hour: ${Math.floor(hourTime)}:00`);
            $(`#hour${hour + 1}temp`).text(`Temperature: ${hourTemp}°`);

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
                        beginAtZero: true,
                        ticks: {
                            color: 'white'
                        }
                    },
                    x: {

                        ticks: {
                            color: 'white'
                        }
                    },
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
                },
                scales: {
                    x: {

                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {

                        ticks: {
                            color: 'white'
                        }
                    },
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
        if (error.response) {
            console.error("Error details:", error.response.data);
        }
        document.getElementById('gemresponse').innerText = `Error: ${error.message}`;
    }
}

