import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="receipts-container">

      <!-- Quick Search Panel -->
      <div class="section-card search-card">
        <div class="section-header">
          <span class="section-icon">🔍</span>
          <h3>Quick Search</h3>
        </div>
        <form [formGroup]="searchForm" class="search-grid">
          <div class="form-field">
            <label>Receipt Number</label>
            <input type="text" formControlName="receiptNumber" placeholder="Enter receipt no." />
          </div>
          <div class="form-field">
            <label>Financial Year</label>
            <select formControlName="financialYear">
              <option value="">Select Year</option>
              <option *ngFor="let yr of financialYears" [value]="yr">{{ yr }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>Select Group</label>
            <select formControlName="group">
              <option value="">Select Group</option>
              <option value="general">General</option>
              <option value="registration">Registration</option>
              <option value="renewal">Renewal</option>
              <option value="penalty">Penalty</option>
            </select>
          </div>
          <div class="search-actions">
            <button type="button" (click)="onSearch()" class="btn btn-primary">
              <span>🔍</span> Search
            </button>
            <button type="button" (click)="onClear()" class="btn btn-outline">
              <span>↺</span> Clear
            </button>
          </div>
        </form>
      </div>

      <!-- Transaction Details -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">📋</span>
          <h3>Transaction Details</h3>
          <div class="header-badge">{{ receiptForm.get('receiptNumber')?.value || 'New Receipt' }}</div>
        </div>

        <form [formGroup]="receiptForm">
          <!-- Top Meta Row -->
          <div class="meta-row">
            <div class="form-field">
              <label>Date</label>
              <input type="date" formControlName="date" />
            </div>
            <div class="form-field">
              <label>Receipt Number</label>
              <input type="text" formControlName="receiptNumber" placeholder="Auto-generated" [readonly]="!isEditing" />
            </div>
            <div class="form-field">
              <label>Financial Year</label>
              <select formControlName="financialYear">
                <option value="">Select Year</option>
                <option *ngFor="let yr of financialYears" [value]="yr">{{ yr }}</option>
              </select>
            </div>
          </div>

          <!-- Ledger Entries Table -->
          <div class="entries-table-wrapper">
            <table class="entries-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Particulars (By / To)</th>
                  <th>Ledger Head</th>
                  <th>Debit (₹)</th>
                  <th>Credit (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody formArrayName="entries">
                <tr *ngFor="let entry of entries.controls; let i = index" [formGroupName]="i" class="entry-row">
                  <td class="row-num">{{ i + 1 }}</td>
                  <td>
                    <input type="text" formControlName="particulars" placeholder="By / To ..." class="inline-input" />
                  </td>
                  <td>
                    <select formControlName="ledgerHead" class="inline-select">
                      <option value="">Select Head</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="registration_fee">Registration Fee</option>
                      <option value="renewal_fee">Renewal Fee</option>
                      <option value="penalty">Penalty</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" formControlName="debit" placeholder="0.00"
                      class="inline-input amount-input"
                      (input)="recalculate()" />
                  </td>
                  <td>
                    <input type="number" formControlName="credit" placeholder="0.00"
                      class="inline-input amount-input"
                      (input)="recalculate()" />
                  </td>
                  <td>
                    <button type="button" (click)="removeEntry(i)" class="btn-remove" title="Remove row">✕</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="3" class="totals-label">Totals</td>
                  <td class="total-amount debit-total">₹ {{ totalDebit | number:'1.2-2' }}</td>
                  <td class="total-amount credit-total">₹ {{ totalCredit | number:'1.2-2' }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="add-row-area">
            <button type="button" (click)="addEntry()" class="btn btn-add-row">
              <span>+</span> Add Entry Row
            </button>
            <span *ngIf="totalDebit !== totalCredit" class="balance-alert">
              ⚠ Debit and Credit are not balanced (Difference: ₹ {{ (totalDebit - totalCredit) | number:'1.2-2' }})
            </span>
            <span *ngIf="totalDebit === totalCredit && totalDebit > 0" class="balance-ok">
              ✓ Balanced
            </span>
          </div>

          <!-- Remarks -->
          <div class="remarks-row">
            <div class="form-field full-width">
              <label>Remarks</label>
              <textarea formControlName="remarks" rows="3" placeholder="Enter any additional remarks or narration..."></textarea>
            </div>
          </div>

          <!-- Metadata Row -->
          <div class="meta-row metadata-strip">
            <div class="form-field">
              <label>Created By</label>
              <input type="text" formControlName="createdBy" [readonly]="true" />
            </div>
            <div class="form-field">
              <label>Created On</label>
              <input type="text" formControlName="createdOn" [readonly]="true" />
            </div>
            <div class="form-field">
              <label>Updated By</label>
              <input type="text" formControlName="updatedBy" [readonly]="true" />
            </div>
            <div class="form-field">
              <label>Updated On</label>
              <input type="text" formControlName="updatedOn" [readonly]="true" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-bar">
            <button type="button" (click)="onAdd()" class="btn btn-action btn-add" [disabled]="receiptForm.invalid">
              <span class="btn-icon">➕</span> Add
            </button>
            <button type="button" (click)="onEdit()" class="btn btn-action btn-edit" [disabled]="!selectedReceiptId">
              <span class="btn-icon">✏️</span> Edit
            </button>
            <button type="button" (click)="onCancel()" class="btn btn-action btn-cancel">
              <span class="btn-icon">✕</span> Cancel
            </button>
            <button type="button" (click)="onPrint()" class="btn btn-action btn-print" [disabled]="!selectedReceiptId">
              <span class="btn-icon">🖨️</span> Print
            </button>
          </div>
        </form>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Poppins', sans-serif;
    }

    .receipts-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ---- Section Cards ---- */
    .section-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 16px rgba(112, 144, 176, 0.12);
      border: 1px solid #eef2fa;
      transition: box-shadow 0.3s ease;
      &:hover { box-shadow: 0 4px 24px rgba(112, 144, 176, 0.18); }
    }

    .search-card {
      background: linear-gradient(135deg, #f8f9ff 0%, #eef2fa 100%);
      border: 1px solid #e0e8ff;
    }

    /* ---- Section Header ---- */
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #2b3674;
        letter-spacing: 0.3px;
      }
    }

    .section-icon {
      font-size: 1.1rem;
    }

    .header-badge {
      margin-left: auto;
      background: linear-gradient(135deg, #6b46c1, #4299e1);
      color: white;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* ---- Grids ---- */
    .search-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr) auto;
      gap: 16px;
      align-items: end;
    }

    .meta-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .remarks-row {
      margin-bottom: 20px;
    }

    .metadata-strip {
      padding: 16px;
      background: #f8f9ff;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    /* ---- Form Fields ---- */
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7a99;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      input, select, textarea {
        padding: 10px 14px;
        border: 1.5px solid #e0e8ff;
        border-radius: 10px;
        font-size: 0.9rem;
        color: #2b3674;
        background: white;
        font-family: inherit;
        transition: all 0.2s ease;
        outline: none;
        &:focus {
          border-color: #6b46c1;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.12);
        }
        &[readonly] {
          background: #f4f7fe;
          color: #a3aed0;
          cursor: default;
        }
      }

      textarea { resize: vertical; }

      &.full-width { grid-column: 1 / -1; }
    }

    /* ---- Search Actions ---- */
    .search-actions {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    /* ---- Entries Table ---- */
    .entries-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e0e8ff;
      margin-bottom: 12px;
    }

    .entries-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;

      thead tr {
        background: linear-gradient(135deg, #6b46c1 0%, #4299e1 100%);
        color: white;
        th {
          padding: 12px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.4px;
          white-space: nowrap;
          &:first-child { border-radius: 12px 0 0 0; }
          &:last-child { border-radius: 0 12px 0 0; }
        }
      }

      tbody {
        .entry-row {
          border-bottom: 1px solid #f0f4ff;
          transition: background 0.15s ease;
          &:hover { background: #f8f9ff; }
          &:last-child { border-bottom: none; }

          td {
            padding: 8px 10px;
            vertical-align: middle;
            &.row-num {
              color: #a3aed0;
              font-weight: 600;
              text-align: center;
              width: 40px;
            }
          }
        }
      }

      tfoot .totals-row {
        background: #f4f7fe;
        border-top: 2px solid #e0e8ff;
        td { padding: 12px 14px; font-weight: 700; }
        .totals-label { color: #2b3674; }
        .total-amount { font-size: 1rem; }
        .debit-total { color: #d32f2f; }
        .credit-total { color: #05cd99; }
      }
    }

    .inline-input, .inline-select {
      width: 100%;
      padding: 8px 10px;
      border: 1.5px solid #e0e8ff;
      border-radius: 8px;
      font-size: 0.88rem;
      color: #2b3674;
      background: white;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
      &:focus { border-color: #6b46c1; }
      &.amount-input { text-align: right; }
    }

    /* ---- Add Row Area ---- */
    .add-row-area {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .balance-alert {
      font-size: 0.83rem;
      color: #e65100;
      font-weight: 600;
      background: #fff3e0;
      padding: 6px 12px;
      border-radius: 8px;
    }

    .balance-ok {
      font-size: 0.83rem;
      color: #05cd99;
      font-weight: 600;
      background: #e8faf5;
      padding: 6px 12px;
      border-radius: 8px;
    }

    /* ---- Buttons ---- */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.88rem;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #6b46c1, #4299e1);
      color: white;
      box-shadow: 0 4px 14px rgba(107, 70, 193, 0.3);
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(107, 70, 193, 0.4);
      }
      &:active:not(:disabled) { transform: translateY(0); }
    }

    .btn-outline {
      background: white;
      color: #6b46c1;
      border: 1.5px solid #6b46c1;
      &:hover:not(:disabled) {
        background: rgba(107, 70, 193, 0.06);
        transform: translateY(-1px);
      }
    }

    .btn-add-row {
      background: #eef2ff;
      color: #6b46c1;
      border: 1.5px dashed #a78bfa;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      font-size: 0.88rem;
      transition: all 0.2s;
      &:hover {
        background: #e0e7ff;
        border-style: solid;
      }
    }

    .btn-remove {
      background: none;
      border: none;
      color: #a3aed0;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
      &:hover { background: #fee2e2; color: #d32f2f; }
    }

    /* ---- Action Bar ---- */
    .action-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 8px;
      border-top: 1px solid #eef2fa;

      .btn-action {
        padding: 11px 26px;
        border-radius: 12px;
        font-size: 0.92rem;
        .btn-icon { font-size: 1rem; }
      }
    }

    .btn-add {
      background: linear-gradient(135deg, #6b46c1 0%, #4299e1 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(107, 70, 193, 0.3);
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(107, 70, 193, 0.45);
      }
    }

    .btn-edit {
      background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(237, 137, 54, 0.3);
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(237, 137, 54, 0.4);
      }
    }

    .btn-cancel {
      background: white;
      color: #6b7a99;
      border: 1.5px solid #e0e8ff;
      &:hover:not(:disabled) {
        background: #fee2e2;
        color: #d32f2f;
        border-color: #fca5a5;
        transform: translateY(-1px);
      }
    }

    .btn-print {
      background: linear-gradient(135deg, #05cd99 0%, #0077b6 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(5, 205, 153, 0.3);
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 205, 153, 0.4);
      }
    }
  `]
})
export class ReceiptsComponent implements OnInit {
  searchForm!: FormGroup;
  receiptForm!: FormGroup;

  isEditing = false;
  selectedReceiptId: string | null = null;

  totalDebit = 0;
  totalCredit = 0;

  financialYears: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFinancialYears();
    this.initForms();
  }

  buildFinancialYears() {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 1; y >= 2015; y--) {
      this.financialYears.push(`${y - 1}-${y}`);
    }
  }

  initForms() {
    const today = new Date().toISOString().split('T')[0];

    this.searchForm = this.fb.group({
      receiptNumber: [''],
      financialYear: [''],
      group: ['']
    });

    this.receiptForm = this.fb.group({
      date: [today, Validators.required],
      receiptNumber: [{ value: '', disabled: true }],
      financialYear: ['', Validators.required],
      entries: this.fb.array([this.createEntry(), this.createEntry()]),
      remarks: [''],
      createdBy: [{ value: 'Admin', disabled: true }],
      createdOn: [{ value: today, disabled: true }],
      updatedBy: [{ value: '', disabled: true }],
      updatedOn: [{ value: '', disabled: true }]
    });

    this.recalculate();
  }

  createEntry(): FormGroup {
    return this.fb.group({
      particulars: [''],
      ledgerHead: [''],
      debit: [null],
      credit: [null]
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

  onSearch() {
    console.log('Search:', this.searchForm.value);
  }

  onClear() {
    this.searchForm.reset();
  }

  onAdd() {
    this.recalculate();
    if (this.receiptForm.valid) {
      console.log('Add Receipt:', this.receiptForm.getRawValue());
      alert('Receipt saved successfully!');
    }
  }

  onEdit() {
    this.isEditing = true;
    this.receiptForm.get('receiptNumber')?.enable();
  }

  onCancel() {
    this.isEditing = false;
    this.selectedReceiptId = null;
    this.receiptForm.get('receiptNumber')?.disable();
    this.initForms();
  }

  onPrint() {
    window.print();
  }
}
