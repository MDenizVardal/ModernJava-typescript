@echo off
echo ================================================
echo   Gulsa Emlak - Kurulum Scripti
echo ================================================
echo.

:: Node.js kontrolu
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [BILGI] Node.js bulunamadi. Yukleniyor...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo [HATA] Node.js yuklenemedi. Lutfen https://nodejs.org adresinden manuel yukleyin.
        pause
        exit /b 1
    )
    echo [OK] Node.js yuklendi. Terminali yeniden baslatmaniz gerekebilir.
    pause
    exit /b 0
) else (
    echo [OK] Node.js bulundu.
    node --version
)

echo.
echo [ADIM 1] Bagimliliklar yukleniyor...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [HATA] npm install basarisiz.
    pause
    exit /b 1
)

echo.
echo [ADIM 2] better-sqlite3 Electron icin yeniden derleniyor...
npm run postinstall
if %errorlevel% neq 0 (
    echo [UYARI] better-sqlite3 yeniden derlenemedi.
    echo Lutfen su adresten 'Visual Studio Build Tools' yukleyin:
    echo https://visualstudio.microsoft.com/downloads/
    echo ve 'Desktop development with C++' workload'unu secin.
    pause
)

echo.
echo ================================================
echo   Kurulum tamamlandi!
echo   Balatmak icin: start.bat
echo ================================================
pause
