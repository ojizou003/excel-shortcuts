/**
 * Excel ショートカットキー一覧表 - JavaScript
 * 検索機能とフィルタリング機能を提供
 */

document.addEventListener("DOMContentLoaded", () => {
  initializeSearch();
  initializeFilters();
  initializeScrollEffects();
  initializeSmoothScroll();
});

/**
 * 検索機能の初期化
 */
function initializeSearch() {
  const searchInput = document.getElementById("search-input");
  const heroSearchInput = document.getElementById("hero-search-input");

  let debounceTimer;

  // 検索ハンドラー関数
  const handleSearch = (e, otherInput) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim().toLowerCase();
      // 両方の検索バーを同期
      if (otherInput) {
        otherInput.value = e.target.value;
      }
      performSearch(query);

      // ヒーロー検索バーから検索した場合、結果セクションへスクロール
      if (e.target.id === "hero-search-input" && query) {
        const coreReference = document.getElementById("core-reference");
        if (coreReference) {
          const headerOffset = 80;
          const elementPosition = coreReference.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }, 200);
  };

  // 通常の検索バー
  if (searchInput) {
    searchInput.addEventListener("input", (e) =>
      handleSearch(e, heroSearchInput)
    );
  }

  // ヒーローセクションの検索バー
  if (heroSearchInput) {
    heroSearchInput.addEventListener("input", (e) =>
      handleSearch(e, searchInput)
    );
  }
}

/**
 * 検索を実行
 * @param {string} query - 検索クエリ
 */
function performSearch(query) {
  const tables = document.querySelectorAll(".shortcut-table");
  const categoryBlocks = document.querySelectorAll(".category-block");

  // すべてのハイライトをクリア
  clearHighlights();

  if (!query) {
    // クエリが空の場合はすべて表示
    showAllRows();
    categoryBlocks.forEach((block) => block.classList.remove("hidden"));
    return;
  }

  tables.forEach((table) => {
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      if (text.includes(query)) {
        row.classList.remove("hidden");
        highlightText(row, query);
      } else {
        row.classList.add("hidden");
      }
    });
  });

  // 結果がないカテゴリを非表示
  categoryBlocks.forEach((block) => {
    const table = block.querySelector(".shortcut-table");
    if (table) {
      const visibleRows = table.querySelectorAll("tbody tr:not(.hidden)");
      if (visibleRows.length === 0) {
        block.classList.add("hidden");
      } else {
        block.classList.remove("hidden");
      }
    }
  });
}

/**
 * すべてのハイライトをクリア
 */
function clearHighlights() {
  const highlights = document.querySelectorAll(".highlight");
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    parent.replaceChild(
      document.createTextNode(highlight.textContent),
      highlight
    );
    parent.normalize();
  });
}

/**
 * テキストをハイライト
 * @param {HTMLElement} element - 対象要素
 * @param {string} query - ハイライトするテキスト
 */
function highlightText(element, query) {
  const cells = element.querySelectorAll("td");
  cells.forEach((cell) => {
    // kbd 要素内はハイライトしない
    const textNodes = getTextNodes(cell);
    textNodes.forEach((node) => {
      const text = node.textContent;
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(query);

      if (index >= 0) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);

        const span = document.createElement("span");
        span.className = "highlight";
        span.textContent = match;

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(span);
        if (after) fragment.appendChild(document.createTextNode(after));

        node.parentNode.replaceChild(fragment, node);
      }
    });
  });
}

/**
 * テキストノードを取得
 * @param {HTMLElement} element - 対象要素
 * @returns {Text[]} テキストノードの配列
 */
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // kbd 要素内はスキップ
      if (node.parentNode.tagName === "KBD") {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) {
      textNodes.push(node);
    }
  }
  return textNodes;
}

/**
 * すべての行を表示
 */
function showAllRows() {
  const rows = document.querySelectorAll(".shortcut-table tbody tr");
  rows.forEach((row) => row.classList.remove("hidden"));
}

