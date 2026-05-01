<template>
  <div class="doc-page">
    <div class="doc-container">

      <div class="hero-header text-center mb-5">
        <div class="hero-badge">📜 LEGAL</div>
        <h1 class="hero-title">Privacy Policy</h1>
        <p class="hero-subtitle text-muted">Effective Date: April 1, 2026</p>
      </div>

      <div class="glass-card">
        <div class="card-glow"></div>
        <div class="doc-content">
          <p class="lead">At Transcendence, we value your privacy. This policy explains what data we collect, how we use it, and what rights you have when using our services.</p>

          <div class="doc-section">
            <h2><span class="icon">🔍</span> Information We Collect</h2>
            <ul>
              <li>Name and email address (during registration)</li>
              <li>Password (stored securely using encryption)</li>
              <li>Focus duration, task activity, and productivity data</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🛠️</span> How We Use Your Data</h2>
            <ul>
              <li>Personalize your user experience</li>
              <li>Generate productivity reports and analytics</li>
              <li>Ensure account security</li>
              <li>Send important product-related email updates</li>
              <li>Occasionally deliver productivity tips or feature announcements</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">📧</span> Email Communications</h2>
            <p>By signing up, you agree to receive essential email updates about the product.</p>
            <p>If you do not wish to receive productivity tips or announcement emails, please send an email to <strong>transcendence@gmail.com</strong> with the subject line <strong>unsubscribe</strong>. Your request will be processed as soon as possible.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🤝</span> Data Sharing</h2>
            <p>Transcendence does not share your data with any third parties.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🛡️</span> Security</h2>
            <p>Passwords are stored using secure hashing algorithms. We prioritize the protection of your data.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🔄</span> Changes to This Privacy Policy</h2>
            <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.</p>
            <p>If you have any questions about this privacy policy, please contact us at <strong>transcendence@gmail.com</strong>.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">⚖️</span> Your Rights</h2>
            <ul>
              <li>You may request access to your data</li>
              <li>You may delete your account and request permanent removal of your data</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">✅</span> Acceptance of This Policy</h2>
            <p>By registering for Transcendence, you acknowledge that you have read, understood, and agreed to this Privacy Policy.</p>
          </div>
        </div>
      </div>

      <div class="mt-5 pb-5">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
import Footer from "@/components/Footer.vue";
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.doc-page {
  flex: 1;
  width: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.doc-container {
  width: 100%;
  max-width: 800px;
}

/* ─── Hero Header ────────────────────────────────────────── */
.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
}

/* ─── Glass Card ─────────────────────────────────────────── */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 70%);
  pointer-events: none;
}

/* ─── Document Content ───────────────────────────────────── */
.doc-content {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
}

.lead {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

.doc-section {
  margin-bottom: 2.5rem;
}

.doc-section h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doc-section ul {
  padding-left: 1.5rem;
}

.doc-section li {
  margin-bottom: 0.5rem;
}

.icon {
  font-size: 1.25rem;
}

strong {
  color: #818cf8;
}
</style>
