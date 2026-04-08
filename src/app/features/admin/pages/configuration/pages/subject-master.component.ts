import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectMasterService } from './subject-master.service';
import { SubjectMaster } from './subject-master.model';

@Component({
  selector: 'app-subject-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Subject Master</h2>
            <div class="actions">
                <input type="text" placeholder="Search Subjects..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New Subject</button>
            </div>
        </div>



        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Subject Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let subject of filteredSubjects">
                        <td>{{ subject.subjectName }}</td>
                        <td>
                            <span class="status-badge" [class.active]="subject.activeStatus === 'Active'">
                                {{ subject.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary btn-sm" (click)="openEditView(subject)" title="Edit">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredSubjects.length === 0">
                        <td colspan="3" class="no-data">No subjects found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit Subject' : 'Add New Subject' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="subjectForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Subject Name <span class="required">*</span></label>
                            <input type="text" formControlName="subjectName" placeholder="Enter Subject Name">
                        </div>
                        <div class="form-group">
                            <label>Short Code <span class="required">*</span></label>
                            <input type="text" formControlName="shortCode" placeholder="Enter Short Code">
                        </div>
                        <div class="form-group">
                            <label>Course <span class="required">*</span></label>
                            <select formControlName="courseId">
                                <option value="">Select Course</option>
                                <option *ngFor="let course of courseOptions" [value]="course.courseId">{{ course.courseName }}</option>
                            </select>
                        </div>
                        <div class="form-group" *ngIf="isEditing">
                            <label>Status <span class="required">*</span></label>
                            <select formControlName="status">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="subjectForm.invalid">
                            {{ isEditing ? 'Update Subject' : 'Save Subject' }}
                        </button>
                        <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; background: var(--bg-color); min-height: 100%; font-family: var(--font-family, 'Poppins', sans-serif); }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-actions h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-color); }
    .actions { display: flex; gap: 0.75rem; }
    .search-box { padding: 0.625rem 1rem; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--text-color); border-radius: 0.5rem; width: 17.5rem; font-size: 0.9rem; transition: all 0.2s; }
    .search-box:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 0.1875rem rgba(var(--primary-color), 0.1); }

    .filter-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
    .filter-select { padding: 0.625rem 0.875rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.5rem; background: var(--card-bg); color: var(--text-color); min-width: 15.625rem; font-size: 0.95rem; }
    .records-info { color: #ef4444; font-style: italic; font-size: 0.9rem; }

    .table-container { background: var(--card-bg); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: var(--table-header-bg); padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: var(--table-header-text); text-transform: uppercase; letter-spacing: 0.025em; }
    .data-table td { padding: 1rem; border-top: 1px solid rgba(0,0,0,0.05); color: var(--table-body-text); font-size: 0.95rem; }

    .status-badge { display: inline-flex; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #fee2e2; color: #991b1b; }
    .status-badge.active { background: #dcfce7; color: #166534; }

    .btn-primary { background: var(--button-color); color: #ffffff; border: none; padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.9); }
    .btn-primary.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .edit-page-view { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .card { background: var(--card-bg); border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem; }
    .form-container { max-width: 50rem; margin: 0 auto; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-weight: 600; font-size: 0.875rem; color: var(--text-color); }
    .form-group input, .form-group select { padding: 0.625rem 0.875rem; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--table-body-text); border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1); }
    .required { color: #ef4444; }

    .form-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.05); }

    .btn-secondary { background: var(--bg-color); color: var(--text-color); border: 1px solid rgba(0,0,0,0.1); padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: rgba(0,0,0,0.05); }

    .action-buttons { display: flex; gap: 0.75rem; }
    .no-data { text-align: center; padding: 3rem !important; color: var(--text-color); opacity: 0.6; font-style: italic; }
  `]
})
export class SubjectMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subjectService = inject(SubjectMasterService);
  private cdr = inject(ChangeDetectorRef);

  subjects: SubjectMaster[] = [];
  filteredSubjects: SubjectMaster[] = [];
  courseOptions: any[] = [];

  showEditView = false;
  isEditing = false;
  selectedSubject: SubjectMaster | null = null;
  selectedCourseFilter = '';

  subjectForm = this.fb.group({
    shortCode: ['', Validators.required],
    subjectName: ['', Validators.required],
    courseId: ['', Validators.required],
    status: ['Active', Validators.required]
  });

  ngOnInit() {
    this.loadCourseOptions();
    this.loadSubjects();
  }

  loadCourseOptions() {
    this.subjectService.getCourses().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || response.result || []);
        this.courseOptions = data.map((item: any) => {
          const idKey = Object.keys(item).find(k => k.toLowerCase() === 'courseid' || k.toLowerCase().endsWith('id')) || 'courseId';
          return {
            courseId: item[idKey] || item.id || item.Id || item.course_id || '',
            courseName: item.courseName || item.courseDescription || item.CourseDescription || item.name || ''
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading course options', err)
    });
  }

  loadSubjects() {
    this.subjectService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || response.result || []);
        this.subjects = data.map((item: any) => ({
          subjectId: item.subjectId || item.id || '',
          sub_code: item.sub_code || '',
          shortCode: item.shortCode || '',
          subjectName: item.sub_name || item.subjectName || item.subjectDescription || '',
          courseId: item.courseId || '',
          courseName: item.courseName || '',
          status: item.activeStatus || '',
          activeStatus: item.activeStatus === 'A' ? 'Active' : 'Inactive'
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading subjects', err);
        this.subjects = [];
        this.filteredSubjects = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let result = [...this.subjects];
    if (this.selectedCourseFilter) {
      result = result.filter(s => s.courseId == this.selectedCourseFilter);
    }
    this.filteredSubjects = result;
    this.cdr.detectChanges();
  }

  onCourseFilter(event: any) {
    this.selectedCourseFilter = event.target.value;
    this.applyFilters();
  }

  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSubjects = this.subjects.filter(s =>
      (s.subjectName && s.subjectName.toLowerCase().includes(query)) ||
      (s.courseName && s.courseName.toLowerCase().includes(query))
    ).filter(s => !this.selectedCourseFilter || s.courseId == this.selectedCourseFilter);
    this.cdr.detectChanges();
  }

  openAddView() {
    this.isEditing = false;
    this.selectedSubject = null;
    this.subjectForm.reset({ 
        status: 'Active', 
        shortCode: '',
        subjectName: '', 
        courseId: this.selectedCourseFilter || '' 
    });
    this.showEditView = true;
  }

  openEditView(subject: SubjectMaster) {
    this.isEditing = true;
    this.selectedSubject = subject;
    this.subjectForm.patchValue({
      shortCode: subject.shortCode || '',
      subjectName: subject.subjectName,
      courseId: subject.courseId,
      status: subject.activeStatus
    });
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
    this.subjectForm.reset();
  }

  onSubmit() {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const v: any = this.subjectForm.value;
    const payload = {
      sub_code: this.isEditing ? (this.selectedSubject?.sub_code || '') : "0",
      sub_name: v.subjectName,
      createdBy: "admin",
      updatedBy: this.isEditing ? "admin" : null,
      shortCode: v.shortCode,
      courseId: v.courseId,
      activeStatus: v.status === 'Active' ? 'A' : 'I'
    };

    this.subjectService.save(payload).subscribe({
      next: () => {
        alert(`Subject ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadSubjects();
        this.showEditView = false;
      },
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}
