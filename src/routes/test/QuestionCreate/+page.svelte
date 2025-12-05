<script>
    import { page }             from '$app/stores';        
    import fastapi              from "$lib/api.js";             // api 호출 모듈    
    import { onMount }          from 'svelte'; 
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트
    import { goto }             from '$app/navigation';         // 페이지 이동 함수

    let error = {detail:[]}
    let subject = ''
    let content = ''

    function post_question(event) {
        event.preventDefault()
        let url = "/test/question/create"
        let params = {
            subject: subject,
            content: content,
        }
        fastapi('post', url, params, 
            (json) => {
                goto("/test")
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
            <input type="text" class="form-control" bind:value="{subject}">
        </div>
        <div class="mb-3">
            <label for="content">내용</label>
            <textarea class="form-control" rows="10" bind:value="{content}"></textarea>
        </div>
        <button class="btn btn-primary" on:click="{post_question}">저장하기</button>
    </form>
</div>
