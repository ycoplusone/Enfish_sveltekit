<script>
    import { page , access_token , user_nm , user_id , email , is_login , keyword }     from "$lib/stores/test.js";    // 스토어 
</script>

<!-- 네비게이션바 -->
<nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
    <div class="container-fluid">
        <!--<a  class="navbar-brand" href="/test">Enfish</a> -->
        <a class="navbar-brand" href="/test" on:click="{() => {$page = 0 , $keyword=''}}">Enfish</a>
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
                        <a href="/test/UserLogin" class="nav-link" on:click={() => {
                            $access_token = ''
                            $user_nm = ''
                            $user_id = ''
                            $email = ''
                            $is_login = false
                        }}>로그아웃 ({$user_nm})</a>
                    </li>
                {:else}
                    <li class="nav-item">
                        <a class="nav-link" href="/test/UserCreate">회원가입</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/test/UserLogin">로그인</a>
                    </li>
                {/if}
            </ul>
        </div>
    </div>
</nav>
