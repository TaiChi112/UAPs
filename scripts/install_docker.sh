#!/bin/bash
echo "Downloading Docker Desktop for Apple Silicon..."
curl -L -o Docker.dmg "https://desktop.docker.com/mac/main/arm64/Docker.dmg"
echo "Mounting DMG..."
hdiutil attach Docker.dmg -nobrowse -mountpoint /Volumes/Docker
echo "Copying to Applications (this may take a minute)..."
cp -R /Volumes/Docker/Docker.app /Applications/
echo "Unmounting DMG..."
hdiutil detach /Volumes/Docker
echo "Cleaning up..."
rm Docker.dmg
echo "Opening Docker. Please finish the setup in the Docker Desktop app."
open -a Docker
echo "Waiting for Docker to start..."
while ! docker info > /dev/null 2>&1; do
  sleep 2
done
echo "Docker is ready!"
