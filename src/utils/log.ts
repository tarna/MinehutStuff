import { appendFileSync } from 'fs';

export function logToFile(file: string, data: string) {
    const date = new Date();
    appendFileSync(`./logs/${file}.log`, `[${date.toISOString()}] ${data}\n`);
}