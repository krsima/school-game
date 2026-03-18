from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
import threading
import os
import time

HOST = "0.0.0.0"
PORT = 8000
DATA_FILE = "leaderboard.json"

leaderboard = []
lock = threading.Lock()
ip_last_submit = {}  # {ip: timestamp}


def load_leaderboard():
    global leaderboard
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                leaderboard = json.load(f)
        except:
            leaderboard = []
    else:
        leaderboard = []


def save_leaderboard():
    with open(DATA_FILE, "w") as f:
        json.dump(leaderboard, f, indent=4)


class LeaderboardHandler(BaseHTTPRequestHandler):

    # ✅ CORS headers
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.end_headers()

    # ✅ Preflight
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    # GET top 10
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/top":
            with lock:
                top_10 = sorted(leaderboard, key=lambda x: x["time"])[:10]

            self._set_headers()
            self.wfile.write(json.dumps(top_10).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    # POST submit
    def do_POST(self):
        parsed_path = urlparse(self.path)
        client_ip = self.client_address[0]  # IP address of the requester

        if parsed_path.path == "/submit":
            now = time.time()
            last_time = ip_last_submit.get(client_ip, 0)

            if now - last_time < 60:  # rate limit: 60 seconds
                self._set_headers(429)
                self.wfile.write(
                    json.dumps({"error": "Rate limit exceeded. Try again later."}).encode()
                )
                return

            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body)
                name = data.get("name")
                time_ms = data.get("time")

                if not name or not isinstance(time_ms, int):
                    raise ValueError("Invalid input")

                entry = {"name": name, "time": time_ms}

                with lock:
                    leaderboard.append(entry)
                    save_leaderboard()
                    ip_last_submit[client_ip] = now

                self._set_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode())

            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())


def run():
    load_leaderboard()
    server = HTTPServer((HOST, PORT), LeaderboardHandler)
    print(f"Server running on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
