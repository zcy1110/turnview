(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const iframe = $("#pageIframe");
  const frame = $("#pageFrame");
  const stage = $("#stage");
  const framePositioner = $("#framePositioner");
  const urlForm = $("#urlForm");
  const urlInput = $("#urlInput");
  const angleInput = $("#angleInput");
  const angleRange = $("#angleRange");
  const zoomRange = $("#zoomRange");
  const angleHud = $("#angleHud");
  const sizeHud = $("#sizeHud");
  const statusText = $("#statusText");
  const statusPulse = $(".status-pulse");
  const sourceTitle = $("#sourceTitle");
  const sourceSubtitle = $("#sourceSubtitle");
  const orientationBadge = $("#orientationBadge");
  const orientationText = $("#orientationText");
  const loadingVeil = $("#loadingVeil");
  const panButton = $("#panButton");
  const flipXButton = $("#flipXButton");
  const flipYButton = $("#flipYButton");
  const recentList = $("#recentList");
  const helpDialog = $("#helpDialog");
  const toast = $("#toast");
  const dropOverlay = $("#dropOverlay");

  const STORAGE_KEY = "turnview-recent-v1";
  const DEFAULT_ANGLE = 90;

  const state = {
    angle: DEFAULT_ANGLE,
    zoom: 1,
    flipX: false,
    flipY: false,
    fitScale: 1,
    panX: 0,
    panY: 0,
    isPanMode: false,
    isDragging: false,
    dragOriginX: 0,
    dragOriginY: 0,
    panOriginX: 0,
    panOriginY: 0,
    currentUrl: "",
    currentLabel: "内置演示页",
    currentSubtitle: "无需联网即可测试",
  };

  let toastTimer = 0;
  let resizeTimer = 0;
  let currentObjectUrl = "";

  const demoHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root { color-scheme: light; font-family: "Microsoft YaHei UI", "PingFang SC", sans-serif; color: #162b33; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #f5f1e8; }
    .page { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
    header { display: flex; align-items: center; justify-content: space-between; padding: 22px 30px; border-bottom: 1px solid #d9d3c7; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: .12em; }
    .mark { width: 24px; height: 24px; background: #f36d4f; border-radius: 7px; transform: rotate(12deg); }
    nav { display: flex; align-items: center; gap: 26px; font-size: 12px; color: #607177; }
    nav b { color: #162b33; }
    .hero { display: grid; grid-template-columns: 1.25fr .75fr; gap: 32px; padding: 38px 30px 26px; }
    .kicker { color: #dc573c; font-size: 10px; font-weight: 800; letter-spacing: .16em; }
    h1 { max-width: 530px; margin: 13px 0 15px; font-family: Georgia, "Songti SC", serif; font-size: clamp(35px, 5vw, 58px); font-weight: 500; line-height: 1.05; letter-spacing: -.045em; }
    .hero p { max-width: 490px; margin: 0; color: #63747a; font-size: 13px; line-height: 1.75; }
    .cta { display: inline-flex; gap: 8px; align-items: center; margin-top: 23px; padding: 11px 17px; color: #fff; background: #162b33; border-radius: 8px; font-size: 11px; font-weight: 700; }
    .visual { position: relative; min-height: 230px; overflow: hidden; background: #0d756c; border-radius: 18px; }
    .sun { position: absolute; width: 150px; height: 150px; right: 30px; top: 22px; background: #f5cf76; border-radius: 50%; }
    .hill { position: absolute; width: 320px; height: 240px; left: -80px; bottom: -150px; background: #a8cc8d; border-radius: 50%; transform: rotate(-10deg); }
    .hill.two { left: 80px; bottom: -175px; background: #e57c5e; }
    .stamp { position: absolute; right: 18px; bottom: 16px; padding: 8px 10px; color: #fff; border: 1px solid rgba(255,255,255,.5); border-radius: 50%; font-size: 8px; letter-spacing: .1em; transform: rotate(-9deg); }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 30px 30px; }
    .card { padding: 17px; background: #fffdf8; border: 1px solid #ded8cc; border-radius: 12px; }
    .card header { justify-content: flex-start; padding: 0 0 13px; border: 0; }
    .num { color: #f36d4f; font-family: Georgia, serif; font-size: 22px; }
    .card strong { font-size: 12px; }
    .card p { margin: 8px 0 0; color: #718085; font-size: 10px; line-height: 1.6; }
    footer { display: flex; justify-content: space-between; padding: 15px 30px; color: #7c898d; border-top: 1px solid #d9d3c7; font-size: 9px; letter-spacing: .04em; }
    @media (max-width: 650px) {
      header { padding: 16px 18px; }
      nav { display: none; }
      .hero { grid-template-columns: 1fr; padding: 28px 18px 21px; }
      .visual { min-height: 195px; }
      .cards { grid-template-columns: 1fr; padding: 0 18px 21px; }
      footer { padding: 13px 18px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <div class="brand"><span class="mark"></span> NORTH & FIELD</div>
      <nav><b>探索</b><span>灵感</span><span>关于</span><span>联系</span></nav>
    </header>
    <main>
      <section class="hero">
        <div>
          <span class="kicker">A SMALL GUIDE TO BIG IDEAS</span>
          <h1>让每个方向，都有新的发现。</h1>
          <p>这是一张用于测试旋转效果的内置演示页。改变角度时，版式、文字和画面都会保持完整，适合放在竖屏显示器、平板或展览屏幕上使用。</p>
          <span class="cta">开始探索 →</span>
        </div>
        <div class="visual">
          <span class="sun"></span>
          <span class="hill"></span>
          <span class="hill two"></span>
          <span class="stamp">TURN A NEW PAGE</span>
        </div>
      </section>
      <section class="cards">
        <article class="card"><div class="num">01</div><strong>任意角度</strong><p>从直角翻转到精细角度，自由寻找更舒服的阅读方向。</p></article>
        <article class="card"><div class="num">02</div><strong>自动适应</strong><p>切换 0° 与 90° 时，网页视口会重新计算，尽量填满预览区。</p></article>
        <article class="card"><div class="num">03</div><strong>本地运行</strong><p>页面不会上传你的操作记录；最近网址只保存在当前浏览器中。</p></article>
      </section>
    </main>
    <footer><span>TURNVIEW · LOCAL DEMO</span><span>VOL. 01 / 2026</span></footer>
  </div>
</body>
</html>`;

  function normalizeAngle(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return ((Math.round(numeric) % 360) + 360) % 360;
  }

  function setRangeProgress(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const progress = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${progress}%`);
  }

  function updateView(options = {}) {
    const { instant = false } = options;
    if (instant) frame.classList.add("is-resizing");

    const rect = stage.getBoundingClientRect();
    const horizontalPadding = rect.width < 680 ? 24 : 46;
    const verticalPadding = rect.height < 470 ? 24 : 48;
    const availableWidth = Math.max(rect.width - horizontalPadding * 2, 160);
    const availableHeight = Math.max(rect.height - verticalPadding * 2, 120);
    const radians = (state.angle * Math.PI) / 180;
    const sine = Math.sin(radians);
    const cosine = Math.cos(radians);
    const swap = sine * sine;

    const baseWidth = availableWidth * (1 - swap) + availableHeight * swap;
    const baseHeight = availableHeight * (1 - swap) + availableWidth * swap;
    const rotatedWidth = Math.abs(baseWidth * cosine) + Math.abs(baseHeight * sine);
    const rotatedHeight = Math.abs(baseWidth * sine) + Math.abs(baseHeight * cosine);
    const scaleX = availableWidth / Math.max(rotatedWidth, 1);
    const scaleY = availableHeight / Math.max(rotatedHeight, 1);
    state.fitScale = Math.min(1, scaleX, scaleY);

    const previewScale = state.fitScale * state.zoom;
    const flipX = state.flipX ? -1 : 1;
    const flipY = state.flipY ? -1 : 1;

    frame.style.width = `${baseWidth}px`;
    frame.style.height = `${baseHeight}px`;
    frame.style.transform = `rotate(${state.angle}deg) scaleX(${flipX}) scaleY(${flipY}) scale(${previewScale})`;
    framePositioner.style.setProperty("--pan-x", `${state.panX}px`);
    framePositioner.style.setProperty("--pan-y", `${state.panY}px`);

    angleInput.value = state.angle;
    angleRange.value = state.angle;
    angleHud.textContent = `${state.angle}°`;
    sizeHud.textContent = `${Math.round(baseWidth)} × ${Math.round(baseHeight)} px`;
    setRangeProgress(angleRange);
    setRangeProgress(zoomRange);
    updateAnglePresentation();

    if (instant) {
      requestAnimationFrame(() => frame.classList.remove("is-resizing"));
    }

    try {
      localStorage.setItem("turnview-last-angle", String(state.angle));
      localStorage.setItem("turnview-last-zoom", String(state.zoom));
    } catch {
      // Browsers may disable storage for local files. The view still works.
    }
  }

  function updateAnglePresentation() {
    const distanceToRightAngle = Math.min(
      Math.abs(state.angle - 90),
      Math.abs(state.angle - 270)
    );
    const isSideways = distanceToRightAngle < 35;
    orientationBadge.classList.toggle("is-portrait", isSideways);

    if (isSideways) {
      orientationText.textContent = "侧向显示";
    } else {
      orientationText.textContent = "标准方向";
    }

    let hint = "屏幕内纵向显示";
    if (state.angle === 90) hint = "屏幕内横向显示";
    else if (state.angle === 180) hint = "屏幕内倒置显示";
    else if (state.angle === 270) hint = "屏幕内反向显示";
    else if (state.angle === 0) hint = "网页保持原始方向";
    $("#angleHint").textContent = hint;

    $$(".preset-button").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.angle) === state.angle);
    });
  }

  function setAngle(value, options = {}) {
    state.angle = normalizeAngle(value);
    updateView(options);
  }

  function setZoom(value, options = {}) {
    state.zoom = Math.min(2, Math.max(0.25, value));
    $("#zoomValue").textContent = `${Math.round(state.zoom * 100)}%`;
    zoomRange.value = String(Math.round(state.zoom * 100));
    updateView(options);
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.flipX = false;
    state.flipY = false;
    flipXButton.setAttribute("aria-pressed", "false");
    flipYButton.setAttribute("aria-pressed", "false");
    $("#zoomValue").textContent = "100%";
    zoomRange.value = "100";
    updateView();
    showToast("视图已恢复为适应窗口");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function setStatus(message, mode = "ready") {
    statusText.textContent = message;
    statusPulse.classList.toggle("is-loading", mode === "loading");
  }

  function setLoading(isLoading) {
    loadingVeil.classList.toggle("is-hidden", !isLoading);
    setStatus(isLoading ? "正在载入网页" : "网页已载入", isLoading ? "loading" : "ready");
  }

  function updateSource(title, subtitle) {
    state.currentLabel = title;
    state.currentSubtitle = subtitle;
    sourceTitle.textContent = title;
    sourceTitle.title = title;
    sourceSubtitle.textContent = subtitle;
    sourceSubtitle.title = subtitle;
  }

  function getSafeUrl(rawValue) {
    let value = rawValue.trim();
    if (!value) return null;
    if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) value = `https://${value}`;
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function revokeObjectUrl() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = "";
    }
  }

  function loadUrl(rawValue, options = {}) {
    const safeUrl = getSafeUrl(rawValue);
    if (!safeUrl) {
      showToast("请输入有效的 http 或 https 网页地址");
      urlInput.focus();
      return;
    }

    revokeObjectUrl();
    iframe.removeAttribute("srcdoc");
    state.currentUrl = safeUrl;
    urlInput.value = safeUrl;
    setLoading(true);
    iframe.src = safeUrl;

    const readableTitle = safeUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .replace(/^www\./, "");
    updateSource(readableTitle, new URL(safeUrl).hostname);

    if (!options.silent) rememberUrl(safeUrl);
  }

  function loadHtml(html, title = "本地网页", subtitle = "本地 HTML 文件") {
    revokeObjectUrl();
    state.currentUrl = "";
    currentObjectUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    setLoading(true);
    iframe.removeAttribute("srcdoc");
    iframe.src = currentObjectUrl;
    updateSource(title, subtitle);
  }

  function loadDemo(options = {}) {
    loadHtml(demoHtml, "内置演示页", "无需联网即可测试");

    if (!options.silent) {
      showToast("已载入演示页，可直接尝试旋转");
    }
  }

  function readRecent() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value)
        ? value.filter((item) => item && typeof item.url === "string").slice(0, 5)
        : [];
    } catch {
      return [];
    }
  }

  function renderRecent() {
    const recent = readRecent();
    recentList.replaceChildren();
    if (!recent.length) {
      const empty = document.createElement("p");
      empty.className = "recent-empty";
      empty.textContent = "载入过的网页会保存在这里";
      recentList.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    recent.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recent-item";
      button.title = item.url;
      button.innerHTML = `
        <svg aria-hidden="true"><use href="#icon-globe"></use></svg>
        <span></span>
        <small>↗</small>
      `;
      $("span", button).textContent = item.label || item.url;
      button.addEventListener("click", () => loadUrl(item.url));
      fragment.append(button);
    });
    recentList.append(fragment);
  }

  function rememberUrl(url) {
    try {
      const label = new URL(url).hostname.replace(/^www\./, "");
      const recent = readRecent().filter((item) => item.url !== url);
      recent.unshift({ url, label });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 5)));
      renderRecent();
    } catch {
      // Keep loading even when storage is unavailable.
    }
  }

  function openCurrentInNewTab() {
    const target = state.currentUrl || currentObjectUrl;
    if (!target) {
      showToast("请先载入网页或演示页");
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
  }

  function togglePanMode(force) {
    state.isPanMode = typeof force === "boolean" ? force : !state.isPanMode;
    stage.classList.toggle("is-panning", state.isPanMode);
    panButton.setAttribute("aria-pressed", String(state.isPanMode));
    if (state.isPanMode) {
      showToast("移动模式已开启：拖动画面调整位置，按 H 退出");
      if (state.zoom <= 1) showToast("可先放大网页，再拖动调整位置");
    }
  }

  function rotateBy(delta) {
    frame.classList.add("is-resizing");
    setAngle(state.angle + delta);
    requestAnimationFrame(() => frame.classList.remove("is-resizing"));
  }

  function openHelp() {
    if (typeof helpDialog.showModal === "function") helpDialog.showModal();
    else helpDialog.setAttribute("open", "");
  }

  function closeHelp() {
    if (typeof helpDialog.close === "function") helpDialog.close();
    else helpDialog.removeAttribute("open");
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      showToast("当前浏览器未能进入全屏模式");
    }
  }

  function handleLocalFile(file) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["html", "htm"].includes(extension) && !file.type.includes("html")) {
      showToast("请选择 .html 或 .htm 文件");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast("文件超过 15 MB，建议先从网页地址载入");
      return;
    }

    file
      .text()
      .then((html) => {
        loadHtml(html, file.name, `${(file.size / 1024).toFixed(1)} KB · 本地文件`);
        showToast(`已打开 ${file.name}`);
      })
      .catch(() => showToast("这个文件无法读取"));
  }

  function bindEvents() {
    urlForm.addEventListener("submit", (event) => {
      event.preventDefault();
      loadUrl(urlInput.value);
    });

    angleRange.addEventListener("input", (event) => setAngle(event.target.value));
    angleInput.addEventListener("change", (event) => setAngle(event.target.value));
    angleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        angleInput.blur();
        setAngle(angleInput.value);
      }
    });

    $$(".preset-button").forEach((button) => {
      button.addEventListener("click", () => setAngle(button.dataset.angle));
    });

    $("#rotateLeftButton").addEventListener("click", () => rotateBy(-90));
    $("#rotateRightButton").addEventListener("click", () => rotateBy(90));
    $("#rotateLeftTool").addEventListener("click", () => rotateBy(-90));
    $("#rotateRightTool").addEventListener("click", () => rotateBy(90));
    $("#resetAngleButton").addEventListener("click", () => {
      setAngle(0);
      showToast("旋转角度已归零");
    });

    zoomRange.addEventListener("input", (event) => setZoom(Number(event.target.value) / 100));
    $("#zoomInButton").addEventListener("click", () => setZoom(state.zoom + 0.1));
    $("#zoomOutButton").addEventListener("click", () => setZoom(state.zoom - 0.1));
    $("#resetViewButton").addEventListener("click", resetView);

    flipXButton.addEventListener("click", () => {
      state.flipX = !state.flipX;
      flipXButton.setAttribute("aria-pressed", String(state.flipX));
      updateView();
    });

    flipYButton.addEventListener("click", () => {
      state.flipY = !state.flipY;
      flipYButton.setAttribute("aria-pressed", String(state.flipY));
      updateView();
    });

    panButton.addEventListener("click", () => togglePanMode());
    $("#demoButton").addEventListener("click", () => loadDemo());
    $("#openButton").addEventListener("click", openCurrentInNewTab);
    $("#fileButton").addEventListener("click", () => $("#fileInput").click());
    $("#fileInput").addEventListener("change", (event) => {
      handleLocalFile(event.target.files?.[0]);
      event.target.value = "";
    });

    $("#clearRecentButton").addEventListener("click", () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage restrictions.
      }
      renderRecent();
      showToast("最近记录已清空");
    });

    $("#helpButton").addEventListener("click", openHelp);
    $("#closeHelpButton").addEventListener("click", closeHelp);
    $("#closeHelpAction").addEventListener("click", closeHelp);
    helpDialog.addEventListener("click", (event) => {
      const rect = helpDialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) closeHelp();
    });

    $("#fullscreenButton").addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", () => {
      const button = $("#fullscreenButton");
      const use = $("use", button);
      use.setAttribute("href", document.fullscreenElement ? "#icon-minimize" : "#icon-maximize");
      $("span", button).textContent = document.fullscreenElement ? "退出全屏" : "全屏";
    });

    $("#brandLink").addEventListener("click", (event) => {
      event.preventDefault();
      resetView();
      setAngle(DEFAULT_ANGLE);
    });

    iframe.addEventListener("load", () => {
      window.setTimeout(() => {
        if (!state.currentUrl && !iframe.srcdoc && !currentObjectUrl) return;
        setLoading(false);
      }, 220);
    });

    stage.addEventListener("pointerdown", (event) => {
      if (!state.isPanMode || event.button !== 0) return;
      state.isDragging = true;
      state.dragOriginX = event.clientX;
      state.dragOriginY = event.clientY;
      state.panOriginX = state.panX;
      state.panOriginY = state.panY;
      stage.classList.add("is-dragging");
      frame.classList.add("is-dragging");
      stage.setPointerCapture?.(event.pointerId);
    });

    stage.addEventListener("pointermove", (event) => {
      if (!state.isDragging) return;
      state.panX = state.panOriginX + event.clientX - state.dragOriginX;
      state.panY = state.panOriginY + event.clientY - state.dragOriginY;
      framePositioner.style.setProperty("--pan-x", `${state.panX}px`);
      framePositioner.style.setProperty("--pan-y", `${state.panY}px`);
    });

    const endDrag = () => {
      state.isDragging = false;
      stage.classList.remove("is-dragging");
      frame.classList.remove("is-dragging");
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    stage.addEventListener("wheel", (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(state.zoom + (event.deltaY > 0 ? -0.05 : 0.05));
    }, { passive: false });

    let dragDepth = 0;
    stage.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dragDepth += 1;
      stage.classList.add("is-dragover");
    });
    stage.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    stage.addEventListener("dragleave", () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) stage.classList.remove("is-dragover");
    });
    stage.addEventListener("drop", (event) => {
      event.preventDefault();
      dragDepth = 0;
      stage.classList.remove("is-dragover");
      handleLocalFile(event.dataTransfer?.files?.[0]);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.isPanMode) {
        togglePanMode(false);
        return;
      }
      if (helpDialog.open || /input|textarea|select/i.test(event.target.tagName)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        rotateBy(event.shiftKey ? -90 : 90);
      } else if (key === "0") {
        event.preventDefault();
        setAngle(0);
      } else if (key === "f") {
        event.preventDefault();
        toggleFullscreen();
      } else if (key === "h") {
        event.preventDefault();
        togglePanMode();
      } else if (key === "+" || key === "=") {
        event.preventDefault();
        setZoom(state.zoom + 0.1);
      } else if (key === "-" || key === "_") {
        event.preventDefault();
        setZoom(state.zoom - 0.1);
      } else if (key === "arrowleft") {
        event.preventDefault();
        state.panX -= 28;
        updateView({ instant: true });
      } else if (key === "arrowright") {
        event.preventDefault();
        state.panX += 28;
        updateView({ instant: true });
      } else if (key === "arrowup") {
        event.preventDefault();
        state.panY -= 28;
        updateView({ instant: true });
      } else if (key === "arrowdown") {
        event.preventDefault();
        state.panY += 28;
        updateView({ instant: true });
      }
    });

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => updateView({ instant: true }), 90);
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => updateView({ instant: true }));
      resizeObserver.observe(stage);
    }
  }

  function restorePreferences() {
    try {
      const savedAngle = localStorage.getItem("turnview-last-angle");
      const savedZoom = localStorage.getItem("turnview-last-zoom");
      if (savedAngle !== null) state.angle = normalizeAngle(savedAngle);
      if (savedZoom !== null) {
        state.zoom = Math.min(2, Math.max(0.25, Number(savedZoom) || 1));
      }
    } catch {
      // Defaults are already set.
    }
    $("#zoomValue").textContent = `${Math.round(state.zoom * 100)}%`;
    zoomRange.value = String(Math.round(state.zoom * 100));
  }

  function init() {
    bindEvents();
    restorePreferences();
    renderRecent();
    loadDemo({ silent: true });
    updateView({ instant: true });

    if (!localStorageAvailable()) {
      // No visible warning needed; this is only a convenience feature.
      $("#recentList").innerHTML = '<p class="recent-empty">当前浏览器不允许保存最近记录</p>';
    }
  }

  function localStorageAvailable() {
    try {
      const key = "__turnview_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  init();
})();
