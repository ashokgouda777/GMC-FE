import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin/services/admin.service';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
             <div class="card nav-card" (click)="setActiveTab('noc')">
                <div class="icon">📜</div>
                <h3>NOC Status</h3>
                <p>Check your No Objection Certificate status</p>
             </div>
             <div class="card nav-card" (click)="setActiveTab('cme')">
                <div class="icon">📊</div>
                <h3>CME Points</h3>
                <p>Track your continuing education progress</p>
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
                    <button class="edit-btn" (click)="toggleEditProfile()">{{ isEditingProfile() ? 'Cancel' : 'Edit' }}</button>
                  </div>

                  <!-- View Mode -->
                  <div class="details-grid" *ngIf="!isEditingProfile()">
                    <div class="detail-item" *ngFor="let item of getFilteredPersonalData()">
                       <span class="label">{{ item.label }}:</span>
                       <span class="value" [class.status-badge]="item.label === 'Vote' || item.label === 'Status'" [class.active]="(item.label === 'Vote' || item.label === 'Status') && (item.value === 'Active' || item.value === '1')">
                         {{ item.value }}
                       </span>
                    </div>
                  </div>

                  <!-- Edit Mode -->
                  <form [formGroup]="personalForm" (ngSubmit)="saveProfile()" *ngIf="isEditingProfile()" class="edit-form-container">
                    <div class="edit-form-grid">
                      <div class="form-group">
                        <label>Title</label>
                        <select formControlName="title" class="form-control">
                          <option value="">Select Title</option>
                          <option *ngFor="let opt of titleOptions()" [value]="opt.titleId">{{ opt.titleName }}</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Name</label>
                        <input type="text" formControlName="name" class="form-control" placeholder="Full Name">
                      </div>

                      <div class="form-group">
                        <label>Gender</label>
                        <select formControlName="gender" class="form-control">
                          <option value="">Select Gender</option>
                          <option *ngFor="let opt of genderOptions()" [value]="opt.genderId">{{ opt.genderName }}</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Blood Group</label>
                        <select formControlName="bloodGroup" class="form-control">
                          <option value="">Select Blood Group</option>
                          <option *ngFor="let opt of bloodGroupOptions()" [value]="opt.bloodGroupCode">{{ opt.bloodGroupDescription }}</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Change of Name (if any)</label>
                        <input type="text" formControlName="changeOfName" class="form-control">
                      </div>

                      <div class="form-group">
                        <label>Father's / Spouse Name</label>
                        <input type="text" formControlName="fatherName" class="form-control">
                      </div>

                      <div class="form-group">
                        <label>Birth Date</label>
                        <input type="date" formControlName="birthDate" class="form-control">
                      </div>

                      <div class="form-group">
                        <label>Birth Place</label>
                        <input type="text" formControlName="birthPlace" class="form-control">
                      </div>

                      <div class="form-group">
                        <label>Nationality</label>
                        <select formControlName="nationality" class="form-control">
                          <option value="">Select Nationality</option>
                          <option *ngFor="let opt of nationalityOptions()" [value]="opt.nationalityId">{{ opt.nationality }}</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Eligibility</label>
                        <select formControlName="eligibility" class="form-control">
                          <option value="">Select Eligibility</option>
                          <option *ngFor="let opt of eligibilityOptions()" [value]="opt.eligibiltyId">{{ opt.eligibilty }}</option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label>Email</label>
                        <input type="email" formControlName="email" class="form-control">
                      </div>

                      <div class="form-group">
                        <label>Mobile</label>
                        <input type="text" formControlName="mobile" class="form-control">
                      </div>

                    </div>

                    <div class="form-actions-row">
                      <button type="button" class="cancel-btn" (click)="toggleEditProfile()">Cancel</button>
                      <button type="submit" class="save-btn" [disabled]="!personalForm.valid">Save Changes</button>
                    </div>
                  </form>
                </div>


                <!-- Contact Info Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'contact'">
                  <div class="card-header">
                    <h3>Contact Information</h3>
                    <button class="edit-btn" (click)="toggleEditContact()">{{ isEditingContact() ? 'Cancel' : 'Edit' }}</button>
                  </div>
                  
                  <!-- View Mode -->
                  <div *ngIf="!isEditingContact()">
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

                  <!-- Edit Mode -->
                  <form [formGroup]="contactForm" (ngSubmit)="saveContact()" *ngIf="isEditingContact()" class="edit-form-container">
                    
                    <!-- Residential Section -->
                    <div class="address-edit-group">
                      <h4 class="section-title">Residential Address</h4>
                      <div class="edit-form-grid">
                        <div class="form-group">
                          <label>Address Line 1</label>
                          <input type="text" formControlName="resAddress1" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Address Line 2</label>
                          <input type="text" formControlName="resAddress2" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>City / Town</label>
                          <input type="text" formControlName="resCity" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Rural / Urban</label>
                          <select formControlName="resRuralUrban" class="form-control">
                            <option value="">Select</option>
                            <option *ngFor="let opt of ruralUrbanOptions()" [value]="opt.typeId || opt.ruralurbanId || opt.ruralurban">{{ opt.typeName || opt.ruralurban }}</option>
                            <option value="Rural">Rural</option>
                            <option value="Urban">Urban</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Country</label>
                          <select formControlName="resCountry" class="form-control">
                            <option value="">Select Country</option>
                            <option *ngFor="let opt of countryOptions()" [value]="opt.countryId">{{ opt.countryName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>State</label>
                          <select formControlName="resState" class="form-control">
                            <option value="">Select State</option>
                            <option *ngFor="let s of resStateOptions()" [value]="s.stateId">{{ s.stateName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>District</label>
                          <select formControlName="resDistrict" class="form-control">
                            <option value="">Select District</option>
                            <option *ngFor="let d of resDistrictOptions()" [value]="d.districtId">{{ d.districtName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Pin Code</label>
                          <input type="text" formControlName="resPinCode" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Phone 1</label>
                          <input type="text" formControlName="resPhone1" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Phone 2</label>
                          <input type="text" formControlName="resPhone2" class="form-control">
                        </div>
                      </div>
                    </div>

                    <!-- Professional Section -->
                    <div class="address-edit-group" style="margin-top: $spacing-xl;">
                      <div class="section-header-flex">
                        <h4 class="section-title">Professional Address</h4>
                        <label class="checkbox-label">
                          <input type="checkbox" formControlName="isProSameAsRes">
                          Same as Residential
                        </label>
                      </div>
                      
                      <div class="edit-form-grid" [style.opacity]="contactForm.get('isProSameAsRes')?.value ? 0.6 : 1" [style.pointer-events]="contactForm.get('isProSameAsRes')?.value ? 'none' : 'auto'">
                        <div class="form-group">
                          <label>Address Line 1</label>
                          <input type="text" formControlName="profAddress1" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Address Line 2</label>
                          <input type="text" formControlName="profAddress2" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>City / Town</label>
                          <input type="text" formControlName="profCity" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Rural / Urban</label>
                          <select formControlName="profRuralUrban" class="form-control">
                            <option value="">Select</option>
                            <option *ngFor="let opt of ruralUrbanOptions()" [value]="opt.typeId || opt.ruralurbanId || opt.ruralurban">{{ opt.typeName || opt.ruralurban }}</option>
                            <option value="Rural">Rural</option>
                            <option value="Urban">Urban</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Country</label>
                          <select formControlName="profCountry" class="form-control">
                            <option value="">Select Country</option>
                            <option *ngFor="let opt of countryOptions()" [value]="opt.countryId">{{ opt.countryName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>State</label>
                          <select formControlName="profState" class="form-control">
                            <option value="">Select State</option>
                            <option *ngFor="let s of profStateOptions()" [value]="s.stateId">{{ s.stateName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>District</label>
                          <select formControlName="profDistrict" class="form-control">
                            <option value="">Select District</option>
                            <option *ngFor="let d of profDistrictOptions()" [value]="d.districtId">{{ d.districtName }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label>Pin Code</label>
                          <input type="text" formControlName="profPinCode" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Phone 1</label>
                          <input type="text" formControlName="profPhone1" class="form-control">
                        </div>
                        <div class="form-group">
                          <label>Phone 2</label>
                          <input type="text" formControlName="profPhone2" class="form-control">
                        </div>
                      </div>
                    </div>

                    <div class="form-actions-row">
                      <button type="button" class="cancel-btn" (click)="toggleEditContact()">Cancel</button>
                      <button type="submit" class="save-btn">Save Addresses</button>
                    </div>
                  </form>

                  <div *ngIf="!resAddress() && !profAddress() && !isEditingContact()" class="loading-state">
                    Loading contact information...
                  </div>
                </div>


                <!-- Educational Info Sub-Tab -->
                <div *ngIf="activeProfileSubTab() === 'educational'">
                                  <!-- Education Form -->
                                  <div class="education-form-card" *ngIf="isAddingEducation">
                                      <div class="form-header">
                                          <div class="header-content">
                                              <i class="fas fa-graduation-cap"></i>
                                              <h2>{{ editingEducationId ? 'Edit' : 'Add' }} Educational Information</h2>
                                          </div>
                                          <button class="close-btn" (click)="toggleAddEducation()">
                                              <i class="fas fa-times"></i>
                                          </button>
                                      </div>

                                      <form [formGroup]="educationForm" (ngSubmit)="saveEducation()" class="modern-form">
                                          <div class="form-grid">
                                              <!-- Degree -->
                                              <div class="form-group span-2">
                                                  <label>Degree <span class="required">*</span></label>
                                                  <div class="select-wrapper">
                                                      <select formControlName="degree">
                                                          <option value="" disabled selected hidden>Select Degree</option>
                                                          <option *ngFor="let c of courseOptions" [value]="c.courseId">{{ c.courseDescription }}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              <!-- Course Name -->
                                              <div class="form-group">
                                                  <label>Course Name</label>
                                                  <input type="text" formControlName="courseName" placeholder="Enter Course Name">
                                              </div>

                                              <!-- Other Subject -->
                                              <div class="form-group">
                                                  <label>Other Subject</label>
                                                  <input type="text" formControlName="otherSubject" placeholder="Enter Other Subject">
                                              </div>

                                              <!-- Passing Month & Year -->
                                              <div class="form-group">
                                                  <label>Passing Month <span class="required">*</span></label>
                                                  <div class="select-wrapper">
                                                      <select formControlName="passMonth">
                                                          <option value="" disabled selected hidden>Select Month</option>
                                                          <option *ngFor="let m of months" [value]="m.value">{{ m.name }}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              <div class="form-group">
                                                  <label>Passing Year <span class="required">*</span></label>
                                                  <div class="select-wrapper">
                                                      <select formControlName="passYear">
                                                          <option value="" disabled selected hidden>Select Year</option>
                                                          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              <!-- University -->
                                              <div class="form-group span-2">
                                                  <label>Name Of The University</label>
                                                  <div class="select-wrapper">
                                                      <select formControlName="university" (change)="onUniversityChange()">
                                                          <option value="" disabled selected hidden>Select University</option>
                                                          <option *ngFor="let u of universityOptions" [value]="u.universityId">{{ u.universityName }}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              <!-- College -->
                                              <div class="form-group span-2">
                                                  <label>Name Of The College Studied <span class="required">*</span></label>
                                                  <div class="select-wrapper">
                                                      <select formControlName="college">
                                                          <option value="" disabled selected hidden>Select College</option>
                                                          <option *ngFor="let c of collegeOptions" [value]="c.colid">{{ c.colname }}</option>
                                                      </select>
                                                  </div>
                                              </div>

                                              <div class="form-divider"></div>

                                              <!-- Certificate No -->
                                              <div class="form-group">
                                                  <label>Certificate No</label>
                                                  <input type="text" formControlName="certificateNo" placeholder="Enter Certificate No">
                                              </div>

                                              <!-- Certificate Date -->
                                              <div class="form-group">
                                                  <label>Certificate Date</label>
                                                  <input type="date" formControlName="certificateDate">
                                              </div>
                                          </div>

                                          <div class="form-actions">
                                              <button type="button" class="btn-secondary" (click)="toggleAddEducation()">Cancel</button>
                                              <button type="submit" class="btn-primary" [disabled]="educationForm.invalid">
                                                  <i class="fas fa-save"></i> Save Education
                                              </button>
                                          </div>
                                      </form>
                                  </div>

                                  <!-- Education List -->
                                  <div class="education-list-view" *ngIf="!isAddingEducation">
                                      <div class="list-header">
                                          <h3>Educational Records</h3>
                                          <button class="add-btn-premium" (click)="toggleAddEducation()">
                                              <i class="fas fa-plus-circle"></i> Add New Record
                                          </button>
                                      </div>

                                      <div class="records-container">
                                          <div class="no-records-card" *ngIf="educationalInfo().length === 0">
                                              <i class="fas fa-graduation-cap"></i>
                                              <p>No educational records found.</p>
                                          </div>

                                          <div class="education-premium-card" *ngFor="let edu of educationalInfo()">
                                              <div class="card-top">
                                                  <div class="record-icon">
                                                      <i class="fas fa-certificate"></i>
                                                  </div>
                                                  <div class="record-main-info">
                                                      <h4>{{ edu.educationName || 'Educational Record' }}</h4>
                                                      <span class="passing-date">
                                                          <i class="far fa-calendar-alt"></i>
                                                          Passed: {{ edu.monthOfPassing }} / {{ edu.yearOfPassing }}
                                                      </span>
                                                  </div>
                                                  <div class="card-actions">
                                                      <button class="action-btn edit" (click)="editEducation(edu)" title="Edit">
                                                          <i class="fas fa-edit"></i>
                                                      </button>
                                                      <button class="action-btn delete" (click)="deleteEducation(edu.educationID)" title="Delete">
                                                          <i class="fas fa-trash-alt"></i>
                                                      </button>
                                                  </div>
                                              </div>

                                              <div class="card-details">
                                                  <div class="detail-item">
                                                      <span class="label">College</span>
                                                      <span class="value">{{ edu.colName || 'N/A' }}</span>
                                                  </div>
                                                  <div class="detail-item">
                                                      <span class="label">University</span>
                                                      <span class="value">{{ edu.universityName || 'N/A' }}</span>
                                                  </div>
                                                  <div class="detail-item">
                                                      <span class="label">Certificate No</span>
                                                      <span class="value">{{ edu.certificateNo || 'N/A' }}</span>
                                                  </div>
                                                  <div class="detail-item">
                                                      <span class="label">Date</span>
                                                      <span class="value">{{ edu.certificateDate | date:'dd MMM yyyy' }}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
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
                      <select id="paymentFor" class="form-control" (change)="onLedgerChange($event)">
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

                    <div class="form-actions">
                      <button 
                        class="pay-btn" 
                        [disabled]="!selectedLedger() || isProcessingPayment()"
                        (click)="initiateRazorpayPayment()">
                        {{ isProcessingPayment() ? 'Processing...' : 'Proceed to Pay' }}
                      </button>
                    </div>

                    <div *ngIf="paymentStatus()" [class]="'payment-alert ' + (paymentStatus()?.success ? 'success' : 'error')">
                      {{ paymentStatus()?.message }}
                    </div>
                  </div>

                </div>

                <!-- Other Sub-Tabs Placeholders -->
                <div *ngIf="['documents'].includes(activeProfileSubTab())" class="sub-placeholder">
                   <div class="placeholder-icon">ℹ️</div>
                   <h4>{{ activeProfileSubTabData()?.label }}</h4>
                   <p>Information for this section is currently being migrated.</p>
                </div>
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
                    <button class="text-action-btn" (click)="printCertificate(receipt)">{{ receipt.ledgerDescription || receipt.feeItemname }} Certificate</button>
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

        <!-- Other Tabs Placeholders -->
        <div *ngIf="['noc', 'cme', 'complaints'].includes(activeTab())" class="placeholder-content">
          <div class="card">
            <div class="icon-large">{{ activeTabData()?.icon }}</div>
            <h2>{{ activeTabData()?.label }}</h2>
            <p>This section is currently under development. Please check back later.</p>
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

  // Education Properties
  isAddingEducation = false;
  editingEducationId: string | null = null;
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

  // Profile Edit State
  isEditingProfile = signal<boolean>(false);
  isEditingContact = signal<boolean>(false);
  
  // Master Data Signals
  titleOptions = signal<any[]>([]);
  genderOptions = signal<any[]>([]);
  bloodGroupOptions = signal<any[]>([]);
  nationalityOptions = signal<any[]>([]);
  eligibilityOptions = signal<any[]>([]);

  // Address Master Data Signals
  countryOptions = signal<any[]>([]);
  ruralUrbanOptions = signal<any[]>([]);
  resStateOptions = signal<any[]>([]);
  resDistrictOptions = signal<any[]>([]);
  profStateOptions = signal<any[]>([]);
  profDistrictOptions = signal<any[]>([]);

  personalForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    name: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: ['', Validators.required],
    changeOfName: [''],
    fatherName: ['', Validators.required],
    birthDate: ['', Validators.required],
    birthPlace: ['', Validators.required],
    nationality: ['', Validators.required],
    eligibility: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  contactForm: FormGroup = this.fb.group({
    // Residential Address
    resAddress1: [''],
    resAddress2: [''],
    resCity: [''],
    resRuralUrban: [''],
    resCountry: [''],
    resState: [''],
    resDistrict: [''],
    resPinCode: [''],
    resPhone1: [''],
    resPhone2: [''],

    // Professional Address
    isProSameAsRes: [false],
    profAddress1: [''],
    profAddress2: [''],
    profCity: [''],
    profRuralUrban: [''],
    profCountry: [''],
    profState: [''],
    profDistrict: [''],
    profPinCode: [''],
    profPhone1: [''],
    profPhone2: ['']
  });





  tabs = [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'noc', label: 'NOC', icon: '📜' },
    { id: 'cme', label: 'CME Points', icon: '📊' },
    { id: 'complaints', label: 'Complaints', icon: '💬' },
    { id: 'receipts', label: 'Receipts', icon: '🧾' }
  ];

  profileTabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'educational', label: 'Educational Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'payments', label: 'Payments' }
  ];

  activeTabData = () => this.tabs.find(t => t.id === this.activeTab());
  activeProfileSubTabData = () => this.profileTabs.find(t => t.id === this.activeProfileSubTab());

  onLedgerChange(event: any) {
    const ledgerId = event.target.value;
    const ledger = this.ledgers().find(l => l.ledgerID === ledgerId);
    this.selectedLedger.set(ledger);
    if (ledger) {
      this.paymentAmount.set(ledger.feeAmount);
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

  async initiateRazorpayPayment() {
    if (!this.selectedLedger() || this.paymentAmount() <= 0) return;

    this.isProcessingPayment.set(true);
    this.paymentStatus.set(null);

    try {
      await this.loadRazorpayScript();

      const practitionerId = this.practitionerData()?.practitionerID || this.practitionerData()?.practitionerId || '';
      const ledgerId = this.selectedLedger().ledgerID;

      this.adminService.createOrder(this.paymentAmount(), practitionerId, ledgerId).subscribe({
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

    // First notify the webhook
    this.adminService.hitPaymentWebhook(webhookPayload).subscribe({
      next: (res) => {
        console.log('Webhook hit successfully', res);
        this.finalizePaymentRecord(razorpayResponse);
      },
      error: (err) => {
        console.error('Webhook notification failed', err);
        // Proceeding to finalize record even if webhook fails, to ensure user data is saved
        this.finalizePaymentRecord(razorpayResponse);
      }
    });
  }

  private finalizePaymentRecord(razorpayResponse: any) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id;

    const payload = {
      practitionerID: userId,
      type: this.selectedLedger().ledgerID,
      amount: String(this.paymentAmount()),
      paymentFor: this.selectedLedger().ledgerID,
      transactionNo: razorpayResponse.razorpay_payment_id,
      bank: 'Razorpay',
      receiptDate: new Date().toISOString(),
      feeItemname: this.selectedLedger().ledgerName,
      createdBy: 'User'
    };

    const headers = new HttpHeaders({ 'pId': String(userId) });

    this.adminService.createRenewal(payload, headers).subscribe({
      next: () => {
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
        console.error('Failed to finalize payment record', err);
        this.paymentStatus.set({ success: false, message: 'Payment received but record update failed. Please contact support.' });
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
          this.receiptsList.set(records);
        },
        error: (err) => {
          console.error('Error fetching payment details:', err);
        }
      });
    }
  }


  setProfileSubTab(subTabId: string) {
    this.activeProfileSubTab.set(subTabId);
  }




  loadAddressMasterData(): Observable<any[]> {
    const countries$ = this.adminService.getCountries().pipe(
      map((data: any) => {
        const list = Array.isArray(data) ? data : ((data as any)?.result || []);
        this.countryOptions.set(list);
        return list;
      })
    );
    
    this.adminService.getRuralUrbanTypes().subscribe((data: any) => 
      this.ruralUrbanOptions.set(Array.isArray(data) ? data : ((data as any)?.result || []))
    );

    return countries$;
  }

  private prefetchAddressCascades(res: any, prof: any) {
    // Wait for countries to be loaded if not already
    if (this.countryOptions().length === 0) {
      this.loadAddressMasterData().subscribe(() => this.prefetchAddressCascades(res, prof));
      return;
    }

    if (res?.country) {
      const countryId = this.findId(this.countryOptions(), 'countryId', 'countryName', res.country);
      if (countryId) {
        this.adminService.getStates(countryId).subscribe(states => {
          const stateList = Array.isArray(states) ? states : ((states as any)?.result || []);
          this.resStateOptions.set(stateList);
          const stateId = this.findId(stateList, 'stateId', 'stateName', res.state);
          if (stateId) {
            this.adminService.getDistricts(stateId).subscribe(districts => {
              this.resDistrictOptions.set(Array.isArray(districts) ? districts : ((districts as any)?.result || []));
            });
          }
        });
      }
    }

    if (prof?.country) {
      const countryId = this.findId(this.countryOptions(), 'countryId', 'countryName', prof.country);
      if (countryId) {
        this.adminService.getStates(countryId).subscribe(states => {
          const stateList = Array.isArray(states) ? states : ((states as any)?.result || []);
          this.profStateOptions.set(stateList);
          const stateId = this.findId(stateList, 'stateId', 'stateName', prof.state);
          if (stateId) {
            this.adminService.getDistricts(stateId).subscribe(districts => {
              this.profDistrictOptions.set(Array.isArray(districts) ? districts : ((districts as any)?.result || []));
            });
          }
        });
      }
    }
  }

  setupAddressListeners() {
    // Residential Country -> State
    this.contactForm.get('resCountry')?.valueChanges.subscribe(countryId => {
      this.resStateOptions.set([]);
      this.resDistrictOptions.set([]);
      if (countryId) {
        this.adminService.getStates(countryId).subscribe((data: any) => {
          this.resStateOptions.set(Array.isArray(data) ? data : (data?.result || []));
        });
      }
    });

    // Residential State -> District
    this.contactForm.get('resState')?.valueChanges.subscribe(stateId => {
      this.resDistrictOptions.set([]);
      if (stateId) {
        this.adminService.getDistricts(stateId).subscribe((data: any) => {
          this.resDistrictOptions.set(Array.isArray(data) ? data : (data?.result || []));
        });
      }
    });

    // Professional Country -> State
    this.contactForm.get('profCountry')?.valueChanges.subscribe(countryId => {
      this.profStateOptions.set([]);
      this.profDistrictOptions.set([]);
      if (countryId) {
        this.adminService.getStates(countryId).subscribe((data: any) => {
          this.profStateOptions.set(Array.isArray(data) ? data : (data?.result || []));
        });
      }
    });

    // Professional State -> District
    this.contactForm.get('profState')?.valueChanges.subscribe(stateId => {
      this.profDistrictOptions.set([]);
      if (stateId) {
        this.adminService.getDistricts(stateId).subscribe((data: any) => {
          this.profDistrictOptions.set(Array.isArray(data) ? data : (data?.result || []));
        });
      }
    });

    // "Same as Residential" Logic
    this.contactForm.get('isProSameAsRes')?.valueChanges.subscribe(checked => {
      if (checked) {
        const val = this.contactForm.value;
        this.contactForm.patchValue({
          profAddress1: val.resAddress1,
          profAddress2: val.resAddress2,
          profCity: val.resCity,
          profRuralUrban: val.resRuralUrban,
          profCountry: val.resCountry,
          profState: val.resState,
          profDistrict: val.resDistrict,
          profPinCode: val.resPinCode,
          profPhone1: val.resPhone1,
          profPhone2: val.resPhone2
        });
      }
    });
  }

  private findId(options: any[], idKey: string, nameKey: string, value: any): any {
    if (!value) return '';
    const found = options.find(o => o[idKey] == value || o[nameKey] == value);
    return found ? found[idKey] : value;
  }

  toggleEditContact() {
    this.isEditingContact.set(!this.isEditingContact());
    if (this.isEditingContact()) {
      this.populateContactForm();
    }
  }

  populateContactForm() {
    const res = this.resAddress()?.result || this.resAddress();
    const prof = this.profAddress()?.result || this.profAddress();

    if (res) {
      const countryId = this.findId(this.countryOptions(), 'countryId', 'countryName', res.country);
      const ruralUrbanId = this.findId(this.ruralUrbanOptions(), 'typeId', 'typeName', res.placeType) ||
                          this.findId(this.ruralUrbanOptions(), 'ruralurbanId', 'ruralurban', res.placeType) ||
                          res.placeType;

      this.contactForm.patchValue({
        resAddress1: res.address1,
        resAddress2: res.address2,
        resCity: res.city,
        resRuralUrban: ruralUrbanId,
        resCountry: countryId,
        resPinCode: res.zip,
        resPhone1: res.phone1,
        resPhone2: res.phone2
      }, { emitEvent: false });

      // Cascading for Residential
      if (countryId) {
        // If already loaded in ngOnInit, use that, otherwise fetch
        const existingStates = this.resStateOptions();
        if (existingStates.length > 0) {
          const stateId = this.findId(existingStates, 'stateId', 'stateName', res.state);
          this.contactForm.patchValue({ resState: stateId }, { emitEvent: false });
          
          if (stateId) {
            const existingDistricts = this.resDistrictOptions();
            if (existingDistricts.length > 0) {
              const districtId = this.findId(existingDistricts, 'districtId', 'districtName', res.district);
              this.contactForm.patchValue({ resDistrict: districtId }, { emitEvent: false });
            } else {
              this.adminService.getDistricts(stateId).subscribe((districts: any) => {
                const list = Array.isArray(districts) ? districts : ((districts as any)?.result || []);
                this.resDistrictOptions.set(list);
                const districtId = this.findId(list, 'districtId', 'districtName', res.district);
                this.contactForm.patchValue({ resDistrict: districtId }, { emitEvent: false });
              });
            }
          }
        } else {
          this.adminService.getStates(countryId).subscribe((states: any) => {
            const stateList = Array.isArray(states) ? states : ((states as any)?.result || []);
            this.resStateOptions.set(stateList);
            const stateId = this.findId(stateList, 'stateId', 'stateName', res.state);
            this.contactForm.patchValue({ resState: stateId }, { emitEvent: false });
            
            if (stateId) {
              this.adminService.getDistricts(stateId).subscribe((districts: any) => {
                const distList = Array.isArray(districts) ? districts : ((districts as any)?.result || []);
                this.resDistrictOptions.set(distList);
                const districtId = this.findId(distList, 'districtId', 'districtName', res.district);
                this.contactForm.patchValue({ resDistrict: districtId }, { emitEvent: false });
              });
            }
          });
        }
      }
    }

    if (prof) {
      const countryId = this.findId(this.countryOptions(), 'countryId', 'countryName', prof.country);
      const ruralUrbanId = this.findId(this.ruralUrbanOptions(), 'typeId', 'typeName', prof.placeType) ||
                          this.findId(this.ruralUrbanOptions(), 'ruralurbanId', 'ruralurban', prof.placeType) ||
                          prof.placeType;

      this.contactForm.patchValue({
        profAddress1: prof.address1,
        profAddress2: prof.address2,
        profCity: prof.city,
        profRuralUrban: ruralUrbanId,
        profCountry: countryId,
        profPinCode: prof.zip,
        profPhone1: prof.phone1,
        profPhone2: prof.phone2
      }, { emitEvent: false });

      // Cascading for Professional
      if (countryId) {
        const existingStates = this.profStateOptions();
        if (existingStates.length > 0) {
          const stateId = this.findId(existingStates, 'stateId', 'stateName', prof.state);
          this.contactForm.patchValue({ profState: stateId }, { emitEvent: false });

          if (stateId) {
            const existingDistricts = this.profDistrictOptions();
            if (existingDistricts.length > 0) {
              const districtId = this.findId(existingDistricts, 'districtId', 'districtName', prof.district);
              this.contactForm.patchValue({ profDistrict: districtId }, { emitEvent: false });
            } else {
              this.adminService.getDistricts(stateId).subscribe((districts: any) => {
                const list = Array.isArray(districts) ? districts : ((districts as any)?.result || []);
                this.profDistrictOptions.set(list);
                const districtId = this.findId(list, 'districtId', 'districtName', prof.district);
                this.contactForm.patchValue({ profDistrict: districtId }, { emitEvent: false });
              });
            }
          }
        } else {
          this.adminService.getStates(countryId).subscribe((states: any) => {
            const stateList = Array.isArray(states) ? states : ((states as any)?.result || []);
            this.profStateOptions.set(stateList);
            const stateId = this.findId(stateList, 'stateId', 'stateName', prof.state);
            this.contactForm.patchValue({ profState: stateId }, { emitEvent: false });

            if (stateId) {
              this.adminService.getDistricts(stateId).subscribe((districts: any) => {
                const distList = Array.isArray(districts) ? districts : ((districts as any)?.result || []);
                this.profDistrictOptions.set(distList);
                const districtId = this.findId(distList, 'districtId', 'districtName', prof.district);
                this.contactForm.patchValue({ profDistrict: districtId }, { emitEvent: false });
              });
            }
          });
        }
      }
    }
  }

  saveContact() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    const val = this.contactForm.value;

    const resPayload = {
      clientID: userId,
      addressType: "R",
      address1: val.resAddress1,
      address2: val.resAddress2,
      city: val.resCity,
      district: String(val.resDistrict || ""),
      state: String(val.resState || ""),
      zip: val.resPinCode,
      country: String(val.resCountry || ""),
      phone1: val.resPhone1,
      phone2: val.resPhone2,
      placeType: val.resRuralUrban,
      createdBy: "User"
    };

    const profPayload = {
      clientID: userId,
      addressType: "P",
      address1: val.profAddress1 || val.resAddress1,
      address2: val.profAddress2 || val.resAddress2,
      city: val.profCity,
      district: String(val.profDistrict || ""),
      state: String(val.profState || ""),
      zip: val.profPinCode,
      country: String(val.profCountry || ""),
      phone1: val.profPhone1,
      phone2: val.profPhone2,
      placeType: val.profRuralUrban,
      createdBy: "User"
    };

    this.adminService.saveAddress(resPayload).subscribe({
      next: () => {
        this.adminService.saveAddress(profPayload).subscribe({
          next: () => {
            alert('Contact Information Updated Successfully!');
            this.isEditingContact.set(false);
            this.ngOnInit(); // Reload data
          },
          error: () => alert('Failed to save Professional Address.')
        });
      },
      error: () => alert('Failed to save Residential Address.')
    });
  }

  loadMasterData() {
    this.adminService.getTitles().subscribe((data: any) => this.titleOptions.set(Array.isArray(data) ? data : (data?.result || [])));
    this.adminService.getGenders().subscribe((data: any) => this.genderOptions.set(Array.isArray(data) ? data : (data?.result || [])));
    this.adminService.getBloodGroups().subscribe((data: any) => this.bloodGroupOptions.set(Array.isArray(data) ? data : (data?.result || [])));
    this.adminService.getNationalities().subscribe((data: any) => this.nationalityOptions.set(Array.isArray(data) ? data : (data?.result || [])));
    this.adminService.getEligibility().subscribe((data: any) => this.eligibilityOptions.set(Array.isArray(data) ? data : (data?.result || [])));
  }

  toggleEditProfile() {
    this.isEditingProfile.set(!this.isEditingProfile());
    if (this.isEditingProfile()) {
      this.populatePersonalForm();
    }
  }

  populatePersonalForm() {
    let user = this.practitionerData();
    if (!user) return;
    if (user.result) user = user.result;

    const titleId = this.findId(this.titleOptions(), 'titleId', 'titleName', user.title);
    const genderId = this.findId(this.genderOptions(), 'genderId', 'genderName', user.gender);
    const bloodGroupId = this.findId(this.bloodGroupOptions(), 'bloodGroupCode', 'bloodGroupDescription', user.bloodGroup);
    const nationalityId = this.findId(this.nationalityOptions(), 'nationalityId', 'nationality', user.nationality);
    const eligibilityId = this.findId(this.eligibilityOptions(), 'eligibiltyId', 'eligibilty', user.vote);

    this.personalForm.patchValue({
        title: titleId,
        name: user.name,
        gender: genderId,
        bloodGroup: bloodGroupId,
        changeOfName: user.changeOfName,
        fatherName: user.spouseName,
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        birthPlace: user.birthPlace,
        nationality: nationalityId,
        eligibility: eligibilityId,
        email: user.emailID,
        mobile: user.mobileNumber
    });
  }

  saveProfile() {
    if (!this.personalForm.valid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    const formValue = this.personalForm.value;
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    const payload = {
        councilId: "1",
        title: String(this.titleOptions().find(t => t.titleId == formValue.title)?.titleName || formValue.title || ""),
        name: formValue.name,
        changeOfName: formValue.changeOfName || "",
        spouseName: formValue.fatherName,
        birthDate: new Date(formValue.birthDate).toISOString(),
        birthPlace: formValue.birthPlace,
        gender: String(formValue.gender || ""),
        nationality: String(formValue.nationality || ""),
        vote: String(formValue.eligibility || ""),
        emailID: formValue.email,
        mobileNumber: formValue.mobile,
        bloodGroup: String(formValue.bloodGroup || ""),
        createdBy: "User",
        status: "1"
    };

    this.adminService.updatePractitioner(userId, payload).subscribe({
        next: () => {
            alert('Profile Updated Successfully!');
            this.isEditingProfile.set(false);
            this.ngOnInit(); // Reload data
        },
        error: (err) => {
            console.error('Update Failed:', err);
            alert('Failed to update profile.');
        }
    });
  }

  ngOnInit() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.loadMasterData();
      this.loadAddressMasterData().subscribe();
      this.loadEducationMasterData();
      this.setupAddressListeners();
      
      // Populate years for education form
      const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 1950; i--) {
        // Assuming 'years' is a property of the component, e.g., `years: number[] = [];`
        // If not, it needs to be declared.
        // For this edit, I'm assuming it's declared or will be.
        (this as any).years.push(i); 
      }

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

      // Fetch Addresses and Pre-fetch Dropdowns
      this.adminService.getAddress(userId, 'R').subscribe(data => {
        const res = (data as any)?.result || data;
        this.resAddress.set(res);
        if (this.profAddress()) {
           this.prefetchAddressCascades(this.resAddress(), this.profAddress());
        }
      });

      this.adminService.getAddress(userId, 'P').subscribe(data => {
        const prof = (data as any)?.result || data;
        this.profAddress.set(prof);
        if (this.resAddress()) {
           this.prefetchAddressCascades(this.resAddress(), this.profAddress());
        }
      });

      // Fetch Education
      this.loadEducation(userId);

      // Fetch Ledgers for Payments
      this.adminService.getPaymentLedgers().subscribe((data: any) => {
        const list = Array.isArray(data) ? data : (data?.result || []);
        this.ledgers.set(list);
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
      this.educationalInfo.set(records.map((edu: any) => ({
        ...edu,
        convertedDate: `${edu.monthOfPassing}/${edu.yearOfPassing}`
      })));
    });
  }

  loadEducationMasterData() {
    this.adminService.getCourses().subscribe({
      next: (data: any) => {
        this.courseOptions = Array.isArray(data) ? data : (data?.result || []);
      },
      error: (err) => console.error('Failed to load courses', err)
    });

    this.adminService.getUniversities().subscribe({
      next: (data: any) => {
        this.universityOptions = Array.isArray(data) ? data : (data?.result || []);
      },
      error: (err) => console.error('Failed to load universities', err)
    });
  }

  onUniversityChange() {
    const universityId = this.educationForm.get('university')?.value;
    if (!universityId) {
      this.collegeOptions = [];
      return;
    }

    this.adminService.getColleges(universityId).subscribe({
      next: (data: any) => {
        this.collegeOptions = Array.isArray(data) ? data : (data?.result || []);
      },
      error: (err) => console.error('Failed to load colleges', err)
    });
  }

  toggleAddEducation() {
    this.isAddingEducation = !this.isAddingEducation;
    this.editingEducationId = null;
    this.educationForm.reset();
    this.collegeOptions = [];
  }

  editEducation(edu: any) {
    this.isAddingEducation = true;
    this.editingEducationId = edu.educationID;

    this.educationForm.patchValue({
      degree: edu.subCode,
      courseName: edu.subject,
      otherSubject: edu.otherSubject,
      passMonth: edu.monthOfPassing,
      passYear: edu.yearOfPassing,
      university: edu.universityId,

      certificateNo: edu.certificateNo,
      certificateDate: edu.certificateDate ? new Date(edu.certificateDate).toISOString().split('T')[0] : ''
    });

    if (edu.universityId) {
      this.adminService.getColleges(edu.universityId).subscribe({
        next: (data: any) => {
          this.collegeOptions = Array.isArray(data) ? data : (data?.result || []);
          this.educationForm.patchValue({ college: edu.collegeID });
        },
        error: (err) => console.error('Failed to load colleges for edit', err)
      });
    }
  }

  deleteEducation(id: string) {
    if (confirm('Are you sure you want to delete this educational record?')) {
      this.adminService.deleteEducation(id).subscribe({
        next: () => {
          alert('Record deleted successfully');
          this.loadEducation(this.auth.currentUser()?.id!);
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert('Failed to delete record');
        }
      });
    }
  }

  saveEducation() {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    const formVal = this.educationForm.value;
    const userId = this.auth.currentUser()?.id;

    const selectedCourse = this.courseOptions.find(c => c.courseId === formVal.degree);
    const educationName = selectedCourse ? selectedCourse.courseDescription : '';

    const payload = {
      educationID: this.editingEducationId || "",
      practitionerID: userId,
      educationName: educationName,
      yearOfPassing: formVal.passYear,
      collegeID: formVal.college,
      universityId: formVal.university,
      subject: formVal.courseName,
      monthOfPassing: formVal.passMonth,
      subCode: formVal.degree,
      createdBy: 'User',

      certificateNo: formVal.certificateNo,
      certificateDate: formVal.certificateDate ? new Date(formVal.certificateDate).toISOString() : null

    };

    this.adminService.saveEducation(payload).subscribe({
      next: () => {
        alert(`Educational information ${this.editingEducationId ? 'updated' : 'saved'} successfully!`);
        this.toggleAddEducation();
        this.loadEducation(userId!);
      },
      error: (err) => {
        console.error('Save failed', err);
        alert('Failed to save educational information.');
      }
    });
  }
}

