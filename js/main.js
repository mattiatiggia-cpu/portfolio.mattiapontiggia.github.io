import projects from './projects.js';
import otherProjects from './other-projects.js';

// ── Custom cursor (runs on every page) ──────────────────────
(function initCursor() {
  const dot = document.createElement('div');
  dot.id = 'custom-cursor';
  document.body.appendChild(dot);

  // Direct positioning — no lerp, so it always matches mouse exactly
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    dot.style.opacity = '1';
  });

  // Grow on interactive elements
  const hoverTargets = 'a, button, .work-link, [role="button"]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) dot.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) dot.classList.remove('cursor-hover');
  });

  // Hide cursor if mouse leaves the window
  document.addEventListener('mouseleave', () => dot.style.opacity = '0');
})();

document.addEventListener('DOMContentLoaded', () => {


  // ── Coming Soon tooltip ─────────────────────────────────
  const csTooltip = document.createElement('div');
  csTooltip.id = 'coming-soon-tooltip';
  csTooltip.textContent = 'Coming Soon — Thesis Development';
  document.body.appendChild(csTooltip);

  document.addEventListener('mousemove', e => {
    csTooltip.style.left = (e.clientX + 24) + 'px';
    csTooltip.style.top  = (e.clientY + 24) + 'px';
  });

  window.addEventListener('scroll', () => csTooltip.classList.remove('visible'), { passive: true });

  // ── Fashion Works list (work.html) ──────────────────────
  const workListContainer = document.getElementById('work-list');
  const hoverPreview      = document.getElementById('hover-preview');
  const previewImg        = document.getElementById('preview-img');

  if (workListContainer) {
    projects.forEach(project => {
      const li = document.createElement('li');
      li.className = 'work-item' + (project.comingSoon ? ' work-item--coming-soon' : '');

      if (project.comingSoon) {
        // Not a link — just a div that shows the tooltip
        li.innerHTML = `
          <div class="work-link" data-coming-soon="true">
            <span class="work-index">${project.index} ${project.year}</span>
            <span class="work-title">${project.title}</span>
            <span class="work-category">${project.category}</span>
          </div>`;

        const row = li.querySelector('.work-link');
        row.addEventListener('mouseenter', () => csTooltip.classList.add('visible'));
        row.addEventListener('mouseleave', () => csTooltip.classList.remove('visible'));
      } else {
        li.innerHTML = `
          <a href="${project.customUrl || 'project.html?id=' + project.id}" class="work-link" data-image="${project.coverImage}">
            <span class="work-index">${project.index} ${project.year}</span>
            <span class="work-title">${project.title}</span>
            <span class="work-category">${project.category}</span>
          </a>`;
      }

      workListContainer.appendChild(li);
    });

    setupHoverPreview(workListContainer, hoverPreview, previewImg);
  }

  // ── Other Works list (other-works.html) ─────────────────
  const otherListContainer = document.getElementById('other-work-list');

  if (otherListContainer) {
    otherProjects.forEach(project => {
      const li = document.createElement('li');
      li.className = 'work-item';
      li.innerHTML = `
        <a href="${project.customUrl || 'other-project.html?id=' + project.id}" class="work-link" data-image="${project.coverImage}">
          <span class="work-index">${project.index} ${project.year}</span>
          <span class="work-title">${project.title}</span>
          <span class="work-category">${project.category}</span>
        </a>`;
      otherListContainer.appendChild(li);
    });

    setupHoverPreview(otherListContainer, hoverPreview, previewImg);
  }

  // ── Fashion Project detail (project.html) ───────────────
  const projectDetail = document.getElementById('project-detail-container');
  if (projectDetail && window.location.pathname.includes('project.html')) {
    const id      = new URLSearchParams(window.location.search).get('id');
    const project = projects.find(p => p.id === id);
    renderProjectDetail(project, 'fashion');
  }

  // ── Other Project detail (other-project.html) ───────────
  const otherDetail = document.getElementById('project-detail-container');
  if (otherDetail && window.location.pathname.includes('other-project.html')) {
    const id      = new URLSearchParams(window.location.search).get('id');
    const project = otherProjects.find(p => p.id === id);
    renderProjectDetail(project, 'other');
  }
});

// ── Helpers ─────────────────────────────────────────────────

function setupHoverPreview(container, preview, img) {
  if (!preview || !img) return;

  let lastX = 0, lastY = 0;

  // Update preview position with the mouse
  document.addEventListener('mousemove', e => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (preview.classList.contains('active')) {
      preview.style.left = (lastX + 24) + 'px';
      preview.style.top  = (lastY + 24) + 'px';
    }
  });

  // Hide preview while scrolling (re-triggers mouseenter when mouse moves again)
  window.addEventListener('scroll', () => {
    preview.classList.remove('active');
  }, { passive: true });

  container.querySelectorAll('.work-link').forEach(link => {
    link.addEventListener('mouseenter', e => {
      const src = link.getAttribute('data-image');
      if (src && window.innerWidth > 900) {
        img.src = src;
        preview.classList.add('active');
        preview.style.left = (e.clientX + 24) + 'px';
        preview.style.top  = (e.clientY + 24) + 'px';
      }
    });
    link.addEventListener('mouseleave', () => preview.classList.remove('active'));
  });
}

function renderProjectDetail(project, type) {
  if (!project) {
    document.getElementById('project-detail-container').innerHTML =
      '<h1 style="padding:3rem">Project not found</h1><p style="padding:0 3rem"><a href="' + (type === 'fashion' ? 'work.html' : 'other-works.html') + '">← Back</a></p>';
    return;
  }

  document.title = `${project.title} | Mattia Pontiggia`;
  document.getElementById('project-year').textContent     = project.year;
  document.getElementById('project-category').textContent = project.category;
  document.getElementById('project-title').textContent    = project.title;
  document.getElementById('project-description').textContent = project.description;

  // Gallery
  const gallery = document.getElementById('project-gallery');
  project.gallery.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = project.title;
    gallery.appendChild(img);
  });

  // Optional video
  if (project.video) {
    const wrapper = document.createElement('div');
    wrapper.className = 'project-video';
    wrapper.innerHTML = `<iframe src="${project.video}" frameborder="0" allowfullscreen></iframe>`;
    gallery.appendChild(wrapper);
  }
}
