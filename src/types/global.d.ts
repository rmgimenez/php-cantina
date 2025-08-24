declare namespace NodeJS {
  interface Global {
    __CANTINA_DB_POOL?: import("mysql2/promise").Pool;
  }
}

declare global {
  var __CANTINA_DB_POOL: import("mysql2/promise").Pool | undefined;
}

export {};
