import axios from 'axios';

// 1. Lê a URL base da API a partir da variável de ambiente do Vite.
const baseURL = import.meta.env.VITE_API_URL;

// 2. Cria uma instância do Axios com a configuração base.
//    Isso evita que você tenha que digitar a URL completa em toda chamada.
export const api = axios.create({
  baseURL: baseURL,
});