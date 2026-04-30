<template>
  <div class="game-footer">
    <div class="footer-card">
      <div class="card-glow"></div>
      <div class="row g-4">
        <!-- Contact Section -->
        <div class="col-12 col-md-4 text-center text-md-start">
          <h4 class="footer-title">Contact Us</h4>
          <div class="footer-info">
            <p>Created by <span class="highlight">42 Students</span></p>
            <p class="copyright">© 2026 Transcendence. All rights reserved.</p>
            <p class="version">v0.0.1 Beta</p>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-12 col-md-4 text-center">
          <h4 class="footer-title">Quick Links</h4>
          <nav class="footer-nav">
            <router-link to="/login" class="footer-link">Login</router-link>
            <router-link to="/sign_up" class="footer-link">Register</router-link>
            <router-link to="/privacy_policy" class="footer-link">Privacy Policy</router-link>
            <router-link to="/terms_of_service" class="footer-link">Terms of Service</router-link>
          </nav>
        </div>

        <!-- Get in Touch -->
        <div class="col-12 col-md-4 text-center text-md-end">
          <h4 class="footer-title">Get in Touch</h4>
          <a href="mailto:transcendence@gmail.com" class="email-link">transcendence@gmail.com</a>
        </div>
      </div>

      <hr class="footer-divider" />

      <div class="footer-motto text-center">
        <span class="motto-icon">✨</span>
        <span class="motto-text">Each day I improve</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-footer {
  width: 100%;
}

.footer-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.1), transparent 70%);
  pointer-events: none;
}

.footer-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
}

.footer-info p {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.highlight {
  color: #818cf8;
  font-weight: 700;
}

.copyright {
  font-size: 0.8rem !important;
}

.version {
  font-size: 0.75rem !important;
  opacity: 0.5;
}

/* Nav Links */
.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: #818cf8;
  transform: translateX(5px);
}

.email-link {
  color: #818cf8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.email-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}

.footer-divider {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 2rem 0;
}

.footer-motto {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

.motto-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}
</style>
