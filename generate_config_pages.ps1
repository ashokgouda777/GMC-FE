$basePath = "d:\ASHOK Working Folder\GMC\GMC FE\gmc-portal\src\app\features\admin\pages\configuration\pages"
if (!(Test-Path -Path $basePath)) {
    New-Item -ItemType Directory -Path $basePath -Force
}

$pages = @(
    @{ Name = "user-management"; Class = "UserManagementComponent"; Title = "User Management" },
    @{ Name = "user-access-control"; Class = "UserAccessControlComponent"; Title = "User Access Control" },
    @{ Name = "website-config"; Class = "WebsiteConfigComponent"; Title = "Website Configuration" },
    @{ Name = "notification-config"; Class = "NotificationConfigComponent"; Title = "Notification Configuration" },
    @{ Name = "broadcast-sms"; Class = "BroadcastSmsComponent"; Title = "Broadcast SMS" },
    @{ Name = "university-list"; Class = "UniversityListComponent"; Title = "University List" },
    @{ Name = "colleges-list"; Class = "CollegesListComponent"; Title = "Colleges List" },
    @{ Name = "subject-master"; Class = "SubjectMasterComponent"; Title = "Subject Master" },
    @{ Name = "course-list"; Class = "CourseListComponent"; Title = "Course List" },
    @{ Name = "state-list"; Class = "StateListComponent"; Title = "State List" },
    @{ Name = "district-list"; Class = "DistrictListComponent"; Title = "District List" },
    @{ Name = "country-master"; Class = "CountryMasterComponent"; Title = "Country Master" },
    @{ Name = "nationality-master"; Class = "NationalityMasterComponent"; Title = "Nationality Master" },
    @{ Name = "registration-type"; Class = "RegistrationTypeComponent"; Title = "Registration Type" },
    @{ Name = "signature"; Class = "SignatureComponent"; Title = "Signature" }
)

foreach ($page in $pages) {
    $filePath = Join-Path -Path $basePath -ChildPath "$($page.Name).component.ts"
    # Note: Using double backticks ``` to escape the backtick character in PowerShell string
    $content = @"
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-$($page.Name)',
  standalone: true,
  imports: [CommonModule],
  template: ``
    <div class='config-page'>
      <h2>$($page.Title)</h2>
      <div class='placeholder-content'>
        <p>$($page.Title) content will go here.</p>
      </div>
    </div>
  ``,
  styles: [``
    .config-page {
      padding: 0;
      h2 { color: #333; margin-bottom: 20px; font-size: 1.5rem; }
      .placeholder-content {
        padding: 40px;
        background: #f8f9fa;
        border: 1px dashed #ccc;
        border-radius: 8px;
        text-align: center;
        color: #666;
      }
    }
  ``]
})
export class $($page.Class) {}
"@
    Set-Content -Path $filePath -Value $content
    Write-Host "Regenerated $($page.Name)"
}
