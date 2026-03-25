import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../../../../../core/services/api.service';
import { AdminService } from '../../../../../../services/admin.service';
import { HttpParams } from '@angular/common/http';

interface CashbookSearchResult {
  feeItemName: string;
  ledgerDescription: string;
  financialYear: string | null;
  accountNo: string | null;
  remarks: string;
  type: string;
  receiptNumber: string;
  receiptDate: string;
  transactionNo: string;
  transactionDate: string | null;
  bank: string;
  amount: string;
  renewalID: string;
  createdBy: string;
  updatedBy: string | null;
  createdOn: string;
}

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="receipts-container">

      <!-- Main Receipt Register Card -->
      <div class="section-card register-card">
        <div class="section-header register-header">
          <h3>Receipt Register</h3>
        </div>

        <form [formGroup]="receiptForm" class="register-body">
          
          <!-- Search Row -->
          <div class="search-row-layout">
            <span class="label">Search : </span>
            <span class="sub-label">Receipt Number</span>
            <input type="text" [formControl]="receiptSearchControl" placeholder="Enter receipt no." class="search-input" (keyup.enter)="onSearch()" />
            <button type="button" (click)="onSearch()" class="btn btn-search">Search</button>
            <div class="nav-arrows">
              <button type="button" (click)="onFirst()" [disabled]="!canNav" title="First">⏮</button>
              <button type="button" (click)="onPrev()" [disabled]="!canNav" title="Previous">◀</button>
              <button type="button" (click)="onNext()" [disabled]="!canNav" title="Next">▶</button>
              <button type="button" (click)="onLast()" [disabled]="!canNav" title="Last">⏭</button>
            </div>
          </div>

          <!-- Fields Grid -->
          <div class="fields-grid-layout">
            <!-- Row 1 -->
            <div class="field-item">
              <label>Financial Year</label>
              <select formControlName="financialYear">
                <option value="">Select Year</option>
                <option *ngFor="let yr of financialYearsData" [value]="yr.id">{{ yr.label }}</option>
              </select>
            </div>
            <div class="field-item">
              <label>Date[DD/MM/YYYY]</label>
              <input type="date" formControlName="date" />
            </div>

            <!-- Row 2 -->
            <div class="field-item">
              <label>Select Group</label>
              <select formControlName="group">
                <option value="">Select Group</option>
                <option *ngFor="let g of groups" [value]="g.id">{{ g.label }}</option>
              </select>
            </div>
            <div class="field-item">
              <label>Receipt Number</label>
              <input type="text" formControlName="receiptNumber" readonly />
            </div>

            <!-- Row 3 -->
            <div class="field-item">
              <label>Group Receipt Number</label>
              <input type="text" formControlName="groupReceiptNumber" />
            </div>
            <div class="field-item empty"></div>
          </div>

          <!-- Transaction Table -->
          <div class="entries-table-wrapper legacy-style">
            <table class="entries-table">
              <thead>
                <tr>
                  <th style="width: 40px"></th>
                  <th>Description</th>
                  <th style="width: 150px">Debit</th>
                  <th style="width: 150px">Credit</th>
                  <th style="width: 40px" *ngIf="isEditing"></th>
                </tr>
              </thead>
              <tbody formArrayName="entries">
                <tr *ngFor="let entry of entries.controls; let i = index" [formGroupName]="i">
                  <td class="row-label">{{ i === 0 ? 'By' : 'To' }}</td>
                  <td>
                    <input *ngIf="isEditing" type="text" formControlName="particulars" class="inline-input" placeholder="Enter description..." />
                    <span *ngIf="!isEditing" class="display-text">{{ entry.get('particulars')?.value }}</span>
                  </td>
                  <td>
                    <input *ngIf="isEditing" type="number" formControlName="debit" class="inline-input amount" (input)="recalculate()" />
                    <span *ngIf="!isEditing" class="display-amount">{{ entry.get('debit')?.value | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <input *ngIf="isEditing" type="number" formControlName="credit" class="inline-input amount" (input)="recalculate()" />
                    <span *ngIf="!isEditing" class="display-amount">{{ entry.get('credit')?.value | number:'1.2-2' }}</span>
                  </td>
                  <td *ngIf="isEditing">
                    <button type="button" (click)="removeEntry(i)" class="btn-remove">✕</button>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="2" class="total-label">Total</td>
                  <td class="total-amount">₹ {{ totalDebit | number:'1.2-2' }}</td>
                  <td class="total-amount">₹ {{ totalCredit | number:'1.2-2' }}</td>
                  <td *ngIf="isEditing"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="add-row-action" *ngIf="isEditing">
             <button type="button" (click)="addEntry()" class="btn-add-row">+ Add Row</button>
          </div>

          <!-- Remarks -->
          <div class="remarks-section">
            <label>Remarks</label>
            <textarea formControlName="remarks" rows="2"></textarea>
          </div>

          <!-- Metadata Footer -->
          <div class="metadata-grid">
            <div class="field-item">
              <label>Created By</label>
              <input type="text" formControlName="createdBy" readonly />
            </div>
            <div class="field-item">
              <label>Updated By</label>
              <input type="text" formControlName="updatedBy" readonly />
            </div>
          </div>

          <!-- Action Bar -->
          <div class="register-footer-actions">
            <button type="button" (click)="onAddNew()" class="btn btn-footer" *ngIf="!isEditing">Add</button>
            <button type="button" (click)="onAdd()" class="btn btn-footer btn-primary" *ngIf="isEditing" [disabled]="receiptForm.invalid">
              {{ selectedReceiptId ? 'Update' : 'Save' }}
            </button>
            <button type="button" (click)="onEdit()" class="btn btn-footer" [disabled]="!selectedReceiptId" *ngIf="!isEditing">Edit</button>
            <button type="button" (click)="onCancel()" class="btn btn-footer" *ngIf="isEditing">Cancel</button>
            <button type="button" (click)="onPrint()" class="btn btn-footer" [disabled]="!selectedReceiptId">Print</button>
          </div>
        </form>
      </div>

      <!-- Search Results popover -->
      <div class="results-popover" *ngIf="searchResults.length > 0">
         <div class="popover-header">
           <span>Results Found ({{ searchResults.length }})</span>
           <button (click)="searchResults = []">✕</button>
         </div>
         <div class="popover-body">
           <div *ngFor="let res of searchResults" (click)="selectResult(res)" class="result-item">
             #{{ res.receiptNumber }} - {{ res.amount }}
           </div>
         </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Poppins', 'Inter', sans-serif;
      background: var(--bg-color, #f8f9fc);
      min-height: 100%;
      color: var(--text-color, #1e293b);
      font-size: 0.88rem;
    }

    .receipts-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 24px;
    }

    .register-card {
      margin-top: 5px;
      padding: 0 !important;
      overflow: hidden;
      border: 1px solid var(--primary-color, #7c3aed);
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }

    .register-header {
      background: var(--primary-color, #7c3aed);
      color: white;
      padding: 8px 15px;
      border-radius: 0;
      h3 { font-size: 1rem; margin: 0; color: white; font-weight: 600; }
    }

    .register-body {
      padding: 15px;
    }

    .search-row-layout {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 15px;
      flex-wrap: wrap;

      .label { font-weight: 600; font-size: 0.9rem; color: var(--primary-color); }
      .sub-label { font-size: 0.85rem; color: #64748b; }
      .search-input {
        width: 180px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        outline: none;
        &:focus { border-color: var(--primary-color); }
      }
      .btn-search {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 4px 12px;
        font-size: 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        &:hover { background: #e2e8f0; }
      }
      .nav-arrows {
        display: flex;
        gap: 2px;
        margin-left: auto;
        button {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          &:hover:not(:disabled) { background: #e2e8f0; }
          &:disabled { opacity: 0.5; cursor: not-allowed; }
        }
      }
    }

    .fields-grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 30px;
      margin-bottom: 20px;

      .field-item {
        display: flex;
        align-items: center;
        label {
          width: 160px;
          font-size: 0.85rem;
          color: #475569;
          margin: 0;
          font-weight: 500;
        }
        input, select {
          flex: 1;
          height: 30px;
          padding: 0 8px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.85rem;
          outline: none;
          &:focus { border-color: var(--primary-color); }
          &:read-only { background: #f8fafc; color: #64748b; }
        }
      }
    }

    .legacy-style {
      .entries-table {
        border-collapse: collapse;
        width: 100%;
        border: 1px solid #e2e8f0;
        th {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          text-align: left;
          padding: 6px 10px;
          font-size: 0.8rem;
        }
        td {
          border: 1px solid #e2e8f0;
          padding: 0;
        }
        .row-label {
          padding-left: 10px;
          font-weight: 500;
          color: #64748b;
          background: #f8fafc;
          width: 40px;
        }
        .inline-input {
          width: 100%;
          border: none;
          padding: 6px 10px;
          font-size: 0.85rem;
          outline: none;
          background: transparent;
          &.amount { text-align: right; font-family: monospace; }
        }
        .total-row {
          background: #f8fafc;
          .total-label {
            padding: 6px 10px;
            font-weight: 600;
            text-align: right;
          }
          .total-amount {
            font-weight: 700;
            color: var(--primary-color);
            padding: 6px 10px;
            text-align: right;
            border-left: 1px solid #e2e8f0;
          }
        }
      }
    }

    .add-row-action {
       padding: 8px 0;
       .btn-add-row {
          background: none;
          border: 1px dashed #cbd5e1;
          color: var(--primary-color);
          padding: 4px 12px;
          font-size: 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          &:hover { background: #f1f5f9; }
       }
    }

    .remarks-section {
      margin-top: 15px;
      label { display: block; font-size: 0.85rem; margin-bottom: 4px; color: #475569; font-weight: 500; }
      textarea {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 8px;
        font-size: 0.85rem;
        background: #f8fafc;
        resize: vertical;
        outline: none;
        &:focus { border-color: var(--primary-color); }
      }
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #f1f5f9;
      .field-item {
        display: flex;
        align-items: center;
        label { width: 100px; font-size: 0.8rem; color: #94a3b8; }
        input { flex: 1; background: none; border: none; font-size: 0.8rem; color: #94a3b8; outline: none; }
      }
    }

    .register-footer-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;

      .btn-footer {
        min-width: 110px;
        height: 34px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        &:hover:not(:disabled) { background: #e2e8f0; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &.btn-primary {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          &:hover:not(:disabled) { opacity: 0.9; }
        }
      }
    }

    .results-popover {
      position: fixed;
      top: 180px;
      left: 50%;
      transform: translateX(-50%);
      width: 320px;
      background: white;
      border: 1px solid var(--primary-color);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
      z-index: 100;
      border-radius: 8px;
      overflow: hidden;
      animation: slideUp 0.2s ease-out;

      .popover-header {
        background: var(--primary-color);
        color: white;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        font-weight: 600;
        button { background: none; border: none; color: white; cursor: pointer; font-size: 1rem; }
      }
      .popover-body {
        max-height: 250px;
        overflow-y: auto;
        .result-item {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
          &:hover { background: #f8fafc; color: var(--primary-color); }
          &:last-child { border-bottom: none; }
        }
      }
    }

    .display-amount {
      display: block;
      text-align: right;
      padding: 4px 8px;
      font-weight: 500;
      color: #2b3674;
      min-width: 80px;
    }

    .display-text {
      display: block;
      padding: 4px 8px;
      color: #2b3674;
    }

    .amount { text-align: right; }
  `]
})
export class ReceiptsComponent implements OnInit {
  searchForm!: FormGroup;
  receiptForm!: FormGroup;

  isEditing = true;
  selectedReceiptId: string | null = null;

  totalDebit = 0;
  totalCredit = 0;

  get canNav(): boolean {
    return !!this.receiptForm?.get('receiptNumber')?.value;
  }

  financialYearsData: any[] = [];
  searchResults: CashbookSearchResult[] = [];
  isLoading = false;

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private adminService = inject(AdminService);

  receiptSearchControl = this.fb.control('');

  groups: any[] = [];

  constructor() {}

  ngOnInit() {
    this.initForms();
    this.loadMasterData();
    this.loadDefaultRecord();
  }

  loadDefaultRecord() {
    this.isLoading = true;
    this.apiService.get<CashbookSearchResult[]>('Payment/cashbooksearch').subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data && data.length > 0) {
          this.selectResult(data[0]);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadMasterData() {
    this.adminService.getFinancialYears().subscribe({
      next: (data: any) => {
        const raw = Array.isArray(data) ? data : (data?.result?.years || data?.result || data?.years || []);
        this.financialYearsData = raw.map((y: any) => ({
          id: y.years || y.FinYearrId || y.finYearrId || y.Id || y.id || y,
          label: y.years || y.FinancialYear || y.financialYear || 'Year'
        }));
      },
      error: () => this.buildFinancialYears()
    });

    this.adminService.getGroups().subscribe({
      next: (data: any) => {
        const raw = Array.isArray(data) ? data : (data?.result || data?.data || []);
        this.groups = raw.map((g: any) => ({
          id: g.account || g.Id || g.id || g.Name || g.GroupName || g,
          label: g.account || g.Name || g.name || g.GroupName || 'Group'
        }));
      }
    });
  }

  buildFinancialYears() {
    this.financialYearsData = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 1; y >= 2015; y--) {
      const yearStr = `${y - 1}-${y}`;
      this.financialYearsData.push({ id: yearStr, label: yearStr });
    }
  }

  initForms() {
    const today = new Date().toISOString().split('T')[0];

    this.receiptForm = this.fb.group({
      date: [today, Validators.required],
      receiptNumber: [{ value: '', disabled: true }],
      financialYear: ['', Validators.required],
      group: ['KMC Cash book'],
      groupReceiptNumber: [''],
      entries: this.fb.array([this.createEntry(), this.createEntry()]),
      remarks: [''],
      createdBy: [{ value: 'Admin', disabled: true }],
      updatedBy: [{ value: '', disabled: true }]
    });

    this.recalculate();
  }

  createEntry(): FormGroup {
    return this.fb.group({
      particulars: [''],
      ledgerHead: [''],
      debit: [0],
      credit: [0]
    });
  }

  get entries(): FormArray {
    return this.receiptForm.get('entries') as FormArray;
  }

  addEntry() {
    this.entries.push(this.createEntry());
  }

  removeEntry(index: number) {
    if (this.entries.length > 1) {
      this.entries.removeAt(index);
      this.recalculate();
    }
  }

  recalculate() {
    this.totalDebit = this.entries.controls.reduce((sum, ctrl) => {
      return sum + (parseFloat(ctrl.get('debit')?.value) || 0);
    }, 0);
    this.totalCredit = this.entries.controls.reduce((sum, ctrl) => {
      return sum + (parseFloat(ctrl.get('credit')?.value) || 0);
    }, 0);
  }

  onSearch(num?: string) {
    const receiptNumber = num || this.receiptSearchControl.value;
    const financialYear = this.receiptForm?.get('financialYear')?.value;

    let params = new HttpParams();
    if (receiptNumber) params = params.set('receiptNumber', receiptNumber);
    if (financialYear) params = params.set('financialYear', financialYear);

    this.isLoading = true;
    this.apiService.get<CashbookSearchResult[]>('Payment/cashbooksearch', params).subscribe({
      next: (data: CashbookSearchResult[]) => {
        this.searchResults = data || [];
        this.isLoading = false;
        if (this.searchResults.length === 1) {
          this.selectResult(this.searchResults[0]);
          this.searchResults = [];
        } else if (this.searchResults.length === 0) {
          alert('No records found');
        } else {
          // Multiple results logic can be added here
        }
      },
      error: (err: any) => {
        console.error('Search Error:', err);
        this.isLoading = false;
        alert('Error fetching data');
      }
    });
  }

  onFirst() {
    this.onSearch('first');
  }

  onPrev() {
    const current = this.receiptForm.get('receiptNumber')?.value;
    if (current) {
      const num = parseInt(current, 10);
      if (!isNaN(num)) {
        const prev = (num - 1).toString().padStart(current.length, '0');
        this.onSearch(prev);
      }
    }
  }

  onNext() {
    const current = this.receiptForm.get('receiptNumber')?.value;
    if (current) {
      const num = parseInt(current, 10);
      if (!isNaN(num)) {
        const next = (num + 1).toString().padStart(current.length, '0');
        this.onSearch(next);
      }
    }
  }

  onLast() {
    this.onSearch('last');
  }

  selectResult(res: CashbookSearchResult) {
    this.isEditing = false;
    this.selectedReceiptId = res.receiptNumber;
    
    const receiptDate = res.receiptDate ? res.receiptDate.split('T')[0] : '';
    
    this.receiptForm.patchValue({
      date: receiptDate,
      receiptNumber: res.receiptNumber,
      financialYear: res.financialYear || (this.financialYearsData[0]?.id || ''),
      group: res.type === 'Off line' ? 'KMC Cash book' : 'general',
      groupReceiptNumber: res.receiptNumber,
      remarks: res.remarks,
      createdBy: res.createdBy,
      updatedBy: res.updatedBy || '',
    });

    // Clear existing entries
    while (this.entries.length) {
      this.entries.removeAt(0);
    }

    // Row 1: Credit (Revenue/Income)
    this.entries.push(this.fb.group({
      particulars: [res.ledgerDescription || res.feeItemName],
      ledgerHead: [''],
      debit: [0],
      credit: [parseFloat(res.amount) || 0]
    }));

    // Row 2: Debit (Bank/Cash)
    const bankDisplay = res.bank ? `By Bank (${res.bank})` : 'By Cash';
    this.entries.push(this.fb.group({
      particulars: [bankDisplay],
      ledgerHead: [res.bank ? 'bank' : 'cash'],
      debit: [parseFloat(res.amount) || 0],
      credit: [0]
    }));

    this.recalculate();
    this.receiptForm.disable();
    // Scroll to details
    document.querySelector('.transaction-details-anchor')?.scrollIntoView({ behavior: 'smooth' });
  }

  onAddNew() {
    this.selectedReceiptId = null;
    this.isEditing = true;
    this.initForms();
    this.receiptForm.enable();
    this.receiptForm.get('receiptNumber')?.disable(); // Auto-generated
  }

  onClear() {
    this.receiptSearchControl.reset();
    this.searchResults = [];
    this.initForms();
  }

  onAdd() {
    this.recalculate();
    if (this.receiptForm.valid) {
      console.log('Save Receipt:', this.receiptForm.getRawValue());
      alert('Receipt saved successfully!');
      this.isEditing = false;
      this.receiptForm.disable();
    }
  }

  onEdit() {
    this.isEditing = true;
    this.receiptForm.enable();
    this.receiptForm.get('receiptNumber')?.disable(); // Keep receipt number disabled unless manual override
  }

  onCancel() {
    if (this.selectedReceiptId) {
      // Re-load if we were editing an existing record
      const original = this.searchResults.find(r => r.receiptNumber === this.selectedReceiptId);
      if (original) {
        this.selectResult(original);
      } else {
        this.isEditing = false;
        this.receiptForm.disable();
      }
    } else {
      this.isEditing = true; // Stay in "new" mode but reset
      this.initForms();
    }
  }

  onPrint() {
    window.print();
  }
}
