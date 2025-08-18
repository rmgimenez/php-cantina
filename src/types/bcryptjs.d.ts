declare module "bcryptjs" {
  export function hash(s: string, salt: string | number): Promise<string>;
  export function hashSync(s: string, salt: string | number): string;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compareSync(s: string, hash: string): boolean;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;

  const bcrypt: {
    hash(s: string, salt: string | number): Promise<string>;
    hashSync(s: string, salt: string | number): string;
    compare(s: string, hash: string): Promise<boolean>;
    compareSync(s: string, hash: string): boolean;
    genSaltSync(rounds?: number): string;
    genSalt(rounds?: number): Promise<string>;
  };

  export default bcrypt;
}
