<template>
  <div class="doc-page">
    <div class="doc-container">

      <div class="hero-header text-center mb-5">
        <div class="hero-badge">⚖️ LEGAL</div>
        <h1 class="hero-title">Terms of Service</h1>
        <p class="hero-subtitle text-muted">Effective Date: April 28, 2026</p>
      </div>

      <div class="glass-card">
        <div class="card-glow"></div>
        <div class="doc-content">
          <p class="lead">Welcome to Transcendence, a real-time multiplayer trivia platform. By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.</p>

          <div class="doc-section">
            <h2><span class="icon">📜</span> Acceptance of Terms</h2>
            <p>By creating an account or using Transcendence, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🎮</span> Description of Service</h2>
            <p>Transcendence is a web-based trivia platform that allows users to participate in real-time multiplayer trivia games, tournaments, and related activities. Our service includes matchmaking, leaderboards, achievements, and analytics features.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">👤</span> User Accounts</h2>
            <ul>
              <li>You must be at least 13 years old to use our service</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🚫</span> Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Share inappropriate, offensive, or copyrighted content without permission</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use bots, scripts, or automated tools to interact with the service</li>
              <li>Impersonate other users or entities</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">💡</span> Content and Intellectual Property</h2>
            <ul>
              <li>All content provided by Transcendence (questions, graphics, etc.) is owned by us or our licensors</li>
              <li>You retain ownership of content you create or upload</li>
              <li>By uploading content, you grant us a license to use it for service operation</li>
              <li>You agree not to upload copyrighted material without permission</li>
            </ul>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🛑</span> Termination</h2>
            <p>We reserve the right to terminate or suspend your account at any time for violations of these Terms. You may also terminate your account at any time.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">⚠️</span> Disclaimers</h2>
            <p>The service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service or accuracy of content.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">📉</span> Limitation of Liability</h2>
            <p>Transcendence shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">🔄</span> Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the service after changes constitutes acceptance of the new Terms.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">📩</span> Contact Information</h2>
            <p>If you have questions about these Terms, please contact us at <strong>transcendence@gmail.com</strong>.</p>
          </div>

          <div class="doc-section">
            <h2><span class="icon">⚖️</span> Governing Law</h2>
            <p>These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>
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
