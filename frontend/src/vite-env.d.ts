/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // você pode adicionar outras variáveis de ambiente aqui no futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}