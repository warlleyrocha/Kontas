process.env.EXPO_PUBLIC_API_URL = "http://localhost:3333";

jest.mock("axios", () => {
  class AxiosError extends Error {
    code?: string;
    config?: any;
    response?: any;
    isAxiosError = true;

    constructor(
      message?: string,
      code?: string,
      config?: any,
      request?: any,
      response?: any
    ) {
      super(message);
      this.name = "AxiosError";
      this.code = code;
      this.config = config;
      this.response = response;
    }
  }

  const createInterceptor = () => {
    const handlers: any[] = [];

    return {
      handlers,
      use: jest.fn((fulfilled, rejected) => {
        handlers.push({ fulfilled, rejected });
        return handlers.length - 1;
      }),
      eject: jest.fn(),
    };
  };

  const createInstance = (config: any = {}) => {
    return {
      defaults: {
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: {
          ...(config.headers || {}),
        },
      },

      interceptors: {
        request: createInterceptor(),
        response: createInterceptor(),
      },

      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    };
  };

  const axios = {
    create: jest.fn((config) => createInstance(config)),
  };

  return {
    __esModule: true,
    default: axios,
    AxiosError,
    isAxiosError: (err: any) => err?.isAxiosError === true,
  };
});
