import "server-only";
import { Pool, type QueryResultRow } from "pg";

const globalForDb=globalThis as unknown as {cupstoryPool?:Pool};
export const db=globalForDb.cupstoryPool??new Pool({connectionString:process.env.DATABASE_URL,max:10});
if(process.env.NODE_ENV!=="production")globalForDb.cupstoryPool=db;
export async function query<T extends QueryResultRow>(text:string,values:unknown[]=[]){return db.query<T>(text,values)}
