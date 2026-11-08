@echo off
setlocal
cd /d "%~dp0"
title Lustria - Sync analytics to Convex

echo.
echo ================================================
echo  LUSTRIA - CONVEX ANALYTICS SYNC
echo ================================================
echo  Working folder: %CD%
echo.

if not exist "convex\analytics.ts" (
  echo ERROR: convex\analytics.ts was not found.
  echo Extract the updated project before running this script.
  goto :fail
)
if not exist "convex\schema.ts" (
  echo ERROR: convex\schema.ts was not found.
  goto :fail
)
if not exist ".env.local" (
  echo ERROR: .env.local is missing. Keep your original .env.local.
  goto :fail
)
if not exist "node_modules\.bin\convex.cmd" (
  echo Convex dependencies are missing. Running npm install...
  call npm install
  if errorlevel 1 goto :fail
)

echo Connected deployment from .env.local:
findstr /B "CONVEX_DEPLOYMENT=" ".env.local"
echo.
echo Deploying functions to that development deployment...
echo.
call npx convex dev --once --verbose
if errorlevel 1 goto :fail

echo.
echo Checking regenerated API types...
findstr /L /C:"import type * as analytics" "convex\_generated\api.d.ts" >nul 2>&1
if errorlevel 1 (
  echo WARNING: analytics was not found in generated API types.
  echo Review the output above and verify Convex Functions in the dashboard.
  goto :fail
)

echo.
echo SUCCESS: Analytics functions are included in generated API types.
echo In the Convex Dashboard, verify analytics:overview and analytics:recordPageView.
echo Now reload http://localhost:5173/admin and visit Home / Collection to count views.
pause
exit /b 0

:fail
echo.
echo FAILED: Read the error ABOVE. Do not close this window.
echo If this is an authentication prompt, sign in with the account that owns your Lustria Convex project.
pause
exit /b 1
