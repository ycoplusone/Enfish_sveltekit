<script>
    import { access_token , user_email , user_nm , user_id ,  is_login , resetUserStores, page,keyword,permissions}     from "$lib/stores/Info.js";    // 스토어 
</script>

<!-- 네비게이션바 -->
<nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
    <div class="container-fluid">
        
        <a class="navbar-brand" href="/" on:click="{() => {$page = 0 , $keyword=''} }">Enfish</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon" > </span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                {#if $is_login }
                    <li class="nav-item">
                        <a class="nav-link" href="/system/Boards/test">Test</a>
                    </li>                
                    <li class="nav-item">
                        <a class="nav-link" href="/system/Boards/forget">forget</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/system/Menus/List">Menu</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/system/Roles/List">Role</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/system/Permission/List">Permission</a>
                    </li>                
                    <li class="nav-item">
                        <a class="nav-link" href="/system/User/RoleUpdate">RoleUpdate</a>
                    </li>                                            
                    <li class="nav-item">
                        <a href="/" class="nav-link" on:click={() => {
                            resetUserStores(); // 로그아웃 처리
                        }}>로그아웃 ({$user_nm})</a>
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