<script>    
    // svelte 라이브러리
          
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    // external 라이브러리
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    // custom 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈   
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트   
    import { access_token , user_nm , user_id , email , is_login }     from "$lib/stores/test.js";    // 스토어

    let error           = {detail:[]};
    let login_email     = "";
    let login_password  = "";   

    function login(event) {
        event.preventDefault()
        let url = "/test/user/login"
        let params = {
            username    : login_email   ,
            email       : login_email   ,
            password    : login_password,
        }
        fastapi('login', url, params, 
            (json) => {
                $access_token = json.access_token;
                $user_nm      = json.user_nm;
                $user_id      = json.user_id;
                $email        = json.email;
                $is_login     = true;
                goto("/test")
            },
            (json_error) => {
                error = json_error
            }
        )
    }    

</script>
<div class="container">
    <h5 class="my-3 border-bottom pb-2">로그인</h5>
    <ErrorMsg error={error} />
    <form method="post">
        <div class="mb-3">
            <label for="username">사용자 이름</label>
            <input type="text" class="form-control" id="username" bind:value="{login_email}">
        </div>
        <div class="mb-3">
            <label for="password">비밀번호</label>
            <input type="password" class="form-control" id="password" bind:value="{login_password}">
        </div>
        <button type="submit" class="btn btn-primary" on:click="{login}">로그인</button>
    </form>
</div>