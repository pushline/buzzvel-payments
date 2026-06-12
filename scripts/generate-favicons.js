import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
);
const publicDir = path.join(projectRoot, 'public');
const sourceSvg = path.join(publicDir, 'favicon.svg');

const pngOutputs = [
    { filename: 'favicon-16x16.png', size: 16 },
    { filename: 'favicon-32x32.png', size: 32 },
    { filename: 'apple-touch-icon.png', size: 180 },
    { filename: 'android-chrome-192x192.png', size: 192 },
    { filename: 'android-chrome-512x512.png', size: 512 },
];

async function renderPng(size, outputPath) {
    await sharp(sourceSvg, { density: 1024 })
        .resize(size, size, {
            fit: 'fill',
            kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toFile(outputPath);
}

async function generatePngs() {
    await Promise.all(
        pngOutputs.map(({ filename, size }) =>
            renderPng(size, path.join(publicDir, filename)),
        ),
    );
}

async function generateIco() {
    const icoSizes = [16, 32, 48];
    const buffers = await Promise.all(
        icoSizes.map((size) =>
            sharp(sourceSvg, { density: 1024 })
                .resize(size, size, {
                    fit: 'fill',
                    kernel: sharp.kernel.lanczos3,
                })
                .png()
                .toBuffer(),
        ),
    );

    await fs.writeFile(path.join(publicDir, 'favicon.ico'), await pngToIco(buffers));
}

await generatePngs();
await generateIco();

console.log('Generated favicon assets from public/favicon.svg.');
