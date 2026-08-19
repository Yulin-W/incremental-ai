/**
 * particles.js
 * Floating insight click particle animator.
 */

export function spawnClickParticle(e, text, anchorEl) {
  if (typeof document === 'undefined') return;

  const particle = document.createElement('div');
  particle.className = 'click-particle';
  particle.innerText = text;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    x = e && e.clientX ? e.clientX : (rect.left + rect.width / 2);
    y = e && e.clientY ? e.clientY : (rect.top + rect.height / 2);
  } else if (e && e.clientX && e.clientY) {
    x = e.clientX;
    y = e.clientY;
  }

  particle.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    color: var(--accent-primary);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: 0.95rem;
    pointer-events: none;
    z-index: 10000;
    animation: float-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;

  document.body.appendChild(particle);
  setTimeout(() => {
    if (particle.parentNode) {
      particle.remove();
    }
  }, 750);
}
