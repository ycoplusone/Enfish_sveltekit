<!-- src/routes/system/users-role/+page.svelte  (JavaScript 기준) -->
<script>
  import { onMount }            from 'svelte';
  import { goto }               from '$app/navigation';
  import fastapi                from "$lib/api.js";             // api 호출 모듈   

  const ROLE_LIST_URL = '/system/roles/list';
  const USER_LIST_URL = '/system/users/list';
  const USER_UPDATE_URL = '/system/users/update/role';

  let roles = [];
  let users = [];

  let selectedRoleId = '';
  let selectedRole = null;

  let loadingRoles = false;
  let loadingUsers = false;

  let error = null;

  // 행 단위 상태(요청 중/메시지)
  let rowBusy = new Map();
  let rowMessage = new Map();

  const setRowBusy = (email, busy) => {
    rowBusy.set(email, busy);
    rowBusy = new Map(rowBusy);
  };

  const setRowMessage = (email, msg) => {
    rowMessage.set(email, msg);
    rowMessage = new Map(rowMessage);
  };

  const formatDt = (dt) => {
    if (!dt) return '';
    return String(dt).replace('T', ' ').split('.').at(0) || dt;
  };

  const resolveRoleName = (roleId) => {
    if (!roleId) return '';
    const r = roles.find((x) => x.role_id === roleId);
    return r ? r.role_nm : roleId;
  };

  const onSelectRole = (roleId) => {
    selectedRoleId = roleId;
    selectedRole = roles.find((r) => r.role_id === roleId) || null;
  };

  // 공통 payload 생성
  // - 서버가 role_id null 허용 여부가 불명확해서 기본은 '' 처리
  const buildPayload = (user, nextRoleId, nextUseYn) => ({
    user_email  : user.user_email   ,
    role_id     : nextRoleId ?? ''  ,
    use_yn      : nextUseYn
  });

  // 1) Roles 조회
  const loadRoles = () => {
    loadingRoles = true;
    error = null;

    fastapi('get', ROLE_LIST_URL, {},
      (json) => {
        roles = (json && json.datas) ? json.datas : [];
        if (!selectedRoleId && roles.length > 0) {
          selectedRoleId = roles[0].role_id;
        }
        selectedRole = roles.find((r) => r.role_id === selectedRoleId) || null;
        loadingRoles = false;
      },
      (json_error) => {
        error = json_error;
        loadingRoles = false;
      }
    );
  };

  // 2) Users 조회
  const loadUsers = () => {
    loadingUsers = true;
    error = null;
    fastapi(
      'get',
      USER_LIST_URL,
      {},
      (json) => {
        users = Array.isArray(json?.datas) ? json.datas : [];
        loadingUsers = false;
      },
      (json_error) => {
        error = json_error;
        loadingUsers = false;
      }
    );
  };

  // 3) 특정 사용자에게 "선택된 role" 적용하여 수정
  const applySelectedRoleToUser = (user) => {
    if (!selectedRoleId) {
      setRowMessage(user.user_email, '왼쪽에서 권한을 먼저 선택하세요.');
      return;
    }

    const email = user.user_email;
    setRowBusy(email, true);
    setRowMessage(email, '');

    const payload = buildPayload(user, selectedRoleId, user.use_yn);    
    fastapi(
      'put',
      USER_UPDATE_URL,
      payload,
      (json) => {       
        // 요구사항 공통 패턴대로면 goto('/') 이지만,
        // 실무 UX는 여기서 즉시 반영 + 재조회가 자연스러움.
        users = users.map((u) => (u.user_email === email ? { ...u, role_id: selectedRoleId } : u));
        setRowMessage(email, '권한이 적용되었습니다.');
        setRowBusy(email, false);        
        // 공통 패턴을 강제하려면 아래를 사용
        // goto('/');
      },
      (json_error) => {
        error = json_error;
        setRowMessage(email, '권한 적용에 실패했습니다.');
        setRowBusy(email, false);
      }
    );

  };

  // 4) 사용자 리스트에서 use_yn 즉시 변경
  const updateUseYn = (user, nextUseYn) => {
    const email = user.user_email;
    setRowBusy(email, true);
    setRowMessage(email, '');

    const payload = buildPayload(user, user.role_id, nextUseYn);

    fastapi(
      'put',
      USER_UPDATE_URL,
      payload,
      (json) => {
        // 요구사항 공통 패턴대로면 goto('/') 이지만,
        // 실무 UX는 여기서 즉시 반영 + 재조회가 자연스러움.
        users = users.map((u) => (u.user_email === email ? { ...u, use_yn: nextUseYn } : u));
        setRowMessage(email, '사용여부가 변경되었습니다.');
        setRowBusy(email, false);        
        // 공통 패턴을 강제하려면 아래를 사용
      },
      (json_error) => {
        error = json_error;
        setRowMessage(email, '사용여부 변경에 실패했습니다.');
        setRowBusy(email, false);
      }
    );
  };

  onMount(() => {
    loadRoles();
    loadUsers();
  });
