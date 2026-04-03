$adminDir = 'c:\Users\acer\OneDrive\Documents\WEBSITE112JKT\frontend\src\pages\admin'
$toastTag = '      <ToastContainer toasts={toasts} onRemove={removeToast} />'

$files = Get-ChildItem -Path $adminDir -Recurse -Filter 'Admin*.jsx'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($content -notmatch 'useToast') { continue }

    if ($content -match 'ToastContainer toasts=') {
        Write-Host "SKIP (ToastContainer exists): $($file.Name)"
        continue
    }

    $pattern = '(  return \(\r?\n    <div)'
    $replacement = "  return (`n$toastTag`n    <div"
    $newContent = [regex]::Replace($content, $pattern, $replacement)

    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "UPDATED: $($file.Name)"
    } else {
        Write-Host "NO MATCH: $($file.Name)"
    }
}

Write-Host "`nDone!"
