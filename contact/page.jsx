import './contact.css';

const PHONE = '+919500145832';
const DISPLAY_PHONE = '+91 9500145832';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi Pranav, I would like to know more about RouteProspect.');

export default function ContactPage() {
  return (
    <main className="contact-page">
      <nav className="nav contact-nav">
        <a className="brand brand-link" href="/">
          <img src="/routeprospect-mark.svg" alt="RouteProspect" width="38" height="38" />
          <span>RouteProspect</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link signin-link" href="/signin">Sign in</a>
        </div>
      </nav>

      <section className="contact-shell">
        <div className="contact-intro">
          <div className="eyebrow">CONTACT ROUTEPROSPECT</div>
          <h1>Have a question? <em>Let's talk.</em></h1>
          <p>Want to see RouteProspect in action, discuss Pro access, or share feedback? Reach out directly.</p>
        </div>

        <div className="contact-grid">
          <a className="contact-card" href={`mailto:j.pranav9@gmail.com`}>
            <span className="contact-icon">✉</span>
            <div><span className="contact-label">EMAIL</span><strong>j.pranav9@gmail.com</strong><p>For demos, Pro access and product questions.</p></div>
            <span className="contact-arrow">↗</span>
          </a>
          <a className="contact-card" href={`tel:${PHONE}`}>
            <span className="contact-icon">☎</span>
            <div><span className="contact-label">PHONE</span><strong>{DISPLAY_PHONE}</strong><p>Call when you want to speak directly.</p></div>
            <span className="contact-arrow">↗</span>
          </a>
          <a className="contact-card whatsapp-card" href={`https://wa.me/${PHONE}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noreferrer">
            <span className="contact-icon">W</span>
            <div><span className="contact-label">WHATSAPP</span><strong>Chat on WhatsApp</strong><p>Quickest way to ask a question or request a demo.</p></div>
            <span className="contact-arrow">↗</span>
          </a>
        </div>

        <div className="contact-note">
          <span>ROUTEPROSPECT</span>
          <p>Find the right people at the right accounts.</p>
        </div>
      </section>
    </main>
  );
}
