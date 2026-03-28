import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';


export const ADMIN_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    {
        path: 'configuration',
        loadComponent: () => import('./pages/configuration/configuration.component').then(m => m.ConfigurationComponent),
        children: [
            { path: '', redirectTo: 'user-management', pathMatch: 'full' },
            { path: 'user-management', loadComponent: () => import('./pages/configuration/pages/user-management.component').then(m => m.UserManagementComponent) },
            { path: 'user-access-control', loadComponent: () => import('./pages/configuration/pages/user-access-control.component').then(m => m.UserAccessControlComponent) },
            { path: 'website-config', loadComponent: () => import('./pages/configuration/pages/website-config.component').then(m => m.WebsiteConfigComponent) },
            { path: 'university-list', loadComponent: () => import('./pages/configuration/pages/university-list.component').then(m => m.UniversityListComponent) },
            { path: 'colleges-list', loadComponent: () => import('./pages/configuration/pages/colleges-list.component').then(m => m.CollegesListComponent) },
            { path: 'subject-master', loadComponent: () => import('./pages/configuration/pages/subject-master.component').then(m => m.SubjectMasterComponent) },
            { path: 'course-list', loadComponent: () => import('./pages/configuration/pages/course-list.component').then(m => m.CourseListComponent) },
            { path: 'state-list', loadComponent: () => import('./pages/configuration/pages/state-list.component').then(m => m.StateListComponent) },
            { path: 'district-list', loadComponent: () => import('./pages/configuration/pages/district-list.component').then(m => m.DistrictListComponent) },
            { path: 'country-master', loadComponent: () => import('./pages/configuration/pages/country-master.component').then(m => m.CountryMasterComponent) },
            { path: 'nationality-master', loadComponent: () => import('./pages/configuration/pages/nationality-master.component').then(m => m.NationalityMasterComponent) },
            { path: 'registration-type', loadComponent: () => import('./pages/configuration/pages/registration-type.component').then(m => m.RegistrationTypeComponent) },
            { path: 'signature', loadComponent: () => import('./pages/configuration/pages/signature.component').then(m => m.SignatureComponent) },
        ]
    },
    {
        path: 'accounting',
        loadComponent: () => import('./pages/accounting/accounting.component').then(m => m.AccountingComponent),
        children: [
            { path: '', redirectTo: 'cash-book', pathMatch: 'full' },
            {
                path: 'cash-book',
                loadComponent: () => import('./pages/accounting/pages/cash-book/cash-book.component').then(m => m.CashBookComponent)
            },
            {
                path: 'ledger-report',
                loadComponent: () => import('./pages/accounting/pages/ledger-report/ledger-report.component').then(m => m.LedgerReportComponent)
            },
            {
                path: 'daybook-report',
                loadComponent: () => import('./pages/accounting/pages/daybook-report/daybook-report.component').then(m => m.DaybookReportComponent)
            },
            {
                path: 'renewal-report',
                loadComponent: () => import('./pages/accounting/pages/renewal-report/renewal-report.component').then(m => m.RenewalReportComponent)
            }
        ]
    },
    {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
    },
    {
        path: 'users',
        loadComponent: () => import('./pages/users-management/users-management.component').then(m => m.UsersManagementComponent)
    },
    {
        path: 'practitioner/:id',
        loadComponent: () => import('./pages/practitioner-profile/practitioner-profile.component').then(m => m.PractitionerProfileComponent)
    },
    {
        path: 'user-control',
        loadComponent: () => import('./pages/user-control/user-control.component').then(m => m.UserControlComponent),
        children: [
            { path: '', redirectTo: 'case-workers', pathMatch: 'full' },
            {
                path: 'case-workers',
                loadComponent: () => import('./pages/user-control/case-workers/case-workers.component').then(m => m.CaseWorkersComponent)
            },
            {
                path: 'admins',
                loadComponent: () => import('./pages/user-control/admins/admins.component').then(m => m.AdminsComponent)
            }
        ]
    }
];
