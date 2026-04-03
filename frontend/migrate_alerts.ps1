$adminDir = 'c:\Users\acer\OneDrive\Documents\WEBSITE112JKT\frontend\src\pages\admin'
$toastImport = "import { useToast, ToastContainer } from '../../../components/Toast'"
$toastHook = "  const { toasts, toast, removeToast } = useToast()"

$files = Get-ChildItem -Path $adminDir -Recurse -Filter 'Admin*.jsx'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($content -match 'useToast') {
        Write-Host "SKIP (already migrated): $($file.Name)"
        continue
    }

    if ($content -notmatch 'alert\(') {
        Write-Host "SKIP (no alerts): $($file.Name)"
        continue
    }

    # 1. Add Toast import after supabase import line
    $content = $content -replace "(import \{ supabase \} from '\.\.\/\.\.\/\.\.\/lib\/supabase'\r?\n)", "`$1$toastImport`n"

    # 2. Add useToast hook after function opening brace
    $content = $content -replace "(export default function \w+\(\) \{\r?\n)", "`$1$toastHook`n"

    # 3. Replace success alerts
    $content = $content -replace "alert\('(Berhasil[^']*)'", "toast.success('`$1'"
    $content = $content -replace "alert\('(Hero berhasil[^']*)'", "toast.success('`$1'"
    $content = $content -replace "alert\('(Informasi[^']*berhasil[^']*)'", "toast.success('`$1'"
    $content = $content -replace "alert\('(Pembaruan[^']*Berhasil[^']*)'", "toast.success('`$1'"
    $content = $content -replace "alert\('(Data berhasil[^']*)'", "toast.success('`$1'"

    # 4. Replace error alerts
    $content = $content -replace "alert\('(Gagal[^']*)'", "toast.error('`$1'"
    $content = $content -replace "alert\('(Error[^']*)'", "toast.error('`$1'"
    $content = $content -replace "alert\('(Upload gagal[^']*)'", "toast.error('`$1'"

    # 5. Replace warning alerts
    $content = $content -replace "alert\('(Mohon[^']*)'", "toast.warning('`$1'"
    $content = $content -replace "alert\('(Harap[^']*)'", "toast.warning('`$1'"

    # 6. Generic: alert(error.message) -> toast.error(error.message)
    $content = $content -replace 'alert\(error\.message\)', 'toast.error(error.message)'

    # 7. Catch-all remaining: alert( -> toast.info(
    $content = $content -replace 'alert\(', 'toast.info('

    # 8. Add ToastContainer right after the first <div in return
    $content = $content -replace '(  return \(\r?\n    <div)', "`$1"

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "UPDATED: $($file.Name)"
}

Write-Host "`nDone! All admin files processed."
