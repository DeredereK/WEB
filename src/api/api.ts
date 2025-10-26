import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});
api.interceptors.response.use(
    (response) => response,
    (error)=> {
        console.error("Erro na requisição API: ", error.response || error.message);
        return Promise.reject(error);
    }
);