import { writeFile, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { request } from 'https';
import { request as httpRequest } from 'http';

const IMAGES = 'https://minehut-server-icons-live.s3.us-west-2.amazonaws.com';
const missingIcons = [
    'BEDROCK'
]

const icons = await fetch('https://api.minehut.com/servers/icons').then(res => res.json());

let i = 0;
for (const icon of icons) {
    i++;
    let imageUrl = `${IMAGES}/${icon.icon_name}.png`;
    if (await fileExists(`icons/${basename(imageUrl.toLowerCase())}`)) {
        console.log(`Skipping ${i}/${icons.length} icons`);
        continue;
    }
    if (missingIcons.includes(icon.icon_name)) {
        console.log(`Skipping ${i}/${icons.length} icons`);
        continue;
    }
    if (icon.icon_name === 'CAVE_VINES_PLANT') {
        imageUrl = `${IMAGES}/CAVE_VINES.png`;
    }
    await downloadImage(imageUrl, 'icons');
    console.log(`Downloaded ${i}/${icons.length} icons`);
    await wait(2000);
}

async function downloadImage(imageUrl: string, saveFolder: string): Promise<void> {
    const protocol = imageUrl.startsWith('https') ? request : httpRequest;
    const fileName = basename(imageUrl);
    const savePath = join(saveFolder, fileName.toLowerCase());

    // Ensure the save folder exists
    if (!existsSync(saveFolder)) {
        mkdirSync(saveFolder, { recursive: true });
    }

    // Download the image
    await new Promise<void>((resolve, reject) => {
        const req = protocol(imageUrl, async (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image ${imageUrl}. Status code: ${response.statusCode}`));
                return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));

            response.on('end', () => {
                // @ts-ignore
                const buffer = Buffer.concat(chunks);
                // @ts-ignore
                writeFile(savePath, buffer, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Image downloaded and saved to ${savePath}`);
                        resolve();
                    }
                });
            });
        });

        req.on('error', (err) => reject(err));
        req.end();
    });
}

async function fileExists(path: string): Promise<boolean> {
    return new Promise(resolve => {
        existsSync(path) ? resolve(true) : resolve(false);
    });
}

async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}