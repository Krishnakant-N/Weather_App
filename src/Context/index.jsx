import { useContext, createContext, useState, useEffect } from "react";
import axios from 'axios';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const [weather, setWeather] = useState({});
    const [values, setValues] = useState([]);
    const [place, setPlace] = useState('delhi');  // Default place
    const [thisLocation, setLocation] = useState('');

    // Fetch weather data
    const fetchWeather = async (location = place) => {
        const options = {
            method: 'GET',
            url: 'https://visual-crossing-weather.p.rapidapi.com/forecast',
            params: {
                aggregateHours: '24',
                location: location,
                contentType: 'json',
                unitGroup: 'metric',
                shortColumnNames: 0,
            },
            headers: {
                'X-RapidAPI-Key': import.meta.env.VITE_API_KEY,
                'X-RapidAPI-Host': 'visual-crossing-weather.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            const thisData = Object.values(response.data.locations)[0];
            setLocation(thisData.address);
            setValues(thisData.values);
            setWeather(thisData.values[0]);
        } catch (e) {
            console.error(e);
            alert('This place does not exist');
        }
    };

    // Fetch user's current location (coordinates)
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

                const API_KEY = import.meta.env.API_KEY
                // Reverse geocoding to get the city name from coordinates
                const reverseGeocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}&pretty=1&no_annotations=1`;

                try {
                    const response = await axios.get(reverseGeocodeUrl);
                    const city = response.data.results[0].components.city;
                    console.log('City: ', city);
                    setPlace(city);  // Update the place with the detected city
                } catch (error) {
                    console.error('Error fetching city from coordinates: ', error);
                    alert('Could not fetch location. Try manually entering the place. Setting location to DELHI by default.');
                }
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    // Call `fetchWeather` initially and when `place` changes
    useEffect(() => {
        fetchWeather();
    }, [place]);

    // Optionally, call `getCurrentLocation` on mount to automatically detect location
    useEffect(() => {
        getCurrentLocation();
    }, []);

    return (
        <StateContext.Provider value={{
            weather,
            setPlace,
            values,
            thisLocation,
            place
        }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
