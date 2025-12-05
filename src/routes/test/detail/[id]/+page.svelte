<script>
    // svelte 라이브러리
    import { page }             from '$app/stores';             // url 파라미터 추출
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    // external 라이브러리
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    import { marked }           from 'marked'   // 마크다운 렌더링 라이브러리
    // custom 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈   
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트
    import { is_login , user_nm , email}  from "$lib/stores/test.js";    
    

    const params = $page.params;
    let question_id = params['id'];
    let question = {answers:[], voter:[] , content:''};
    let content = "";
    let textareaRef;   
    let error = {detail:[]}    
    
    function get_question() {
        fastapi("get", "/test/question/detail/" + question_id, {}, (json) => {
            question = json;
            textareaRef.focus();
        });
    }
    
    function post_answer(event) {
        event.preventDefault()
        let url = "/test/answer/create/" + question_id
        let params = {
            content: content
        }
        fastapi('post', url, params, 
            (json) => {
                content = '';
                error = {detail:[]};
                get_question();
            },
            (err_json) => {
                error = err_json
            }
        )
    }    

    function delete_question(_question_id) {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            let url = "/test/question/delete"
            let params = {
                question_id: _question_id
            }
            fastapi('delete', url, params, 
                (json) => {
                    goto('/test')
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }    

    function delete_answer(answer_id) {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            let url = "/test/answer/delete"
            let params = {
                answer_id: answer_id
            }
            fastapi('delete', url, params, 
                (json) => {
                    get_question()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }

    function vote_question(_question_id) {
        if(window.confirm('정말로 추천하시겠습니까?')) {
            let url = "/test/question/vote"
            let params = {
                question_id: _question_id
            }
            fastapi('post', url, params, 
                (json) => {
                    get_question()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }    

    function vote_answer(answer_id) {
        if(window.confirm('정말로 추천하시겠습니까?')) {
            let url = "/test/answer/vote";
            let params = {
                answer_id: answer_id
            }
            fastapi('post', url, params, 
                (json) => {
                    get_question()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }

  
    onMount(async () => {
        get_question()
        //textareaRef.focus();
    });            
     

</script>




<div class="container my-3">
    <!-- 질문 -->
    <h2 class="border-bottom py-2">{question.subject}</h2>
    <div class="card my-3">
        <div class="card-body">
            <div class="card-text" >
                <!--{question.content}-->
                 {@html marked.parse(question.content)}
            </div>
            <div class="d-flex justify-content-end">
                <div class="badge bg-light text-dark p-3 text-start">
                    <div class="mb-2">{ question.user ? question.user.user_nm : ""}</div>
                    <div>{moment(question.create_date).format("YY/MM/DD HH:mm")}</div>
                    <div>{question.modify_date ? moment(question.modify_date).format("YY/MM/DD HH:mm") : "" }</div>
                </div>
            </div>
            <div class="my-3">
                <button class="btn btn-sm btn-outline-secondary" on:click="{ () => {vote_question(question.id)} }">
                    추천
                    <span class="badge rounded-pill bg-success">{ question.voter.length }</span>
                </button>                
                {#if question.user && $email === question.user.email }
                <a  href="/test/QuestionModify/{question.id}" class="btn btn-sm btn-outline-secondary">수정</a>
                <button class="btn btn-sm btn-outline-secondary" on:click={() => delete_question(question.id)}>삭제</button>                
                {/if}
            </div>            
        </div>
    </div>
    <button class="btn btn-secondary" on:click="{() => {        goto('/test')    }}">목록으로</button>

    <!-- 답변 등록 -->
    <ErrorMsg error={error} />
    <form method="post" class="my-3">
        <div class="mb-3">
            <textarea rows="5" bind:value={content} bind:this={textareaRef} class="form-control" disabled={$is_login ? "" : "disabled"}></textarea>
        </div>
        <input type="submit" value="답변등록" class="btn btn-primary {$is_login ? '' : 'disabled'}"  on:click="{post_answer}" />
    </form>

    <!-- 답변 목록 -->
    <h5 class="border-bottom my-3 py-2">{question.answers.length}개의 답변이 있습니다.</h5>
    {#each question.answers as answer}
    <div class="card my-3">
        <div class="card-body">
            <div class="card-text">
                 {@html marked.parse(answer.content)}
            </div>
            <div class="d-flex justify-content-end">
                <div class="badge bg-light text-dark p-3 text-start">
                    <div class="mb-2">{ answer.user ? answer.user.user_nm : ""}</div>
                    <div>{moment(answer.create_date).format("YY/MM/DD HH:mm")}</div>
                    <div>{answer.modify_date ? moment(answer.modify_date).format("YY/MM/DD HH:mm") : ""}</div>
                </div>
            </div>
            <div class="my-3">
                <button class="btn btn-sm btn-outline-secondary" on:click="{ () => { vote_answer(answer.id) }}"> 
                    추천
                    <span class="badge rounded-pill bg-success">{ answer.voter.length }</span>
                </button>                
                {#if answer.user && $email === answer.user.email }
                <a href="/test/AnswerModify/{answer.id}" class="btn btn-sm btn-outline-secondary">수정</a>
                <button class="btn btn-sm btn-outline-secondary" on:click={() => delete_answer(answer.id) }>삭제</button>                
                {/if}
            </div>

        </div>
    </div>
    {/each}

</div>