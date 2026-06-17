(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  const DEBOUNCE_MS = 300;
  const MAX_INPUT_LENGTH = 4296;
  const SCAN_INTERVAL_MS = 300;

  const state = {
    qrDataUrl: null,
    qrSvg: null,
    debounceTimer: null,
    generating: false,
    scanTimer: null,
    scanStream: null,
    restoringHash: false,
  };

  const els = {
    input: $("inputText"),
    form: $("qrForm"),
    qrImage: $("qrImage"),
    qrLoading: $("qrLoading"),
    qrEmptyState: $("qrEmptyState"),
    msg: $("formMessage"),
    year: $("year"),
    clear: $("clearBtn"),
    downloadBtn: $("downloadBtn"),
    downloadSvg: $("downloadSvgBtn"),
    formatSelect: $("formatSelect"),
    scanBtn: $("scanBtn"),
    scannerModal: $("scanner-modal"),
    scannerVideo: $("scannerVideo"),
    scannerCanvas: $("scannerCanvas"),
    closeScannerBtn: $("closeScannerBtn"),
    ecc: $("eccSelect"),
    size: $("sizeRange"),
    margin: $("marginRange"),
    bgMode: $("bgModeSelect"),
    fgColor: $("fgColor"),
    bgColor: $("bgColor"),
    sizeVal: $("sizeValue"),
    marginVal: $("marginValue"),
    frameToggle: $("frameToggle"),
    sizePresets: $$(".size-preset"),
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

  const setLoading = (loading) => {
    state.generating = loading;
    els.qrLoading.classList.toggle("hidden", !loading);
    els.qrLoading.setAttribute("aria-hidden", (!loading).toString());
  };

  const getQrOptions = () => {
    const fg = els.fgColor.value;
    const bg = els.bgMode.value === "transparent" ? "#0000" : els.bgColor.value;
    return {
      width: parseInt(els.size.value),
      margin: parseInt(els.margin.value),
      errorCorrectionLevel: els.ecc.value,
      color: { dark: fg, light: bg },
      type: "image/png"
    };
  };

  const generateQr = async () => {
    const text = els.input.value.trim();
    if (!text) {
      els.qrImage.src = "./assets/placeholder.svg";
      els.qrEmptyState.classList.remove("hidden");
      state.qrDataUrl = null;
      state.qrSvg = null;
      updateButtons();
      if (!state.restoringHash) pushHash();
      return;
    }
    setLoading(true);
    try {
      const options = getQrOptions();
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, text, options);
      els.qrEmptyState.classList.add("hidden");

      if (els.frameToggle.checked) {
        const framed = document.createElement("canvas");
        framed.width = canvas.width;
        framed.height = canvas.height + 28;
        const fctx = framed.getContext("2d");
        fctx.fillStyle = els.bgMode.value === "transparent" ? "#ffffff" : els.bgColor.value;
        fctx.fillRect(0, 0, framed.width, framed.height);
        fctx.drawImage(canvas, 0, 14);
        fctx.fillStyle = els.fgColor.value;
        fctx.font = "11px Plus Jakarta Sans, sans-serif";
        fctx.textAlign = "center";
        fctx.fillText("lunaqr.app", framed.width / 2, framed.height - 5);
        state.qrDataUrl = framed.toDataURL("image/png");
      } else {
        state.qrDataUrl = canvas.toDataURL("image/png");
      }

      els.qrImage.style.opacity = "0";
      requestAnimationFrame(() => {
        els.qrImage.src = state.qrDataUrl;
        els.qrImage.onload = () => { els.qrImage.style.opacity = "1"; };
      });

      state.qrSvg = await QRCode.toString(text, { ...options, type: "svg" });

      if (!state.restoringHash) pushHash();
      setStatus("QR code updated");
      updateButtons();
    } catch (err) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("Invalid data")) {
        setStatus("Text too long for this error correction level. Try 'Robust' or 'Maximum'.", true);
      } else {
        setStatus("Generation failed: " + (msg || "unknown error"), true);
      }
    } finally {
      setLoading(false);
    }
  };

  const pushHash = () => {
    const params = new URLSearchParams();
    if (els.input.value.trim()) params.set("text", els.input.value.trim());
    const fg = els.fgColor.value;
    const bg = els.bgColor.value;
    if (fg !== "#000000") params.set("fg", fg);
    if (bg !== "#ffffff") params.set("bg", bg);
    if (els.ecc.value !== "M") params.set("ecc", els.ecc.value);
    if (els.size.value !== "512") params.set("size", els.size.value);
    if (els.margin.value !== "1") params.set("margin", els.margin.value);
    if (els.bgMode.value !== "off") params.set("bgMode", els.bgMode.value);
    if (els.frameToggle.checked) params.set("frame", "1");
    const hash = params.toString();
    history.replaceState(null, "", hash ? "#" + hash : window.location.pathname);
  };

  const pullHash = () => {
    const hash = location.hash.slice(1);
    if (!hash) return false;
    const params = new URLSearchParams(hash);
    let changed = false;
    if (params.has("text")) { els.input.value = params.get("text"); changed = true; }
    if (params.has("ecc")) { els.ecc.value = params.get("ecc"); changed = true; }
    if (params.has("fg")) { els.fgColor.value = params.get("fg"); changed = true; }
    if (params.has("bg")) { els.bgColor.value = params.get("bg"); changed = true; }
    if (params.has("size")) { els.size.value = params.get("size"); changed = true; }
    if (params.has("margin")) { els.margin.value = params.get("margin"); changed = true; }
    if (params.has("bgMode")) { els.bgMode.value = params.get("bgMode"); changed = true; }
    if (params.has("frame")) { els.frameToggle.checked = params.get("frame") === "1"; changed = true; }
    if (params.has("size")) {
      els.sizePresets.forEach((btn) => btn.classList.toggle("active", parseInt(btn.dataset.size) === parseInt(params.get("size"))));
    }
    return changed;
  };

  const updateButtons = () => {
    const hasQr = !!state.qrDataUrl;
    els.downloadBtn.disabled = !hasQr;
    els.downloadSvg.disabled = !hasQr;
  };

  const debouncedGenerate = () => {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(generateQr, DEBOUNCE_MS);
  };

  const handleInput = () => {
    els.sizeVal.textContent = els.size.value;
    els.marginVal.textContent = els.margin.value;
    debouncedGenerate();
  };

  const updateColorLabels = () => {
    const fgLabel = els.fgColor.parentElement.querySelector(".color-label");
    const bgLabel = els.bgColor.parentElement.querySelector(".color-label");
    if (fgLabel) fgLabel.textContent = els.fgColor.value;
    if (bgLabel) bgLabel.textContent = els.bgColor.value;
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

  const setSize = (size) => {
    els.size.value = String(size);
    els.sizeVal.textContent = size;
    els.sizePresets.forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.dataset.size) === size);
    });
    handleInput();
  };

  const downloadImage = () => {
    const format = els.formatSelect.value;
    const mimeTypes = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    const ext = format;
    if (format === "png") {
      const link = document.createElement("a");
      link.download = `luna-${sanitizeFilename(els.input.value)}.${ext}`;
      link.href = state.qrDataUrl;
      link.click();
      showToast("PNG Downloaded");
      return;
    }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      const dataUrl = c.toDataURL(mimeTypes[format], 0.92);
      const link = document.createElement("a");
      link.download = `luna-${sanitizeFilename(els.input.value)}.${ext}`;
      link.href = dataUrl;
      link.click();
      showToast(`${format.toUpperCase()} Downloaded`);
    };
    img.src = state.qrDataUrl;
  };

  const closeScanner = () => {
    if (state.scanTimer) { clearInterval(state.scanTimer); state.scanTimer = null; }
    if (state.scanStream) {
      state.scanStream.getTracks().forEach((t) => t.stop());
      state.scanStream = null;
    }
    els.scannerVideo.srcObject = null;
    els.scannerModal.setAttribute("aria-hidden", "true");
  };

  const scanFrame = () => {
    const video = els.scannerVideo;
    if (video.readyState < 2) return;
    const canvas = els.scannerCanvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      els.input.value = code.data;
      closeScanner();
      generateQr();
      showToast("QR code scanned");
    }
  };

  const openScanner = async () => {
    try {
      state.scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
      });
      els.scannerVideo.srcObject = state.scanStream;
      els.scannerModal.setAttribute("aria-hidden", "false");
      await els.scannerVideo.play();
      state.scanTimer = setInterval(scanFrame, SCAN_INTERVAL_MS);
    } catch {
      setStatus("Camera access denied or unavailable", true);
    }
  };

  const init = () => {
    els.year.textContent = new Date().getFullYear();
    const savedTheme = localStorage.getItem("luna-theme") || "dark";
    setTheme(savedTheme);

    els.input.addEventListener("input", debouncedGenerate);
    [els.size, els.margin, els.ecc, els.bgMode, els.fgColor, els.bgColor, els.frameToggle].forEach((el) => {
      el.addEventListener("input", handleInput);
    });

    els.fgColor.addEventListener("input", updateColorLabels);
    els.bgColor.addEventListener("input", updateColorLabels);

    els.sizePresets.forEach((btn) => {
      btn.addEventListener("click", () => setSize(parseInt(btn.dataset.size)));
    });

    els.clear.addEventListener("click", () => {
      els.input.value = "";
      els.qrEmptyState.classList.remove("hidden");
      generateQr();
      setStatus("");
    });

    els.downloadBtn.addEventListener("click", downloadImage);

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

    els.scanBtn.addEventListener("click", openScanner);
    els.closeScannerBtn.addEventListener("click", closeScanner);
    els.scannerModal.addEventListener("click", (e) => {
      if (e.target === els.scannerModal || e.target.classList.contains("modal-glass")) closeScanner();
    });

    els.input.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        clearTimeout(state.debounceTimer);
        generateQr();
      }
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

    state.restoringHash = true;
    const hasHash = pullHash();
    updateColorLabels();
    if (hasHash) generateQr();
    state.restoringHash = false;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
