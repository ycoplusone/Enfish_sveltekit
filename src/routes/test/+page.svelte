<!--  test 홈 -->
<script>
    import fastapi              from "$lib/api.js";             // api 호출 모듈
	import { page , is_login , keyword }  from "$lib/stores/test.js";    
    import { onMount }          from 'svelte';
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    //moment.locale('ko')
    let question_list = []    
    let size    = 10;
    //let page    = 0;
    let total   = 0;
    let kw = '';

    $: total_page = Math.ceil(total/size);
    function get_question_list() {
        let params = {
            page: $page,
            size: size,
            keyword: $keyword,
        }
        fastapi('get', '/test/question/list', params, (json) => {
            question_list = json.question_list
            total = json.total
            kw = $keyword
        })
    }


    /*
    onMount(async () => { // 페이지 로딩시 함수 호출
        get_question_list($page);
    });            */

    $: $page , $keyword, get_question_list();
    
</script>

<div class="container my-3">

    <div class="row my-3">
        <div class="col-6">
            <a href="/test/QuestionCreate" class="btn btn-primary {$is_login ? '' : 'disabled'}">질문 등록하기</a>
        </div>
        <div class="col-6">
            <div class="input-group">
                <input type="text" class="form-control" bind:value="{kw}">
                <button class="btn btn-outline-secondary" on:click={() => {$keyword = kw, $page = 0}}>
                    찾기
                </button>
            </div>
        </div>
    </div>    

    <table class="table">
        <thead>
        <tr class="table-dark">
            <th>번호</th>
            <th style="width:50%">제목</th>
            <th>글쓴이</th>
            <th>작성일시</th>
        </tr>
        </thead>
        <tbody>
        {#each question_list as question, i}
        <tr class="text-center">
            <td>{question.id}</td>
            <td class="text-start">
                <a href="/test/detail/{question.id}">{question.subject}</a>
                {#if question.answers.length > 0 }
                    <span class="text-danger small mx-2">{question.answers.length}</span>
                {/if}
            </td>
            <td>{ question.user ? question.user.user_nm : "" }</td>
            <td>{moment(question.create_date).format("YY/MM/DD HH:mm")}</td>
        </tr>
        {/each}
        </tbody>
    </table>

    <!-- 페이징처리 시작 -->
    <ul class="pagination justify-content-center">
        <!-- 이전페이지 -->
        <li class="page-item {$page <= 0 && 'disabled'}">
            <button class="page-link" on:click="{() => get_question_list($page--)}">이전</button>
        </li>
        <!-- 페이지번호 -->
        {#each Array(total_page) as _, loop_page}
        {#if loop_page >= $page-5 && loop_page <= $page+5} 
        <li class="page-item {loop_page === $page && 'active'}">
            <button on:click="{() => $page = loop_page }" class="page-link">{loop_page+1}</button>
        </li>
        {/if}
        {/each}
        <!-- 다음페이지 -->
        <li class="page-item {$page >= total_page-1 && 'disabled'}">
            <button class="page-link" on:click="{() => get_question_list($page++)}">다음</button>
        </li>
    </ul>
    <!-- 페이징처리 끝 -->    
</div>