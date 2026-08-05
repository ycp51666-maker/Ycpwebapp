# IMPORTANT: Do NOT hardcode tokens in source. Set a GitHub PAT in the
# environment variable GITHUB_TOKEN before running this script.
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Error "Environment variable GITHUB_TOKEN is not set. Exiting."
    exit 1
}
$headers = @{ Authorization = "Bearer $token" }

try {
    # Add Arulraj2001 as collaborator with Write (push) permission on Ycpwebapp repo
    $body = @{
        permission = "write"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri 'https://api.github.com/repos/ycp51666-maker/Ycpwebapp/collaborators/Arulraj2001' -Method PUT -Headers $headers -Body $body -ContentType 'application/json'
    Write-Output "Collaborator Arulraj2001 added successfully!"
    Write-Output "Permission: write"

    # Verify collaborator list
    $collabs = Invoke-RestMethod -Uri 'https://api.github.com/repos/ycp51666-maker/Ycpwebapp/collaborators' -Headers $headers
    Write-Output "Current collaborators:"
    foreach ($c in $collabs) {
        $perms = @()
        if ($c.permissions.pull) { $perms += "pull" }
        if ($c.permissions.push) { $perms += "push" }
        if ($c.permissions.admin) { $perms += "admin" }
        Write-Output "  - $($c.login) (permissions: $($perms -join ', '))"
    }
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Output "Details: $($_.ErrorDetails.Message)"
    }
}