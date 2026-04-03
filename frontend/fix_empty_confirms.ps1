$adminDir = 'c:\Users\acer\OneDrive\Documents\WEBSITE112JKT\frontend\src\pages\admin'

$files = Get-ChildItem -Path $adminDir -Recurse -Filter 'Admin*.jsx'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($content -match "showConfirm\(''\)") {
        # Replace empty showConfirm with a standardized message
        $content = $content -replace "showConfirm\(''\)", "showConfirm('Hapus data ini?', 'Tindakan ini tidak bisa dibatalkan.')"
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "FIXED: $($file.Name)"
    }
}

Write-Host "Done fixing empty confirms!"