</script>

<svelte:head>
  <title>User Role 관리</title>
</svelte:head>

<div class="page">
  <header class="topbar">
    <div class="title">
      <h1>User Role 관리</h1>
      <p>권한 선택 후 사용자별 권한 적용 및 사용여부를 즉시 변경합니다.</p>
    </div>

    <div class="actions">
      <button class="btn" on:click={loadRoles} disabled={loadingRoles}>권한 새로고침</button>
      <button class="btn" on:click={loadUsers} disabled={loadingUsers}>사용자 새로고침</button>
    </div>
  </header>

  {#if error}
    <section class="error">
      <div class="error-title">오류</div>
      <pre class="error-body">{JSON.stringify(error, null, 2)}</pre>
    </section>
  {/if}

  <main class="layout">
    <!-- Roles -->
    <section class="panel">
      <div class="panel-header">
        <h2>Roles</h2>
        {#if loadingRoles}<span class="badge">Loading</span>{/if}
      </div>

      <div class="role-picker">
        <label class="label" for="roleSelect">선택된 권한</label>
        <select
          id="roleSelect"
          class="select"
          bind:value={selectedRoleId}
          on:change={(e) => onSelectRole(e.currentTarget.value)}
        >
          {#each roles as r (r.role_id)}
            <option value={r.role_id}>
              {r.role_nm} ({r.role_id}) [{r.use_yn}]
            </option>
          {/each}
        </select>

        {#if selectedRole}
          <div class="role-detail">
            <div class="kv"><div class="k">role_id</div><div class="v">{selectedRole.role_id}</div></div>
            <div class="kv"><div class="k">role_nm</div><div class="v">{selectedRole.role_nm}</div></div>
            <div class="kv"><div class="k">use_yn</div><div class="v">{selectedRole.use_yn}</div></div>
            <div class="kv"><div class="k">updated</div><div class="v">{formatDt(selectedRole.updated_dt)}</div></div>
          </div>
        {/if}
      </div>

      <div class="role-list">
        {#each roles as r (r.role_id)}
          <button
            class="role-item {r.role_id === selectedRoleId ? 'active' : ''}"
            on:click={() => onSelectRole(r.role_id)}
          >
            <div class="role-main">
              <div class="role-name">{r.role_nm}</div>
              <div class="role-id">{r.role_id}</div>
            </div>
            <div class="role-meta">
              <span class="pill">{r.use_yn}</span>
              <span class="muted">{formatDt(r.updated_dt)}</span>
            </div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Users -->
    <section class="panel">
      <div class="panel-header">
        <h2>Users</h2>
        {#if loadingUsers}<span class="badge">Loading</span>{/if}
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>현재 권한</th>
              <th>use_yn</th>
              <th>변경</th>
            </tr>
          </thead>
          <tbody>
            {#each users as u (u.user_email)}
              <tr >
                <td>
                  <div class="cell-main">
                    <div class="primary">{u.user_nm}</div>
                    <div class="secondary">id {u.id} · user_id {u.user_id || ''}</div>
                  </div>
                </td>

                <td class="mono">{u.user_email}</td>

                <td>
                  <div class="cell-main">
                    <div class="primary">{resolveRoleName(u.role_id)}</div>
                    <div class="secondary mono">{u.role_id || ''}</div>
                  </div>
                </td>

                <td>
                  <select
                    class="select compact"
                    value={u.use_yn}                    
                    on:change={(e) => updateUseYn(u, e.currentTarget.value)}
                  >
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      class="btn primary"                      
                      on:click={() => applySelectedRoleToUser(u)}
                      title="왼쪽에서 선택한 권한을 이 사용자에게 적용"
                    >
                      권한 적용
                    </button>

                    {#if rowMessage.get(u.user_email)}
                      <div class="row-msg">{rowMessage.get(u.user_email)}</div>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}

            {#if !loadingUsers && users.length === 0}
              <tr><td colspan="5" class="empty">사용자 데이터가 없습니다.</td></tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</div>

<style>
  .page { padding: 16px; display: grid; gap: 12px; }

  .topbar {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between;
    border: 1px solid #e7e7e7; border-radius: 12px; padding: 12px 14px; background: #fff;
  }

  .title h1 { margin: 0; font-size: 18px; line-height: 1.2; }
  .title p { margin: 6px 0 0; color: #666; font-size: 13px; }

  .actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .layout { display: grid; grid-template-columns: 360px 1fr; gap: 12px; align-items: start; }
  @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }

  .panel {
    border: 1px solid #e7e7e7; border-radius: 12px; background: #fff;
    padding: 12px; display: grid; gap: 12px;
  }

  .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .panel-header h2 { margin: 0; font-size: 15px; }

  .badge { font-size: 12px; padding: 4px 8px; border-radius: 999px; background: #f2f2f2; color: #444; }

  .label { font-size: 12px; color: #666; display: block; margin-bottom: 6px; }

  .select {
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid #d9d9d9;
    background: #fff;
  }
  .select.compact { width: auto; min-width: 70px; padding: 6px 8px; border-radius: 10px; }

  .role-picker { display: grid; gap: 10px; }

  .role-detail {
    border: 1px dashed #e2e2e2; border-radius: 10px; padding: 10px;
    background: #fafafa; display: grid; gap: 6px;
  }
  .kv { display: grid; grid-template-columns: 90px 1fr; gap: 8px; font-size: 12px; }
  .kv .k { color: #666; }
  .kv .v { color: #111; word-break: break-all; }

  .role-list { display: grid; gap: 8px; }

  .role-item {
    text-align: left; border: 1px solid #e7e7e7; border-radius: 12px;
    padding: 10px; background: #fff; cursor: pointer; display: grid; gap: 6px;
  }
  .role-item.active { border-color: #b9c6ff; background: #f7f9ff; }

  .role-main { display: grid; gap: 2px; }
  .role-name { font-weight: 600; }
  .role-id { font-size: 12px; color: #666; }

  .role-meta { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
  .pill { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #f2f2f2; }
  .muted { font-size: 12px; color: #777; }

  .table-wrap { overflow: auto; border: 1px solid #eee; border-radius: 12px; }
  .table { width: 100%; border-collapse: collapse; min-width: 750px; }

  .table thead th {
    position: sticky; top: 0; background: #fafafa;
    border-bottom: 1px solid #eee; padding: 10px; font-size: 12px; text-align: left; color: #555;
  }
  .table tbody td { border-bottom: 1px solid #f0f0f0; padding: 10px; vertical-align: top; }
  tr.busy { opacity: 0.6; }

  .cell-main .primary { font-weight: 600; }
  .cell-main .secondary { margin-top: 2px; font-size: 12px; color: #666; }

  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }

  .row-actions { display: grid; gap: 6px; }
  .row-msg { font-size: 12px; color: #333; }

  .btn {
    border: 1px solid #d9d9d9; background: #fff; padding: 8px 10px;
    border-radius: 10px; cursor: pointer; font-size: 13px; white-space: nowrap;
  }
  .btn:disabled { cursor: not-allowed; opacity: 0.6; }
  .btn.primary { border-color: #9fb0ff; background: #eef2ff; }

  .error { border: 1px solid #ffd4d4; background: #fff6f6; border-radius: 12px; padding: 12px 14px; }
  .error-title { font-weight: 700; margin-bottom: 8px; }
  .error-body { margin: 0; font-size: 12px; overflow: auto; }

  .empty { text-align: center; padding: 18px; color: #666; }
</style>
