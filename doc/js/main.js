(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  const DEBOUNCE_MS = 300;
  const MAX_INPUT_LENGTH = 4296;
  const LOGO_PADDING_RATIO = 0.18;
  const LOGO_RADIUS_RATIO = 0.18;

  const state = {
    qrDataUrl: null,
    qrSvg: null,
    logoImage: null,
    debounceTimer: null,
  };

  const els = {
    input: $("inputText"),
    form: $("qrForm"),
    qrImage: $("qrImage"),
    msg: $("formMessage"),
    year: $("year"),
    clear: $("clearBtn"),
    downloadPng: $("downloadBtn"),
    downloadSvg: $("downloadSvgBtn"),
    removeLogo: $("removeLogoBtn"),
    ecc: $("eccSelect"),
    size: $("sizeRange"),
    margin: $("marginRange"),
    bgMode: $("bgModeSelect"),
    logo: $("logoInput"),
    logoSize: $("logoSizeRange"),
    sizeVal: $("sizeValue"),
    marginVal: $("marginValue"),
    logoSizeVal: $("logoSizeValue"),
    logoControls: $("logoControls"),
    modal: $("privacy-modal"),
    closeModal: $("close-modal"),
    privacyBtn: $("privacy-btn"),
    toastContainer: $("toast-container"),
    themeBtns: $$(".theme-btn"),
  };

  const showToast = (message) => {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    els.toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add("toast-out");
      el.addEventListener("animationend", () => el.remove());
    }, 3000);
  };

  const setStatus = (msg, isError = false) => {
    els.msg.textContent = msg;
    els.msg.style.color = isError ? "var(--primary)" : "";
  };

  const sanitizeFilename = (text) => {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) || "qr-code";
  };

  const loadImage = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

  const getQrOptions = () => {
    const bgMode = els.bgMode.value;
    const light = bgMode === "transparent" ? "#0000" : bgMode === "dark" ? "#03050a" : "#ffffff";
    const dark = bgMode === "dark" ? "#f0f4ff" : "#000000";
    return {
      width: parseInt(els.size.value),
      margin: parseInt(els.margin.value),
      errorCorrectionLevel: els.ecc.value,
      color: { dark, light },
      type: "image/png"
    };
  };

  const addLogoToCanvas = (canvas, logo, scale) => {
    const ctx = canvas.getContext("2d");
    const size = Math.min(canvas.width, canvas.height);
    const logoSize = size * (scale / 100);
    const padding = logoSize * LOGO_PADDING_RATIO;
    const totalSize = logoSize + padding * 2;
    const x = (canvas.width - logoSize) / 2;
    const y = (canvas.height - logoSize) / 2;
    const bx = x - padding;
    const by = y - padding;
    const radius = totalSize * LOGO_RADIUS_RATIO;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(bx, by, totalSize, totalSize, radius);
    ctx.fill();
    ctx.drawImage(logo, x, y, logoSize, logoSize);
  };

  const generateQr = async () => {
    const text = els.input.value.trim();
    if (!text) {
      els.qrImage.src = "./assets/placeholder.svg";
      state.qrDataUrl = null;
      state.qrSvg = null;
      updateButtons();
      return;
    }
    try {
      const options = getQrOptions();
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, text, options);
      if (state.logoImage) {
        addLogoToCanvas(canvas, state.logoImage, parseInt(els.logoSize.value));
      }
      state.qrDataUrl = canvas.toDataURL("image/png");
      els.qrImage.src = state.qrDataUrl;
      const svgString = await QRCode.toString(text, { ...options, type: "svg" });
      if (state.logoImage) {
        const logoBase64 = state.logoImage.src;
        const logoSize = options.width * (parseInt(els.logoSize.value) / 100);
        const pos = (options.width - logoSize) / 2;
        const logoSvg = `<image href="${logoBase64}" x="${pos}" y="${pos}" width="${logoSize}" height="${logoSize}" />`;
        state.qrSvg = svgString.replace("</svg>", `${logoSvg}</svg>`);
      } else {
        state.qrSvg = svgString;
      }
      setStatus("QR code updated");
      updateButtons();
    } catch (err) {
      console.error(err);
      setStatus("Generation failed", true);
    }
  };

  const updateButtons = () => {
    const hasQr = !!state.qrDataUrl;
    els.downloadPng.disabled = !hasQr;
    els.downloadSvg.disabled = !hasQr;
  };

  const debouncedGenerate = () => {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(generateQr, DEBOUNCE_MS);
  };

  const handleInput = () => {
    els.sizeVal.textContent = els.size.value;
    els.marginVal.textContent = els.margin.value;
    els.logoSizeVal.textContent = els.logoSize.value;
    debouncedGenerate();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Logo too large (max 2MB)", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      state.logoImage = await loadImage(event.target.result);
      els.logoControls.classList.remove("hidden");
      generateQr();
    };
    reader.readAsDataURL(file);
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("luna-theme", theme);
    els.themeBtns.forEach((btn) => {
      const isActive = btn.getAttribute("data-theme") === theme;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", isActive.toString());
    });
  };

  const init = () => {
    els.year.textContent = new Date().getFullYear();
    const savedTheme = localStorage.getItem("luna-theme") || "dark";
    setTheme(savedTheme);

    els.input.addEventListener("input", debouncedGenerate);
    [els.size, els.margin, els.ecc, els.bgMode, els.logoSize].forEach((el) => {
      el.addEventListener("input", handleInput);
    });

    els.logo.addEventListener("change", handleLogoUpload);

    els.removeLogo.addEventListener("click", () => {
      state.logoImage = null;
      els.logo.value = "";
      els.logoControls.classList.add("hidden");
      generateQr();
    });

    els.clear.addEventListener("click", () => {
      els.input.value = "";
      state.logoImage = null;
      els.logo.value = "";
      els.logoControls.classList.add("hidden");
      generateQr();
      setStatus("");
    });

    els.downloadPng.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = `luna-${sanitizeFilename(els.input.value)}.png`;
      link.href = state.qrDataUrl;
      link.click();
      showToast("PNG Downloaded");
    });

    els.downloadSvg.addEventListener("click", () => {
      const blob = new Blob([state.qrSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `luna-${sanitizeFilename(els.input.value)}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast("SVG Exported");
    });

    els.themeBtns.forEach((btn) => {
      btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme")));
      btn.addEventListener("keydown", (e) => {
        const btns = Array.from(els.themeBtns);
        const idx = btns.indexOf(btn);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = btns[(idx + 1) % btns.length];
          next.focus();
          next.click();
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prev = btns[(idx - 1 + btns.length) % btns.length];
          prev.focus();
          prev.click();
        }
      });
    });

    els.privacyBtn.addEventListener("click", () => els.modal.setAttribute("aria-hidden", "false"));
    els.closeModal.addEventListener("click", () => els.modal.setAttribute("aria-hidden", "true"));
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal || e.target.classList.contains("modal-glass")) {
        els.modal.setAttribute("aria-hidden", "true");
      }
    });

    els.form.addEventListener("submit", (e) => e.preventDefault());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
