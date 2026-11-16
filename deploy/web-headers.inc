# Security headers of the web version: its WebAssembly needs
# wasm-unsafe-eval, its notes core runs in a worker, its pictures are blobs.
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy no-referrer always;
