# deploy-gh-pages.ps1
# Build and deploy to GitHub Pages (gh-pages branch)
param(
    [switch]$CommitOnly = $false
)

$ErrorActionPreference = 'Stop'
Write-Host 'Building for GitHub Pages...' -ForegroundColor Green

# Build with GITHUB_PAGES=true
$env:GITHUB_PAGES = 'true'
npm run build 2>&1
Remove-Item Env:\GITHUB_PAGES

Write-Host ''
Write-Host 'Deploying to gh-pages branch...' -ForegroundColor Green

# Create temporary gh-pages worktree or push
$tempDist = Join-Path $PSScriptRoot 'dist'

$gitUser = git config user.email 2>$null
$commitMsg = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

git add dist/ 2>$null
git commit -m "build: GitHub Pages deployment $commitMsg" 2>$null
git subtree push --prefix dist origin gh-pages 2>&1

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 129) {
    Write-Host ''
    Write-Host 'Deployed to GitHub Pages!' -ForegroundColor Green
    Write-Host 'URL: https://0xXuegege.github.io/the-last-spell-tool/' -ForegroundColor Cyan
} else {
    Write-Host 'Deploy failed, trying alternative method...' -ForegroundColor Yellow
    $branch = git branch --show-current 2>$null
    git checkout --orphan gh-pages-temp 2>$null
    git rm -rf . 2>$null
    Copy-Item "$tempDist\*" . -Recurse -Force
    git add .
    git commit -m $commitMsg 2>$null
    git branch -D gh-pages 2>$null
    git branch -m gh-pages-temp gh-pages
    git push -f origin gh-pages
    git checkout $branch 2>$null
    Write-Host 'Deployed!' -ForegroundColor Green
}
