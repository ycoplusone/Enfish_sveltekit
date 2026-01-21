<script>
  import { onMount } from 'svelte';
  import fastapi                          from "$lib/api.js";             // api 호출 모듈

  // endpoints
  const API_ROLES_LIST = '/system/roles/list';
  const API_MENUS_LIST = '/system/menus/list';
  const API_PERMISSION_GET = '/system/permission/get';

  const API_PERMISSION_CREATE = '/system/permission/create';
  const API_PERMISSION_UPDATE = '/system/permission/update';
  const API_PERMISSION_DELETE = '/system/permission/delete';

  // state
  let roles = [];
  let menus = [];  
  let permissions = [];

  let selectedRole = null;

  // "추가된 리스트" (서버 조회 API가 없으므로 화면 내 상태로 관리)
  // item shape: { role_id, menu_id, use_yn, menu_nm, group_nm, url_path, sort_no }
  

  // ui state
  let loadingRoles = false;
  let loadingMenus = false;
  let busy = false;
  let errorMsg = '';

  let menuSearch = '';
  let showOnlyEnabledMenus = false;
  let showOnlyEnabledPermissions = false;

  const safe = (v) => (v === null || v === undefined ? '' : String(v));

  const menuFiltered = () => {
    const q = menuSearch.trim().toLowerCase();
    return menus
      .filter((m) => (showOnlyEnabledMenus ? m.use_yn === 'Y' : true))
      .filter((m) => {
        if (!q) return true;
        return (
          safe(m.menu_nm).toLowerCase().includes(q) ||
          safe(m.group_nm).toLowerCase().includes(q) ||
          safe(m.url_path).toLowerCase().includes(q) ||
          safe(m.id).toLowerCase().includes(q)
        );
      });
      //.sort((a, b) => safe(a.sort_no).localeCompare(safe(b.sort_no)));
  };

  const permissionsFiltered = () => {
    //return permission.filter((p) => (showOnlyEnabledPermissions ? p.menu.use_yn === 'Y' : true));
    return permissions
      .filter((m) => (showOnlyEnabledPermissions ? m.use_yn === 'Y' : true));
  };

  function resetError() {
    errorMsg = '';
  }

  async function loadRoles() {
    loadingRoles = true;
    resetError();
    try {
        await fastapi('get', API_ROLES_LIST, {}, (json) => {
            roles = (json && json.datas) ? json.datas : [];
        });      

    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      loadingRoles = false;
    }
  }

  async function loadMenus() {
    loadingMenus = true;
    resetError();
    try {
        await fastapi('get', API_MENUS_LIST, {}, (json) => {
            menus = (json && json.datas) ? json.datas : [];
        });  
    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      loadingMenus = false;
    }
  }

  async function loadPermission() {
    resetError();
    try {
        await fastapi('get', API_PERMISSION_GET+'/'+selectedRole.role_id, {}, (json) => {
            permissions = (json && json.datas) ? json.datas : [];
        });  
    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      loadingMenus = false;
    }
  }  

  function selectRole(role) {
    selectedRole = role;
    // 서버에 "권한 조회 API"가 없다면, 최소한 UX 관점에서 role 변경 시 화면 내 리스트를 분리하는 게 안전합니다.
    // 만약 role별로 따로 유지하고 싶으면 map(role_id -> permissions[]) 구조로 바꾸세요.
    permissions = [];
    loadPermission()
  }

  function permissionKey(role_id, menu_id) {    
    return `${role_id}::${menu_id}`;
  }

  function alreadyAdded(role_id, menu_id) {    
    return permissions.some((p) => p.role_id === role_id && Number(p.menu_id) === Number(menu_id));
  }

  async function addPermissionFromMenu(menu) {
    if (!selectedRole) {
      errorMsg = '먼저 Role을 선택해야 합니다.';
      return;
    }
    resetError();
    
    const role_id = selectedRole.role_id;
    const menu_id = Number(menu.id);
    
    if (alreadyAdded(role_id, menu_id)) {
      // 중복 생성 방지 (서버가 중복을 허용하지 않는 경우가 많음)
      return;
    }
    
    busy = true;
    try {
        await fastapi('post', API_PERMISSION_CREATE, { role_id, menu_id }, (j) => {
            loadPermission();
        });
        
    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      busy = false;
    }

  }

  async function togglePermissionUseYn(p) {    
    resetError();
    busy = true;
    try {
        const nextUseYn = p.use_yn === 'Y' ? 'N' : 'Y';
        await fastapi(
            'put',
            API_PERMISSION_UPDATE,
            { role_id: p.role_id, menu_id: Number(p.menu_id), use_yn: nextUseYn },
            (j) => j
        );

        const k = permissionKey(p.role_id, p.menu_id);
        permissions = permissions.map((x) =>
            permissionKey(x.role_id, x.menu_id) === k ? { ...x, use_yn: nextUseYn } : x
        );
    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      busy = false;
    }
  }

  async function deletePermission(p) {
    resetError();
    busy = true;
    try {
      await fastapi(
        'DELETE',
        API_PERMISSION_DELETE,
        { role_id: p.role_id, menu_id: Number(p.menu_id) },
        (j) => j
      );

      const k = permissionKey(p.role_id, p.menu_id);
      permissions = permissions.filter((x) => permissionKey(x.role_id, x.menu_id) !== k);
    } catch (e) {
      errorMsg = e?.message ?? String(e);
    } finally {
      busy = false;
    }
  }

  onMount(async () => {
    await Promise.all([loadRoles(), loadMenus()]);
  });
