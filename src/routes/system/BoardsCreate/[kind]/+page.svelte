<script>    
    // svelte 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈    
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    import { page as param }                from '$app/stores';             // url 파라미터 추출

    // external 라이브러리
    // 
    // custom 라이브러리
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트
    
    
    let board_kind = $param.params.kind;
    let error = {detail:[]}
    let subject = ''
    let content = ''

    function post_board(event) {
        event.preventDefault()
        let url = "/system/boards/set"
        let params = {
            kind : board_kind ,
            subject: subject,
            content: content,
        }
        fastapi('post', url, params, 
            (json) => {
                goto("/system/Boards/"+board_kind)
            },
            (json_error) => {
                error = json_error
            }
        )
    }
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">질문 등록</h5>
    <Error error={error} />
    <form method="post" class="my-3">
        <div class="mb-3">
            <label for="subject">제목</label>
            <input type="text" name="subject" class="form-control" bind:value="{subject}"/>
        </div>
        <div class="mb-3">
            <label for="content">내용</label>
            <textarea class="form-control" name="content" rows="10" bind:value="{content}"></textarea>
        </div>
        <button class="btn btn-primary" on:click="{post_board}">저장하기</button>
    </form>
</div>
