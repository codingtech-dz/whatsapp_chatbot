import { execFile } from 'child_process';
import { promisify } from 'util';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

export async function GET() {
  const chromePath =
    process.env.WA_CHROME_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    '/usr/bin/chromium';

  try {
    const { stdout, stderr } = await execFileAsync(chromePath, ['--version']);
    return Response.json({
      ok: true,
      chromePath,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    });
  } catch (err: any) {
    return Response.json(
      {
        ok: false,
        chromePath,
        error: err?.message || String(err),
        code: err?.code,
        stderr: err?.stderr,
      },
      { status: 500 }
    );
  }
}
