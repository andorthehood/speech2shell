import { exec } from "child_process";

function shellEscape(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

type ActionOptions = {
  commandTemplate: string;
};

export function createAction({ commandTemplate }: ActionOptions) {
  return async (text: string) => {
    const cmd = commandTemplate
      .replaceAll("{text}", shellEscape(text));

    return await new Promise<boolean>((resolve) => {
      exec(cmd, { shell: true }, (err, stdout, stderr) => {
        if (err) {
          console.error("Transcript command error:", err.message);
          resolve(false);
          return;
        }
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);
        resolve(true);
      });
    });
  };
}
