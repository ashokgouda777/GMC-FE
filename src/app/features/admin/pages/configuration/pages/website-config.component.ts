import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { SharedSidebarComponent, SidebarItem } from '../../../../../shared/components/shared-sidebar/shared-sidebar.component';
import { AuthService } from '../../../../../core/services/auth.service';

interface ThemePreset {
  name: string;
  icon: string;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    buttonColor: string;
    sidebarColor: string;
    sidebarText: string;
    sidebarActiveColor: string;
    topbarBg: string;
    navbarBg: string;
    navbarText: string;
    cardBg: string;
    tableHeaderBg: string;
    tableHeaderText: string;
    tableBodyBg: string;
    tableBodyText: string;
    tableBtnColor: string;
  };
}

@Component({
  selector: 'app-website-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedSidebarComponent],
  template: `
    <div class="page-layout local-layout">
      <app-shared-sidebar
        title="Site Settings"
        [items]="sidebarItems"
        (itemClick)="onSidebarClick($event)">
      </app-shared-sidebar>

      <main class="content-area">

        <!-- ===== THEME COLORS SECTION ===== -->
        <div *ngIf="activeSection === 'Colors'">

          <div class="page-header">
            <div>
              <h2>Theme Customization</h2>
              <p class="page-desc">Choose a preset or personalize every color across your portal.</p>
            </div>
            <div class="live-preview" [title]="'Live preview of current colors'">
              <div class="preview-bar" [style.background]="colorForm.get('primaryColor')?.value"></div>
              <div class="preview-bar" [style.background]="colorForm.get('secondaryColor')?.value"></div>
              <div class="preview-bar" [style.background]="colorForm.get('buttonColor')?.value"></div>
              <div class="preview-bar" [style.background]="colorForm.get('sidebarColor')?.value"></div>
              <span class="preview-label">Color Preview</span>
            </div>
          </div>

          <!-- Preset Themes -->
          <div class="form-section">
            <h3><span class="section-icon">🎨</span> Standard Themes</h3>
            <p class="section-desc">Click a preset to instantly apply it to all color settings.</p>
            <div class="presets-grid">
              <div *ngFor="let preset of themePresets"
                   class="preset-card"
                   [class.active-preset]="activePresetName === preset.name"
                   (click)="applyPreset(preset)"
                   [title]="'Apply ' + preset.name">
                <div class="preset-swatch">
                  <div class="swatch-primary" [style.background]="preset.colors.primaryColor"></div>
                  <div class="swatch-secondary" [style.background]="preset.colors.secondaryColor"></div>
                  <div class="swatch-sidebar" [style.background]="preset.colors.sidebarColor"></div>
                  <div class="swatch-btn" [style.background]="preset.colors.buttonColor"></div>
                </div>
                <div class="preset-footer">
                  <span class="preset-icon">{{preset.icon}}</span>
                  <span class="preset-name">{{preset.name}}</span>
                </div>
                <div class="preset-check" *ngIf="activePresetName === preset.name">✓</div>
              </div>
            </div>
          </div>

          <form [formGroup]="colorForm" (ngSubmit)="saveColors()">

            <!-- Brand Identity -->
            <div class="form-section">
              <h3><span class="section-icon">🏷️</span> Brand Identity</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Brand Primary Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('primaryColor')?.value"
                           (input)="onColorPick('primaryColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="primaryColor"
                           class="color-text-input"
                           placeholder="#000000"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('primaryColor')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Brand Accent Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('secondaryColor')?.value"
                           (input)="onColorPick('secondaryColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="secondaryColor"
                           class="color-text-input"
                           placeholder="#000000"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('secondaryColor')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Primary Action Button</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('buttonColor')?.value"
                           (input)="onColorPick('buttonColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="buttonColor"
                           class="color-text-input"
                           placeholder="#000000"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('buttonColor')?.value"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Header Configuration -->
            <div class="form-section">
              <h3><span class="section-icon">🔝</span> Header Configuration</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Top Bar Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('topbarBg')?.value"
                           (input)="onColorPick('topbarBg', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="topbarBg"
                           class="color-text-input"
                           placeholder="#ffffff"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('topbarBg')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Menu Bar Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('navbarBg')?.value"
                           (input)="onColorPick('navbarBg', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="navbarBg"
                           class="color-text-input"
                           placeholder="#0077B6"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('navbarBg')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Menu Bar Text Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('navbarText')?.value"
                           (input)="onColorPick('navbarText', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="navbarText"
                           class="color-text-input"
                           placeholder="#ffffff"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('navbarText')?.value"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Side Navigation -->
            <div class="form-section">
              <h3><span class="section-icon">📋</span> Side Navigation</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Sidebar Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('sidebarColor')?.value"
                           (input)="onColorPick('sidebarColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="sidebarColor"
                           class="color-text-input"
                           placeholder="#ffffff"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('sidebarColor')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Sidebar Text Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('sidebarText')?.value"
                           (input)="onColorPick('sidebarText', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="sidebarText"
                           class="color-text-input"
                           placeholder="#2B3674"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('sidebarText')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Sidebar Active Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('sidebarActiveColor')?.value"
                           (input)="onColorPick('sidebarActiveColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="sidebarActiveColor"
                           class="color-text-input"
                           placeholder="#0077B6"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('sidebarActiveColor')?.value"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content & Global -->
            <div class="form-section">
              <h3><span class="section-icon">🖥️</span> Content &amp; Global</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Global Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('backgroundColor')?.value"
                           (input)="onColorPick('backgroundColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="backgroundColor"
                           class="color-text-input"
                           placeholder="#F4F7FE"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('backgroundColor')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Global Text Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('textColor')?.value"
                           (input)="onColorPick('textColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="textColor"
                           class="color-text-input"
                           placeholder="#333333"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('textColor')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Card Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('cardBg')?.value"
                           (input)="onColorPick('cardBg', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="cardBg"
                           class="color-text-input"
                           placeholder="#FFFFFF"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('cardBg')?.value"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table / Grid -->
            <div class="form-section">
              <h3><span class="section-icon">📊</span> Table / Grid</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Grid Header Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('tableHeaderBg')?.value"
                           (input)="onColorPick('tableHeaderBg', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="tableHeaderBg"
                           class="color-text-input"
                           placeholder="#f4f7fe"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('tableHeaderBg')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Grid Header Text</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('tableHeaderText')?.value"
                           (input)="onColorPick('tableHeaderText', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="tableHeaderText"
                           class="color-text-input"
                           placeholder="#2B3674"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('tableHeaderText')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Grid Body Background</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('tableBodyBg')?.value"
                           (input)="onColorPick('tableBodyBg', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="tableBodyBg"
                           class="color-text-input"
                           placeholder="#FFFFFF"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('tableBodyBg')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Grid Body Text</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('tableBodyText')?.value"
                           (input)="onColorPick('tableBodyText', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="tableBodyText"
                           class="color-text-input"
                           placeholder="#333333"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('tableBodyText')?.value"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Grid Button Color</label>
                  <div class="color-row">
                    <input type="color"
                           [value]="colorForm.get('tableBtnColor')?.value"
                           (input)="onColorPick('tableBtnColor', $event)"
                           class="color-swatch-input">
                    <input type="text"
                           formControlName="tableBtnColor"
                           class="color-text-input"
                           placeholder="#0077B6"
                           maxlength="7">
                    <div class="color-dot" [style.background]="colorForm.get('tableBtnColor')?.value"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Actions Bar -->
            <div class="actions-bar">
              <div class="actions-right">
                <button type="button" class="btn-ghost" (click)="resetTheme()">
                  ↩ Reset Defaults
                </button>
                <button type="button" class="btn-outline-primary" (click)="previewTheme()" [disabled]="colorForm.invalid">
                  👁 Preview
                </button>
                <button type="submit" class="btn-primary" [disabled]="loading || colorForm.invalid">
                  <span *ngIf="!loading">💾 Save Configuration</span>
                  <span *ngIf="loading" class="loading-dots">Saving<span>.</span><span>.</span><span>.</span></span>
                </button>
              </div>
            </div>

          </form>
        </div>

        <!-- ===== GENERAL SECTION ===== -->
        <div *ngIf="activeSection === 'General'">
          <div class="page-header">
            <div>
              <h2>General Information</h2>
              <p class="page-desc">Site name, description, and contact details configuration.</p>
            </div>
          </div>
          <div class="coming-soon-box">
            <div class="coming-soon-icon">⚙️</div>
            <h3>Coming Soon</h3>
            <p>General site settings configuration will be available in the next update.</p>
          </div>
        </div>

        <!-- ===== LOGOS SECTION ===== -->
        <div *ngIf="activeSection === 'Logos'">
          <div class="page-header">
            <div>
              <h2>Logos &amp; Assets</h2>
              <p class="page-desc">Upload and manage logos, favicon, and branding assets.</p>
            </div>
          </div>
          <div class="coming-soon-box">
            <div class="coming-soon-icon">🖼️</div>
            <h3>Coming Soon</h3>
            <p>Logo upload and favicon configuration will be available in the next update.</p>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    @import 'sidebar-layout';

    .local-layout {
      height: 100%;
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
      gap: 16px;
      flex-wrap: wrap;

      h2 {
        margin: 0 0 4px;
        font-size: 1.5rem;
        font-weight: 800;
        color: #2B3674;
      }
    }

    .page-desc {
      color: #A3AED0;
      margin: 0;
      font-size: 0.9rem;
    }

    /* Live Preview Strip */
    .live-preview {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f8f9fc;
      border: 1px solid #e0e5f2;
      border-radius: 12px;
      padding: 8px 14px;
      flex-shrink: 0;

      .preview-bar {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(0,0,0,0.08);
        flex-shrink: 0;
      }

      .preview-label {
        font-size: 0.75rem;
        color: #A3AED0;
        margin-left: 8px;
        white-space: nowrap;
      }
    }

    /* Form Sections */
    .form-section {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid #eef2ff;
      box-shadow: 0 2px 12px rgba(112,144,176,0.07);

      h3 {
        margin: 0 0 4px;
        font-size: 1rem;
        font-weight: 700;
        color: #2B3674;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 14px;
        border-bottom: 1px solid #f0f4ff;
        margin-bottom: 20px;

        .section-icon { font-size: 1.1rem; }
      }
    }

    .section-desc {
      color: #A3AED0;
      font-size: 0.85rem;
      margin: -12px 0 16px;
    }

    /* Preset Themes */
    .presets-grid {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .preset-card {
      width: 110px;
      cursor: pointer;
      border-radius: 14px;
      border: 2px solid #e8edf5;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      background: #fff;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,119,182,0.15);
        border-color: #0077B6;
      }

      &.active-preset {
        border-color: #0077B6;
        box-shadow: 0 0 0 3px rgba(0,119,182,0.18);
      }

      .preset-swatch {
        height: 64px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;

        .swatch-primary  { grid-column: 1; grid-row: 1; }
        .swatch-secondary{ grid-column: 2; grid-row: 1; }
        .swatch-sidebar  { grid-column: 1; grid-row: 2; }
        .swatch-btn      { grid-column: 2; grid-row: 2; }
      }

      .preset-footer {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        background: #fff;

        .preset-icon { font-size: 0.9rem; }
        .preset-name { font-size: 0.78rem; font-weight: 600; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      }

      .preset-check {
        position: absolute;
        top: 4px; right: 6px;
        background: #0077B6;
        color: #fff;
        border-radius: 50%;
        width: 18px; height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 0.83rem;
        font-weight: 600;
        color: #444;
        letter-spacing: 0.2px;
      }
    }

    /* Color Row — picker + text input synced, no duplicate formControlName */
    .color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fc;
      border: 1.5px solid #e0e5f2;
      border-radius: 10px;
      padding: 6px 10px 6px 6px;
      transition: border-color 0.2s;

      &:focus-within {
        border-color: #0077B6;
        box-shadow: 0 0 0 3px rgba(0,119,182,0.1);
      }

      .color-swatch-input {
        width: 40px;
        height: 36px;
        padding: 2px;
        border: 1px solid #ddd;
        border-radius: 7px;
        cursor: pointer;
        background: none;
        flex-shrink: 0;
      }

      .color-text-input {
        flex: 1;
        border: none;
        background: transparent;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        color: #2B3674;
        outline: none;
        text-transform: uppercase;
        min-width: 0;

        &::placeholder { color: #bbb; }
      }

      .color-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.1);
        flex-shrink: 0;
        transition: background 0.2s;
      }
    }

    /* Actions Bar */
    .actions-bar {
      position: sticky;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #fff;
      border-top: 1px solid #eef2ff;
      padding: 16px 24px;
      margin-top: 8px;
      border-radius: 0 0 16px 16px;
      box-shadow: 0 -4px 20px rgba(112,144,176,0.1);
      z-index: 20;

      .actions-left {
        flex: 1;
        min-width: 0;
      }

      .actions-right {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-shrink: 0;
      }
    }

    .save-success {
      color: #05CD99;
      font-size: 0.88rem;
      font-weight: 600;
      animation: fadeIn 0.3s ease;
    }

    .save-error {
      color: #D32F2F;
      font-size: 0.88rem;
      font-weight: 600;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    button {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none !important;
      }
    }

    .btn-ghost {
      background: transparent;
      color: #A3AED0;
      border: 1px solid #e0e5f2;
      &:hover:not(:disabled) { background: #f4f7fe; color: #2B3674; }
    }

    .btn-outline-primary {
      background: transparent;
      border: 1.5px solid #0077B6;
      color: #0077B6;
      &:hover:not(:disabled) { background: rgba(0,119,182,0.06); }
    }

    .btn-primary {
      background: linear-gradient(135deg, #0077B6, #0096C7);
      color: white;
      box-shadow: 0 4px 14px rgba(0,119,182,0.3);
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,119,182,0.35); }
    }

    /* Loading dots animation */
    .loading-dots span {
      animation: blink 1s infinite;
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
    @keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }

    /* Coming Soon */
    .coming-soon-box {
      background: #fff;
      border-radius: 20px;
      padding: 60px 40px;
      text-align: center;
      border: 1px dashed #d0d9f0;

      .coming-soon-icon { font-size: 3.5rem; margin-bottom: 16px; }
      h3 { font-size: 1.4rem; color: #2B3674; margin: 0 0 8px; }
      p  { color: #A3AED0; font-size: 0.95rem; margin: 0; }
    }
  `]
})
export class WebsiteConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  activeSection = 'Colors';
  loading = false;
  activePresetName = '';

  sidebarItems: SidebarItem[] = [
    { label: 'General Info',   action: 'General', active: false },
    { label: 'Theme Colors',   action: 'Colors',  active: true  },
    { label: 'Logos & Assets', action: 'Logos',   active: false }
  ];

  themePresets: ThemePreset[] = [
    {
      name: 'GMC Blue', icon: '🌊',
      colors: {
        primaryColor: '#0077B6', secondaryColor: '#0096C7', textColor: '#2B3674',
        backgroundColor: '#F4F7FE', buttonColor: '#0077B6', sidebarColor: '#FFFFFF',
        sidebarText: '#2B3674', sidebarActiveColor: '#0077B6', topbarBg: '#FFFFFF',
        navbarBg: '#0077B6', navbarText: '#FFFFFF', cardBg: '#FFFFFF',
        tableHeaderBg: '#f4f7fe', tableHeaderText: '#2B3674',
        tableBodyBg: '#FFFFFF', tableBodyText: '#333333', tableBtnColor: '#0077B6'
      }
    },
    {
      name: 'GMC Pink', icon: '🌸',
      colors: {
        primaryColor: '#E91E63', secondaryColor: '#F50057', textColor: '#333333',
        backgroundColor: '#FFF0F6', buttonColor: '#E91E63', sidebarColor: '#FFFFFF',
        sidebarText: '#2B3674', sidebarActiveColor: '#E91E63', topbarBg: '#FFFFFF',
        navbarBg: '#E91E63', navbarText: '#FFFFFF', cardBg: '#FFFFFF',
        tableHeaderBg: '#fce4ec', tableHeaderText: '#880E4F',
        tableBodyBg: '#FFFFFF', tableBodyText: '#333333', tableBtnColor: '#E91E63'
      }
    },
    {
      name: 'Forest', icon: '🌿',
      colors: {
        primaryColor: '#2E7D32', secondaryColor: '#43A047', textColor: '#1B3A1F',
        backgroundColor: '#F1F8E9', buttonColor: '#2E7D32', sidebarColor: '#FFFFFF',
        sidebarText: '#2E7D32', sidebarActiveColor: '#2E7D32', topbarBg: '#FFFFFF',
        navbarBg: '#2E7D32', navbarText: '#FFFFFF', cardBg: '#FFFFFF',
        tableHeaderBg: '#dcedc8', tableHeaderText: '#1b5e20',
        tableBodyBg: '#FFFFFF', tableBodyText: '#333333', tableBtnColor: '#43A047'
      }
    },
    {
      name: 'Dark Mode', icon: '🌙',
      colors: {
        primaryColor: '#BB86FC', secondaryColor: '#03DAC6', textColor: '#E0E0E0',
        backgroundColor: '#121212', buttonColor: '#BB86FC', sidebarColor: '#1E1E1E',
        sidebarText: '#E0E0E0', sidebarActiveColor: '#BB86FC', topbarBg: '#1E1E1E',
        navbarBg: '#2D2D2D', navbarText: '#E0E0E0', cardBg: '#1E1E1E',
        tableHeaderBg: '#2C2C2C', tableHeaderText: '#BB86FC',
        tableBodyBg: '#1E1E1E', tableBodyText: '#E0E0E0', tableBtnColor: '#03DAC6'
      }
    },
    {
      name: 'Sunset', icon: '🌅',
      colors: {
        primaryColor: '#F57C00', secondaryColor: '#FF9800', textColor: '#333333',
        backgroundColor: '#FFF3E0', buttonColor: '#F57C00', sidebarColor: '#FFFFFF',
        sidebarText: '#BF360C', sidebarActiveColor: '#F57C00', topbarBg: '#FFFFFF',
        navbarBg: '#F57C00', navbarText: '#FFFFFF', cardBg: '#FFFFFF',
        tableHeaderBg: '#FFE0B2', tableHeaderText: '#E65100',
        tableBodyBg: '#FFFFFF', tableBodyText: '#333333', tableBtnColor: '#F57C00'
      }
    },
    {
      name: 'Purple', icon: '💜',
      colors: {
        primaryColor: '#6A1B9A', secondaryColor: '#AB47BC', textColor: '#311B92',
        backgroundColor: '#F3E5F5', buttonColor: '#6A1B9A', sidebarColor: '#FFFFFF',
        sidebarText: '#4A148C', sidebarActiveColor: '#6A1B9A', topbarBg: '#FFFFFF',
        navbarBg: '#6A1B9A', navbarText: '#FFFFFF', cardBg: '#FFFFFF',
        tableHeaderBg: '#E1BEE7', tableHeaderText: '#4A148C',
        tableBodyBg: '#FFFFFF', tableBodyText: '#333333', tableBtnColor: '#6A1B9A'
      }
    }
  ];

  colorForm: FormGroup = this.fb.group({
    primaryColor:      ['#0077B6', Validators.required],
    secondaryColor:    ['#0096C7', Validators.required],
    textColor:         ['#2B3674', Validators.required],
    backgroundColor:   ['#F4F7FE', Validators.required],
    buttonColor:       ['#0077B6', Validators.required],
    sidebarColor:      ['#FFFFFF'],
    sidebarText:       ['#2B3674'],
    sidebarActiveColor:['#0077B6'],
    topbarBg:          ['#FFFFFF'],
    navbarBg:          ['#0077B6'],
    navbarText:        ['#FFFFFF'],
    cardBg:            ['#FFFFFF'],
    tableHeaderBg:     ['#f4f7fe'],
    tableHeaderText:   ['#2B3674'],
    tableBodyBg:       ['#FFFFFF'],
    tableBodyText:     ['#333333'],
    tableBtnColor:     ['#0077B6']
  });

  ngOnInit() {
    this.loadSettings();
  }

  /** Called when the native color picker fires — patch form control by controlName */
  onColorPick(controlName: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.colorForm.get(controlName)?.setValue(value, { emitEvent: true });
    this.activePresetName = ''; // deselect preset when manually editing
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.sidebarItems = this.sidebarItems.map(i => ({ ...i, active: i.action === section }));
  }

  onSidebarClick(item: SidebarItem) {
    if (item.action) this.setActiveSection(item.action);
  }

  applyPreset(preset: ThemePreset) {
    this.colorForm.patchValue(preset.colors);
    this.themeService.setTheme(preset.colors);
    this.activePresetName = preset.name;
  }

  loadSettings(applyTheme = false) {
    const currentUser = this.authService.currentUser();
    const userId = currentUser ? currentUser.id : null;
    if (!userId) {
      console.warn('Cannot load settings: User ID not found');
      return;
    }
    this.adminService.getSiteSettings(userId).subscribe({
      next: (data) => {
        if (data) {
          this.colorForm.patchValue(data);
          if (applyTheme) this.themeService.setTheme(data);
        }
      },
      error: (err) => console.error('Failed to load site settings', err)
    });
  }

  previewTheme() {
    if (this.colorForm.valid) {
      this.themeService.setTheme(this.colorForm.value);
    }
  }

  resetTheme() {
    this.loadSettings(true);
    this.activePresetName = '';
  }

  saveColors() {
    if (this.colorForm.invalid) return;

    this.loading = true;

    const currentUser = this.authService.currentUser();
    const userId = currentUser ? currentUser.id : null;
    if (!userId) {
      this.loading = false;
      alert('User session not found. Please log in again.');
      return;
    }

    const payload = { ...this.colorForm.value, userId: String(userId) };

    this.adminService.updateSiteSettings(payload).subscribe({
      next: () => {
        this.themeService.setTheme(this.colorForm.value);
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          alert('✓ Settings saved successfully!');
        }, 100);
      },
      error: (err) => {
        const msg = err.error?.message || err.error?.title || err.message || 'Unknown error occurred';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          alert(`✗ Failed to save settings.\nError: ${msg}`);
        }, 100);
      }
    });
  }
}
