<script>
    /*
    import fastapi from "../lib/api"
    import Error from "../components/Error.svelte"
    import { push } from 'svelte-spa-router'
    */
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
    //export let params = {}
    const answer_id = parameter['id'];

    let error = {detail:[]}
    let question_id = 0
    let content = ''

    fastapi("get", "/test/answer/detail/" + answer_id, {}, (json) => {
        question_id = json.question_id
        content = json.content
    })

    function update_answer(event) {
        event.preventDefault()
        let url = "/test/answer/update"
        let params = {
            answer_id: answer_id,
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
    <h5 class="my-3 border-bottom pb-2">답변 수정</h5>
    <Error error={error} />
    <form method="post" class="my-3">
        <div class="mb-3">
            <label for="content">내용</label>
            <textarea class="form-control" rows="10" bind:value="{content}"></textarea>
        </div>
        <button class="btn btn-primary" on:click="{update_answer}">수정하기</button>
    </form>
</div>
