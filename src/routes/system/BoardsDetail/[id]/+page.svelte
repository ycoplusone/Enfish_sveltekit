<script>
    // svelte 라이브러리
    import { page as param }                from '$app/stores';             // url 파라미터 추출
    import { onMount }          from 'svelte'; 
    import { goto }             from '$app/navigation';         // 페이지 이동 함수
    // external 라이브러리
    import moment               from 'moment/min/moment-with-locales'   // moment 라이브러리 임포트 년월 변환
    import { marked }           from 'marked'   // 마크다운 렌더링 라이브러리
    // custom 라이브러리
    import fastapi              from "$lib/api.js";             // api 호출 모듈   
    import ErrorMsg             from "$lib/components/ErrorMsg.svelte"; //error 문구 처리 컴포넌트
    import { is_login , user_nm , user_email}  from "$lib/stores/Info.js";    
    

    
    let board_id = $param.params.id;
    let board = {comments:[], voter:[] , content:''};
    let content = "";
    let textareaRef;   
    let error = {detail:[]}    

    
    function get_board() {
        fastapi("get", "/system/boards/detail/" + board_id, {}, (json) => {
            board = json;
            textareaRef.focus();
        });
    }
    

    function post_comment(event) {
        event.preventDefault()
        let url = "/system/comments/set/" + board_id
        let params = {
            content: content
        }
        fastapi('post', url, params, 
            (json) => {
                content = '';
                error = {detail:[]};
                get_board();
            },
            (err_json) => {
                error = err_json
            }
        )
    }    

    function delete_board( _id) {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            let url = "/system/boards/delete"
            let params = {
                system_boards_id: _id
            }
            fastapi('delete', url, params, 
                (json) => {
                    goto('/system/Boards/'+board.kind)
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }    

    function delete_comment(_id) {
        if(window.confirm('정말로 삭제하시겠습니까?')) {
            let url = "/system/comments/delete"
            let params = {
                comment_id: _id
            }
            fastapi('delete', url, params, 
                (json) => {
                    get_board()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }

    function vote_board(_id) {
        if(window.confirm('정말로 추천하시겠습니까?')) {
            let url = "/system/boards/vote"
            let params = {
                system_boards_id : _id
            }
            fastapi('post', url, params, 
                (json) => {
                    get_board()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }    

    function vote_comment(_id) {
        if(window.confirm('정말로 추천하시겠습니까?')) {
            let url = "/system/comments/vote";
            let params = {
                comment_id: _id
            }
            fastapi('post', url, params, 
                (json) => {
                    get_board()
                },
                (err_json) => {
                    error = err_json
                }
            )
        }
    }
    

    /*
    onMount(async () => {
        get_board();
        textareaRef.focus();
    });  
    */
    $:{
        board_id = $param.params.id
        , get_board()
    }
</script>
<div class="container my-3">
    <!-- 질문 -->
    <h2 class="border-bottom py-2">{board.subject}</h2>
    <div class="card my-3">
        <div class="card-body">
            <div class="card-text" >
                 {@html marked.parse(board.content)}
            </div>
            <div class="d-flex justify-content-end">
                <div class="badge bg-light text-dark p-3 text-start">
                    <div class="mb-2">{ board.user ? board.user.user_nm : ""}</div>
                    <div>{moment(board.create_date).format("YY/MM/DD HH:mm")}</div>
                    <div>{board.modify_date ? moment(board.modify_date).format("YY/MM/DD HH:mm") : "" }</div>
                </div>
            </div>
            <div class="my-3">
                <button class="btn btn-sm btn-outline-secondary" on:click="{ () => {vote_board(board.id)} }">
                    추천
                    <span class="badge rounded-pill bg-success">{ board.voter.length }</span>
                </button>                
                {#if board.user && $user_email === board.user.user_email }
                <a  href="/system/BoardsUpdate/{board.id}" class="btn btn-sm btn-outline-secondary">수정</a>
                <button class="btn btn-sm btn-outline-secondary" on:click={() => delete_board(board.id)}>삭제</button>                
                {/if}
            </div>            
        </div>
    </div>
    <button class="btn btn-secondary" on:click="{() => {        goto('/system/Boards/'+board.kind)    }}">목록으로</button>

    <!-- 답변 등록 -->
    <ErrorMsg error={error} />
    <form method="post" class="my-3">
        <div class="mb-3">
            <textarea rows="5" bind:value={content} bind:this={textareaRef} class="form-control" disabled={$is_login ? "" : "disabled"}></textarea>
        </div>
        <input type="submit" value="답변등록" class="btn btn-primary {$is_login ? '' : 'disabled'}"  on:click="{post_comment}" />
    </form>

    <!-- 답변 목록 -->
    <h5 class="border-bottom my-3 py-2">{board.comments.length}개의 답변이 있습니다.</h5>
    {#each board.comments as comment}
    <div class="card my-3">
        <div class="card-body">
            <div class="card-text">
                 {@html marked.parse(comment.content)}
            </div>
            <div class="d-flex justify-content-end">
                <div class="badge bg-light text-dark p-3 text-start">
                    <div class="mb-2">{ comment.user ? comment.user.user_nm : ""}</div>
                    <div>{moment(comment.create_date).format("YY/MM/DD HH:mm")}</div>
                    <div>{comment.modify_date ? moment(comment.modify_date).format("YY/MM/DD HH:mm") : ""}</div>
                </div>
            </div>
            <div class="my-3">
                <button class="btn btn-sm btn-outline-secondary" on:click="{ () => { vote_comment(comment.id) }}"> 
                    추천
                    <span class="badge rounded-pill bg-success">{ comment.voter.length }</span>
                </button>                
                {#if comment.user && $user_email === comment.user.user_email }
                <a href="/system/comments/update/{comment.id}" class="btn btn-sm btn-outline-secondary">수정</a>
                <button class="btn btn-sm btn-outline-secondary" on:click={() => delete_comment(comment.id) }>삭제</button>                
                {/if}
            </div>

        </div>
    </div>
    {/each}

</div>