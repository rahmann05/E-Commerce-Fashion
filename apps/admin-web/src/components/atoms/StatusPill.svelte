<script lang="ts">
  let { status } = $props<{ status: string }>();

  function getStatusClass(s: string) {
    if (['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(s)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(s)) return 'cancelled';
    return 'pending';
  }
</script>

<span class="status-pill {getStatusClass(status)}">
  {status.replace('_', ' ')}
</span>

<style>
  .status-pill {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-pill.success {
    background: #f0fdf4;
    color: #15803d;
  }

  .status-pill.cancelled {
    background: #fef2f2;
    color: #b91c1c;
  }

  .status-pill.pending {
    background: #fffbeb;
    color: #92400e;
  }
</style>
