from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
import threading
import os
import time

HOST = "0.0.0.0"
PORT = 8000
DATA_FILE = "leaderboard.json"
PASSWORD_FILE = "password.txt"

leaderboard = []
lock = threading.Lock()
ip_last_submit = {}

admin_password = None


# =========================
# File Handling
# =========================

def load_password():
    global admin_password

    if not os.path.exists(PASSWORD_FILE):
        print("password.txt not found! Creating default.")
        with open(PASSWORD_FILE, "w") as f:
            f.write("changeme")

    with open(PASSWORD_FILE, "r") as f:
        admin_password = f.read().strip()


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


# =========================
# HTTP Handler
# =========================

class LeaderboardHandler(BaseHTTPRequestHandler):

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers",
                         "Content-Type, X-Admin-Password")
        self.send_header("Access-Control-Allow-Methods",
                         "GET, POST, OPTIONS")

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    # =========================
    # Auth check
    # =========================

    def check_admin_password(self):
        header_password = self.headers.get("X-Admin-Password")
        return header_password == admin_password

    # =========================
    # GET routes
    # =========================

    def do_GET(self):
        parsed_path = urlparse(self.path)

        # ---------- TOP 10 ----------

        if parsed_path.path == "/top":
            with lock:
                top_10 = sorted(
                    leaderboard,
                    key=lambda x: x["time"]
                )[:10]

            self._set_headers()
            self.wfile.write(json.dumps(top_10).encode())

        # ---------- RAW (ADMIN) ----------

        elif parsed_path.path == "/raw":

            if not self.check_admin_password():
                self._set_headers(403)
                self.wfile.write(json.dumps({
                    "error": "Unauthorized"
                }).encode())
                return

            with lock:
                data = leaderboard.copy()

            self._set_headers()
            self.wfile.write(json.dumps(data).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({
                "error": "Not found"
            }).encode())

    # =========================
    # POST routes
    # =========================

    def do_POST(self):
        parsed_path = urlparse(self.path)
        client_ip = self.client_address[0]

        content_length = int(
            self.headers.get("Content-Length", 0)
        )
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body) if body else {}
        except:
            self._set_headers(400)
            self.wfile.write(json.dumps({
                "error": "Invalid JSON"
            }).encode())
            return

        # ---------- SUBMIT ----------

        if parsed_path.path == "/submit":

            now = time.time()
            last_time = ip_last_submit.get(client_ip, 0)

            if now - last_time < 60:
                self._set_headers(429)
                self.wfile.write(json.dumps({
                    "error": "Rate limit exceeded"
                }).encode())
                return

            name = data.get("name")
            time_ms = data.get("time")

            if not name or not isinstance(time_ms, int):
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": "Invalid input"
                }).encode())
                return

            entry = {
                "name": name[:32],  # limit name length
                "time": time_ms
            }

            with lock:
                leaderboard.append(entry)
                save_leaderboard()
                ip_last_submit[client_ip] = now

            self._set_headers()
            self.wfile.write(json.dumps({
                "status": "success"
            }).encode())

        # ---------- DELETE (ADMIN) ----------

        elif parsed_path.path == "/delete":

            if not self.check_admin_password():
                self._set_headers(403)
                self.wfile.write(json.dumps({
                    "error": "Unauthorized"
                }).encode())
                return

            index = data.get("index")

            if not isinstance(index, int):
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": "Index must be integer"
                }).encode())
                return

            with lock:

                if index == -1:
                    leaderboard.clear()

                elif 0 <= index < len(leaderboard):
                    leaderboard.pop(index)

                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "error": "Invalid index"
                    }).encode())
                    return

                save_leaderboard()

            self._set_headers()
            self.wfile.write(json.dumps({
                "status": "deleted"
            }).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({
                "error": "Not found"
            }).encode())


# =========================
# Start server
# =========================

def run():
    load_password()
    load_leaderboard()

    server = HTTPServer(
        (HOST, PORT),
        LeaderboardHandler
    )

    print(f"Server running on http://{HOST}:{PORT}")
    print("Admin password loaded.")

    server.serve_forever()


if __name__ == "__main__":
    run()