</script>

<style>
  .wrap {
    display: grid;
    grid-template-columns: 320px 1fr 520px;
    gap: 12px;
    padding: 12px;
  }
  .panel {
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 12px;
    background: #fff;
    min-height: 560px;
    display: flex;
    flex-direction: column;
  }
  .panel h2 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 700;
  }
  .toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .toolbar input[type='text'] {
    flex: 1;
    min-width: 180px;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  .toolbar label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #333;
    user-select: none;
  }
  .btn {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
    cursor: pointer;
    font-size: 12px;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .list {
    overflow: auto;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
    flex: 1;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  th, td {
    border-bottom: 1px solid #f1f1f1;
    padding: 8px 6px;
    vertical-align: top;
    text-align: left;
  }
  th {
    font-size: 11px;
    color: #666;
    font-weight: 700;
    background: #fcfcfc;
    position: sticky;
    top: 0;
  }
  tr.selected td {
    background: #f3f6ff;
  }
  .pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid #ddd;
    background: #fff;
  }
  .pill.y {
    border-color: #cfe6cf;
    background: #f2fbf2;
  }
  .pill.n {
    border-color: #f1d0d0;
    background: #fff5f5;
  }
  .muted {
    color: #777;
    font-size: 12px;
    margin-top: 6px;
  }
  .error {
    border: 1px solid #f2c6c6;
    background: #fff3f3;
    padding: 10px;
    border-radius: 10px;
    margin: 12px;
    font-size: 12px;
    color: #7a1b1b;
  }
</style>

{#if errorMsg}
  <div class="error">{errorMsg}</div>
{/if}

<div class="wrap">
  <!-- Roles -->
  <section class="panel">
    <h2>Roles</h2>

    <div class="toolbar">
      <button class="btn" on:click={loadRoles} disabled={loadingRoles || busy}>
        {loadingRoles ? '로딩중...' : '새로고침'}
      </button>
      {#if selectedRole}
        <span class="pill y">선택: {selectedRole.role_id}</span>
      {:else}
        <span class="pill">선택된 Role 없음</span>
      {/if}
    </div>

    <div class="list">
      <table>
        <thead>
          <tr>
            <th style="width: 92px;">role_id</th>
            <th>role_nm</th>
            <th style="width: 54px;">use</th>
          </tr>
        </thead>
        <tbody>
          {#each roles as r (r.role_id)}
            <tr
              class="{selectedRole?.role_id === r.role_id ? 'selected' : ''}"
              on:click={() => selectRole(r)}
              style="cursor:pointer;"
            >
              <td>{r.role_id}</td>
              <td>{r.role_nm}</td>
              <td>
                <span class="pill {r.use_yn === 'Y' ? 'y' : 'n'}">{r.use_yn}</span>
              </td>
            </tr>
          {/each}
          {#if !loadingRoles && roles.length === 0}
            <tr><td colspan="3" class="muted">roles 데이터가 없습니다.</td></tr>
          {/if}
        </tbody>
      </table>
    </div>

    <div class="muted">
      Role 선택 후, 가운데 메뉴를 클릭하면 permission이 즉시 생성됩니다.
    </div>
  </section>

  <!-- Menus -->
  <section class="panel">
    <h2>Menus</h2>
    <div class="toolbar">
      <input
        type="text"
        placeholder="메뉴 검색: menu_nm, group_nm, url_path"
        bind:value={menuSearch}
        disabled={loadingMenus || busy}
      />
      <label>
        <input type="checkbox" bind:checked={showOnlyEnabledMenus} />
        use_yn=Y
      </label>
      <button class="btn" on:click={loadMenus} disabled={loadingMenus || busy}>
        {loadingMenus ? '로딩중...' : '새로고침'}
      </button>
    </div>

    <div class="list">
      <table>
        <thead>
          <tr>
            <th style="width: 54px;">id</th>
            <th>menu</th>
            <th style="width: 70px;">group</th>
            <th style="width: 70px;">sort</th>
            <th style="width: 70px;">add</th>
          </tr>
        </thead>
        <tbody>
          {#each menuFiltered() as m (m.id)}
            <tr>
              <td>{m.id}</td>
              <td>
                <div>{m.menu_nm} | {m.use_yn}</div>
                <div class="muted">{m.url_path}</div>
              </td>
              <td>{m.group_nm}</td>
              <td>{m.sort_no}</td>
              <td>
                <button class="btn"                  
                    	disabled={!selectedRole || busy || alreadyAdded(selectedRole?.role_id, m.id)}
                        on:click={() => addPermissionFromMenu(m)}
                  title={!selectedRole ? 'Role을 먼저 선택하세요' : '권한 추가'}
                >
                  {#if selectedRole && alreadyAdded(selectedRole.role_id, m.id)}
                    추가됨
                  {:else}
                    추가
                  {/if}
                </button>
              </td>
            </tr>
          {/each}
          {#if !loadingMenus && menus.length === 0}
            <tr><td colspan="5" class="muted">menus 데이터가 없습니다.</td></tr>
          {/if}
        </tbody>
      </table>
    </div>

    <div class="muted">
      권한 생성 API는 단건 입력(role_id, menu_id)만 받으므로 메뉴 클릭 단위로 즉시 생성하도록 구성했습니다.
    </div>
  </section>

  <!-- Permissions -->
  <section class="panel">
    <h2>Permissions (추가된 리스트)</h2>
    <div class="toolbar">
      <label>
        <input type="checkbox" bind:checked={showOnlyEnabledPermissions} />
        use_yn=Y
      </label>
      <span class="pill">
        {selectedRole ? `role: ${selectedRole.role_id}` : 'role 미선택'}
      </span>
      <span class="pill">
        {permissions.length}건
      </span>
    </div>

    <div class="list">
      <table>
        <thead>
          <tr>
            <th style="width: 54px;">menu_id</th>
            <th>menu(group | url_path | sort_no)</th>
            <th style="width: 60px;">use</th>
            <th style="width: 160px;">actions</th>
          </tr>
        </thead>
        <tbody>
          {#each permissionsFiltered() as p (permissionKey(p.role_id, p.menu_id))}
            <tr >
              <td>{p.menu_id}</td>
              <td>
                <div>{p.menu.menu_nm}</div>
                <div class="muted">{p.menu.group_nm} | {p.menu.url_path} | {p.menu.sort_no}</div>
              </td>
              <td>
                <span class="pill {p.use_yn === 'Y' ? 'y' : 'n'}">{p.use_yn}</span>
              </td>
              <td>
                <button class="btn" disabled={busy} on:click={() => togglePermissionUseYn(p)}>
                  use_yn
                </button>
                <button class="btn" disabled={busy} on:click={() => deletePermission(p)}>
                  삭제
                </button>
              </td>
            </tr>
          {/each}
          {#if permissions.length === 0}
            <tr>
              <td colspan="4" class="muted">
                {#if !selectedRole}
                  Role을 선택하세요.
                {:else}
                  아직 추가된 permission이 없습니다. 가운데에서 메뉴를 추가하세요.
                {/if}
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>

    <div class="muted">
      서버에서 role별 permission을 “항상 조회”하려면 permission 조회 API가 별도로 필요합니다.
    </div>
  </section>
</div>
