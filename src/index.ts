#!/usr/bin/env node

import { createTranscriber } from "./transcribe.ts";
import { createRecorder } from "./recording.ts";
import { createSerialController } from "./serial.ts";
import { createAction } from "./action.ts";
import os from "os";
import { Command } from "commander";

const program = new Command();

program
  .requiredOption("--serial-port <path>")
  .requiredOption("--api-key <key>")
  .option("--baud-rate <number>", "", "9600")
  .option("--sample-rate <number>", "", "44100")
  .option("--action-template <template>", "", "echo {text}");

program.parse(process.argv);
const options = program.opts();

const portPath = String(options.serialPort);
const apiKey = String(options.apiKey);
const baudRate = Number(options.baudRate);
const sampleRate = Number(options.sampleRate);
const actionTemplate = String(options.actionTemplate);

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
      if (!ok) {
        console.error("Action failed.");
      }
    }
  } catch (err) {
    console.error("Transcription error:", err instanceof Error ? err.message : err);
  } finally {
    await recorder.cleanup(filePath);
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
