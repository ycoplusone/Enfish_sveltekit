<!-- page -->
<script>
  async function hello() {
    const res = await fetch('http://127.0.0.1:8000/version');
    const data = await res.json();
    if(res.ok) {
      return data.version;
    } else {
      throw new Error(data.version);
    }
  }    
  
  
    /*fetch('http://127.0.0.1:8000/version')
    .then(response => response.json())
    .then(data => {
      message = data.version;
    });
    */
  let promise = hello();

  let todos = []
  function get_question_list() {
    fetch("http://127.0.0.1:8000/test/lists").then((response) => {
      response.json().then((json) => {
        todos = json
      })
    })
  }

  get_question_list()


</script>
<h1>Todo List - start</h1>
<ul>
  {#each todos as todo}
    <li>{todo.title}</li>
  {/each}
</ul>
<h1>Todo List - end</h1>

{#await promise}
  <h1><p>Loading...</p></h1>
{:then version}
<h1>{version}</h1>
{:catch error}
  <p>Error</p>
{/await}

<div class="container">
    <div class="login-container">
      <h2 class="text-center mb-4">로그인</h2>
      <form>
        <!--
        <div class="mb-3">
          <label for="client_id" class="form-label">Client ID</label>
          <input type="text" class="form-control" id="client_id" placeholder="Cliend ID">
        </div>   
        -->
        <div class="mb-3">
          <label for="user_id" class="form-label">아이디</label>
          <input type="text" class="form-control" id="user_id" placeholder="아이디 입력">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">비밀번호</label>
          <input type="password" class="form-control" id="password" placeholder="비밀번호 입력">
        </div>
        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary">로그인</button>
        </div>
        <!--
        <div class="text-center">
          <a href="#">비밀번호를 잊으셨나요?</a>
        </div>
        -->
      </form>
    </div>
  </div>

<style>
    .login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 30px;
      background-color: #fff;
      border-radius: 15px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
    }
    .form-control:focus {
      box-shadow: none;
      border-color: #86b7fe;
    }
</style>