@echo off
docker build -t mikugg-app .
docker run -p 8484:8484 -p 8585:8585 5173:5173 mikugg-app
