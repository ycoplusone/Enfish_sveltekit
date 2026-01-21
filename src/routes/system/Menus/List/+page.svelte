<script>
    import { onMount } from 'svelte';

    // 당신 프로젝트에 이미 있는 fastapi 래퍼를 import 해서 쓰면 됩니다.
    // 예: src/lib/api.js 또는 src/lib/fastapi.js 등
    import fastapi                          from "$lib/api.js";             // api 호출 모듈

    let _list = [];

    // 검색/필터
    let q = '';
    let useFilter = 'ALL';

    // 선택된 row
    let selected = null;
    let mode = 'create'; // create | edit

    // 폼 상태
    let form = {
        id: '',
        menu_nm: '',
        group_nm: '',
        url_path: '',
        use_yn: 'Y',
        sort_no: '9999'
    };

    // 간단한 상태 UI
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
        form = { id: '', menu_nm: '', group_nm: '', url_path: '', use_yn: 'Y', sort_no: '9999' };
        clearMsg();
    }

    function pick(row) {
        selected = row;
        mode = 'edit';
        form = {
        id: String(row.id),
        menu_nm: row.menu_nm || '',
        group_nm: row.group_nm || '',
        url_path: row.url_path || '',
        use_yn: row.use_yn || 'Y',
        sort_no: row.sort_no || '9999'
        };
        clearMsg();
    }

    function validateForm() {
        if (!form.menu_nm.trim()) return 'menu_nm is required';
        if (!form.group_nm.trim()) return 'group_nm is required';
        if (!form.url_path.trim()) return 'url_path is required';
        if (form.use_yn !== 'Y' && form.use_yn !== 'N') return 'use_yn must be Y or N';
        return '';
    }

    async function loadList() {
        loading = true;
        clearMsg();

        // params를 쓰고 싶으면 여기서 구성
        const params = {};

        try {
          await fastapi('get', '/system/menus/list/', params, (json) => {
              _list = (json && json.datas) ? json.datas : [];
          });
        } catch (e) {
        errorMsg = 'List load failed';
        } finally {
        loading = false;
        }
    }

    async function createMenu() {
        const msg = validateForm();
        if (msg) {
        errorMsg = msg;
        return;
        }

        saving = true;
        clearMsg();

        const params = {
        menu_nm: form.menu_nm.trim(),
        group_nm: form.group_nm.trim(),
        url_path: form.url_path.trim(),
        use_yn: form.use_yn,
        sort_no: String(form.sort_no || '9999').trim()
        };

        try {
        await fastapi('post', '/system/menus/create/', params, (json) => {
            // 서버 응답 구조에 따라 메시지/처리를 조정 가능
            loadList();
        });

        okMsg = 'Created';

        resetToCreate();
        } catch (e) {
        errorMsg = 'Create failed';
        } finally {
        saving = false;
        }
    }

    async function updateMenu() {
        if (!form.id) {
        errorMsg = 'id is required for update';
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
        id: Number(form.id),
        menu_nm: form.menu_nm.trim(),
        group_nm: form.group_nm.trim(),
        url_path: form.url_path.trim(),
        use_yn: form.use_yn,
        sort_no: String(form.sort_no || '9999').trim()
        };

        try {
        await fastapi('put', '/system/menus/update/', params, (json) => {
            loadList();
        });

        okMsg = 'Saved';
        resetToCreate();
        } catch (e) {
        errorMsg = 'Update failed';
        } finally {
        saving = false;
        }
    }

    async function deleteMenu(row) {
        if (!row?.id) return;

        const ok = confirm(`Delete menu id=${row.id} (${row.menu_nm}) ?`);
        if (!ok) return;

        saving = true;
        clearMsg();

        const params = { id: Number(row.id) };

        try {
        await fastapi('delete', '/system/menus/delete/', params, (json) => {
            loadList();
        });

        okMsg = 'Deleted';
        

        if (selected && selected.id === row.id) resetToCreate();
        } catch (e) {
        errorMsg = 'Delete failed';
        } finally {
        saving = false;
        }
    }

  $: filtered = _list
    .filter((m) => (useFilter === 'ALL' ? true : m.use_yn === useFilter))
    .filter((m) => {
      if (!q.trim()) return true;
      const s = q.trim().toLowerCase();
      return (
        String(m.menu_nm || '').toLowerCase().includes(s) ||
        String(m.group_nm || '').toLowerCase().includes(s) ||
        String(m.url_path || '').toLowerCase().includes(s)
      );
    })
    .slice()
    .sort((a, b) => {
      const an = Number(a.sort_no || 9999);
      const bn = Number(b.sort_no || 9999);
      if (an !== bn) return an - bn;
      return (a.id || 0) - (b.id || 0);
    });    

  onMount(loadList);
</script>

<div class="container-fluid py-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h4 class="mb-0">System Menu Management</h4>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" type="button" on:click={loadList} disabled={loading || saving}>
        Refresh
      </button>
      <button class="btn btn-outline-secondary" type="button" on:click={resetToCreate} disabled={saving}>
        New Menu
      </button>
    </div>
  </div>

  {#if errorMsg}
    <div class="alert alert-danger py-2">{errorMsg}</div>
  {/if}
  {#if okMsg}
    <div class="alert alert-success py-2">{okMsg}</div>
  {/if}

  <div class="row g-3">
    <!-- LIST -->
    <div class="col-12 col-lg-7">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-6">
              <input class="form-control" placeholder="Search (menu/group/path)" bind:value={q} />
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
                <th style="width:70px;">ID</th>
                <th>Menu</th>
                <th>Group</th>
                <th>Path</th>
                <th style="width:80px;">Use</th>
                <th style="width:90px;">Sort</th>
                <th style="width:140px;" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if filtered.length === 0}
                <tr>
                  <td colspan="7" class="text-center text-muted py-4">No data</td>
                </tr>
              {:else}
                {#each filtered as row (row.id)}
                  <tr
                    class:selected-row={selected && selected.id === row.id}
                    on:click={() => pick(row)}
                    style="cursor:pointer;"
                  >
                    <td>{row.id}</td>
                    <td class="fw-semibold">{row.menu_nm}</td>
                    <td>{row.group_nm}</td>
                    <td class="text-muted">{row.url_path}</td>
                    <td>
                      {#if row.use_yn === 'Y'}
                        <span class="badge text-bg-success">Y</span>
                      {:else}
                        <span class="badge text-bg-secondary">N</span>
                      {/if}
                    </td>
                    <td>{row.sort_no}</td>
                    <td class="text-end" on:click|stopPropagation>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        type="button"
                        on:click={() => deleteMenu(row)}
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
            {#if mode === 'create'}Create Menu{:else}Edit Menu (ID: {form.id}){/if}
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
            <label class="form-label">Menu Name</label>
            <input class="form-control" bind:value={form.menu_nm} />
          </div>

          <div class="mb-3">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-label">Group Name</label>
            <input class="form-control" bind:value={form.group_nm} />
          </div>

          <div class="mb-3">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-label">URL Path</label>
            <input class="form-control" bind:value={form.url_path} />
            <div class="form-text">Example: /system/menu</div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">Use</label>
              <select class="form-select" bind:value={form.use_yn}>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            <div class="col-6">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">Sort No</label>
              <input class="form-control" bind:value={form.sort_no} />
            </div>
          </div>

          <div class="d-flex gap-2">
            {#if mode === 'create'}
              <button class="btn btn-primary" type="button" on:click={createMenu} disabled={saving}>
                {#if saving}Saving...{:else}Create{/if}
              </button>
            {:else}
              <button class="btn btn-primary" type="button" on:click={updateMenu} disabled={saving}>
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
