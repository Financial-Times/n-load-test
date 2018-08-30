# n-load-test

Load test an application using the URLs used for smoke testing.

## Usage

With you app running on http://local.ft.com:3002, run within the folder:

`npx @financial-times/n-load-test`

**Options:**

* `-C` - path to smoke test file (default: `./test/smoke.js`)
* `-H` - host (default: `http://local.ft.com:3002`)
* `-c` - number of concurrent requests (default: 10)
* `-n` - total number of requests to make (default: 200)
