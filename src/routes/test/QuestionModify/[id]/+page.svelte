<script>
    // svelte 라이브러리
    import { page }             from '$app/stores';             // url 파라미터 추출
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    // external 라이브러리
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    // custom 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈   
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트
    import { is_login , user_nm , email}  from "$lib/stores/test.js";       

    
    const parameter = $page.params;
    //export let params = {};
    const question_id = parameter['id'];    

    let error = {detail:[]}
    let subject = ''
    let content = ''

    fastapi("get", "/test/question/detail/" + question_id, {}, (json) => {
        subject = json.subject
        content = json.content
    })

    function update_question(event) {
        event.preventDefault()
        let url = "/test/question/update"
        let params = {
            question_id: question_id,
            subject: subject,
            content: content,
        }
        fastapi('put', url, params, 
            (json) => {
                goto('/test/detail/'+question_id)
            },
            (json_error) => {
                error = json_error
            }
        )
    }
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">질문 수정</h5>
    <ErrorMsg error={error} />
    <form method="post" class="my-3">
        <div class="mb-3">
            <label for="subject">제목</label>
            <input type="text" class="form-control" bind:value="{subject}">
        </div>
        <div class="mb-3">
            <label for="content">내용</label>
            <textarea class="form-control" rows="10" bind:value="{content}"></textarea>
        </div>
        <button class="btn btn-primary" on:click="{update_question}">수정하기</button>
    </form>
</div>
