(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const header = $("#site-header");
  const progressBar = $("#scroll-progress-bar");

  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    scrollTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  const menu = $("#mobile-menu");
  const menuToggle = $("#nav-toggle");
  const menuLinks = $$("[data-mobile-nav]");
  const menuFocusables = () => $$('a[href], button:not([disabled])', menu);

  const openMenu = () => {
    if (!menu || !menuToggle) return;
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");
    const first = $("a[href]", menu);
    if (first) window.requestAnimationFrame(() => first.focus());
  };

  const closeMenu = (restoreFocus = true) => {
    if (!menu || !menuToggle) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
    if (restoreFocus) menuToggle.focus();
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });
  }

  if (menu) {
    menu.setAttribute("aria-hidden", "true");
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = menuFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });

  const navLinks = $$(".desktop-nav a[data-nav], .mobile-nav a[data-mobile-nav]");
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: "-38% 0px -56% 0px", threshold: 0 });
    navSections.forEach((section) => navObserver.observe(section));
  }

  const revealItems = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  $$(".spotlight").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  const showDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("dialog-open");
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  const refreshBodyLock = () => {
    const anyOpen = $$("dialog[open]").length > 0;
    document.body.classList.toggle("dialog-open", anyOpen);
  };

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-image");
  const lightboxCaption = $("#lightbox-caption");
  const lightboxCounter = $("#lightbox-counter");
  const lightboxClose = $(".lightbox-close");
  const lightboxPrev = $(".lightbox-prev");
  const lightboxNext = $(".lightbox-next");
  let activeGalleryKey = null;
  let activeGalleryIndex = 0;
  let galleryTrigger = null;

  const galleryItems = (key) => (window.HAMSKY_GALLERY && window.HAMSKY_GALLERY[key]) || [];

  const updateLightbox = () => {
    const items = galleryItems(activeGalleryKey);
    const item = items[activeGalleryIndex];
    if (!item || !lightboxImage) return;

    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || item.caption || item.title || "Achievement photo";
    if (lightboxCaption) lightboxCaption.textContent = item.caption || item.title || "";
    if (lightboxCounter) lightboxCounter.textContent = `${activeGalleryIndex + 1} / ${items.length}`;

    if (lightboxPrev) lightboxPrev.hidden = items.length < 2;
    if (lightboxNext) lightboxNext.hidden = items.length < 2;
  };

  const openLightbox = (key, index, trigger) => {
    const items = galleryItems(key);
    if (!items.length) return;
    activeGalleryKey = key;
    activeGalleryIndex = index;
    galleryTrigger = trigger || null;
    updateLightbox();
    showDialog(lightbox);
    window.requestAnimationFrame(() => lightboxClose?.focus());
  };

  const stepLightbox = (direction) => {
    const items = galleryItems(activeGalleryKey);
    if (items.length < 2) return;
    activeGalleryIndex = (activeGalleryIndex + direction + items.length) % items.length;
    updateLightbox();
  };

  lightboxClose?.addEventListener("click", () => closeDialog(lightbox));
  lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
  lightboxNext?.addEventListener("click", () => stepLightbox(1));

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    }
  });

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeDialog(lightbox);
  });

  lightbox?.addEventListener("close", () => {
    refreshBodyLock();
    if (galleryTrigger && typeof galleryTrigger.focus === "function") galleryTrigger.focus();
  });

  const createGalleryItem = (item, index, key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.setAttribute("aria-label", `Open photo ${index + 1}: ${item.caption || item.title || "achievement photo"}`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || item.caption || item.title || "Achievement photo";
    image.width = item.width || 1200;
    image.height = item.height || 900;
    image.loading = "lazy";
    image.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    caption.textContent = item.caption || item.title || "";

    button.append(image, caption);
    button.addEventListener("click", () => openLightbox(key, index, button));
    return button;
  };

  const renderGalleries = () => {
    $$("[data-gallery]").forEach((container) => {
      const key = container.getAttribute("data-gallery");
      const items = galleryItems(key);
      container.replaceChildren();
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "gallery-noscript";
        empty.textContent = "Photos will be added soon.";
        container.append(empty);
        return;
      }
      items.forEach((item, index) => container.append(createGalleryItem(item, index, key)));
    });
  };

  renderGalleries();

  // Deter casual saving of the achievement photos. This is a speed bump, not real protection:
  // screenshots are taken by the operating system and cannot be blocked by a website.
  const isProtectedImage = (target) =>
    target instanceof Element && Boolean(target.closest(".gallery-item img, #lightbox-image"));

  document.addEventListener("contextmenu", (event) => {
    if (isProtectedImage(event.target)) event.preventDefault();
  });

  document.addEventListener("dragstart", (event) => {
    if (isProtectedImage(event.target)) event.preventDefault();
  });

  // Restore color on touch for mobile devices (no hover state)
  document.addEventListener("touchstart", (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.target.classList.add("touched-color");
    }
  });

  document.addEventListener("touchend", (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.target.classList.remove("touched-color");
    }
  });

  const projects = {
    "big-data": {
      image: "assets/images/projects/big-data.svg",
      alt: "Abstract data visualization for the Big Data Processing project",
      kicker: "Academic project · Data processing",
      title: "Big Data Processing with Pandas & PySpark",
      description: "A hands-on academic exploration of working with datasets using two complementary tools: Pandas for local data manipulation and PySpark for distributed processing concepts.",
      tags: ["Python", "Pandas", "PySpark", "Data Processing"],
      highlights: [
        "Cleaned and transformed structured datasets",
        "Explored DataFrame operations and aggregation workflows",
        "Compared local Pandas workflows with PySpark processing",
        "Focused on readable, reproducible data preparation"
      ],
      note: "This is an academic learning project. No client work or production-scale claims are implied."
    },
    "mudimesra": {
      image: "assets/images/projects/mudimesra.svg",
      alt: "Abstract browser illustration for the Mudimesra.com website analysis",
      kicker: "Independent analysis · Web / UX",
      title: "Website Analysis — Mudimesra.com",
      description: "An independent review of Mudimesra.com focused on structure, interface, and user experience. The analysis looks at how the site organizes content and guides visitors through its pages.",
      tags: ["Web Analysis", "UX Review", "Documentation"],
      highlights: [
        "Reviewed page structure and navigation",
        "Observed interface and visual hierarchy",
        "Documented usability observations",
        "Framed findings as an independent student analysis"
      ],
      note: "I did not develop, own, or represent Mudimesra.com. This project is an independent analysis only."
    },
    "portfolio": {
      image: "assets/images/projects/portfolio.svg",
      alt: "Abstract interface illustration for the HAMSKY personal portfolio website",
      kicker: "Personal build · Front-end",
      title: "Personal Portfolio Website",
      description: "The HAMSKY portfolio you are viewing now — designed and built from scratch with HTML, CSS, and vanilla JavaScript. It focuses on responsive layout, motion, accessibility, and a dark futuristic visual language.",
      tags: ["HTML5", "CSS3", "JavaScript", "UI/UX"],
      highlights: [
        "Responsive single-page layout",
        "Scroll reveal and active navigation",
        "Accessible gallery lightbox and dialogs",
        "Contact form validation with an honest static-site flow"
      ],
      note: "This site is a living project and will continue to evolve as I learn and build more."
    },
    "proxmox": {
      image: "assets/images/projects/proxmox.svg",
      alt: "Abstract server virtualization illustration for the Proxmox homelab experiment",
      kicker: "Learning experiment · Virtualization / Homelab",
      title: "Proxmox Home Lab",
      description: "Currently learning server virtualization with Proxmox VE. The experiment covers creating and managing virtual machines and Linux containers, configuring basic virtual networking, and exploring storage options in a home lab environment.",
      tags: ["Proxmox VE", "Virtualization", "Linux", "Networking", "Home Lab"],
      highlights: [
        "Installed and configured Proxmox VE hypervisor",
        "Created virtual machines with different operating systems",
        "Set up Linux containers (LXC) for lightweight workloads",
        "Configured virtual bridges and basic network routing",
        "Explored storage and backup concepts for VMs"
      ],
      note: "This is a personal learning experiment. I am currently studying Proxmox VE and virtualization concepts — no production infrastructure is implied."
    },
    "laravel": {
      image: "assets/images/projects/laravel.svg",
      alt: "Abstract web application illustration for the Laravel framework experiment",
      kicker: "Learning experiment · Web / Backend",
      title: "Laravel Web Application",
      description: "Currently learning backend web development with the Laravel PHP framework. The experiment covers routing, controllers, Blade templating, database connections, and basic form handling.",
      tags: ["Laravel", "PHP", "Blade", "MySQL", "Backend"],
      highlights: [
        "Set up a fresh Laravel project locally",
        "Defined web routes and controller methods",
        "Rendered views using Blade templates",
        "Connected to a MySQL database with Eloquent",
        "Handled form input and basic validation"
      ],
      note: "This is a personal learning experiment. I am currently studying the Laravel framework — this is not a production application and no client work is implied."
    },
    "laragon": {
      image: "assets/images/projects/laragon.svg",
      alt: "Abstract local development illustration for the Laragon environment experiment",
      kicker: "Learning experiment · Local Development / Tooling",
      title: "Laragon Local Development",
      description: "Currently learning local development environment setup with Laragon. The experiment covers installing and configuring Apache, MySQL, and PHP so web projects can run on a local machine without a remote server.",
      tags: ["Laragon", "Apache", "MySQL", "PHP", "Local Development"],
      highlights: [
        "Installed Laragon as a local development environment",
        "Started and stopped Apache and MySQL services",
        "Created local test domains and virtual hosts",
        "Connected PHP projects to a local MySQL database",
        "Explored phpMyAdmin for database management"
      ],
      note: "This is a personal learning experiment. I am currently studying local development tooling — no production deployment is implied."
    }
  };

  const projectModal = $("#project-modal");
  const projectModalImage = $("#project-modal-image");
  const projectModalKicker = $("#project-modal-kicker");
  const projectModalTitle = $("#project-modal-title");
  const projectModalDesc = $("#project-modal-desc");
  const projectModalTags = $("#project-modal-tags");
  const projectModalHighlights = $("#project-modal-highlights");
  const projectModalNote = $("#project-modal-note");
  const projectModalClose = $(".modal-close");
  let projectTrigger = null;

  const openProject = (key, trigger) => {
    const project = projects[key];
    if (!project) return;

    if (projectModalImage) {
      projectModalImage.src = project.image;
      projectModalImage.alt = project.alt;
    }
    if (projectModalKicker) projectModalKicker.textContent = project.kicker;
    if (projectModalTitle) projectModalTitle.textContent = project.title;
    if (projectModalDesc) projectModalDesc.textContent = project.description;
    if (projectModalNote) projectModalNote.textContent = project.note;

    if (projectModalTags) {
      projectModalTags.replaceChildren();
      project.tags.forEach((tag) => {
        const item = document.createElement("li");
        item.textContent = tag;
        projectModalTags.append(item);
      });
    }

    if (projectModalHighlights) {
      projectModalHighlights.replaceChildren();
      project.highlights.forEach((highlight) => {
        const item = document.createElement("li");
        item.textContent = highlight;
        projectModalHighlights.append(item);
      });
    }

    projectTrigger = trigger || null;
    showDialog(projectModal);
    window.requestAnimationFrame(() => projectModalClose?.focus());
  };

  $$("[data-project]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.getAttribute("data-project"), button));
  });

  projectModalClose?.addEventListener("click", () => closeDialog(projectModal));

  projectModal?.addEventListener("click", (event) => {
    if (event.target === projectModal) closeDialog(projectModal);
  });

  projectModal?.addEventListener("close", () => {
    refreshBodyLock();
    if (projectTrigger && typeof projectTrigger.focus === "function") projectTrigger.focus();
  });

  const contactForm = $("#contact-form");
  const formStatus = $("#form-status");
  const formSubmitButton = contactForm ? $('button[type="submit"]', contactForm) : null;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // FormSubmit delivers the message to this inbox without a custom backend.
  // The address is already public on this site, so it is not a secret.
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/ilhammauridhaa@gmail.com";

  const formFields = [
    {
      input: $("#name"),
      error: $("#name-error"),
      validate: (value) => value.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters)."
    },
    {
      input: $("#email"),
      error: $("#email-error"),
      validate: (value) => emailPattern.test(value.trim()) ? "" : "Please enter a valid email address."
    },
    {
      input: $("#subject"),
      error: $("#subject-error"),
      validate: (value) => value.trim().length >= 3 ? "" : "Please add a subject (at least 3 characters)."
    },
    {
      input: $("#message"),
      error: $("#message-error"),
      validate: (value) => value.trim().length >= 10 ? "" : "Please write a message (at least 10 characters)."
    }
  ].filter((field) => field.input && field.error);

  const setFieldError = (field, message) => {
    const wrapper = field.input.closest(".field");
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
    field.error.textContent = message;
  };

  const validateField = (field) => {
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    return !message;
  };

  const hideFormStatus = () => {
    if (formStatus) {
      formStatus.classList.remove("is-visible");
      formStatus.replaceChildren();
    }
  };

  const setFormBusy = (busy) => {
    if (!formSubmitButton) return;
    formSubmitButton.disabled = busy;
    formSubmitButton.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const showFormStatus = (title, text, link = null) => {
    if (!formStatus) return;
    formStatus.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = title;
    formStatus.append(strong, document.createTextNode(text));
    if (link) {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.label;
      formStatus.append(anchor, document.createTextNode(link.tail || ""));
    }
    formStatus.classList.add("is-visible");
    formStatus.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  };

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      contactForm.dataset.submitted = "true";
      let firstInvalid = null;

      formFields.forEach((field) => {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (formStatus) {
          formStatus.textContent = "Please review the highlighted fields before sending your message.";
          formStatus.classList.add("is-visible");
        }
        firstInvalid.input.focus();
        return;
      }

      // Hidden honeypot: real visitors never fill it in.
      const honey = $('input[name="_honey"]', contactForm);
      if (honey && honey.value.trim()) {
        showFormStatus("Message sent.", " Thank you for getting in touch.");
        return;
      }

      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const subject = $("#subject").value.trim();
      const message = $("#message").value.trim();
      const mailto = `mailto:ilhammauridhaa@gmail.com?subject=${encodeURIComponent(`[HAMSKY Portfolio] ${subject}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;

      setFormBusy(true);
      showFormStatus("Sending message…", " Please wait a moment.");

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
            _subject: `[HAMSKY Portfolio] ${subject}`,
            _replyto: email,
            _template: "table",
            _captcha: "false"
          })
        });

        const data = await response.json().catch(() => ({}));
        const success = data.success === true || String(data.success) === "true";
        if (!response.ok || !success) {
          throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        showFormStatus(
          "Message sent.",
          ` Thank you — your message reached my inbox. I will reply to ${email} soon.`
        );
        contactForm.reset();
        contactForm.dataset.submitted = "false";
        formFields.forEach((field) => setFieldError(field, ""));
      } catch (error) {
        showFormStatus(
          "Message could not be sent.",
          " Please try again, or send it from your email app: ",
          { href: mailto, label: "open the email draft", tail: "." }
        );
      } finally {
        setFormBusy(false);
      }
    });

    formFields.forEach((field) => {
      field.input.addEventListener("input", () => {
        hideFormStatus();
        if (contactForm.dataset.submitted === "true") validateField(field);
      });
      field.input.addEventListener("blur", () => {
        if (contactForm.dataset.submitted === "true" || field.input.value.trim()) validateField(field);
      });
    });
  }

  const backToTop = $("#back-to-top");
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
})();
