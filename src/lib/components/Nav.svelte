<script>
  // info.js는 “구현 참고용”으로만 두고, 아래 로직은 permissions 데이터만 이용합니다.
  import {
    user_nm,
    is_login,
    resetUserStores,
    page,
    keyword,
    permissions
  } from "$lib/stores/Info.js";

  // localStorage fallback (원하시면 key 명만 맞추면 됩니다)
  const STORAGE_KEY = "permissions";

  function safeJsonParse(v, fallback) {
    try {
      const parsed = JSON.parse(v);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function normalizePath(p) {
    if (!p) return "";
    const s = String(p).trim();
    // 허용: / 로 시작하는 내부 라우트만
    return s.startsWith("/") ? s : "";
  }

  function buildMenuTree(permissionRows) {
    const rows = Array.isArray(permissionRows) ? permissionRows : [];

    // 1) permission.use_yn=Y, menu.use_yn=Y, url_path 유효한 것만
    const usable = rows
      .filter((r) => String(r?.use_yn || "").toUpperCase() === "Y")
      .map((r) => ({
        role_id: r?.role_id,
        menu_id: r?.menu_id,
        menu_nm: r?.menu?.menu_nm ?? "",
        group_nm: r?.menu?.group_nm ?? "ETC",
        url_path: normalizePath(r?.menu?.url_path),
        sort_no: r?.menu?.sort_no ?? "ZZZ",
        menu_use_yn: String(r?.menu?.use_yn || "").toUpperCase()
      }))
      .filter((r) => r.menu_use_yn === "Y")
      .filter((r) => !!r.url_path);

    // 2) 그룹별로 묶기
    const groupMap = new Map();
    for (const r of usable) {
      const g = String(r.group_nm || "ETC").trim() || "ETC";
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g).push(r);
    }

    // 3) 그룹 내 정렬( sort_no -> menu_nm )
    const groups = [];
    for (const [group_nm, items] of groupMap.entries()) {
      items.sort((a, b) => {
        const s1 = String(a.sort_no);
        const s2 = String(b.sort_no);
        if (s1 !== s2) return s1.localeCompare(s2);
        return String(a.menu_nm).localeCompare(String(b.menu_nm));
      });

      // url_path 중복 제거
      const seen = new Set();
      const deduped = [];
      for (const it of items) {
        if (seen.has(it.url_path)) continue;
        seen.add(it.url_path);
        deduped.push(it);
      }

      groups.push({ group_nm, items: deduped });
    }

    // 4) 그룹 정렬( group_nm )
    //groups.sort((a, b) => String(a.group_nm).localeCompare(String(b.group_nm)));

    return groups;
  }

  // permissions 원본: 스토어 우선, 없으면 localStorage
  let permissionSource = [];
  let menuGroups = [];

  $: if ($is_login) {
    const storePerms = $permissions; // store에 들어있다면 이것 사용
    if (Array.isArray(storePerms) && storePerms.length) {
      permissionSource = storePerms;
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      permissionSource = safeJsonParse(raw, []);
    }
    menuGroups = buildMenuTree(permissionSource);
  } else {
    permissionSource = [];
    menuGroups = [];
  }
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
  <div class="container-fluid">
    <a
      class="navbar-brand"
      href="/"
      on:click={() => {
        $page = 0;
        $keyword = "";
      }}
      >Enfish</a
    >

    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        {#if $is_login}
          <!-- 2단 트리 메뉴: 그룹(상위) -> 메뉴(하위) -->
          {#each menuGroups as g (g.group_nm)}
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                on:click|preventDefault={() => {}}
              >
                {g.group_nm}
              </a>

              <ul class="dropdown-menu">
                {#each g.items as m (m.url_path)}
                  <li>
                    <a class="dropdown-item" href={m.url_path}>
                      {m.menu_nm}
                    </a>
                  </li>
                {/each}
              </ul>
            </li>
          {/each}

          <!-- 로그아웃 -->
          <li class="nav-item">
            <a
              href="/"
              class="nav-link"
              on:click={() => {
                resetUserStores();
              }}
              >로그아웃 ({$user_nm})</a
            >
          </li>
        {:else}
          <li class="nav-item">
            <a class="nav-link" href="/system/UserCreate">회원가입</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/system/UserLogin">로그인</a>
          </li>
        {/if}
      </ul>
    </div>
  </div>
</nav>
