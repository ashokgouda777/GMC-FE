import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseListService } from './course-list.service';
import { CourseList } from './course-list.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Course List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Courses..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New Course</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Sl. No</th>
                        <th>Course Name</th>
                        <th>Shortcut Code</th>
                        <th>Nomenclature</th>
                        <th>Addl. Degree</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let course of filteredCourses; let i = index">
                        <td>{{ i + 1 }}</td>
                        <td>{{ course.courseName }}</td>
                        <td>{{ course.shortcutCode }}</td>
                        <td>{{ course.nomenclature }}</td>
                        <td>{{ course.additionalDegree }}</td>
                        <td>
                            <span class="status-badge" [class.active]="course.activeStatus === 'Active'">
                                {{ course.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(course)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredCourses.length === 0">
                        <td colspan="7" class="no-data">No courses found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit Course' : 'Add New Course' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Course Name <span class="required">*</span></label>
                            <input type="text" formControlName="courseName" placeholder="Enter Course Name">
                        </div>
                        <div class="form-group">
                            <label>Course Shortcut Code <span class="required">*</span></label>
                            <input type="text" formControlName="shortcutCode" placeholder="Enter Shortcut Code">
                        </div>
                        <div class="form-group">
                            <label>Course Nomenclature <span class="required">*</span></label>
                            <input type="text" formControlName="nomenclature" placeholder="Enter Nomenclature">
                        </div>
                        <div class="form-group">
                            <label>Additional Degree Status</label>
                            <select formControlName="additionalDegree">
                                <option [value]="null">Select Status</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div class="form-group" *ngIf="isEditing">
                            <label>Status</label>
                            <select formControlName="status">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="validation-msg" *ngIf="courseForm.invalid && (courseForm.dirty || courseForm.touched)">
                        <span class="required">* All fields are required.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="courseForm.invalid">
                            {{ isEditing ? 'Update Course' : 'Save Course' }}
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
.page-container { padding: 24px; background: #f8fafc; min-height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
.header-actions h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.actions { display: flex; gap: 12px; }
.search-box { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; width: 300px; font-size: 0.9rem; }
.table-container { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8fafc; padding: 16px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.data-table td { padding: 16px; border-top: 1px solid #f1f5f9; color: #334155; }
.status-badge { display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge:not(.active) { background: #fee2e2; color: #991b1b; }

.card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; max-width: 600px; margin: 0 auto; }
.form-grid { display: grid; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: #334155; }
.form-group input, .form-group select { padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; background: #ffffff; color: #1e293b; }
.form-group input:focus, .form-group select:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.required { color: #ef4444; }

.form-footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.action-buttons { display: flex; gap: 16px; }

.btn-primary { background: #2563eb; color: #ffffff; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #e2e8f0; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f8fafc; }

.no-data { text-align: center; padding: 64px !important; color: #94a3b8; font-style: italic; }
  `]
})
export class CourseListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseListService);
  private cdr = inject(ChangeDetectorRef);

  courses: CourseList[] = [];
  filteredCourses: CourseList[] = [];

  showEditView = false;
  isEditing = false;
  selectedCourse: CourseList | null = null;

  courseForm = this.fb.group({
    courseName: ['', Validators.required],
    shortcutCode: ['', Validators.required],
    nomenclature: ['', Validators.required],
    additionalDegree: [null as string | null],
    status: ['Active', Validators.required]
  });

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getAll().subscribe({
      next: (response: any) => {
        console.log('Courses API Raw Response:', response);
        const data = Array.isArray(response) ? response : (response.data || []);
        this.courses = data.map((item: any) => {
          // Aggressively search for any field that might be an ID
          const idKey = Object.keys(item).find(k => k.toLowerCase().endsWith('id')) || 'courseId';
          const mapped = {
            courseId: item[idKey] || item.id || item.Id || item.course_id || '',
            courseName: item.courseName || item.courseDescription || item.CourseDescription || '',
            shortcutCode: item.shortcutCode || item.courseShortCode || item.CourseShortCode || '',
            nomenclature: item.nomenclature || item.courseNomeclature || item.CourseNomeclature || '',
            additionalDegree: item.additionalDegree || null,
            status: item.status || 'Active',
            activeStatus: (item.status === 'Active' || item.status === 'A') ? 'Active' : 'Inactive'
          };
          console.log(`Mapped Item (ID Key: ${idKey}):`, mapped);
          return mapped;
        });
        this.filteredCourses = [...this.courses];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading courses', err)
    });
  }



  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCourses = this.courses.filter(c =>
      c.courseName.toLowerCase().includes(query) ||
      c.shortcutCode.toLowerCase().includes(query) ||
      c.nomenclature.toLowerCase().includes(query)
    );
  }

  openAddView() {
    this.isEditing = false;
    this.selectedCourse = null;
    this.courseForm.reset({ status: 'Active', courseName: '', shortcutCode: '', nomenclature: '', additionalDegree: null });
    this.showEditView = true;
  }

  openEditView(course: CourseList) {
    this.isEditing = true;
    this.selectedCourse = course;
    this.courseForm.patchValue({
      courseName: course.courseName,
      shortcutCode: course.shortcutCode,
      nomenclature: course.nomenclature,
      additionalDegree: course.additionalDegree,
      status: course.status
    });
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const v: any = this.courseForm.value;
    const payload = {
      CourseId: this.isEditing ? this.selectedCourse?.courseId : '',
      CourseDescription: v.courseName,
      CourseShortCode: v.shortcutCode,
      CourseNomeclature: v.nomenclature,
      AdditionalDegree: v.additionalDegree,
      Status: v.status === 'Active' ? 'A' : 'D',
      CreatedBy: 'Admin'
    };

    console.log('Form values:', v);
    console.log('Saving Course Payload:', payload);

    this.courseService.save(payload).subscribe({
      next: () => {
        alert(`Course ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadCourses();
        this.showEditView = false;
      },
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}

