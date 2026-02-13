import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function GET() {
  const candidates = [
    process.env.WA_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ].filter(Boolean) as string[];

  const checks = await Promise.all(
    candidates.map(async (p) => {
      try {
        await fs.access(p);
        return { path: p, exists: true };
      } catch {
        return { path: p, exists: false };
      }
    })
  );

  return Response.json({
    render: Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_HOSTNAME),
    nodeEnv: process.env.NODE_ENV,
    candidates: checks,
  });
}
