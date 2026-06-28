#!/usr/bin/env python3

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


ROOT = Path(__file__).resolve().parent

COOP_PATHS = (
    "/other/noises/",
    "/games/walker_around/",
    "/games/minesweeper_cars/",
    "/games/minesweeper_cars_test/",
)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.path.startswith(COOP_PATHS):
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Serve this repo locally with optional COOP/COEP headers.")
    host = "127.0.0.1"
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    args = parser.parse_args()

    server = ThreadingHTTPServer((host, args.port), Handler)
    print(f"Serving {ROOT} at http://{host}:{args.port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
