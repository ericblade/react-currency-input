#!/usr/bin/env python3
import sys
import socketserver
from http.server import SimpleHTTPRequestHandler

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")


if __name__ == '__main__':
    PORT = 8080
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("Listening on port {}. Press Ctrl+C to stop.".format(PORT))
        httpd.serve_forever()
