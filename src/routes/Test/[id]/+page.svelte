<!--  test 홈 -->
<script>

    import { page as param }                from '$app/stores';             // url 파라미터 추출

    let id = $param.params.id;
    $:{
        id = $param.params.id;
    }

</script>
{id}