/**
 * フィルター機能の初期化
 */
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // アクティブ状態を更新
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");

      const filter = e.target.dataset.filter;
      applyFilter(filter);
    });
  });
}

/**
 * フィルターを適用
 * @param {string} filter - フィルター種類
 */
function applyFilter(filter) {
  const categoryBlocks = document.querySelectorAll(".category-block");
  const searchInput = document.getElementById("search-input");

  // 検索をクリア
  if (searchInput) {
    searchInput.value = "";
  }
  clearHighlights();
  showAllRows();

  if (filter === "all") {
    categoryBlocks.forEach((block) => block.classList.remove("hidden"));
    return;
  }

  categoryBlocks.forEach((block) => {
    const category = block.dataset.category;
    if (category === filter) {
      block.classList.remove("hidden");
    } else {
      block.classList.add("hidden");
    }
  });

  // フィルター適用時に対象セクションへスムーズスクロール
  const visibleBlock = document.querySelector(".category-block:not(.hidden)");
  if (visibleBlock) {
    const headerOffset = 180; // ヘッダー + 検索バーの高さ
    const elementPosition = visibleBlock.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

/**
 * スクロールエフェクトの初期化
 */
function initializeScrollEffects() {
  const header = document.querySelector(".header");
  let lastScrollY = 0;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      // ヘッダーの背景透明度調整
      if (currentScrollY > 100) {
        header.style.background = "rgba(15, 23, 42, 0.98)";
      } else {
        header.style.background = "rgba(15, 23, 42, 0.95)";
      }

      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  // 要素のフェードインアニメーション
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // アニメーション対象要素を監視
  const animatedElements = document.querySelectorAll(
    ".category-block, .triad-card, .advanced-card"
  );
  animatedElements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.5s ease ${
      index * 0.1
    }s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(el);
  });
}

/**
 * スムーズスクロールの初期化
 */
function initializeSmoothScroll() {
  const navLinks = document.querySelectorAll(".nav-link");
  const homeLink = document.getElementById("home-link");

  // ナビゲーションリンク
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // ホームリンク（ロゴ）
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // 検索をクリア
      const searchInput = document.getElementById("search-input");
      const heroSearchInput = document.getElementById("hero-search-input");
      if (searchInput) searchInput.value = "";
      if (heroSearchInput) heroSearchInput.value = "";
      clearHighlights();
      showAllRows();
      // すべてのカテゴリを表示
      document.querySelectorAll(".category-block").forEach((block) => {
        block.classList.remove("hidden");
      });
      // フィルターをリセット
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
      if (allBtn) allBtn.classList.add("active");
    });
  }
}

/**
 * キーボードショートカットのコピー機能
 * 各ショートカットをクリックでコピー
 */
document.addEventListener("click", (e) => {
  if (e.target.closest(".shortcut-table td:nth-child(2)")) {
    const cell = e.target.closest("td");
    const kbdElements = cell.querySelectorAll("kbd");
    const shortcutText = Array.from(kbdElements)
      .map((kbd) => kbd.textContent)
      .join(" + ");

    if (shortcutText) {
      navigator.clipboard
        .writeText(shortcutText)
        .then(() => {
          showToast(`"${shortcutText}" をコピーしました`);
        })
        .catch(() => {
          // クリップボードへのアクセスが拒否された場合
          console.log("クリップボードへのアクセスが拒否されました");
        });
    }
  }
});

/**
 * トースト通知を表示
 * @param {string} message - 表示するメッセージ
 */
function showToast(message) {
  // 既存のトーストを削除
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1e7b46 0%, #16a34a 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideUp 0.3s ease;
    `;

  document.body.appendChild(toast);

  // スタイルを追加（初回のみ）
  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideDown {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
            }
        `;
    document.head.appendChild(style);
  }

  // 2秒後に消去
  setTimeout(() => {
    toast.style.animation = "slideDown 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
