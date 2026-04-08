import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin/services/admin.service';
import { CouncilMasterService } from '../../../admin/pages/configuration/pages/council-master.service';
import { HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="tab-nav">
          <button 
            *ngFor="let tab of tabs" 
            (click)="setActiveTab(tab.id)"
            [class.active]="activeTab() === tab.id"
            class="tab-btn"
          >
            <span class="icon">{{ tab.icon }}</span>
            <span class="label">{{ tab.label }}</span>
          </button>
        </div>
      </header>

      <main class="dashboard-content">
        <!-- Welcome Tab -->
        <div *ngIf="activeTab() === 'welcome'">
          <div class="welcome-banner">
            <div class="text">
                <h1>Hello, {{ auth.currentUser()?.username }}!</h1>
                <p>Welcome back to your GMC Portal. Here's a quick overview of your status.</p>
                <button class="cta-btn" (click)="setActiveTab('profile')">View My Profile</button>
            </div>
            <div class="illustration">
                <img *ngIf="practitionerData()?.photo" [src]="practitionerData().photo" alt="Profile" class="profile-img">
                <span *ngIf="!practitionerData()?.photo">🚀</span>
            </div>
          </div>

          <div class="content-grid">
             <div class="card nav-card" (click)="setActiveTab('profile')">
                <div class="icon">👤</div>
                <h3>My Profile</h3>
                <p>View and update your professional details</p>
             </div>
             <div class="card nav-card" (click)="setActiveTab('receipts')">
                <div class="icon">🧾</div>
                <h3>My Receipts</h3>
                <p>View and download your payment receipts</p>
             </div>
          </div>
        </div>

        <!-- My Profile Tab -->
        <div *ngIf="activeTab() === 'profile'">
          <div *ngIf="isLoading()" class="loading-state">
             Loading profile data...
          </div>
          <div *ngIf="error()" class="error-msg">
             {{ error() }}
          </div>

          <div class="profile-layout" *ngIf="practitionerData()">
             <div class="profile-nav">
               <button 
                 *ngFor="let pTab of profileTabs" 
                 (click)="setProfileSubTab(pTab.id)"
                 [class.active]="activeProfileSubTab() === pTab.id"
                 class="p-tab-btn"
               >
                 {{ pTab.label }}
               </button>
             </div>

             <div class="profile-card">
                <!-- Personal Info Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'personal'">
                  <div class="card-header">
                    <h3>Personal Information</h3>
                  </div>

                  <div class="details-grid">
                    <div class="detail-item" *ngFor="let item of getFilteredPersonalData()">
                       <span class="label">{{ item.label }}:</span>
                       <span class="value" [class.status-badge]="item.label === 'Vote' || item.label === 'Status'" [class.active]="(item.label === 'Vote' || item.label === 'Status') && (item.value === 'Active' || item.value === '1')">
                         {{ item.value }}
                       </span>
                    </div>
                  </div>

                </div>


                <!-- Contact Info Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'contact'">
                  <div class="card-header">
                    <h3>Contact Information</h3>
                  </div>
                  
                  <div>
                    <div class="address-section" *ngIf="resAddress()">
                      <h4 class="section-title">Residential Address</h4>
                      <div class="details-grid">
                        <div class="detail-item" *ngFor="let item of getFilteredAddressData('R')">
                          <span class="label">{{ item.label }}:</span>
                          <span class="value">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="address-section" *ngIf="profAddress()" style="margin-top: $spacing-xl;">
                      <h4 class="section-title">Professional Address</h4>
                      <div class="details-grid">
                        <div class="detail-item" *ngFor="let item of getFilteredAddressData('P')">
                          <span class="label">{{ item.label }}:</span>
                          <span class="value">{{ item.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div *ngIf="!resAddress() && !profAddress()" class="loading-state">
                    Loading contact information...
                  </div>
                </div>


                <div *ngIf="activeProfileSubTab() === 'educational'">
                  <div class="card-header">
                    <h3>Educational Information</h3>
                  </div>

                  <div class="records-container" *ngIf="educationalInfo().length > 0">
                    <div class="education-grid-item" *ngFor="let edu of educationalInfo()">
                      <div class="content-header">
                        <i class="fas fa-graduation-cap"></i>
                        <h4>{{ edu.educationName || 'Educational Record' }}</h4>
                      </div>
                      
                      <div class="details-grid">
                        <div class="detail-item">
                           <span class="label">Degree:</span>
                           <span class="value">{{ edu.educationName || '-' }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">Course Name:</span>
                           <span class="value">{{ edu.courseName || '-' }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">Passing:</span>
                           <span class="value">{{ edu.convertedDate }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">University:</span>
                           <span class="value">{{ edu.universityName || '-' }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">College:</span>
                           <span class="value">{{ edu.colName || '-' }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">Certificate No:</span>
                           <span class="value">{{ edu.certificateNo || '-' }}</span>
                        </div>
                        <div class="detail-item">
                           <span class="label">Certificate Issued Date:</span>
                           <span class="value">{{ edu.certificateDate | date:'dd MMM yyyy' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="educationalInfo().length === 0" class="no-records-card">
                    <i class="fas fa-graduation-cap"></i>
                    <p>No educational records found.</p>
                  </div>
                </div>

                <!-- Documents Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'documents'">
                  <div class="card-header">
                    <h3>My Documents</h3>
                  </div>

                  <div class="document-groups" *ngIf="documentList().length > 0">
                    <div class="document-group" *ngFor="let group of documentList()" style="margin-bottom: 25px;">
                      <div class="group-header" style="background: rgba(0, 119, 182, 0.05); padding: 10px 15px; border-left: 4px solid #0077B6; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
                        <h4 style="margin: 0; color: #333; font-weight: 700; font-size: 1rem;">{{ group.documentName }}</h4>
                      </div>

                      <div class="table-responsive">
                         <table class="data-table">
                            <thead>
                              <tr>
                                <th>Document Name</th>
                                <th class="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr *ngFor="let doc of group.documents">
                                <td>{{ doc.documentType || '-' }}</td>
                                <td class="text-right">
                                  <a [href]="doc.documentUrl" target="_blank" style="color: #0077B6; font-weight: 600; text-decoration: none; font-size: 0.9rem;" *ngIf="doc.documentUrl">
                                    View
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                         </table>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="documentList().length === 0" class="no-records-card">
                    <i class="fas fa-file-alt"></i>
                    <p>No documents found.</p>
                  </div>
                </div>

                <!-- Payments Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'payments'">
                  <div class="card-header">
                    <h3>Make a Payment</h3>
                  </div>

                  <div class="payment-form">
                    <div class="form-group">
                      <label for="paymentFor">Payment For</label>
                      <select id="paymentFor" class="form-control" (change)="onLedgerChange($event)" [value]="selectedLedger()?.ledgerID || ''">
                        <option value="">Select Payment Type</option>
                        <option *ngFor="let ledger of ledgers()" [value]="ledger.ledgerID">
                          {{ ledger.ledgerName }}
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="amount">Amount (INR)</label>
                      <input type="number" id="amount" class="form-control" [value]="paymentAmount()" readonly>
                    </div>

                    <!-- Selected Council Display -->
                    <div class="form-group selection-group" *ngIf="isNocSelected() && selectedNocCouncilId() && selectedNocCouncilId() !== 'null'" (click)="showCouncilModal.set(true)">
                      <label>Selected Council <span class="edit-link">(Click to Change)</span></label>
                      <div class="selection-card">
                        <div class="selection-icon">🏛️</div>
                        <div class="selection-details">
                          <span class="selection-name">{{ selectedCouncilName() }}</span>
                          <span class="selection-address">{{ selectedCouncilAddress() }}</span>
                        </div>
                        <div class="selection-edit">
                          <i class="fas fa-edit"></i>
                        </div>
                      </div>
                    </div>

                    <div class="form-actions">
                      <button 
                        class="pay-btn" 
                        [disabled]="!selectedLedger() || isProcessingPayment() || (isNocSelected() && (!selectedNocCouncilId() || selectedNocCouncilId() === 'null'))"
                        (click)="initiateRazorpayPayment()">
                        {{ isProcessingPayment() ? 'Processing...' : 'Proceed to Pay' }}
                      </button>
                    </div>

                     <div *ngIf="paymentStatus()" [class]="'payment-alert ' + (paymentStatus()?.success ? 'success' : 'error')">
                      {{ paymentStatus()?.message }}
                    </div>
                  </div>
                </div>

                <!-- NOC Council Selection Modal -->
                <div class="modal-overlay" *ngIf="showCouncilModal()">
                  <div class="modal-content council-modal">
                    <div class="modal-header">
                      <h3>Select Council</h3>
                      <button class="close-btn" (click)="closeCouncilModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                      <p>For NOC applications, please select the Council you are applying to:</p>
                      <div class="form-group">
                        <label for="nocCouncil">Recipient Council<span class="required">*</span></label>
                        <select id="nocCouncil" class="form-control" (change)="selectedNocCouncilId.set($any($event.target).value)">
                          <option [value]="null">Select Council</option>
                          <option *ngFor="let council of councilsList()" [value]="council.councilId" [selected]="selectedNocCouncilId() === council.councilId">
                            {{ council.councilName }} ({{ council.shortCode }})
                          </option>
                        </select>
                      </div>
                      <div class="form-group" style="margin-top: 15px;" *ngIf="selectedNocCouncilId() && selectedNocCouncilId() !== 'null'">
                        <label>Council Address</label>
                        <textarea 
                          class="form-control" 
                          style="background: rgba(0,0,0,0.05); cursor: default; height: 70px; resize: none; font-size: 0.9em;" 
                          [value]="selectedCouncilAddress()" 
                          readonly></textarea>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button class="btn-secondary" (click)="closeCouncilModal()">Cancel</button>
                      <button class="btn-primary" (click)="confirmCouncilSelection()" [disabled]="!selectedNocCouncilId() || selectedNocCouncilId() === 'null'">Confirm Selection</button>
                    </div>
                  </div>
                </div>

                <!-- Add Document Modal -->
                <div class="modal-overlay" *ngIf="isAddingDocument()">
                  <div class="modal-content" [class.scrollable-modal]="dynamicDocuments().length > 3">
                    <div class="modal-header">
                      <h3>Add Document</h3>
                      <button class="close-btn" (click)="toggleAddDocument()">&times;</button>
                    </div>
                    <div class="modal-body">
                      <form [formGroup]="documentForm" class="modern-form">
                        <div class="form-group">
                          <label>Certificate Type <span class="required">*</span></label>
                          <select formControlName="certificateId" class="form-control">
                            <option value="">Select Certificate</option>
                            <option *ngFor="let cert of certificatesData()" [value]="cert.id">{{ cert.name }}</option>
                          </select>
                        </div>

                        <!-- Dynamic Requirements List -->
                        <div class="dynamic-requirements" *ngIf="dynamicDocuments().length > 0" style="margin-top: 20px;">
                          <h4 style="font-size: 0.9rem; color: #666; margin-bottom: 12px; font-weight: 700; text-transform: uppercase;">Required Documents</h4>
                          
                          <div class="requirement-item" *ngFor="let doc of dynamicDocuments()" style="padding: 15px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; margin-bottom: 12px;">
                            <div style="margin-bottom: 8px; font-weight: 600; color: #333;">{{ doc.docdetailes }}</div>
                            <input type="file" (change)="onDynamicFileSelected($event, doc.id)" style="width: 100%; font-size: 0.85rem;">
                            <div *ngIf="selectedDynamicFiles()[doc.id]" style="margin-top: 5px; color: #0077B6; font-size: 0.8rem; font-weight: 600;">
                               Selected: {{ selectedDynamicFiles()[doc.id].name }}
                            </div>
                          </div>
                        </div>

                        <!-- Default File Input (Only if no dynamic documents) -->
                        <div class="form-group" *ngIf="dynamicDocuments().length === 0" style="margin-top: 15px;">
                          <label>File <span class="required">*</span></label>
                          <input type="file" (change)="onDocumentFileSelected($event)" class="form-control">
                          <div class="file-preview" *ngIf="selectedDocFile">
                             Selected: {{ selectedDocFile.name }}
                          </div>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button class="btn-secondary" (click)="toggleAddDocument()">Cancel</button>
                      <button class="btn-primary" [disabled]="documentForm.get('certificateId')?.invalid" (click)="saveDocument()">Upload Documents</button>
                    </div>
                  </div>
                </div>

                <!-- Other Sub-Tabs Placeholders -->
             </div>
          </div>
        </div>


        <!-- Receipts Tab -->
        <div *ngIf="activeTab() === 'receipts'">
          <div *ngIf="receiptsList().length > 0" class="receipts-list">
            <div class="receipt-card" *ngFor="let receipt of receiptsList()">
              <div class="receipt-header">
                <div class="type-badge">
                  <div class="type-main">
                    <span class="type">{{ (receipt.ledgerDescription || receipt.feeItemname || receipt.type) | uppercase }}</span>
                    <span class="mode">({{ (receipt.ledgerDescription ? receipt.type : receipt.mode) || 'Online' }})</span>
                  </div>
                  <div class="sub-actions">
                    <button class="text-action-btn" (click)="generateReceipt(receipt.receiptNo || receipt.receiptNumber)">Receipt</button>
                    <button class="text-action-btn" (click)="printCertificate(receipt)">{{ receipt.displayName }}</button>
                  </div>
                </div>
                <div class="action-links">
                </div>
              </div>

              <div class="receipt-body">
                <div class="details-column">
                  <div class="detail-group">
                    <span class="label">RECEIPT NO</span>
                    <span class="value highlight-orange">{{ receipt.receiptNo || receipt.receiptNumber }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">TRANSACTION NO</span>
                    <span class="value">{{ receipt.transactionNo || '-' }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">CERTIFICATE NO</span>
                    <span class="value">{{ receipt.certificateNo || '-' }}</span>
                  </div>
                </div>

                <div class="details-column">
                  <div class="detail-group">
                    <span class="label">RECEIPT DATE</span>
                    <span class="value">{{ receipt.receiptDate | date:'dd MMM yyyy' }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">TRANSACTION DATE</span>
                    <span class="value">{{ (receipt.transactionDate || receipt.receiptDate) | date:'dd MMM yyyy' }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">CERTIFICATE ISSUED</span>
                    <span class="value">{{ receipt.certificateIssued || '-' }}</span>
                  </div>
                </div>

                <div class="details-column amount-col">
                  <div class="detail-group amount-group">
                    <span class="label">AMOUNT</span>
                    <span class="value amount">₹{{ receipt.amount | number:'1.2-2' }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">BANK</span>
                    <span class="value uppercase">{{ receipt.bank || '-' }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="label">REGISTRATION DATE</span>
                    <span class="value">{{ receipt.councilRegistrationDate || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="receiptsList().length === 0" class="placeholder-content">
            <div class="card">
              <div class="icon-large">🧾</div>
              <h2>No Receipts Found</h2>
              <p>You haven't made any payments yet. Your transaction receipts will appear here.</p>
            </div>
          </div>
        </div>


      </main>
    </div>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    @import '../../../../../styles/mixins';
    
    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: $spacing-md;
    }

    .selection-group {
      margin-top: 15px;
      cursor: pointer;
      
      label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        
        .edit-link {
          font-size: 0.85em;
          color: #0077B6;
          text-decoration: underline;
          opacity: 0.8;
          &:hover { opacity: 1; }
        }
      }
    }

    .selection-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(0, 119, 182, 0.05);
      border: 1px dashed #0077B6;
      border-radius: 8px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(0, 119, 182, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      .selection-icon {
        font-size: 1.5em;
      }
      
      .selection-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .selection-name {
          font-weight: 600;
          color: #333;
        }
        
        .selection-address {
          font-size: 0.85em;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      
      .selection-edit {
        color: #0077B6;
        opacity: 0.6;
      }
    }

    .dashboard-header {
        background: white;
        border-radius: 16px;
        padding: $spacing-xs;
        margin-bottom: $spacing-lg;
        box-shadow: $shadow-sm;
        border: 1px solid rgba(0,0,0,0.05);

        .tab-nav {
            display: flex;
            gap: $spacing-xs;
            overflow-x: auto;
            scrollbar-width: none;
            &::-webkit-scrollbar { display: none; }

            .tab-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: $spacing-sm $spacing-lg;
                border: none;
                background: transparent;
                color: $text-secondary;
                font-weight: 600;
                cursor: pointer;
                border-radius: 12px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;

                .icon { font-size: 1.2rem; }

                &:hover {
                    background: rgba(0, 119, 182, 0.05);
                    color: $primary-color;
                }

                &.active {
                    background: linear-gradient(135deg, $primary-color, $primary-dark);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 119, 182, 0.3);
                }
            }
        }
    }

    .welcome-banner {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        border-radius: 24px;
        padding: $spacing-xl;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-lg;
        box-shadow: $shadow-md;
        position: relative;
        overflow: hidden;
        
        .text {
            z-index: 1;
            h1 { color: white; margin-bottom: $spacing-xs; font-size: 2.5rem; }
            p { opacity: 0.9; margin-bottom: $spacing-md; font-size: 1.1rem; max-width: 600px; }
            
            .cta-btn {
                padding: $spacing-sm $spacing-lg;
                background: white;
                color: $primary-color;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
                
                &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            }
        }
        
        .illustration {
            font-size: 8rem;
            animation: float 3s ease-in-out infinite;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;

            .profile-img {
                width: 140px;
                height: 140px;
                border-radius: 50%;
                object-fit: cover;
                border: 6px solid rgba(255, 255, 255, 0.2);
                box-shadow: $shadow-lg;
            }
        }
        
        &::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        }
    }
    
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }

    .profile-layout {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: $spacing-lg;
        align-items: start;

        @media (max-width: 992px) {
            grid-template-columns: 1fr;
        }

        .profile-nav {
            background: white;
            border-radius: 16px;
            padding: $spacing-sm;
            display: flex;
            flex-direction: column;
            gap: $spacing-xs;
            box-shadow: $shadow-sm;
            border: 1px solid rgba(0,0,0,0.05);

            .p-tab-btn {
                text-align: left;
                padding: $spacing-sm $spacing-md;
                border: none;
                background: transparent;
                color: $text-secondary;
                font-weight: 600;
                cursor: pointer;
                border-radius: 10px;
                transition: all 0.2s;
                font-size: 0.95rem;

                &:hover {
                    background: rgba(0, 119, 182, 0.05);
                    color: $primary-color;
                }

                &.active {
                    background: rgba(0, 119, 182, 0.1);
                    color: $primary-color;
                    box-shadow: inset 4px 0 0 $primary-color;
                }
            }
        }
    }

    .profile-card {
        @include card-base;
        padding: $spacing-xl;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-lg;
            border-bottom: 2px solid $bg-color;
            padding-bottom: $spacing-sm;

            h3 { color: $primary-color; margin: 0; font-size: 1.6rem; }

            .edit-btn {
                background: rgba(0, 119, 182, 0.1);
                color: $primary-color;
                border: none;
                padding: 6px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                &:hover { background: $primary-color; color: white; }
            }
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: $spacing-lg;

            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 6px;

                .label {
                    font-size: 0.8rem;
                    color: $text-secondary;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .value {
                    font-size: 1.1rem;
                    color: $text-color;
                    font-weight: 500;
                    
                    &.status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        background: rgba($error-color, 0.1);
                        color: $error-color;
                        font-size: 0.9rem;
                        font-weight: 600;
                        width: fit-content;
                        
                        &.active {
                            background: rgba($success-color, 0.1);
                            color: $success-color;
                        }
                    }
                }
            }
        }
    }

    .address-section {
        .section-title {
            color: $primary-color;
            font-size: 1.1rem;
            margin: $spacing-md 0 $spacing-sm 0;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(0, 119, 182, 0.1);
            font-weight: 600;
        }
    }

    .education-list {
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
        margin-top: $spacing-md;

        .education-record {
            padding: $spacing-md;
            border: 1px solid rgba(0, 119, 182, 0.1);
            border-radius: 12px;
            background: rgba(0, 119, 182, 0.02);

            .record-title {
                color: $primary-color;
                margin-bottom: $spacing-sm;
                font-weight: 600;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                gap: 8px;

                &::before {
                    content: '\\1f393';
                    font-size: 1.2rem;
                }
            }
        }
    }

    .no-data {
        text-align: center;
        padding: $spacing-xl;
        color: $text-secondary;
        font-style: italic;
    }

    .edit-form-container {
        animation: fadeIn 0.3s ease-out;
    }

    .edit-form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: $spacing-lg;
        margin-bottom: $spacing-xl;

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;

            label {
                font-size: 0.85rem;
                font-weight: 600;
                color: $text-secondary;
            }

            .form-control {
                padding: 10px 14px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
                transition: all 0.2s;

                &:focus {
                    border-color: $primary-color;
                    box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.1);
                    outline: none;
                }
            }
        }
    }

    .form-actions-row {
        display: flex;
        justify-content: flex-end;
        gap: $spacing-md;
        padding-top: $spacing-lg;
        border-top: 1px solid $border-color;

        button {
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .cancel-btn {
            background: #eee;
            color: $text-secondary;
            border: none;
            &:hover { background: #ddd; }
        }

        .save-btn {
            background: $primary-color;
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(0, 119, 182, 0.2);
            
            &:hover:not(:disabled) {
                background: $primary-dark;
                transform: translateY(-1px);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .address-edit-group {
        .section-header-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-sm;

            .section-title { margin: 0; }
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: $primary-color;
            cursor: pointer;
            font-size: 0.9rem;

            input { width: 18px; height: 18px; }
        }
    }

    .payment-form {
        max-width: 500px;
        margin: $spacing-md 0;
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .form-group {
            display: flex;
            flex-direction: column;
            gap: $spacing-xs;

            label {
                font-weight: 600;
                color: $text-color;
                font-size: 0.95rem;
            }

            .form-control {
                padding: 12px;
                border: 1px solid $border-color;
                border-radius: 8px;
                font-size: 1rem;
                color: $text-color;
                background: $white;
                transition: border-color 0.2s;

                &:focus {
                    outline: none;
                    border-color: $primary-color;
                    box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.1);
                }

                &:read-only {
                    background: rgba($bg-color, 0.5);
                    cursor: not-allowed;
                }
            }
        }

        .form-actions {
            margin-top: $spacing-sm;

            .pay-btn {
                width: 100%;
                padding: 14px;
                background: $primary-color;
                color: $white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s;

                &:hover:not(:disabled) {
                    background: $primary-dark;
                    transform: translateY(-2px);
                }

                &:active:not(:disabled) {
                    transform: translateY(0);
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            }
        }
    }

    .payment-alert {
        margin-top: $spacing-md;
        padding: $spacing-sm;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;

        &.success {
            background: rgba($success-color, 0.1);
            color: darken($success-color, 10%);
            border: 1px solid rgba($success-color, 0.2);
        }

        &.error {
            background: rgba($error-color, 0.1);
            color: $error-color;
            border: 1px solid rgba($error-color, 0.2);
        }
    }

    .payment-history-divider {
        display: flex;
        align-items: center;
        margin: $spacing-lg 0;
        color: $text-secondary;
        font-size: 0.9rem;

        &::before, &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: $border-color;
        }

        span {
            padding: 0 $spacing-md;
        }
    }

    .sub-placeholder {
        text-align: center;
        padding: $spacing-xl;
        
        .placeholder-icon { font-size: 3rem; margin-bottom: $spacing-md; opacity: 0.5; }
        h4 { color: $primary-color; margin-bottom: $spacing-xs; font-size: 1.4rem; }
        p { color: $text-secondary; }
    }

    .receipts-list {
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
        margin-top: $spacing-md;
    }

    .receipt-card {
        @include card-base;
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);

        .receipt-header {
            padding: $spacing-md $spacing-lg;
            background: rgba($bg-color, 0.3);
            border-bottom: 1px solid rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: $spacing-md;

            .type-badge {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .type-main {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    
                    .type {
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #d35400;
                        text-transform: uppercase;
                    }
                    .mode {
                        color: $text-secondary;
                        font-size: 0.9rem;
                    }
                }

                .sub-actions {
                    display: flex;
                    gap: $spacing-md;
                    margin-top: 4px;

                    .text-action-btn {
                        background: none;
                        border: none;
                        padding: 0;
                        color: $primary-color;
                        font-weight: 600;
                        font-size: 0.85rem;
                        cursor: pointer;
                        text-decoration: underline;
                        
                        &:hover {
                            color: $primary-dark;
                        }
                    }
                }
            }

            .action-links {
                display: flex;
                gap: $spacing-md;
                flex-wrap: wrap;

                .action-link {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: $primary-color;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    &:hover { text-decoration: underline; opacity: 0.8; }
                    &.highlight { color: #e67e22; }
                }
            }
        }

        .receipt-body {
            padding: $spacing-lg;
            display: grid;
            grid-template-columns: 1fr 1fr 1.2fr;
            gap: $spacing-xl;

            @media (max-width: 768px) {
                grid-template-columns: 1fr;
                gap: $spacing-md;
            }

            .details-column {
                display: flex;
                flex-direction: column;
                gap: $spacing-md;
            }

            .detail-group {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .label {
                    font-size: 0.75rem;
                    color: $text-secondary;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .value {
                    font-size: 1rem;
                    color: $text-color;
                    font-weight: 600;

                    &.highlight-orange { color: #e67e22; }
                    &.amount {
                        font-size: 1.8rem;
                        color: #e67e22;
                        font-weight: 700;
                    }
                    &.uppercase { text-transform: uppercase; }
                }

                &.amount-group {
                    gap: 0;
                }
            }

            .amount-col {
                text-align: right;
                @media (max-width: 768px) {
                    text-align: left;
                }
            }
        }
    }



    .placeholder-content {
        .card {
            @include card-base;
            padding: $spacing-xl;
            text-align: center;
            background: white;

            .icon-large { font-size: 5rem; margin-bottom: $spacing-md; }
            h2 { color: $primary-color; margin-bottom: $spacing-sm; }
            p { color: $text-secondary; font-size: 1.1rem; }
        }
    }

    .loading-state {
        text-align: center;
        padding: $spacing-xl;
        color: $text-secondary;
        font-weight: 500;
        font-size: 1.2rem;
    }

    .error-msg {
        background: rgba($error-color, 0.1);
        color: $error-color;
        padding: $spacing-lg;
        border-radius: 12px;
        text-align: center;
        margin-bottom: $spacing-lg;
        font-weight: 600;
    }
    
    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: $spacing-lg;
        
        .nav-card {
            @include card-base;
            @include card-hover;
            padding: $spacing-xl;
            text-align: center;
            cursor: pointer;
            border: 1px solid rgba(0,0,0,0.02);
            
            .icon { font-size: 3.5rem; margin-bottom: $spacing-sm; }
            h3 { font-size: 1.3rem; margin-bottom: $spacing-xs; color: $primary-color; }
            p { color: $text-secondary; font-size: 0.95rem; line-height: 1.4; }
        }
    }
    .education-edit-container {
        @include card-base;
        padding: $spacing-xl;
        background: rgba(0, 119, 182, 0.02);
        border: 1px solid rgba(0, 119, 182, 0.1);
        margin-top: $spacing-md;
        border-radius: 16px;
    }

    .education-records-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: $spacing-lg;
        margin-top: $spacing-lg;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .education-card-item {
        @include card-base;
        background: white;
        border: 1px solid rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s;
        border-radius: 16px;
        overflow: hidden;

        &:hover {
            transform: translateY(-4px);
            box-shadow: $shadow-md;
        }

        .edu-header {
            padding: $spacing-md $spacing-lg;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            background: rgba(0, 119, 182, 0.02);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            .edu-title {
                h4 {
                    color: $primary-color;
                    margin: 0;
                    font-size: 1.1rem;
                    line-height: 1.3;
                    font-weight: 700;
                }
                .edu-year {
                    font-size: 0.85rem;
                    color: $text-secondary;
                    font-weight: 600;
                }
            }

            .edu-actions {
                display: flex;
                gap: 8px;

                .icon-btn {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.1);
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &:hover {
                        background: rgba(0, 119, 182, 0.05);
                        border-color: $primary-color;
                    }
                    &.delete:hover {
                        background: rgba($error-color, 0.1);
                        border-color: $error-color;
                    }
                }
            }
        }

        .edu-content {
            padding: $spacing-lg;
            display: flex;
            flex-direction: column;
            gap: $spacing-sm;

            .info-row {
                display: flex;
                gap: 12px;
                font-size: 0.95rem;

                .label {
                    color: $text-secondary;
                    font-weight: 700;
                    min-width: 100px;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .value {
                    color: $text-color;
                    font-weight: 600;
                }
            }
        }
    }

    .no-data-state {
        text-align: center;
        padding: $spacing-xl * 3;
        background: rgba($bg-color, 0.5);
        border-radius: 24px;
        margin-top: $spacing-lg;
        border: 2px dashed rgba($border-color, 0.5);
        
        .icon { font-size: 5rem; margin-bottom: $spacing-md; opacity: 0.3; }
        p { color: $text-secondary; font-size: 1.2rem; font-weight: 600; }
    }

    .required { color: $error-color; margin-left: 2px; }

    // Beautified Education Section
    .education-form-card {
        background: #fff;
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border: 1px solid rgba(0, 119, 182, 0.1);
        padding: $spacing-xl;
        margin-bottom: $spacing-xl;
        animation: slideInUp 0.4s ease-out;

        .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-xl;
            padding-bottom: $spacing-md;
            border-bottom: 2px solid rgba($bg-color, 0.5);

            .header-content {
                display: flex;
                align-items: center;
                gap: 12px;
                i {
                    font-size: 1.5rem;
                    color: $primary-color;
                    background: rgba(0, 119, 182, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                }
                h2 { margin: 0; font-size: 1.3rem; font-weight: 700; color: $text-color; }
            }

            .close-btn {
                background: rgba($error-color, 0.1);
                border: none;
                color: $error-color;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                &:hover { background: $error-color; color: #fff; transform: rotate(90deg); }
            }
        }

        .modern-form {
            .form-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: $spacing-lg;

                .span-2 { grid-column: span 2; }

                .form-group {
                    label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: $text-secondary;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    input, select {
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid rgba($border-color, 0.3);
                        border-radius: 12px;
                        font-size: 1rem;
                        transition: all 0.3s;
                        background: rgba($bg-color, 0.3);

                        &:focus {
                            border-color: $primary-color;
                            background: #fff;
                            box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.1);
                            outline: none;
                        }
                    }

                    .select-wrapper {
                        position: relative;
                        &::after {
                            content: '\\f107';
                            font-family: 'Font Awesome 5 Free';
                            font-weight: 900;
                            position: absolute;
                            right: 16px;
                            top: 50%;
                            transform: translateY(-50%);
                            pointer-events: none;
                            color: $text-secondary;
                        }
                        select { appearance: none; }
                    }
                }

                .form-divider {
                    grid-column: span 2;
                    height: 1px;
                    background: rgba($border-color, 0.5);
                    margin: $spacing-sm 0;
                }
            }

            .form-actions {
                margin-top: $spacing-xl;
                display: flex;
                justify-content: flex-end;
                gap: $spacing-md;
                padding-top: $spacing-lg;
                border-top: 1px solid rgba($border-color, 0.5);

                button {
                    padding: 12px 30px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    &.btn-secondary {
                        background: #fff;
                        border: 2px solid rgba($border-color, 0.5);
                        color: $text-secondary;
                        &:hover { background: rgba($bg-color, 0.5); border-color: $text-secondary; }
                    }

                    &.btn-primary {
                        background: $primary-color;
                        border: none;
                        color: #fff;
                        box-shadow: 0 4px 15px rgba(0, 119, 182, 0.3);
                        &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 119, 182, 0.4); }
                        &:disabled { opacity: 0.5; transform: none; box-shadow: none; cursor: not-allowed; }
                    }
                }
            }
        }
    }

    .education-list-view {
        .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-xl;

            h3 { margin: 0; font-size: 1.5rem; font-weight: 800; color: $text-color; letter-spacing: -0.5px; }

            .add-btn-premium {
                background: linear-gradient(135deg, $primary-color, $primary-dark);
                color: #fff;
                border: none;
                padding: 12px 24px;
                border-radius: 14px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(0, 119, 182, 0.2);

                &:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0, 119, 182, 0.3); }
                i { font-size: 1.2rem; }
            }
        }

        .records-container {
            display: grid;
            gap: $spacing-lg;

            .no-records-card {
                text-align: center;
                padding: $spacing-xl * 3;
                background: rgba(#fff, 0.5);
                border: 2px dashed rgba($border-color, 0.5);
                border-radius: 24px;
                
                i { font-size: 4rem; color: $primary-color; opacity: 0.2; margin-bottom: $spacing-md; display: block; }
                p { color: $text-secondary; font-weight: 600; font-size: 1.1rem; }
            }

            .education-premium-card {
                background: #fff;
                border-radius: 20px;
                border: 1px solid rgba($border-color, 0.5);
                padding: $spacing-xl;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                overflow: hidden;

                &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 6px;
                    height: 100%;
                    background: $primary-color;
                    opacity: 0.8;
                }

                &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
                    border-color: rgba(0, 119, 182, 0.3);
                }

                .card-top {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: $spacing-xl;

                    .record-icon {
                        background: rgba(0, 119, 182, 0.08);
                        color: $primary-color;
                        width: 50px;
                        height: 50px;
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.4rem;
                    }

                    .record-main-info {
                        flex: 1;
                        h4 { margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; color: $text-color; }
                        .passing-date {
                            font-size: 0.85rem;
                            color: $text-secondary;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-weight: 600;
                            i { color: $primary-color; }
                        }
                    }

                    .card-actions {
                        display: flex;
                        gap: 10px;

                        .action-btn {
                            width: 38px;
                            height: 38px;
                            border-radius: 10px;
                            border: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.2s;
                            font-size: 1rem;

                            &.edit { background: rgba(0, 119, 182, 0.1); color: $primary-color; &:hover { background: $primary-color; color: #fff; } }
                            &.delete { background: rgba($error-color, 0.1); color: $error-color; &:hover { background: $error-color; color: #fff; } }
                        }
                    }
                }

                .card-details {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: $spacing-lg;
                    padding-top: $spacing-md;
                    border-top: 1px solid rgba($border-color, 0.3);

                    .detail-item {
                        .label {
                            display: block;
                            font-size: 0.75rem;
                            color: $text-secondary;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            font-weight: 700;
                            margin-bottom: 4px;
                        }
                        .value {
                            color: $text-color;
                            font-weight: 600;
                            font-size: 0.95rem;
                        }
                    }
                }
            }
        }
    }

    @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .required { color: $error-color; margin-left: 2px; }

    // Council Modal Styles
    .council-modal {
        max-width: 500px !important;
        
        .modal-body {
            p { margin-bottom: $spacing-md; color: $text-secondary; font-size: 0.95rem; line-height: 1.5; }
        }
        
        .form-group {
            margin-bottom: $spacing-sm;
            label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; }
            .form-control {
                width: 100%;
                padding: 12px;
                border: 2px solid rgba($border-color, 0.5);
                border-radius: 10px;
                &:focus { border-color: $primary-color; outline: none; }
            }
        }
    }

    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; z-index: 1000;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
        background: white; border-radius: 20px; width: 90%; max-width: 600px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: slideInUp 0.3s ease-out;
        
        .modal-header {
            padding: $spacing-lg $spacing-xl; border-bottom: 1px solid rgba(0,0,0,0.05);
            display: flex; justify-content: space-between; align-items: center;
            h3 { color: $primary-color; margin: 0; }
            .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: $text-secondary; }
        }

        .modal-body { padding: $spacing-xl; }

        .modal-footer {
            padding: $spacing-lg $spacing-xl; border-top: 1px solid rgba(0,0,0,0.05);
            display: flex; justify-content: flex-end; gap: $spacing-md;
            
            button {
                padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                &.btn-secondary { background: #eee; border: none; color: $text-secondary; &:hover { background: #ddd; } }
                &.btn-primary { background: $primary-color; border: none; color: white; &:hover { background: $primary-dark; } &:disabled { opacity: 0.5; } }
            }
        }

        .add-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 20px; background: linear-gradient(135deg, $primary-color, $primary-dark);
          color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 119, 182, 0.2);
          &:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0, 119, 182, 0.3); }
          .icon { font-size: 1.2rem; }
        }

        .documents-list {
          margin-top: $spacing-md;
          .data-table {
            width: 100%; border-collapse: separate; border-spacing: 0;
            th { text-align: left; padding: 12px; border-bottom: 2px solid rgba(0,0,0,0.05); color: $text-secondary; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 14px 12px; border-bottom: 1px solid rgba(0,0,0,0.03); vertical-align: middle; color: $text-color; font-weight: 500; }
            .badge { background: rgba(0, 119, 182, 0.1); color: $primary-color; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
            .action-btns { display: flex; gap: 12px; justify-content: flex-end; align-items: center; }
            .view-btn-sm { text-decoration: none; color: $primary-color; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; 
              &:hover { color: $primary-dark; text-decoration: underline; }
            }
            .delete-btn-sm { background: none; border: none; color: $error-color; cursor: pointer; padding: 6px; border-radius: 8px; 
              transition: all 0.2s; &:hover { background: rgba($error-color, 0.1); transform: scale(1.1); }
            }
          }
        }

        .scrollable-modal {
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: thin;
          &::-webkit-scrollbar { width: 6px; }
          &::-webkit-scrollbar-track { background: transparent; }
          &::-webkit-scrollbar-thumb { background: rgba(0, 119, 182, 0.2); border-radius: 10px; }
        }
    }
  `]

})
export class UserDashboardComponent implements OnInit {
  auth = inject(AuthService);
  adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  practitionerData = signal<any>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  activeTab = signal<string>('welcome');
  activeProfileSubTab = signal<string>('personal');
  receiptsList = signal<any[]>([]);

  resAddress = signal<any>(null);
  profAddress = signal<any>(null);
  educationalInfo = signal<any[]>([]);
  ledgers = signal<any[]>([]);
  selectedLedger = signal<any>(null);
  paymentAmount = signal<number>(0);
  isProcessingPayment = signal<boolean>(false);
  paymentStatus = signal<{ success: boolean; message: string } | null>(null);
  
  // Document Management
  documentList = signal<any[]>([]);
  isAddingDocument = signal<boolean>(false);
  certificatesData = signal<any[]>([]);
  selectedDocFile: File | null = null;
  dynamicDocuments = signal<any[]>([]);
  selectedDynamicFiles = signal<{ [id: string]: File }>({});

  years: number[] = [];
  months = [
    { name: 'January', value: '01' }, { name: 'February', value: '02' }, { name: 'March', value: '03' },
    { name: 'April', value: '04' }, { name: 'May', value: '05' }, { name: 'June', value: '06' },
    { name: 'July', value: '07' }, { name: 'August', value: '08' }, { name: 'September', value: '09' },
    { name: 'October', value: '10' }, { name: 'November', value: '11' }, { name: 'December', value: '12' }
  ];

  courseOptions: any[] = [];
  universityOptions: any[] = [];
  collegeOptions: any[] = [];

  educationForm: FormGroup = this.fb.group({
    degree: ['', Validators.required],
    courseName: [''],
    otherSubject: [''],
    passMonth: ['', Validators.required],
    passYear: ['', Validators.required],
    university: [''],
    college: ['', Validators.required],
    certificateNo: [''],
    certificateDate: ['']
  });

  documentForm: FormGroup = this.fb.group({
    certificateId: ['', Validators.required],
    file: [null, Validators.required]
  });




  tabs = [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'receipts', label: 'Receipts', icon: '🧾' }
  ];

  profileTabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'educational', label: 'Educational Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'payments', label: 'Payments' }
  ];

  councilService = inject(CouncilMasterService);
  showCouncilModal = signal<boolean>(false);
  councilsList = signal<any[]>([]);
  selectedNocCouncilId = signal<string | null>(null);
  isNocSelected = signal<boolean>(false);

  selectedCouncilAddress = computed(() => {
    const id = this.selectedNocCouncilId();
    if (!id || id === 'null') return '';
    const council = this.councilsList().find(c => c.councilId === id);
    if (!council) return '';
    
    return [
      council.address,
      council.address2,
      council.city,
      council.zipCode
    ].filter(p => !!p).join(', ');
  });

  selectedCouncilName = computed(() => {
    const id = this.selectedNocCouncilId();
    if (!id || id === 'null') return '';
    const council = this.councilsList().find(c => c.councilId === id);
    return council ? council.councilName : '';
  });

  activeTabData = () => this.tabs.find(t => t.id === this.activeTab());
  activeProfileSubTabData = () => this.profileTabs.find(t => t.id === this.activeProfileSubTab());

  setProfileSubTab(id: string) {
    this.activeProfileSubTab.set(id);
    const pid = this.practitionerData()?.practitionerID;
    if (id === 'documents' && pid) {
      this.loadDocuments(pid);
      this.loadCertificates();
    }
  }

  onLedgerChange(event: any) {
    const ledgerId = event.target.value;
    const ledger = this.ledgers().find(l => l.ledgerID === ledgerId);
    this.selectedLedger.set(ledger);
    
    if (ledger) {
      this.paymentAmount.set(ledger.feeAmount);
      
      // NOC Council Selection Trigger
      const ledgerName = (ledger.ledgerName || '').toUpperCase();
      const isNoc = ledgerName.includes('NOC') || ledgerName.includes('NO OBJECTION CERTIFICATE');
      this.isNocSelected.set(isNoc);
      
      if (isNoc) {
        this.showCouncilModal.set(true);
      } else {
        this.selectedNocCouncilId.set(null);
      }
    } else {
      this.selectedNocCouncilId.set(null);
    }
  }

  loadCouncils() {
    this.councilService.getAll().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.result || []);
        this.councilsList.set(list);
      },
      error: (err: any) => console.error('Failed to load councils', err)
    });
  }

  confirmCouncilSelection() {
    if (this.selectedNocCouncilId() && this.selectedNocCouncilId() !== 'null') {
      this.showCouncilModal.set(false);
    } else {
      alert('Please select a council to proceed.');
    }
  }

  closeCouncilModal() {
    this.showCouncilModal.set(false);
    
    // Reset payment selection if cancelled without a council for NOC
    const councilId = this.selectedNocCouncilId();
    if (this.isNocSelected() && (!councilId || councilId === 'null')) {
      this.selectedLedger.set(null);
      this.paymentAmount.set(0);
      this.isNocSelected.set(false);
    }
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  }

  // Document Management Methods
  loadDocuments(pid: string) {
    this.adminService.getPractitionerDocuments(pid).subscribe({
      next: (data: any) => {
        // Handle new API response structure: { data: [ { documentName, documents: [] } ] }
        this.documentList.set(data?.data || []);
      },
      error: (err: any) => {
        console.error('Failed to load documents', err);
        this.documentList.set([]);
      }
    });
  }

  loadCertificates() {
    this.adminService.getAllCertificates().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.result || []);
        this.certificatesData.set(list);
      },
      error: (err: any) => {
        console.error('Failed to load certificates', err);
      }
    });
  }

  toggleAddDocument() {
    this.isAddingDocument.update(v => !v);
    if (!this.isAddingDocument()) {
      this.documentForm.reset();
      this.selectedDocFile = null;
      this.dynamicDocuments.set([]);
      this.selectedDynamicFiles.set({});
    }
  }

  onDocumentFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedDocFile = file;
      this.documentForm.patchValue({ file: file });
    }
  }

  onDynamicFileSelected(event: any, docId: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedDynamicFiles.update(files => ({
        ...files,
        [docId]: file
      }));
    }
  }

  saveDocument() {
    const pid = this.practitionerData()?.practitionerID;
    if (!pid) return;

    const { certificateId } = this.documentForm.value;
    const selectedCert = this.certificatesData().find(c => c.id == certificateId);
    const docNameBase = selectedCert ? selectedCert.name : 'Unknown';

    // Check if we have dynamic documents to upload
    const dynamicDocs = this.dynamicDocuments();
    if (dynamicDocs.length > 0) {
      const selectedFiles = this.selectedDynamicFiles();
      const uploads = dynamicDocs
        .filter(doc => selectedFiles[doc.id])
        .map(doc => {
          const file = selectedFiles[doc.id];
          const docType = doc.docdetailes;
          const docName = docNameBase; // DocumentName as certificate name
          return this.adminService.uploadPractitionerDocument(pid, docType, file, docName);
        });

      if (uploads.length === 0) {
        alert('Please select at least one document to upload');
        return;
      }

      forkJoin(uploads).subscribe({
        next: () => {
          alert('Documents uploaded successfully');
          this.toggleAddDocument();
          this.loadDocuments(pid);
        },
        error: (err: any) => {
          console.error('Bulk upload failed', err);
          alert('Failed to upload some documents. Please try again.');
        }
      });
    } else {
      // Fallback to single file upload (though UI will hide this if dynamicDocs exist)
      if (this.documentForm.invalid || !this.selectedDocFile) {
        this.documentForm.markAllAsTouched();
        return;
      }

      const docName = docNameBase;
      const docType = docName;

      this.adminService.uploadPractitionerDocument(pid, docType!, this.selectedDocFile, docName!).subscribe({
        next: () => {
          alert('Document uploaded successfully');
          this.toggleAddDocument();
          this.loadDocuments(pid);
        },
        error: (err: any) => {
          console.error('Upload failed', err);
          alert('Failed to upload document');
        }
      });
    }
  }

  deleteDocument(docId: string) {
    const pid = this.practitionerData()?.practitionerID;
    if (confirm('Are you sure you want to delete this document?')) {
      this.adminService.deletePractitionerDocument(docId).subscribe({
        next: () => {
          alert('Document deleted successfully');
          if (pid) this.loadDocuments(pid);
        },
        error: (err: any) => {
          console.error('Delete failed', err);
          alert('Failed to delete document');
        }
      });
    }
  }

  async initiateRazorpayPayment() {
    if (!this.selectedLedger() || this.paymentAmount() <= 0) return;

    // Strict NOC Council Enforcement
    if (this.isNocSelected() && (!this.selectedNocCouncilId() || this.selectedNocCouncilId() === 'null')) {
      this.showCouncilModal.set(true);
      return;
    }

    this.isProcessingPayment.set(true);
    this.paymentStatus.set(null);

    try {
      await this.loadRazorpayScript();

      const practitionerId = this.practitionerData()?.practitionerID || this.practitionerData()?.practitionerId || '';
      const ledgerId = this.selectedLedger().ledgerID;
      const councilId = this.isNocSelected() ? this.selectedNocCouncilId() : null;

      this.adminService.createOrder(this.paymentAmount(), practitionerId, ledgerId, councilId).subscribe({
        next: (orderRes: any) => {
          const orderId = orderRes?.orderId || orderRes?.result?.orderId || orderRes?.id || orderRes;

          if (!orderId) {
            throw new Error('Failed to create order ID from backend');
          }

          const options = {
            key: environment.razorpayKey,
            amount: this.paymentAmount() * 100, // Amount in paise
            currency: 'INR',
            name: 'GMC Portal',
            description: this.selectedLedger().ledgerName,
            order_id: orderId,
            handler: (response: any) => {
              this.verifyPayment(response);
            },
            prefill: {
              name: this.practitionerData()?.name || '',
              email: this.practitionerData()?.email || '',
              contact: this.practitionerData()?.mobile || ''
            },
            theme: {
              color: '#0077B6'
            },
            modal: {
              ondismiss: () => {
                this.isProcessingPayment.set(false);
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        },
        error: (err) => {
          console.error('Order creation failed', err);
          this.paymentStatus.set({ success: false, message: 'Failed to initiate payment. Please try again.' });
          this.isProcessingPayment.set(false);
        }
      });
    } catch (err) {
      console.error('Razorpay initialization failed', err);
      this.paymentStatus.set({ success: false, message: 'Payment gateway is currently unavailable.' });
      this.isProcessingPayment.set(false);
    }
  }

  private verifyPayment(razorpayResponse: any) {
    console.log('Payment successful, notifying backend...', razorpayResponse);

    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: razorpayResponse.razorpay_payment_id,
            order_id: razorpayResponse.razorpay_order_id,
            amount: this.paymentAmount() * 100, // Amount in paise
            status: "captured"
          }
        }
      }
    };

    // Notify the webhook - this is now the only API call used to finalize payment
    this.adminService.hitPaymentWebhook(webhookPayload).subscribe({
      next: (res) => {
        console.log('Webhook hit successfully', res);
        this.paymentStatus.set({ success: true, message: 'Payment successful! Record updated. Redirecting to receipts...' });
        setTimeout(() => {
          this.setActiveTab('receipts');
          this.isProcessingPayment.set(false);
          this.selectedLedger.set(null);
          this.paymentAmount.set(0);
          this.paymentStatus.set(null);
        }, 2000);
      },
      error: (err) => {
        console.error('Webhook notification failed', err);
        // Providing clear error feedback if the webhook fails
        this.paymentStatus.set({ success: false, message: 'Payment confirmed but record update failed. Please contact support.' });
        this.isProcessingPayment.set(false);
      }
    });
  }


  getFilteredPersonalData() {
    let data = this.practitionerData();
    if (!data) return [];
    if (data.result) data = data.result;

    const excludedFields = [
      'createdOn', 'createdBy', 'photo', 'thumb', 'sign', 'barcode',
      'id', 'roleId', 'password', 'practitionerId', 'practitionerID',
      'countryId', 'stateId', 'councilId', 'districtId'
    ];

    const dateFields = ['birthDate', 'registrationDate', 'validUpTo', 'councilRegistrationDate', 'oldRegDate'];

    return Object.entries(data)
      .filter(([key]) => !excludedFields.includes(key))
      .map(([key, value]) => {
        let formattedValue = value;

        // Format date fields
        if (dateFields.includes(key) && value) {
          const date = new Date(String(value));
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            formattedValue = `${day}-${month}-${year}`;
          }
        }

        return {
          label: this.formatLabel(key),
          value: formattedValue
        };
      });
  }

  getFilteredAddressData(type: 'R' | 'P') {
    let data = type === 'R' ? this.resAddress() : this.profAddress();
    if (!data) return [];
    if (data.result) data = data.result;

    const excludedFields = ['clientID', 'addressType', 'country', 'state', 'district'];

    return Object.entries(data)
      .filter(([key]) => !excludedFields.includes(key) && data[key])
      .map(([key, value]) => ({
        label: this.formatLabel(key),
        value: value
      }));
  }


  formatLabel(key: string): string {
    // Convert camelCase to Space Separated Title Case
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
    if (tabId === 'receipts') {
      this.loadPaymentDetails();
    }
  }

  generateReceipt(receiptNo: string) {
    if (!receiptNo) {
      alert('Receipt Number is missing.');
      return;
    }

    this.adminService.generateReceipt(receiptNo).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Failed to generate receipt', err);
        alert('Failed to generate receipt. Please try again.');
      }
    });
  }

  printCertificate(receipt: any) {
    const rid = receipt.renewalId || receipt.renewalID;
    const pid = this.auth.currentUser()?.id;

    if (!rid || !pid) {
      alert('Required data (Renewal ID or User ID) is missing.');
      return;
    }

    this.adminService.printCertificate(rid, pid).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Failed to print certificate', err);
        alert('Failed to print certificate. Please try again.');
      }
    });
  }

  loadPaymentDetails() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.adminService.getPaymentDetails(userId).subscribe({
        next: (data: any) => {
          const records = Array.isArray(data) ? data : (data?.result || []);
          this.receiptsList.set(records.map((item: any) => {
            const rawName = item.ledgerDescription || item.feeItemname || item.type || '';
            const displayName = rawName.toLowerCase().includes('certificate') ? rawName : rawName + ' Certificate';
            return {
              ...item,
              displayName: displayName
            };
          }));
        },
        error: (err) => {
          console.error('Error fetching payment details:', err);
        }
      });
    }
  }







  setupAddressListeners() {
    // Methods related to editing addresses have been removed as the profile is now read-only.
  }

  ngOnInit() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.loadCouncils();
      
      this.adminService.getPractitionerById(userId).subscribe({
        next: (data) => {
          this.practitionerData.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load practitioner profile data.');
          this.isLoading.set(false);
          console.error('Error fetching practitioner data:', err);
        }
      });

      // Fetch Addresses
      this.adminService.getAddress(userId, 'R').subscribe(data => {
        const res = (data as any)?.result || data;
        this.resAddress.set(res);
      });

      this.adminService.getAddress(userId, 'P').subscribe(data => {
        const prof = (data as any)?.result || data;
        this.profAddress.set(prof);
      });

      // Fetch Education
      this.loadEducation(userId);

      // Fetch Ledgers for Payments
      this.adminService.getPaymentLedgers().subscribe((data: any) => {
        const list = Array.isArray(data) ? data : (data?.result || []);
        this.ledgers.set(list);
      });

      // Listen for certificate selection to fetch dynamic documents
      this.documentForm.get('certificateId')?.valueChanges.subscribe(certId => {
        if (certId) {
          const selectedCert = this.certificatesData().find(c => c.id == certId);
          if (selectedCert && selectedCert.typeid) {
            this.adminService.getDocumentsForServices(selectedCert.typeid).subscribe({
              next: (docs: any) => {
                this.dynamicDocuments.set(docs || []);
                this.selectedDynamicFiles.set({});
              },
              error: (err: any) => {
                console.error('Failed to fetch dynamic documents', err);
                this.dynamicDocuments.set([]);
              }
            });
          }
        } else {
          this.dynamicDocuments.set([]);
          this.selectedDynamicFiles.set({});
        }
      });
    } else {
      this.error.set('User identifier not found in session.');
      this.isLoading.set(false);
    }
  }

  loadEducation(userId: string) {
    this.adminService.getEducation(userId).subscribe((data: any) => {
      const records = Array.isArray(data) ? data : (data?.result || []);
      // Map data for display consistency if needed
      this.educationalInfo.set(records.map((edu: any) => {
        const monthObj = this.months.find(m => m.value === edu.monthOfPassing || m.value === String(edu.monthOfPassing).padStart(2, '0'));
        const monthName = monthObj ? monthObj.name : edu.monthOfPassing;
        return {
          ...edu,
          convertedDate: `${monthName} ${edu.yearOfPassing}`
        };
      }));
    });
  }

}

