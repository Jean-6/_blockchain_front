import axios from "axios";

const API_URL = 'http://51.38.190.134:1155/cards';


const apiService = {
    fetchData: async (idCard) => {
        try {
            const response = await axios.get(API_URL + "/" + idCard + ".json");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};


export default apiService;
