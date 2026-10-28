$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$adb = 'C:\Users\OORT\AppData\Local\Android\Sdk\platform-tools\adb.exe'
$dev = '192.168.88.58:5555'

Write-Output '>>> 抓取 25 秒日志，请在手机上播放 test01 视频'
Start-Sleep -Seconds 25

$lines = & $adb -s $dev logcat -d -v time
Write-Output ('总行数=' + ($lines | Measure-Object).Count)
Write-Output '===== 关键过滤 ====='
$lines | Select-String -Pattern '21410|oortcloudsmart|webrtc|WebRTC|adapter|mixed|Mixed|BLOCKED|ERR_|ERR_CLEAR|ERR_CONNECTION|ERR_NAME|WebSocket|wss|appassets|androidplatform|Failed to load|Refused|RTCPeerConnection|ontrack|icecandidate' | ForEach-Object { Write-Output $_.Line }
