import axios from "axios";

const API_URL = 'http://51.38.190.134:1155/cards/1.json';

const apiService = {
    fetchData: async () => {
        try {
            const response = await axios.get(API_URL);
            let tab = [];
            tab.push(response.data);
            return tab;
        } catch (error) {
            throw error;
        }
    },
};


export default apiService;
