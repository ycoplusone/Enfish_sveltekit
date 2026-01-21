<script>
  import { onMount } from 'svelte';
  import fastapi                          from "$lib/api.js";             // api 호출 모듈

  let _list = [];

  // 검색/필터
  let q = '';
  let useFilter = 'ALL';

  // 선택/모드
  let selected = null;
  let mode = 'create'; // create | edit

  // 폼 상태
  let form = {
    role_id: '',
    role_nm: '',
    use_yn: 'Y'
  };

  // 상태/메시지
  let loading = false;
  let saving = false;
  let errorMsg = '';
  let okMsg = '';

  function clearMsg() {
    errorMsg = '';
    okMsg = '';
  }

  function resetToCreate() {
    selected = null;
    mode = 'create';
    form = { role_id: '', role_nm: '', use_yn: 'Y' };
    clearMsg();
  }

  function pick(row) {
    selected = row;
    mode = 'edit';
    form = {
      role_id: String(row.role_id || ''),
      role_nm: String(row.role_nm || ''),
      use_yn: row.use_yn || 'Y'
    };
    clearMsg();
  }

  function validateForm() {
    if (!form.role_id.trim()) return 'role_id is required';
    if (!form.role_nm.trim()) return 'role_nm is required';
    if (form.use_yn !== 'Y' && form.use_yn !== 'N') return 'use_yn must be Y or N';
    return '';
  }

  // fastapi 래퍼가 Promise를 반환하지 않는 경우가 많아서 안전하게 Promise로 감쌈
  function fastapiAsync(method, url, params) {
    return new Promise((resolve, reject) => {
      try {
        fastapi(method, url, params, (json) => resolve(json));
      } catch (e) {
        reject(e);
      }
    });
  }

  async function loadList() {
    loading = true;
    clearMsg();

    const params = {}; // 필요 시 검색조건 등을 서버에 보내고 싶으면 여기에 추가

    try {
      const json = await fastapiAsync('get', '/system/roles/list', params);
      _list = (json && json.datas) ? json.datas : [];
    } catch (e) {
      errorMsg = 'List load failed';
    } finally {
      loading = false;
    }
  }

  async function createRole() {
    const msg = validateForm();
    if (msg) {
      errorMsg = msg;
      return;
    }

    saving = true;
    clearMsg();

    const params = {
      role_id: form.role_id.trim(),
      role_nm: form.role_nm.trim(),
      use_yn: form.use_yn
    };

    try {
      await fastapiAsync('post', '/system/roles/create', params);
      okMsg = 'Created';
      await loadList();
      resetToCreate();
    } catch (e) {
      errorMsg = 'Create failed';
    } finally {
      saving = false;
    }
  }

  async function updateRole() {
    if (!form.role_id.trim()) {
      errorMsg = 'role_id is required for update';
      return;
    }

    const msg = validateForm();
    if (msg) {
      errorMsg = msg;
      return;
    }

    saving = true;
    clearMsg();

    const params = {
      role_id: form.role_id.trim(),
      role_nm: form.role_nm.trim(),
      use_yn: form.use_yn
    };

    try {
      await fastapiAsync('put', '/system/roles/update', params);
      okMsg = 'Saved';
      await loadList();
      resetToCreate();
    } catch (e) {
      errorMsg = 'Update failed';
    } finally {
      saving = false;
    }
  }

  async function deleteRole(row) {
    if (!row?.role_id) return;

    const ok = confirm(`Delete role_id=${row.role_id} (${row.role_nm}) ?`);
    if (!ok) return;

    saving = true;
    clearMsg();

    const params = { role_id: String(row.role_id) };

    try {
      await fastapiAsync('delete', '/system/roles/delete', params);
      okMsg = 'Deleted';
      await loadList();

      if (selected && selected.role_id === row.role_id) resetToCreate();
    } catch (e) {
      errorMsg = 'Delete failed';
    } finally {
      saving = false;
    }
  }

  $: filtered = _list
    .filter((r) => (useFilter === 'ALL' ? true : r.use_yn === useFilter))
    .filter((r) => {
      if (!q.trim()) return true;
      const s = q.trim().toLowerCase();
      return (
        String(r.role_id || '').toLowerCase().includes(s) ||
        String(r.role_nm || '').toLowerCase().includes(s)
      );
    })
    .slice()
    .sort((a, b) => {
      // role_id가 문자열일 가능성이 높아 localeCompare 정렬
      return String(a.role_id || '').localeCompare(String(b.role_id || ''));
    });

  onMount(loadList);
