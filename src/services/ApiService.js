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
    getAllBalanceOfUser: async (address) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/get-all-balance`,
                {
                    params: {
                        from: address
                    },
                    withCredentials: true,
                });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    authenticate: async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/authenticate`,
                {
                    withCredentials: true,
                });
            const {iat, ...authData} = response.data; // remove unimportant iat value
            return authData.address;
        } catch (error) {
            throw error;
        }
    },

    openPack: async (address) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/open-pack`,
                {
                    params: {
                        from: address
                    },
                    withCredentials: true,
                });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default apiService;
