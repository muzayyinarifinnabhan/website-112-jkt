$adminDir = 'c:\Users\acer\OneDrive\Documents\WEBSITE112JKT\frontend\src\pages\admin'

$files = Get-ChildItem -Path $adminDir -Recurse -Filter 'Admin*.jsx'
$confirmImport = "import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'"
$confirmHook = "  const { confirmState, showConfirm } = useConfirm()"
$confirmTag = "      <ConfirmDialog {...confirmState} />"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    if ($content -notmatch 'confirm\(' -and $content -notmatch 'showConfirm') {
        continue
    }

    if ($content -notmatch 'useConfirm') {
        # 1. Add import below useToast
        $content = $content -replace "(import \{ useToast, ToastContainer \} from '\.\.\/\.\.\/\.\.\/components\/Toast'\r?\n)", "`$1$confirmImport`n"

        # 2. Add hook below useToast hook
        $content = $content -replace "(  const \{ toasts, toast, removeToast \} = useToast\(\)\r?\n)", "`$1$confirmHook`n"

        # 3. Add component below ToastContainer
        $content = $content -replace "(      <ToastContainer toasts=\{toasts\} onRemove=\{removeToast\} />\r?\n)", "`$1$confirmTag`n"
    }

    # 4. Replace !confirm('...') with !(await showConfirm('...'))
    $content = [regex]::Replace($content, "!confirm\('([^']+)'\)", "!(await showConfirm(`'$1`'))")

    # 5. Replace confirm('...') with (await showConfirm('...'))
    $content = [regex]::Replace($content, "confirm\('([^']+)'\)", "(await showConfirm(`'$1`'))")

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "UPDATED: $($file.Name)"
}

Write-Host "Done migrating confirm dialogs!"
