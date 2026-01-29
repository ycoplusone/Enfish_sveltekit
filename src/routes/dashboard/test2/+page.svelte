<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let chartCanvas;

  // 요약 데이터 예시
  const stats = [
    { title: "Total Users", value: "24,512", change: "+12.5%", color: "text-primary" },
    { title: "Revenue", value: "$45,200", change: "+8.2%", color: "text-success" },
    { title: "Active Sessions", value: "1,205", change: "-3.1%", color: "text-danger" },
    { title: "Conversion Rate", value: "4.8%", change: "+2.4%", color: "text-info" }
  ];

  onMount(() => {
    // 이미지 스타일의 선형 차트(Line Chart) 생성
    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Performance',
          data: [12, 19, 15, 25, 22, 30],
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  });
</script>

<div class="container-fluid py-4 bg-light">
  <div class="row g-3 mb-4">
    {#each stats as stat}
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h6 class="text-muted mb-2">{stat.title}</h6>
            <div class="d-flex align-items-center justify-content-between">
              <h3 class="mb-0">{stat.value}</h3>
              <span class="badge rounded-pill bg-light {stat.color}">{stat.change}</span>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-0 pt-3">
          <h5 class="card-title">Analytics Overview</h5>
        </div>
        <div class="card-body" style="height: 350px;">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-white border-0 pt-3">
          <h5 class="card-title">Recent Activities</h5>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            {#each Array(5) as _, i}
              <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-3 py-3">
                <div>
                  <div class="fw-bold">User Action #{i + 1}</div>
                  <small class="text-muted">Updated 5 mins ago</small>
                </div>
                <span class="text-primary"><i class="bi bi-chevron-right"></i></span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* 이미지의 깔끔한 느낌을 위한 추가 스타일링 */
  :global(body) {
    background-color: #f8f9fa;
  }
  .card {
    border-radius: 12px;
  }
  .card-title {
    font-weight: 700;
    color: #333;
  }
</style>