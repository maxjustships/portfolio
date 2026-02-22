#!/bin/bash

PID_FILE=".server.pid"
PORT=8000

start_server() {
    if [ -f "$PID_FILE" ]; then
        if ps -p $(cat "$PID_FILE") > /dev/null; then
            echo "Server is already running (PID: $(cat $PID_FILE))"
            return
        else
            rm "$PID_FILE"
        fi
    fi
    echo "Starting server on http://localhost:$PORT..."
    nohup python3 -m http.server $PORT > /dev/null 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    echo "Server started with PID $PID. Visit http://localhost:$PORT"
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Stopping server (PID: $PID)..."
        kill "$PID" 2>/dev/null
        rm "$PID_FILE"
        echo "Server stopped."
    else
        # Fallback to pkill if PID file is missing
        echo "PID file not found. Attempting pkill..."
        pkill -f "python3 -m http.server $PORT"
        echo "Server stopped (if it was running)."
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    *)
        echo "Usage: ./serve.sh {start|stop}"
        exit 1
        ;;
esac
