
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// --- 1. Definição de Tipos (Opcional, mas recomendado) ---
// Para uma melhor tipagem, você pode definir uma interface para os erros da sua API
interface ApiError {
  message: string;
  // Outras propriedades de erro que sua API pode retornar
}

// --- 2. Criação da Instância do Axios ---
const api: AxiosInstance = axios.create({
  /**
   * `baseURL` será pré-anexado a todas as URLs de requisição, a menos que
   * a URL seja absoluta. É uma ótima prática para evitar a repetição da
   * URL base em cada chamada de API.
   *
   * Use variáveis de ambiente para diferentes ambientes (desenvolvimento, produção, etc.).
   */
  baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com/v1',

  /**
   * `headers` são os cabeçalhos HTTP que serão enviados com cada requisição.
   */
  headers: {
    'Content-Type': 'application/json',
  },

  /**
   * `timeout` especifica o número de milissegundos antes que a requisição
   * seja abortada. O padrão é 0 (sem timeout).
   */
  timeout: 10000, // 10 segundos
});

// --- 3. Interceptadores de Requisição (Request Interceptors) ---
/**
 * Interceptadores de requisição permitem que você execute código ANTES que uma
 * requisição seja enviada. É o local ideal para adicionar tokens de autenticação.
 */
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Recupere o token de algum lugar (localStorage, sessionStorage, context, etc.)
    const token = localStorage.getItem('authToken');

    // Se o token existir, adicione-o ao header de Authorization
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Faça algo com o erro da requisição
    return Promise.reject(error);
  }
);

// --- 4. Interceptadores de Resposta (Response Interceptors) ---
/**
 * Interceptadores de resposta permitem que você lide com respostas (sucesso ou erro)
 * globalmente ANTES que elas sejam tratadas pelo `then` ou `catch` da chamada da API.
 */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Qualquer código de status dentro do intervalo de 2xx fará com que esta função seja acionada
    // Você pode transformar os dados da resposta aqui, se necessário
    return response;
  },
  (error: AxiosError<ApiError>): Promise<AxiosError> => {
    // Qualquer código de status fora do intervalo de 2xx fará com que esta função seja acionada

    // Exemplo: Lidar com erros 401 (Não Autorizado) globalmente
    if (error.response && error.response.status === 401) {
      // Exemplo: Limpar dados do usuário e redirecionar para a página de login
      console.error('Não autorizado. Redirecionando para o login...');
      // window.location.href = '/login';
    }

    // Você também pode extrair mensagens de erro mais amigáveis da resposta da API
    if (error.response && error.response.data && error.response.data.message) {
      console.error('Erro da API:', error.response.data.message);
    }

    // Rejeita a promessa com o erro para que o `catch` da chamada da API possa lidar com ele
    return Promise.reject(error);
  }
);

export default api;