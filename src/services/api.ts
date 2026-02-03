import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não definida no runtime. Verifique o build preview/production."
  );
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
