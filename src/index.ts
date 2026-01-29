import { createTranscriber } from "./transcribe.ts";
import { createRecorder } from "./recording.ts";
import { createSerialController } from "./serial.ts";
import { createAction } from "./action.ts";
import os from "os";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  string: ["serial-port", "api-key", "action-template"],
  default: {
    "baud-rate": 9600,
    "sample-rate": 44100,
  },
});

const portPath = argv["serial-port"] ? String(argv["serial-port"]) : "";
if (!portPath) {
  console.error("Missing required flag: --serial-port");
  process.exit(1);
}
const baudRate = Number(argv["baud-rate"]);
const sampleRate = Number(argv["sample-rate"]);
const actionTemplate = argv["action-template"]
  ? String(argv["action-template"])
  : undefined;

const apiKey = argv["api-key"] ? String(argv["api-key"]) : undefined;

const transcriber = createTranscriber({ apiKey });
const action = createAction({ commandTemplate: actionTemplate });
const recorder = createRecorder({
  sampleRate,
  outputDir: os.tmpdir(),
});

function onRecordingStart() {
  serial.send("ON");
}

function onRecordingStop(filePath: string | null) {
  serial.send("OFF");
  if (filePath) {
    handleRecordingStop(filePath);
  }
}

async function handleRecordingStop(filePath: string) {
  try {
    const text = await transcriber.transcribe(filePath);
    if (text) {
      const ok = await action(text);
      if (ok) {
        await recorder.cleanup(filePath);
      }
    }
  } catch (err) {
    console.error("Transcription error:", err instanceof Error ? err.message : err);
  }
}

const serial = createSerialController({
  portPath,
  baudRate,
  onStart: () => {
    recorder.start({ onStart: onRecordingStart, onStop: onRecordingStop });
  },
  onStop: () => {
    recorder.stop();
  },
});

process.on("SIGINT", () => {
  if (recorder.isRecording()) {
    recorder.stop();
  }
  serial.close();
  process.exit(0);
});
