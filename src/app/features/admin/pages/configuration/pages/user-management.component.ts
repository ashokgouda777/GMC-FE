import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  showForm = false;
  isEditing = false;
  selectedUserId: any = null;

  users: any[] = [];
  filteredUsers: any[] = [];
  roles: any[] = [];

  userForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    role: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    status: ['Active', Validators.required]
  });

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading roles', err);
        this.roles = [
          { role_id: "1", role_desc: "Admin" },
          { role_id: "2", role_desc: "User" }
        ];
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers() {
    console.log('Loading users...');
    this.adminService.getUsers().subscribe({
      next: (data: any) => {
        console.log('Users data received:', data);
        if (Array.isArray(data)) {
          this.users = data;
        } else if (data && Array.isArray(data.result)) {
          this.users = data.result;
        } else {
          this.users = [];
        }
        this.filteredUsers = [...this.users];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.users = [
          { name: 'John Doe', roleName: 'Admin', emailId: 'john@example.com', mobileNumber: '1234567890', active: true }
        ];
        this.filteredUsers = [...this.users];
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.userForm.reset({ status: 'Active' });
      this.isEditing = false;
      this.selectedUserId = null;
    }
  }

  onEdit(user: any) {
    this.isEditing = true;
    this.selectedUserId = user.userId;
    this.showForm = true;

    // Try to find role ID by name
    const foundRole = this.roles.find(r => r.role_desc.toLowerCase() === (user.roleName || '').toLowerCase());
    const roleId = foundRole ? foundRole.role_id : '';

    this.userForm.patchValue({
      name: user.name,
      role: roleId,
      email: user.emailId,
      mobile: user.mobileNumber,
      status: user.active ? 'Active' : 'Inactive',
      password: '',
      confirmPassword: ''
    });

    // Remove password validators if editing? Keeping for now as user might want to change it.
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.emailId && u.emailId.toLowerCase().includes(query)) ||
      (u.roleName && u.roleName.toLowerCase().includes(query))
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      const formValue = this.userForm.value;
      const selectedRoleId = Number(formValue.role);
      const selectedRole = this.roles.find(r => Number(r.role_id) === selectedRoleId);
      const roleName = selectedRole ? selectedRole.role_desc : '';

      const payload = {
        countryId: 0,
        stateId: 0,
        councilId: 0,
        name: formValue.name,
        mobileNumber: formValue.mobile,
        emailId: formValue.email,
        password: formValue.password,
        roleName: roleName,
        roleId: selectedRoleId,
        createdBy: "Admin"
      };

      if (this.isEditing) {
        console.log('Updating user:', this.selectedUserId, payload);
        // Assuming update API exists or just logging for now
        alert('Update functionality not yet connected to backend. Payload ready.');
        // Implement update call here when API is available
        this.toggleForm();
        return;
      }

      console.log('Submitting Payload:', payload);
      this.adminService.createUser(payload).subscribe({
        next: (res) => {
          alert('User created successfully!');
          this.toggleForm();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Full Error:', err);

          let message = 'Something went wrong';

          if (err.error) {
            // API returned plain text
            if (typeof err.error === 'string') {
              message = err.error;
            }
            // API returned JSON
            else if (err.error.message) {
              message = err.error.message;
            }
          }

          alert(message);
        }
      });
    }
  }
}
