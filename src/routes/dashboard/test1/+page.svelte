<script>
    import { onMount } from 'svelte';
    import fastapi from '$lib/api.js'; // 제공해주신 api.js 사용

    let dashboardData = {
        summary: { total_users: 0, active_sessions: 0 },
        recent_activities: []
    };
    let isLoading = true;

    // 데이터를 가져오는 함수
    function getDashboardData() {
        fastapi('get', '/dashboard/test1', {}, (json) => {
            dashboardData = json;
            isLoading = false;
        }, (err) => {
            console.error("데이터 로드 실패:", err);
            isLoading = false;
        });
    }

    onMount(() => {
        getDashboardData();
    });
</script>

<div class="dashboard-container">
    <h1>대시보드</h1>

    {#if isLoading}
        <p>데이터를 불러오는 중...</p>
    {:else}
        <div class="stats-grid">
            <div class="card">
                <h3>전체 사용자</h3>
                <p>{dashboardData.summary.total_users}명</p>
            </div>
            <div class="card">
                <h3>현재 접속자</h3>
                <p>{dashboardData.summary.active_sessions}명</p>
            </div>
        </div>

        <div class="list-section">
            <h2>최근 활동</h2>
            <table>
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>활동 내용</th>
                    </tr>
                </thead>
                <tbody>
                    {#each dashboardData.recent_activities as activity}
                        <tr>
                            <td>{activity.time}</td>
                            <td>{activity.message}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 30px;
    }
    .card {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 10px;
        border-bottom: 1px solid #eee;
        text-align: left;
    }
</style>