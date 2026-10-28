$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$adb = 'C:\Users\OORT\AppData\Local\Android\Sdk\platform-tools\adb.exe'
$dev = '192.168.88.58:5555'
$apk = 'F:\work\VLStream-APP\Android\app\build\outputs\apk\release\app-release.apk'
Write-Output ('APK: ' + (Get-Item $apk).LastWriteTime + '  ' + [math]::Round((Get-Item $apk).Length/1MB,2) + 'MB')
& $adb -s $dev install -r $apk 2>&1 | ForEach-Object { Write-Output $_ }
