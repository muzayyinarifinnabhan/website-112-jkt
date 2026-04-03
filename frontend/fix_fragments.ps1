$adminDir = 'c:\Users\acer\OneDrive\Documents\WEBSITE112JKT\frontend\src\pages\admin'

$files = Get-ChildItem -Path $adminDir -Recurse -Filter 'Admin*.jsx'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Only files that have ToastContainer but NOT already wrapped in Fragment
    if ($content -notmatch 'ToastContainer toasts=') { continue }
    if ($content -match '<>') {
        Write-Host "SKIP (already has Fragment): $($file.Name)"
        continue
    }

    # Pattern: return ( \n  <ToastContainer ... /> \n  <div
    # Replace with: return ( \n  <> \n  <ToastContainer ... /> \n  <div
    $content = $content -replace '(  return \(\r?\n)(      <ToastContainer toasts=\{toasts\} onRemove=\{removeToast\} />)', "`$1    <>`n`$2"

    # Close the fragment: find the last </div>\n  )\n}  and replace with </div>\n  </>\n  )\n}
    $content = $content -replace '(  </div>\r?\n  \)\r?\n\})', "  </div>`n  </>`n  )`n}"

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "FIXED: $($file.Name)"
}

Write-Host "`nDone fixing fragments!"