</script>

<div class="container-fluid py-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h4 class="mb-0">Role Management</h4>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" type="button" on:click={loadList} disabled={loading || saving}>
        Refresh
      </button>
      <button class="btn btn-outline-secondary" type="button" on:click={resetToCreate} disabled={saving}>
        New Role
      </button>
    </div>
  </div>

  {#if errorMsg}
    <div class="alert alert-danger py-2 mb-3">{errorMsg}</div>
  {/if}
  {#if okMsg}
    <div class="alert alert-success py-2 mb-3">{okMsg}</div>
  {/if}

  <div class="row g-3">
    <!-- LIST -->
    <div class="col-12 col-lg-7">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-6">
              <input class="form-control" placeholder="Search (role_id / role_nm)" bind:value={q} />
            </div>
            <div class="col-6 col-md-3">
              <select class="form-select" bind:value={useFilter}>
                <option value="ALL">All</option>
                <option value="Y">Use=Y</option>
                <option value="N">Use=N</option>
              </select>
            </div>
            <div class="col-6 col-md-3 text-end">
              {#if loading}
                <span class="badge text-bg-warning">Loading...</span>
              {:else}
                <span class="badge text-bg-light">Total {filtered.length}</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 180px;">Role ID</th>
                <th>Role Name</th>
                <th style="width: 90px;">Use</th>
                <th style="width: 180px;">Updated</th>
                <th style="width: 180px;">User</th>
                <th style="width: 140px;" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if filtered.length === 0}
                <tr>
                  <td colspan="5" class="text-center text-muted py-4">No data</td>
                </tr>
              {:else}
                {#each filtered as row (row.role_id)}
                  <tr
                    class:selected-row={selected && selected.role_id === row.role_id}
                    on:click={() => pick(row)}
                    style="cursor:pointer;"
                  >
                    <td class="fw-semibold">{row.role_id}</td>
                    <td>{row.role_nm}</td>
                    <td>
                      {#if row.use_yn === 'Y'}
                        <span class="badge text-bg-success">Y</span>
                      {:else}
                        <span class="badge text-bg-secondary">N</span>
                      {/if}
                    </td>
                    <td class="text-muted small">{row.updated_dt}</td>
                    <td class="text-muted small">{row.user.user_nm}</td>
                    <td class="text-end" on:click|stopPropagation>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        type="button"
                        on:click={() => deleteRole(row)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FORM -->
    <div class="col-12 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <div class="fw-semibold">
            {#if mode === 'create'}Create Role{:else}Edit Role (Role ID: {form.role_id}){/if}
          </div>
          {#if mode === 'edit'}
            <button class="btn btn-sm btn-outline-secondary" type="button" on:click={resetToCreate} disabled={saving}>
              Cancel Edit
            </button>
          {/if}
        </div>

        <div class="card-body">
          <div class="mb-3">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-label">Role ID</label>
            <input
              class="form-control"
              bind:value={form.role_id}
              placeholder="ex) admin, manager, user"              
              disabled={mode === 'edit'}
            />
            <div class="form-text">
              Role ID는 보통 PK 성격이라 수정 모드에서는 잠그는 것을 권장합니다.
            </div>
          </div>

          <div class="mb-3">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-label">Role Name</label>
            <input class="form-control" bind:value={form.role_nm} placeholder="ex) 관리자, 매니저, 사용자" />
          </div>

          <div class="mb-3">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-label">Use</label>
            <select class="form-select" bind:value={form.use_yn}>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>

          <div class="d-flex gap-2">
            {#if mode === 'create'}
              <button class="btn btn-primary" type="button" on:click={createRole} disabled={saving}>
                {#if saving}Saving...{:else}Create{/if}
              </button>
            {:else}
              <button class="btn btn-primary" type="button" on:click={updateRole} disabled={saving}>
                {#if saving}Saving...{:else}Save{/if}
              </button>
            {/if}

            <button class="btn btn-outline-secondary" type="button" on:click={resetToCreate} disabled={saving}>
              Reset
            </button>
          </div>
        </div>

        {#if selected && selected.user}
          <div class="card-footer bg-white">
            <div class="small text-muted">
              Last editor: {selected.user.user_nm} ({selected.user.user_email})
            </div>
            <div class="small text-muted">
              Created: {selected.created_dt}
            </div>
            <div class="small text-muted">
              Updated: {selected.updated_dt}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(.selected-row) {
    background: rgba(13, 110, 253, 0.08);
  }
</style>
