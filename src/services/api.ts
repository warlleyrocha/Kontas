import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

if (!API_URL) {
  throw new Error("API_URL indefinida: verifique EXPO_PUBLIC_API_URL no build");
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token do AsyncStorage
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@app:token");
    if (token) {
      if (config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },

  (error) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Interceptor para visualizar respostas
api.interceptors.response.use(
  (response) => {
    // Log da resposta
    console.log(`\n✅ ${response.status} ${response.config.url}`);
    console.log(JSON.stringify(response.data, null, 2));

    return response;
  },

  (error) => {
    // Log de erro
    console.log(
      `\n❌ ${error.response?.status || "Network Error"} ${error.config?.url}`
    );
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);
