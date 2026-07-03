/* =========================================================================
   Launchpad "Further reading" injector.
   Non-invasive: reads the shared window.OBS_RESOURCES catalog and appends a
   resource block to each matching launchpad module. Does not modify any
   existing launchpad logic. Theme-resilient styling (works light or dark).
   ========================================================================= */
(function () {
  "use strict";
  var RES = window.OBS_RESOURCES || [];
  if (!RES.length) return;

  // group resource sets by their target launchpad module id
  var byMod = {};
  RES.forEach(function (g) {
    if (!g.module) return;
    (byMod[g.module] = byMod[g.module] || []).push(g);
  });

  var css = "" +
    ".obs-further{margin-top:36px;padding-top:24px;border-top:1px solid rgba(128,128,128,.25)}" +
    ".obs-further h3{font-family:'Figtree',system-ui,sans-serif;font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;font-weight:700;color:#C74634;margin:0 0 16px}" +
    ".obs-further__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:12px}" +
    ".obs-further__card{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1px solid rgba(128,128,128,.25);border-radius:10px;text-decoration:none;color:inherit;background:rgba(128,128,128,.06);transition:border-color .16s ease,transform .16s ease}" +
    ".obs-further__card:hover{border-color:#C74634;transform:translateY(-2px)}" +
    ".obs-further__card--proj{border-left:3px solid #C74634}" +
    ".obs-further__t{font-family:'Figtree',system-ui,sans-serif;font-weight:600;font-size:.9rem;line-height:1.3}" +
    ".obs-further__s{font-size:.78rem;opacity:.72;line-height:1.4}" +
    ".obs-further__l{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:.68rem;opacity:.55;margin-top:2px}" +
    ".obs-disclaimer{margin:28px 24px 40px;padding:14px 18px;border:1px solid rgba(128,128,128,.3);border-left:3px solid #C58C52;border-radius:8px;font-family:'Figtree',system-ui,sans-serif;font-size:.76rem;line-height:1.55;opacity:.85}" +
    ".obs-disclaimer strong{color:#C74634}" +
    ".showcase-image{cursor:zoom-in}" +
    ".showcase-image:focus-visible{outline:3px solid #C74634;outline-offset:4px}" +
    ".octo-lb{position:fixed;inset:0;z-index:9999;background:rgba(6,20,32,.88);display:flex;align-items:center;justify-content:center;padding:28px;opacity:0;visibility:hidden;transition:opacity .2s ease}" +
    ".octo-lb[hidden]{display:none}" +
    ".octo-lb.open{opacity:1;visibility:visible}" +
    ".octo-lb__image{max-width:95vw;max-height:90vh;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.55);background:#fff}" +
    ".octo-lb__image:focus-visible,.octo-lb__x:focus-visible{outline:3px solid #fff;outline-offset:4px}" +
    ".octo-lb__cap{position:absolute;left:0;right:0;bottom:20px;text-align:center;color:#e7eef0;font-family:'Figtree',system-ui,sans-serif;font-size:.9rem;font-weight:600}" +
    ".octo-lb__x{position:absolute;top:18px;right:22px;width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;font-size:24px;line-height:1;cursor:pointer}" +
    ".octo-lb__x:hover{background:rgba(255,255,255,.2)}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function host(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }

  function render() {
    Object.keys(byMod).forEach(function (modId) {
      var mod = document.getElementById(modId);
      if (!mod || mod.querySelector(".obs-further")) return;
      function cards(list, isProj) {
        return (list || []).map(function (r) {
          return '<a class="obs-further__card' + (isProj ? " obs-further__card--proj" : "") + '" href="' + r.url + '" target="_blank" rel="noopener">' +
            '<span class="obs-further__t">' + r.title + "</span>" +
            '<span class="obs-further__s">' + r.summary + "</span>" +
            '<span class="obs-further__l">' + host(r.url) + " ↗</span></a>";
        }).join("");
      }
      var articles = "", projects = "";
      byMod[modId].forEach(function (g) {
        articles += cards(g.items, false);
        projects += cards(g.projects, true);
      });
      var html = '<section class="obs-further">';
      if (articles) html += '<h3>Further reading — hands-on guides &amp; demos</h3><div class="obs-further__grid">' + articles + "</div>";
      if (projects) html += '<h3 style="margin-top:24px">Open-source projects by @adibirzu</h3><div class="obs-further__grid">' + projects + "</div>";
      html += "</section>";
      mod.insertAdjacentHTML("beforeend", html);
    });
  }

  function disclaimer() {
    if (document.querySelector(".obs-disclaimer")) return;
    var main = document.querySelector(".main-content") || document.body;
    var d = document.createElement("div");
    d.className = "obs-disclaimer";
    d.innerHTML = "<strong>Not an Oracle product.</strong> OCTO Observability Atlas is an independent, community-built project to simplify understanding of Oracle's observability tools. It is not affiliated with, sponsored by, or endorsed by Oracle. Oracle, OCI, and Redwood are trademarks of Oracle and/or its affiliates, used for identification only.";
    main.appendChild(d);
  }
  function lightbox() {
    if (document.querySelector(".octo-lb")) return;
    var lb = document.createElement("div");
    lb.className = "octo-lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-labelledby", "octo-lightbox-caption");
    lb.hidden = true;
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "octo-lb__x";
    closeButton.setAttribute("aria-label", "Close expanded screenshot");
    closeButton.textContent = "×";
    var big = document.createElement("img");
    big.className = "octo-lb__image";
    big.tabIndex = 0;
    var cap = document.createElement("div");
    cap.className = "octo-lb__cap";
    cap.id = "octo-lightbox-caption";
    lb.append(closeButton, big, cap);
    document.body.appendChild(lb);
    var returnFocus = null;
    var previousOverflow = "";

    function close() {
      if (lb.hidden) return;
      lb.classList.remove("open");
      lb.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
      returnFocus = null;
    }

    function trapFocus(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      var focusable = [closeButton, big];
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!focusable.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }

    function open(box) {
      var im = box.querySelector("img");
      if (!im) return;
      var card = box.closest(".showcase-card"), h = card && card.querySelector("h4");
      var label = h ? h.textContent : (im.alt || "Expanded screenshot");
      returnFocus = box;
      previousOverflow = document.body.style.overflow;
      big.src = im.currentSrc || im.src;
      big.alt = "Expanded view of " + label;
      cap.textContent = label;
      lb.hidden = false;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      closeButton.focus();
    }

    closeButton.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    lb.addEventListener("keydown", trapFocus);
    document.querySelectorAll(".showcase-image").forEach(function (box) {
      if (box.tagName !== "BUTTON") {
        box.setAttribute("role", "button");
        box.tabIndex = 0;
        box.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(box);
          }
        });
      }
      box.addEventListener("click", function () { open(box); });
    });
  }
  function init() { render(); disclaimer(); lightbox(); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
