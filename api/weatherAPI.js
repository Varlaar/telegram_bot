import instance from "./instance.js";

const requestWeather = (props) => {
    const { WEATHER_API_KEY } = process.env; // Деструктуризация WEATHER_API_KEY из .env
    // if (!WEATHER_API_KEY) throw new Error('"WEATHER_API_KEY" env var is required!'); // Проверка существует ли токен
    return instance.get(`/current.json?key=${WEATHER_API_KEY}&q=${props}`); // запрос погоды
}

export default requestWeather;