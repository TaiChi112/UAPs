$ErrorActionPreference = "Stop"

function Assert-StatusCode {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Label
  )

  $status = (curl.exe -s -o NUL -w "%{http_code}" $Url)
  if ($status -ne "200") {
    throw "$Label failed. Expected HTTP 200 but got $status"
  }

  Write-Output "$Label OK (HTTP 200)"
}

Assert-StatusCode -Url "http://localhost:3000" -Label "SMOKE_HOME_PAGE"
Assert-StatusCode -Url "http://localhost:3000/hr/filter" -Label "SMOKE_HR_FILTER_PAGE"

$search = Invoke-RestMethod -Uri "http://localhost:4000/v1/hr/resumes?requiredSkills=AWS,Docker&minExperienceYears=2" -Method Get
$count = @($search.data).Count
if ($count -lt 1) {
  throw "SMOKE_SEARCH failed. No recruiter-visible resumes returned."
}

$first = @($search.data)[0]
Write-Output "SMOKE_SEARCH OK (count=$count, firstResume=$($first.versionName))"

$quick = Invoke-RestMethod -Uri ("http://localhost:4000/v1/hr/resumes/" + $first.resumeId + "/quick-view") -Method Get
$quickSkillCount = @($quick.data.skills).Count
Write-Output "SMOKE_QUICK_VIEW OK (owner=$($quick.data.ownerName), skills=$quickSkillCount)"

$payload = @{
  resumeId = $first.resumeId
  companyName = "Northstar Recruiting"
  companyDomain = "northstar.example"
  recruiterName = "Ariya Recruiter"
  recruiterEmail = "ariya.recruiter@northstar.example"
  recruiterRoleTitle = "Senior Technical Recruiter"
  purpose = "Requesting access for screening candidates to fill backend and AI roles."
  positionTitle = "Backend Platform Engineer"
  requestedVisibility = "read-only"
} | ConvertTo-Json

$requestResult = Invoke-RestMethod -Uri "http://localhost:4000/v1/hr/access-requests" -Method Post -ContentType "application/json" -Body $payload
Write-Output "SMOKE_ACCESS_REQUEST OK (accessRequestId=$($requestResult.data.accessRequestId))"

Write-Output "SMOKE_DONE"