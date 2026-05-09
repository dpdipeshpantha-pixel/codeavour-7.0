$content = Get-Content "admin.js" -Raw
$content = [System.Text.RegularExpressions.Regex]::Replace($content, '"blocks"\s*:\s*\[\s*,', '"blocks": [')
Set-Content "admin.js" $content
Write-Host "Fixed admin.js"
