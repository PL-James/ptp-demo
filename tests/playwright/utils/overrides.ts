import { test, BrowserContext, TestInfo, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { testLogger } from './helpers';
import { spawn } from 'child_process';
import { authToken, getAuthorizationToken } from 'tests/login.spec';

const videosDir: string = 'tests/playwright/videos';
const tempDir = path.resolve(videosDir, 'webm');

let sharedStorageState:
  | Awaited<ReturnType<BrowserContext['storageState']>>
  | undefined = undefined;

export async function authorize(
  context: BrowserContext
): Promise<string | undefined> {
  if (authToken) {
    return authToken;
  }
  // const {env} = process;
  //  username: env?.['KEYCLOAK__ADMIN_API_USERNAME'] ?? 'test-user',
  //   password: env?.['KEYCLOAK__ADMIN_API_PASSWORD'] ?? 'test-123',
  await getAuthorizationToken(await context.newPage(), {
    username: 'test-user',
    password: 'test-123',
  });
  sharedStorageState = await context.storageState();
  return authToken;
}

export const videoTest = test.extend<{
  page: Page;
  skipAuth: boolean;
  auth: void;
}>({
  skipAuth: [false, { option: true }],
  auth: [
    async ({ browser, skipAuth }, use) => {
      // Roda UMA VEZ por worker - equivalente ao beforeAll
      if (!skipAuth && !sharedStorageState) {
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        await authorize(context);
        await context.close();
      }
      await use();
    },
    { scope: 'test' },
  ],
  context: async ({ browser, auth }, use) => {
    const context = await browser.newContext({
      recordVideo: {
        dir: tempDir,
      },
      ...(sharedStorageState ? { storageState: sharedStorageState } : {}),
      ignoreHTTPSErrors: true,
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use, testInfo: TestInfo) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `${testInfo.title}-${timestamp}`.replace(/ /g, '_');

    const page = await context.newPage();
    await use(page);
    await page.close();

    try {
      const videoPath = await page.video()?.path();
      if (videoPath && fs.existsSync(videoPath)) {
        await convertToMp4(videoPath, baseName);
      }
      fs.readdirSync(tempDir).forEach((file) => {
        if (!file.includes('gitkeep'))
          fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
      });
    } catch (error: any) {
      testLogger
        .for('videoTest')
        .error(`Error processing video: ${error?.message}`);
    }
  },
});

async function convertToMp4(webmPath: string, name: string): Promise<string> {
  const outputDir = path.join(videosDir, 'mp4');
  fs.mkdirSync(outputDir, { recursive: true });

  const finalPath = path.join(outputDir, `${name}.mp4`);

  // Aguarda um pouco para garantir que o arquivo está completamente gravado
  await new Promise((resolve) => setTimeout(resolve, 500));

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(webmPath)) {
      return reject(`Arquivo WebM não encontrado: ${webmPath}`);
    }

    const args = [
      '-loglevel',
      'error',
      '-i',
      webmPath,
      '-vf',
      'setpts=4.0*PTS',
      '-c:v',
      'libx264',
      '-crf',
      '23',
      '-preset',
      'fast',
      finalPath,
    ];
    const ffmpeg = spawn(ffmpegPath as string, args);
    ffmpeg.stderr.on('data', (data) =>
      testLogger.for('convertToMp4').error(`FFmpeg log: ${data}`)
    );
    ffmpeg.on('close', (code) => {
      if (code === 0) return resolve(finalPath);
      return reject(
        `Erro ao converter ${webmPath} para MP4. Exit code: ${code}`
      );
    });
    ffmpeg.on('error', (err) =>
      reject(`Falha ao iniciar FFmpeg: ${err.message}`)
    );
  });
}
