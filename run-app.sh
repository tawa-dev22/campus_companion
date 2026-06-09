#!/bin/bash

# Clear terminal screen
clear

echo "======================================================================="
echo "                 CAMPUS COMPANION APPLICATION LAUNCHER"
echo "======================================================================="
echo ""
echo "Please select how you want to run the application:"
echo ""
echo "[1] Run using Docker (Recommended - No local Node.js or MongoDB needed)"
echo "[2] Run locally (Requires Node.js and MongoDB installed on this PC)"
echo "[3] Install/Reinstall all dependencies (Run this first if using Option 2)"
echo "[4] Exit"
echo ""

read -p "Enter choice (1-4): " opt

case $opt in
    1)
        echo ""
        echo "Starting Docker containers..."
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "Launching backend and frontend concurrently..."
        npm run dev
        ;;
    3)
        echo ""
        echo "Installing dependencies for root, backend, and frontend..."
        npm run install-all
        echo ""
        echo "Installation complete!"
        read -p "Press enter to continue..."
        ./run-app.sh
        ;;
    4)
        echo ""
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        sleep 2
        ./run-app.sh
        ;;
esac
