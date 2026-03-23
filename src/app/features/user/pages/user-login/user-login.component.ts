import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="login-header" *ngIf="showHeader">
      <h2>User Login</h2>
      <p>Access your account</p>
    </div>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" type="text" formControlName="username" placeholder="user">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" placeholder="••••••••">
      </div>
      
      <button type="submit" [disabled]="loginForm.invalid || isLoading()">
        <span *ngIf="!isLoading()">Sign In</span>
        <span *ngIf="isLoading()">Verifying...</span>
      </button>
      
      <div class="error-msg" *ngIf="error()">
        {{ error() }}
      </div>
    </form>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    @import '../../../../../styles/mixins';

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
            border-color: $secondary-color;
            box-shadow: 0 0 0 3px rgba($secondary-color, 0.1);
        }
      }
    }

    button {
      @include button-1;
      width: 100%;
      margin-top: $spacing-sm;
    }

    .error-msg {
      margin-top: $spacing-md;
      padding: $spacing-sm;
      background: rgba($error-color, 0.1);
      color: $error-color;
      border-radius: 8px;
      text-align: center;
      font-size: 0.9rem;
    }
  `]
})
export class UserLoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  @Input() showHeader = true;
  isLoading = signal(false);
  error = signal('');

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  // error = ''; // Removed in favor of signal

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const credentials = {
      userName: this.loginForm.get('username')?.value || '',
      password: this.loginForm.get('password')?.value || ''
    };

    this.auth.login(credentials, 'user')
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/user/dashboard']);
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
