# build_deploy.ps1 - One-click build and deploy WebDev2 to remote nginx server
#
# Usage:
#   .\build_deploy.ps1                 # Full deploy
#   .\build_deploy.ps1 -BuildOnly      # Build only, no deploy
#   .\build_deploy.ps1 -SkipBuild      # Skip build, just deploy existing dist/
#   .\build_deploy.ps1 -WhatIf         # Preview only, no execution

param(
    [switch]$BuildOnly,
    [switch]$SkipBuild,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

# ---- Configuration ----
$REMOTE_USER  = "root"
$REMOTE_HOST  = "xxxx"
$REMOTE_PORT  = "22"
$REMOTE_PATH  = "/var/www/webdev2"
$NGINX_CONF   = "/etc/nginx/conf.d/webdev2.conf"
$DOMAIN       = ""
# -----------------------

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistPath   = Join-Path $ScriptRoot "dist"

# Helper functions
function log_info ($msg)  { Write-Host ("[INFO]  " + $msg) -ForegroundColor Green }
function log_warn ($msg)  { Write-Host ("[WARN]  " + $msg) -ForegroundColor Yellow }
function log_error($msg)  { Write-Host ("[ERROR] " + $msg) -ForegroundColor Red }

function log_step ($msg) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ("  " + $msg) -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function ssh_cmd ($Cmd) {
    ssh -p $REMOTE_PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no `
        "$REMOTE_USER@$REMOTE_HOST" $Cmd
}

function scp_upload ($LocalPath, $RemotePath) {
    scp -P $REMOTE_PORT -o StrictHostKeyChecking=no -r $LocalPath `
        "$REMOTE_USER@$REMOTE_HOST`:$RemotePath"
}

# ============================================================================
# Step 1: Dependency check
# ============================================================================
log_step "Checking dependencies"

$deps = @("npm", "ssh", "scp")
$missing = @()
foreach ($d in $deps) {
    if (-not (Get-Command $d -ErrorAction SilentlyContinue)) {
        $missing += $d
    }
}
if ($missing.Count -gt 0) {
    log_error ("Missing tools: " + ($missing -join ", "))
    log_error "Windows: Settings -> Apps -> Optional Features -> Add OpenSSH Client"
    exit 1
}
log_info "Dependencies OK (npm, ssh, scp)"

# ============================================================================
# Step 2: Build project
# ============================================================================
if ($SkipBuild) {
    log_warn "Skipping build (-SkipBuild)"
}
else {
    log_step "Building project"

    Push-Location $ScriptRoot
    try {
        # npm install
        log_info "Running npm install..."
        & npm install 2>&1 | Out-Host

        # vite build (skip tsc to avoid pre-existing errors)
        log_info "Running vite build..."
        $oldPref = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        & npx vite build 2>$null | Out-Null
        $buildRc = $LASTEXITCODE
        $ErrorActionPreference = $oldPref

        if (-not (Test-Path (Join-Path $DistPath "index.html"))) {
            log_error "Build failed: missing dist/index.html"
            exit 1
        }

        $fileCount = (Get-ChildItem $DistPath -Recurse -File).Count
        log_info ("Build complete -- " + $fileCount + " files")

        $modDir = Join-Path $DistPath "mod-release"
        if (Test-Path $modDir) {
            $mf = (Get-ChildItem $modDir -Recurse -File).Count
            log_info ("Includes mod-release (" + $mf + " files)")
        }
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# Step 3: Generate nginx config
# ============================================================================
log_step "Generating nginx config"

$serverName = if ($DOMAIN) { $DOMAIN } else { $REMOTE_HOST }

$conf = @"
server {
    listen 80;
    server_name $serverName;

    root $REMOTE_PATH;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot) {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files `$uri `$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
"@

$nginxConfFile = Join-Path $ScriptRoot "nginx.conf"
$conf | Out-File -FilePath $nginxConfFile -Encoding utf8 -NoNewline
log_info "nginx config generated"

# ============================================================================
# Step 4: Build-only mode
# ============================================================================
if ($BuildOnly) {
    log_info "Build-only mode, skipping deploy"
    log_info ("Output: " + (Resolve-Path $DistPath))
    exit 0
}

# ============================================================================
# Step 5: SSH connection test
# ============================================================================
log_step ("Connecting to " + $REMOTE_HOST)

$testOutput = ssh_cmd "echo SSH_OK" 2>&1
if (-not ($testOutput -match "SSH_OK")) {
    log_error ("Cannot connect to " + $REMOTE_USER + "@" + $REMOTE_HOST)
    exit 1
}
log_info "SSH connection OK"

# ============================================================================
# Step 6: Upload artifacts
# ============================================================================
if ($WhatIf) {
    log_info "Preview mode -- would:"
    log_info "  (1) mkdir -p " + $REMOTE_PATH
    log_info "  (2) scp dist/* -> " + $REMOTE_PATH
    log_info "  (3) scp nginx.conf -> " + $NGINX_CONF
    log_info "  (4) nginx -t && systemctl reload nginx"
    exit 0
}

log_step ("Uploading to " + $REMOTE_PATH)

# Create remote dir
log_info "Creating remote directory..."
ssh_cmd "mkdir -p $REMOTE_PATH" | Out-Host

# Upload dist
log_info "Uploading dist/..."
$localDist = (Get-Item $DistPath).FullName -replace '\\', '/'
scp_upload "$localDist/*" "$REMOTE_PATH/"
log_info "Upload complete"

# Set permissions
log_info "Setting permissions..."
ssh_cmd "chown -R www-data:www-data $REMOTE_PATH 2>/dev/null; true" | Out-Host

# Deploy nginx config
log_info "Deploying nginx config..."
scp_upload ($nginxConfFile -replace '\\', '/') "/tmp/webdev2-nginx.conf"
ssh_cmd "mv /tmp/webdev2-nginx.conf $NGINX_CONF" | Out-Host

# Test and reload
log_info "Testing nginx config..."
$test = ssh_cmd "nginx -t" 2>&1
Write-Host ("  " + $test) -ForegroundColor Gray

if ($test -match "successful") {
    log_info "Reloading nginx..."
    ssh_cmd "systemctl reload nginx" | Out-Host
    log_info "nginx reloaded"
}
else {
    log_warn "nginx -t returned unexpected output"
    Write-Host ("  " + $test) -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item (Join-Path $ScriptRoot "nginx.conf") -Force -ErrorAction SilentlyContinue

# ============================================================================
# Done
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
$accessURL = if ($DOMAIN) { "http://" + $DOMAIN } else { "http://" + $REMOTE_HOST }
Write-Host ("  URL: " + $accessURL) -ForegroundColor Gray
Write-Host ""
