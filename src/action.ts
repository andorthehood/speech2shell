import { spawn } from "child_process";

function shellEscape(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

type ActionOptions = {
  commandTemplate: string;
};

export function createAction({ commandTemplate }: ActionOptions) {
  console.log(`Action template: ${commandTemplate}`);
  return async (text: string) => {
    console.log("Running action...");
    const cmd = commandTemplate
      .replaceAll("{text}", shellEscape(text));

    return await new Promise<boolean>((resolve) => {
      const child = spawn(cmd, { shell: true, stdio: "inherit" });
      child.on("error", (err) => {
        console.error("Action error:", err.message);
        resolve(false);
      });
      child.on("exit", (code) => {
        resolve(code === 0);
      });
    });
  };
}
