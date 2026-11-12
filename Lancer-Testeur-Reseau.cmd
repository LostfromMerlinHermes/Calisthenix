@echo off
setlocal
cd /d "%~dp0"
title Calisthenix - test sur telephone
set "PORT=8765"
set "PY="
set "LANIP="

py -3 --version >nul 2>nul && set "PY=py -3"
if not defined PY (
  python --version >nul 2>nul && set "PY=python"
)
if not defined PY goto nopython

for /f "usebackq delims=" %%i in (`%PY% "%~dp0outils\trouver-ip.py"`) do set "LANIP=%%i"

echo.
echo   CALISTHENIX // TEST SUR TELEPHONE
echo   ------------------------------------------------
if defined LANIP (
  echo   Sur le telephone, ouvre : http://%LANIP%:%PORT%/
) else (
  echo   Adresse reseau introuvable. Tape "ipconfig" pour la trouver.
)
echo   Sur cet ordinateur      : http://127.0.0.1:%PORT%/
echo.
echo   Le telephone doit etre sur le MEME Wi-Fi que cet ordinateur.
echo   Si Windows demande l'autorisation du pare-feu : autorise.
echo.
echo   Garde cette fenetre ouverte pendant le test.
echo   Ctrl+C pour arreter le serveur.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:%PORT%/'"
%PY% -m http.server %PORT% --bind 0.0.0.0

echo.
echo   Serveur arrete.
pause
exit /b 0

:nopython
echo.
echo   Python n'est pas installe : impossible de servir l'application sur le reseau.
echo   Options : installer Python, ou envoyer le dossier a la personne qui teste.
echo.
pause
exit /b 0
