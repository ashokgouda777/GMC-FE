import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-ledger-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="ledger-report-container">
      <!-- Filter Panel -->
      <div class="section-card filter-card">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <h3>Ledger Report Filters</h3>
        </div>
        <form [formGroup]="filterForm" class="filter-grid">
          <div class="form-field">
            <label>Financial Year</label>
            <select formControlName="financialYear">
              <option value="">Select Year</option>
              <option *ngFor="let yr of financialYears" [value]="yr.computedId">
                {{ yr.computedLabel }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label>Group</label>
            <select formControlName="group">
              <option value="">Select Group</option>
              <option *ngFor="let g of groups" [value]="g.computedId">
                {{ g.computedLabel }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label>Type</label>
            <select formControlName="type">
              <option value="">Select Type</option>
              <option *ngFor="let t of types" [value]="t.computedId">
                {{ t.computedLabel }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label>From Date</label>
            <input type="date" formControlName="fromDate" />
          </div>
          <div class="form-field">
            <label>To Date</label>
            <input type="date" formControlName="toDate" />
          </div>
          
          <div class="form-field">
            <label>Ledger Name</label>
            <select formControlName="ledgerName">
              <option value="">Select Ledger</option>
              <option *ngFor="let l of ledgers" [value]="l.computedId">
                {{ l.computedLabel }}
              </option>
            </select>
          </div>
          <div class="filter-actions">
            <button type="button" (click)="onDisplay()" class="btn btn-primary">
              <span>👁️</span> Display
            </button>
            <button type="button" (click)="onClear()" class="btn btn-outline">
              <span>↺</span> Clear
            </button>
            <button type="button" (click)="onGeneratePdf()" class="btn btn-print">
              <span>📄</span> Generate PDF
            </button>
          </div>
        </form>
      </div>

      <!-- Results Table -->
      <div class="section-card result-card" *ngIf="showResults">
        <div class="section-header">
          <span class="section-icon">📋</span>
          <h3>Report Data</h3>
          <div class="header-badge">Found {{ reportData.length }} Entries</div>
        </div>
        
        <div class="table-wrapper">
          <table class="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Group Receipt Number</th>
                <th>Receipt Number</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of reportData">
                <td>{{ row.Date || row.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ row.GroupReceiptNumber || row.groupReceiptNumber }}</td>
                <td>{{ row.ReceiptNumber || row.receiptNumber }}</td>
                <td class="text-right">{{ row.Amount || row.amount | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="reportData.length === 0">
                <td colspan="4" class="text-center no-data">No records found for the selected filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Poppins', sans-serif;
    }

    .ledger-report-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 16px rgba(112, 144, 176, 0.12);
      border: 1px solid #eef2fa;
    }

    .filter-card {
      background: linear-gradient(135deg, #f8f9ff 0%, #eef2fa 100%);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .section-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #2b3674;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-field label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7a99;
      text-transform: uppercase;
    }
    .form-field input, .form-field select {
      padding: 10px 14px;
      border: 1.5px solid #e0e8ff;
      border-radius: 10px;
      font-size: 0.9rem;
      outline: none;
    }
    .form-field input:focus, .form-field select:focus {
      border-color: #6b46c1;
    }

    .filter-actions {
      grid-column: 1 / -1;
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6b46c1, #4299e1);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .btn-outline {
      background: white;
      color: #6b46c1;
      border: 1.5px solid #6b46c1;
    }

    .btn-print {
      background: linear-gradient(135deg, #05cd99, #0077b6);
      color: white;
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e0e8ff;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
    }
    .report-table thead {
      background: #f4f7fe;
    }
    .report-table thead th {
      padding: 12px;
      text-align: left;
      color: #2b3674;
      font-weight: 700;
    }
    .report-table tbody td {
      padding: 12px;
      border-bottom: 1px solid #f0f4ff;
      color: #6c757d;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .no-data { padding: 40px !important; color: #adb5bd; font-style: italic; }

    .header-badge {
      margin-left: auto;
      background: #6b46c1;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
    }
  `]
})
export class LedgerReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  filterForm!: FormGroup;
  financialYears: any[] = [];
  groups: any[] = [];
  types: any[] = [];
  ledgers: any[] = [];
  reportData: any[] = [];
  showResults = false;

  ngOnInit() {
    this.initForm();
    this.loadMasterData();
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];
    this.filterForm = this.fb.group({
      financialYear: ['', Validators.required],
      group: ['', Validators.required],
      type: [''],
      fromDate: [today, Validators.required],
      toDate: [today, Validators.required],
      ledgerName: ['']
    });
  }

  loadMasterData() {
    this.adminService.getFinancialYears().subscribe((data: any) => {
      this.financialYears = Array.isArray(data) ? data : (data?.result?.years || data?.result || data?.years || []);
      this.financialYears.forEach(y => {
        // Priority: FinYearrId (from user's updated C#) -> finYearrId -> others
        y.computedId = y.FinYearrId ?? y.finYearrId ?? y.Id ?? y.id ?? y.years ?? '';
        y.computedLabel = y.FinancialYear || y.financialYear || y.years || y.year || y.computedId || 'Year';
      });
      console.log('Processed Year:', this.financialYears[0]);
    });
    this.adminService.getReportGroups().subscribe((data: any) => {
      this.groups = Array.isArray(data) ? data : (data?.result || data?.data || []);
      this.groups.forEach(g => {
        g.computedId = g.Id ?? g.id ?? g.Name ?? g.name ?? g.account;
        g.computedLabel = g.Name || g.name || g.groupName || g.GroupName || g.account || 'Group';
      });
      console.log('Processed Group:', this.groups[0]);
    });
    this.adminService.getReportTypes().subscribe((data: any) => {
      this.types = Array.isArray(data) ? data : (data?.result || data?.data || []);
      this.types.forEach(t => {
        t.computedId = t.Id ?? t.id ?? t.Name ?? t.name;
        t.computedLabel = t.Name || t.name || t.typeName || t.TypeName || 'Type';
      });
      console.log('Processed Type:', this.types[0]);
    });
    this.adminService.getGroupLedgerMaster().subscribe((data: any) => {
      this.ledgers = Array.isArray(data) ? data : (data?.result || data?.data || []);
      this.ledgers.forEach(l => {
        l.computedId = l.LedgerID ?? l.ledgerID ?? l.Id ?? l.id ?? l.LedgerName;
        l.computedLabel = l.LedgerName || l.ledgerName || l.Name || l.name || 'Ledger';
      });
      console.log('Processed Ledger:', this.ledgers[0]);
    });
  }

  onDisplay() {
    if (this.filterForm.valid) {
      this.adminService.getLedgerReport(this.filterForm.value).subscribe({
        next: (response: any) => {
          // Robust mapping for different API response structures (matches Daybook implementation)
          this.reportData = Array.isArray(response) ? response :
            (response?.Data || response?.data || response?.result || response?.items || []);
          this.showResults = true;
          if (this.reportData.length === 0) {
            console.log('No data returned for ledger filters:', this.filterForm.value, 'Response:', response);
          }
        },
        error: (err) => {
          console.error('Failed to load report data', err);
          alert('Failed to load report data: ' + (err.error?.message || err.message || 'Check console for details'));
        }
      });
    } else {
      alert('Please select mandatory filters (Financial Year, Group, Dates)');
    }
  }

  onClear() {
    this.filterForm.reset({
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      financialYear: '',
      group: '',
      type: '',
      ledgerName: ''
    });
    this.showResults = false;
    this.reportData = [];
  }

  onGeneratePdf() {
    if (this.filterForm.valid) {
      this.adminService.generateLedgerReport(this.filterForm.value).subscribe({
        next: (blob: any) => {
          if (blob.size < 500 && blob.type !== 'application/pdf') {
            const reader = new FileReader();
            reader.onload = () => {
              const text = reader.result as string;
              console.error('PDF generation error message:', text);
              alert('Server Error: ' + text.substring(0, 200));
            };
            reader.readAsText(blob);
          } else {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        },
        error: (err) => {
          console.error('Failed to generate PDF', err);
          alert('Failed to generate PDF report.');
        }
      });
    } else {
      alert('Please select mandatory filters to generate PDF');
    }
  }
}

