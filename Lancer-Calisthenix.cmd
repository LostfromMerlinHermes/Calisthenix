@echo off
setlocal
cd /d "%~dp0"
title Calisthenix - test local
set "PORT=8765"
set "PY="

py -3 --version >nul 2>nul && set "PY=py -3"
if not defined PY (
  python --version >nul 2>nul && set "PY=python"
)

if not defined PY goto nopython

echo.
echo   CALISTHENIX // SESSION DE TEST
echo   ------------------------------------------------
echo   Adresse : http://127.0.0.1:%PORT%/
echo.
echo   Garde cette fenetre ouverte pendant le test.
echo   Le navigateur s'ouvre dans un instant.
echo   Pour tout arreter : Ctrl+C, ou ferme cette fenetre.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:%PORT%/'"
%PY% -m http.server %PORT% --bind 127.0.0.1

echo.
echo   Serveur arrete.
pause
exit /b 0

:nopython
echo.
echo   Python n'est pas installe sur cet ordinateur.
echo   Pas de probleme : l'application s'ouvre directement dans le navigateur.
echo.
start "" "%~dp0index.html"
echo   Si rien ne s'ouvre, double-clique sur index.html dans ce dossier.
echo.
pause
exit /b 0
