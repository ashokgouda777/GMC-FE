import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedHeaderComponent } from '../../../../shared/components/shared-header/shared-header.component';
import { SharedFooterComponent } from '../../../../shared/components/shared-footer/shared-footer.component';
import { UserLoginComponent } from '../../../user/pages/user-login/user-login.component';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, SharedHeaderComponent, SharedFooterComponent, UserLoginComponent],
    styleUrls: ['./landing-page.component.scss'],
    template: `
    <app-shared-header></app-shared-header>

    <main class="landing-content">

        <!-- ========== HERO SECTION ========== -->
        <section class="hero-section">
            <div class="hero-bg">
                <div class="mesh-blob blob-1"></div>
                <div class="mesh-blob blob-2"></div>
                <div class="mesh-blob blob-3"></div>
                <div class="grid-overlay"></div>
            </div>

            <div class="hero-inner">
                <div class="hero-content" data-aos="fade-right">
                    <div class="hero-eyebrow">
                        <span class="eyebrow-dot"></span>
                        Government of Goa — Official Portal
                    </div>
                    <h1 class="hero-title">
                        Goa Medical<br>
                        <span class="title-accent">Council</span>
                    </h1>
                    <p class="hero-desc">
                        A Statutory Body regulating the practice of Modern Scientific System of Medicine in the State of Goa, dedicated to upholding the highest standards of medical practice since 1993.
                    </p>
                    <div class="hero-badges">
                        <div class="hero-badge">
                            <span class="badge-icon">&#x2713;</span>
                            <span>Established 1993</span>
                        </div>
                        <div class="hero-badge">
                            <span class="badge-icon">&#x2713;</span>
                            <span>Statutory Body</span>
                        </div>
                        <div class="hero-badge">
                            <span class="badge-icon">&#x2713;</span>
                            <span>Govt. of Goa</span>
                        </div>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-value">30+</div>
                            <div class="stat-label">Years of Service</div>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <div class="stat-value">1991</div>
                            <div class="stat-label">GMC Act Enacted</div>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <div class="stat-value">Goa</div>
                            <div class="stat-label">State Jurisdiction</div>
                        </div>
                    </div>
                </div>

                <div class="hero-login" data-aos="fade-left">
                    <div class="login-card-glass">
                        <div class="login-card-header">
                            <div class="login-header-icon">&#x1F3E5;</div>
                            <div>
                                <h3>User Portal</h3>
                                <p>Sign in to access your dashboard</p>
                            </div>
                        </div>
                        <app-user-login [showHeader]="false"></app-user-login>
                    </div>
                </div>
            </div>

            <div class="scroll-indicator">
                <span>Scroll to explore</span>
                <div class="scroll-line"></div>
            </div>
        </section>


        <!-- ========== ABOUT SECTION ========== -->
        <section id="about" class="section about-section">
            <div class="container">
                <div class="section-header">
                    <div class="section-tag">Who We Are</div>
                    <h2 class="section-title">About Goa Medical Council</h2>
                    <p class="section-subtitle">
                        Goa Medical Council, a Statutory Body constituted in <strong>July 1993</strong>, as a result of enactment of
                        <strong>Goa Medical Council Act, 1991</strong> by the Government of Goa.
                    </p>
                </div>

            </div>
        </section>

        <!-- ========== QUICK LINKS SECTION ========== -->
        <section id="links" class="section links-section">
            <div class="links-bg-shape"></div>
            <div class="container">
                <div class="section-header light">
                    <div class="section-tag light">Resources</div>
                    <h2 class="section-title light">Quick Links</h2>
                    <p class="section-subtitle light">Access important documents and official resources from Goa Medical Council.</p>
                </div>

                <div class="links-grid">
                    <div class="link-card">
                        <div class="link-card-icon">&#x1F4C4;</div>
                        <h3>Acts &amp; Amendments</h3>
                        <ul>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/Medical_Council_Act_and_Rules.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> GMC Act, 1991
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/GMC_Amendment_Act_2005.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> GMC Amendment Act, 2005
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/IMA-Professional-Conduct-Etiquette-Etthics.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Professional Conduct
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-card">
                        <div class="link-card-icon">&#x1F393;</div>
                        <h3>Accreditation (CME)</h3>
                        <ul>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/CME_Giudelines_of_Goa_Medical_Council.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> CME Guidelines
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/cme-proforma.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> CME Proforma
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/circular.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> CME Circular
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdfUpload/upcoming_cme_programs.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Upcoming CME Programs
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-card">
                        <div class="link-card-icon">&#x2139;&#xFE0F;</div>
                        <h3>Information Desk</h3>
                        <ul>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/application-forms.html" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Download Application Forms
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdf/Guidelines-for-Prescription.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Guidelines for Prescription
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdfUpload/guidelines_for_registration_NMR.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> NMR Registration Guidelines
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/pdfUpload/fmg_crmi_internship.pdf" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> FMG CRMI Internship
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-card">
                        <div class="link-card-icon">&#x1F465;</div>
                        <h3>About &amp; Governance</h3>
                        <ul>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/introduction.html" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Introduction
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/council-members.html" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Present Governing Council
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/office-bearers.html" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Office Bearers
                                </a>
                            </li>
                            <li>
                                <a href="https://www.goamedicalcouncil.com/gallery.html" target="_blank" rel="noopener">
                                    <span class="link-arrow">&#x279C;</span> Gallery
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========== CONTACT SECTION ========== -->
        <section id="contact" class="section contact-section">
            <div class="container">
                <div class="section-header">
                    <div class="section-tag">Get In Touch</div>
                    <h2 class="section-title">Contact Us</h2>
                    <p class="section-subtitle">
                        Please feel free to write to us. We will be happy to listen to you!
                    </p>
                </div>

                <div class="contact-layout">
                    <!-- Contact Form -->
                    <div class="contact-form-card">
                        <h3 class="form-card-title">Send a Message</h3>
                        <form class="contact-form">
                            <div class="form-row">
                                <div class="form-field">
                                    <label>Full Name <span class="req">*</span></label>
                                    <div class="input-wrap">
                                        <span class="input-icon">&#x1F464;</span>
                                        <input type="text" placeholder="Your full name">
                                    </div>
                                </div>
                                <div class="form-field">
                                    <label>Mobile No. <span class="req">*</span></label>
                                    <div class="input-wrap">
                                        <span class="input-icon">&#x1F4DE;</span>
                                        <input type="tel" placeholder="Your mobile number">
                                    </div>
                                </div>
                            </div>
                            <div class="form-field">
                                <label>Email Address <span class="req">*</span></label>
                                <div class="input-wrap">
                                    <span class="input-icon">&#x2709;&#xFE0F;</span>
                                    <input type="email" placeholder="Your email address">
                                </div>
                            </div>
                            <div class="form-field">
                                <label>Subject <span class="req">*</span></label>
                                <div class="input-wrap">
                                    <span class="input-icon">&#x1F4CB;</span>
                                    <input type="text" placeholder="Message subject">
                                </div>
                            </div>
                            <div class="form-field">
                                <label>Comments <span class="req">*</span></label>
                                <textarea rows="4" placeholder="Write your message here..."></textarea>
                            </div>
                            <button type="submit" class="btn-send">
                                <span>Send Message</span>
                                <span class="btn-icon">&#x27A4;</span>
                            </button>
                        </form>
                    </div>

                    <!-- Info & Map -->
                    <div class="contact-info-col">
                        <div class="info-cards">
                            <div class="info-card">
                                <div class="info-card-icon">&#x1F4CD;</div>
                                <div class="info-card-body">
                                    <h4>Mailing Address</h4>
                                    <p>NH 17, Bambolim, Tiswadi,<br>Goa &ndash; 403 202</p>
                                </div>
                            </div>
                            <div class="info-card">
                                <div class="info-card-icon">&#x2709;&#xFE0F;</div>
                                <div class="info-card-body">
                                    <h4>Email</h4>
                                    <p><a href="mailto:goamedcouncil@rediffmail.com">goamedcouncil&#64;rediffmail.com</a></p>
                                </div>
                            </div>
                            <div class="info-card">
                                <div class="info-card-icon">&#x1F4F1;</div>
                                <div class="info-card-body">
                                    <h4>Contact No.</h4>
                                    <p><a href="tel:9975208199">+91 99752 08199</a></p>
                                </div>
                            </div>
                            <div class="info-card">
                                <div class="info-card-icon">&#x1F570;&#xFE0F;</div>
                                <div class="info-card-body">
                                    <h4>Working Hours</h4>
                                    <p>Mon &ndash; Sat<br>10:00 AM &ndash; 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                        <div class="map-card">
                            <div class="map-label">&#x1F4CC; Bambolim, Goa</div>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3847.7066066038714!2d73.86339247595327!3d15.461892785185715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfb150b2e4b5e5%3A0x4e51a3e9b7d98a4f!2sNH%2017%2C%20Bambolim%2C%20Goa%20403202!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                                width="100%" height="200"
                                style="border:0; border-radius: 12px; display: block;"
                                allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <app-shared-footer></app-shared-footer>
    `
})
export class LandingPageComponent implements OnInit, OnDestroy {
    ngOnInit() {
    }

    ngOnDestroy() {
    }
}
