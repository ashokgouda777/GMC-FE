import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-header">
        <h2>Admin Portal</h2>
        <p>Secure Access</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" type="text" formControlName="username" placeholder="Enter admin username">
          <div *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid" class="validation-error">
            Username is required
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" placeholder="Enter password">
          <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="validation-error">
            Password is required
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading()">
          <span *ngIf="!isLoading()">Sign In</span>
          <span *ngIf="isLoading()">Verifying...</span>
        </button>

        <div class="error-msg" *ngIf="error()">
          {{ error() }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    @import '../../../../../styles/mixins';

    .login-container {
      /* Reset container styles if needed or reuse layout if global */
    }

    .login-header {
      text-align: center;
      margin-bottom: $spacing-md;

      h2 {
        font-size: 1.5rem;
        margin-bottom: $spacing-xs;
      }
      p {
        color: $text-secondary;
        font-size: 0.9rem;
      }
    }

    .form-group {
      margin-bottom: $spacing-md;
      
      label {
        display: block;
        margin-bottom: $spacing-xs;
        font-weight: 500;
        font-size: 0.9rem;
        color: $text-color;
      }
      
      input {
        @include modern-input;
        &:focus {
            border-color: $primary-color;
            box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
        }
      }

      .validation-error {
        color: $error-color;
        font-size: 0.8rem;
        margin-top: 4px;
      }
    }

    button {
      @include button-1;
      width: 100%;
      margin-top: $spacing-sm;
    }
  `]
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Modern Angular: using signals for state
  isLoading = signal(false);
  error = signal<string>('');

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const credentials = {
      userName: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? ''
    };

    console.log('Attempting Admin Login with payload (Angular 21):', credentials);

    this.auth.login(credentials, 'admin')
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (user) => {
          if (user.roleId === 1 || user.roleId === 3) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.error.set('Access Denied: You do not have permission to access the Admin Portal.');
            this.auth.logout(); // Determine if we should logout if they don't have access
          }
        },
        error: (err) => {
          console.error('Login error:', err);

          let errorString = '';
          try {
            errorString = typeof err.error === 'string' ? err.error : JSON.stringify(err.error || '');
          } catch (e) {
            errorString = 'Unknown error';
          }

          if (errorString.toLowerCase().includes('invalid username or password')) {
            this.error.set('Invalid username or password');
          } else if (err.status === 401) {
            this.error.set('Invalid credentials');
          } else {
            this.error.set('Login failed. Please try again.');
          }
        }
      });
  }
}
