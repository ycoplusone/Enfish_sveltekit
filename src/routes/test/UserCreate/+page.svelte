<script>
    // svelte 라이브러리
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    // external 라이브러리
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    // custom 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈   
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트   


    let error           = {detail:[]};
    let user_nm         = '';
    let password        = '';
    let password_chk    = '';
    let email           = '';

    function post_user(event) {
        event.preventDefault()
        let url = "/test/user/create"
        let params = {
            user_nm     : user_nm,
            password    : password,
            password_chk: password_chk,
            email: email
        }
        fastapi('post', url, params, 
            (json) => {
                goto('/test/UserLogin')
            },
            (json_error) => {
                error = json_error
            }
        )
    }
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">회원 가입</h5>
    <ErrorMsg error={error} />
    <form method="post">
        <div class="mb-3">
            <label for="username">사용자 이름</label>
            <input type="text" class="form-control" id="username" bind:value="{user_nm}">
        </div>
        <div class="mb-3">
            <label for="password">비밀번호</label>
            <input type="password" class="form-control" id="password" bind:value="{password}">
        </div>
        <div class="mb-3">
            <label for="password_chk">비밀번호 확인</label>
            <input type="password" class="form-control" id="password_chk" bind:value="{password_chk}">
        </div>
        <div class="mb-3">
            <label for="email">이메일</label>
            <input type="text" class="form-control" id="email" bind:value="{email}">
        </div>
        <button type="submit" class="btn btn-primary" on:click="{post_user}">생성하기</button>
    </form>
</div>
