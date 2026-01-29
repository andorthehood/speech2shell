# speech2shell

Listen for serial `DOWN`/`UP` commands to control a `sox` recording, then send the WAV to AssemblyAI and run a configurable action on the transcript.

## Requirements
- Node.js with native TypeScript support
- `sox` installed and available on `PATH`
- A serial device that sends `DOWN` and `UP`
- An AssemblyAI API key

## Setup
```bash
npm install
```

Pass configuration via CLI flags.

## Run
```bash
npm start -- \
  --serial-port /dev/cu.usbmodem2102 \
  --baud-rate 9600 \
  --sample-rate 44100 \
  --api-key YOUR_KEY \
  --action-template "echo {text}"
```

## Install as CLI
```bash
npm install -g .
speech2shell --serial-port /dev/cu.usbmodem2102 --baud-rate 9600 --sample-rate 44100 --api-key YOUR_KEY
```

## CLI flags
- `--serial-port` (required)
- `--baud-rate` (default `9600`)
- `--sample-rate` (default `44100`)
- `--api-key` (required)
- `--action-template` (optional; defaults to `echo {text}`)

## Make targets
```bash
make free-serial           # kill any process holding the serial port
make start                 # run the app (pass ARGS="--serial-port ...")
```

## Action
If `--action-template` is set, it runs as a shell command with this placeholder:
- `{text}` transcript text (shell-escaped)

Examples:
```bash
--action-template "echo {text}"
--action-template "my-agent --prompt {text}"
--action-template "python3 ./save_transcript.py {text}"
```

## Notes
- The app sends `ON` when recording starts and `OFF` when it ends.
- If the API key is not set, transcription is skipped.
