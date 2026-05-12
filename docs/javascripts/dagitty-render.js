/**
 * dagpedia — dagitty renderer
 *
 * Converts fenced ```dagitty code blocks into interactive dagitty widgets.
 * dagitty.js must be loaded before this script (see mkdocs.yml extra_javascript).
 *
 * Dagitty.js source: https://github.com/jtextor/dagitty
 * Vendor into docs/javascripts/dagitty.js
 */

(function () {
  "use strict";

  /** Vendored dagitty bundle exposes GraphParser + DAGittyController (no `dagitty` global). */
  function isBundledDagittyLoaded() {
    return (
      typeof GraphParser !== "undefined" &&
      typeof DAGittyController !== "undefined"
    );
  }

  function parseDagGuess(code) {
    if (typeof GraphParser !== "undefined" && GraphParser.parseGuess) {
      return GraphParser.parseGuess(code);
    }
    if (typeof dagitty !== "undefined" && dagitty.GraphParser) {
      return dagitty.GraphParser.parseGuess(code);
    }
    throw new Error("GraphParser missing");
  }

  function relayoutGraph(graph) {
    if (typeof GraphLayouter !== "undefined" && GraphLayouter.Spring) {
      new GraphLayouter.Spring(graph).layout();
      return;
    }
    if (typeof dagitty !== "undefined" && dagitty.Layout) {
      new dagitty.Layout(graph).autoLayout();
    }
  }

  function createGraphView(canvas, graph) {
    if (typeof DAGittyController !== "undefined") {
      var ctrl = new DAGittyController({
        canvas: canvas,
        graph: graph,
        interactive: true,
      });
      return { view: ctrl.getView(), graph: graph };
    }
    if (typeof dagitty !== "undefined" && dagitty.GraphView) {
      var view = new dagitty.GraphView(canvas, graph);
      if (dagitty.Layout) {
        relayoutGraph(graph);
      }
      return { view: view, graph: graph };
    }
    throw new Error("DAGittyController / GraphView missing");
  }

  function renderDagittyBlocks() {
    // pymdownx `fence_div_format` → <div class="dagitty-code">raw text</div> (no <code>).
    // Default fenced code → <pre><code class="language-dagitty">…</code></pre>
    const roots = document.querySelectorAll(
      "pre code.language-dagitty, div.dagitty-code"
    );

    roots.forEach(function (root, idx) {
      const codeEl =
        root.tagName === "DIV"
          ? root.querySelector(":scope > code") || root
          : root;
      const dagCode = codeEl.textContent.trim();
      const pre = codeEl.closest("pre") || codeEl.closest("div");
      if (
        pre &&
        pre.previousElementSibling &&
        pre.previousElementSibling.classList.contains("dagitty-wrapper")
      ) {
        return;
      }

      // Create container
      const containerId = "dagitty-widget-" + idx;
      const wrapper = document.createElement("div");
      wrapper.className = "dagitty-wrapper";
      wrapper.innerHTML = `
        <div id="${containerId}" class="dagitty-canvas" style="width:100%;height:380px;"></div>
        <div class="dagitty-controls">
          <button class="dagitty-btn" data-action="reset" data-target="${containerId}">Reset layout</button>
          <button class="dagitty-btn" data-action="copy" data-code="${encodeURIComponent(dagCode)}">Copy code</button>
          <a class="dagitty-btn dagitty-external"
             href="https://dagitty.net/dags.html#${encodeURIComponent(dagCode)}"
             target="_blank" rel="noopener">Open in dagitty.net ↗</a>
        </div>
      `;

      pre.parentNode.insertBefore(wrapper, pre);
      pre.style.display = "none";

      const libOk =
        isBundledDagittyLoaded() ||
        (typeof dagitty !== "undefined" && dagitty.GraphParser);

      if (libOk) {
        try {
          const g = parseDagGuess(dagCode);
          const canvas = document.getElementById(containerId);
          const { view, graph } = createGraphView(canvas, g);
          canvas._dagittyView = view;
          canvas._dagittyGraph = graph;
          canvas._dagittyCode = dagCode;
        } catch (e) {
          renderFallback(containerId, dagCode, e.message);
        }
      } else {
        renderFallback(
          containerId,
          dagCode,
          "dagitty.js not loaded or incompatible build"
        );
      }
    });
  }

  function renderFallback(containerId, dagCode, reason) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;
    const encoded = encodeURIComponent(dagCode);
    canvas.style.height = "auto";
    canvas.style.padding = "1rem";
    canvas.style.background = "var(--md-code-bg-color, #f5f5f5)";
    canvas.style.borderRadius = "6px";
    canvas.style.fontSize = "13px";
    canvas.innerHTML = `
      <p style="margin:0 0 8px;color:var(--md-default-fg-color--light)">
        Interactive rendering unavailable (${reason}).
      </p>
      <a href="https://dagitty.net/dags.html#${encoded}"
         target="_blank" rel="noopener"
         style="color:var(--md-typeset-a-color)">
        View this DAG on dagitty.net ↗
      </a>
    `;
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".dagitty-btn");
    if (!btn || !btn.classList.contains("dagitty-btn")) return;
    const action = btn.dataset.action;

    if (action === "reset") {
      const canvas = document.getElementById(btn.dataset.target);
      if (canvas && canvas._dagittyView && canvas._dagittyGraph) {
        try {
          relayoutGraph(canvas._dagittyGraph);
          canvas._dagittyView.draw();
        } catch (_) {}
      }
    }

    if (action === "copy") {
      const code = decodeURIComponent(btn.dataset.code);
      navigator.clipboard.writeText(code).then(function () {
        const orig = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = orig;
        }, 1500);
      });
    }
  });

  // Run after MkDocs instantiation (supports instant navigation)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDagittyBlocks);
  } else {
    renderDagittyBlocks();
  }

  // Re-run on MkDocs instant navigation page changes
  document.addEventListener("DOMContentSwitch", renderDagittyBlocks);
})();
