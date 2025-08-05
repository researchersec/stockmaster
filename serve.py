#!/usr/bin/env python3
"""
Simple HTTP server to serve the stock dashboard
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        
        # Open the dashboard in the default browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            print(f"Could not open browser automatically. Please visit: http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()