# run-lighthouse-all.ps1
#
# Runs a Lighthouse accessibility audit against every page of the app and
# saves each report (HTML + JSON) into lighthouse-reports/, named after
# the page. Requires the app already running at localhost:3000
# (npm run build && npm start, or docker).

$BaseUrl = "http://localhost:3000"
$OutDir = "lighthouse-reports"

$Pages = @(
    @{ Name = "home";         Path = "/" },
    @{ Name = "wordle";       Path = "/wordle" },
    @{ Name = "word-search";  Path = "/word-search" },
    @{ Name = "word-lists";   Path = "/word-lists" },
    @{ Name = "activities";   Path = "/activities" },
    @{ Name = "dashboard";    Path = "/dashboard" },
    @{ Name = "about";        Path = "/about" },
    @{ Name = "settings";     Path = "/settings" }
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Write-Host "Checking the app is actually running at $BaseUrl..." -ForegroundColor Cyan
try {
    Invoke-RestMethod "$BaseUrl/health" -TimeoutSec 5 | Out-Null
} catch {
    Write-Host "FAILED - is 'npm start' (or Docker) running? Start it first, then re-run this script." -ForegroundColor Red
    exit 1
}

foreach ($page in $Pages) {
    $url = "$BaseUrl$($page.Path)"
    $outPath = Join-Path $OutDir $page.Name
    Write-Host "=== Auditing $url ===" -ForegroundColor Cyan
    npx lighthouse $url `
        --only-categories=accessibility `
        --output=json --output=html `
        --output-path="$outPath" `
        --chrome-flags="--headless"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED on $url - see error above (often ChromeNotInstalledError, set `$env:CHROME_PATH)" -ForegroundColor Red
    } else {
        Write-Host "Saved $outPath.report.html / $outPath.report.json" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
foreach ($page in $Pages) {
    $jsonPath = Join-Path $OutDir "$($page.Name).report.json"
    if (Test-Path $jsonPath) {
        $report = Get-Content $jsonPath | ConvertFrom-Json
        $score = [math]::Round($report.categories.accessibility.score * 100)
        Write-Host "$($page.Name.PadRight(14)) $score / 100"
    } else {
        Write-Host "$($page.Name.PadRight(14)) (no report - see errors above)"
    }
}

Write-Host ""
Write-Host "Open any *.report.html file in lighthouse-reports/ in a browser for the full breakdown."