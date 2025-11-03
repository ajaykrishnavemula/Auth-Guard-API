declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';

  interface MongoSanitizeOptions {
    replaceWith?: string;
    onSanitize?: (key: string, value: any) => void;
  }

  function mongoSanitize(options?: MongoSanitizeOptions): RequestHandler;

  export = mongoSanitize;
}

