<script lang="ts">
  import { goto } from '$app/navigation';
  import StatusPill from '@components/atoms/StatusPill.svelte';

  let { orders } = $props<{ orders: any[] }>();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
</script>

<div class="table-card">
  <table class="data-table">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th class="text-right">Gross Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {#each orders as order}
        <tr onclick={() => goto(`/orders/${order.id}`)}>
          <td>
            <div class="order-id">#{order.id.slice(-6).toUpperCase()}</div>
            <div class="order-date">{new Date(order.createdAt).toLocaleString()}</div>
          </td>
          <td class="customer-name">{order.customer?.name || 'Guest'}</td>
          <td class="amount text-right">{formatCurrency(order.totalAmount)}</td>
          <td>
            <StatusPill status={order.status} />
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" class="empty-state">No transactions found.</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-card {
    background: #fff;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
    overflow: hidden;
  }

  .data-table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 1.5rem 2.5rem;
    font-size: 0.75rem;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }

  .data-table td {
    padding: 1.5rem 2.5rem;
    font-size: 0.9rem;
    border-top: 1px solid #f9f9f9;
  }

  .data-table tr {
    cursor: pointer;
    transition: background 0.2s;
  }

  .data-table tr:hover {
    background: #fcfcfc;
  }

  .order-id {
    font-weight: 700;
  }

  .order-date {
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.3rem;
  }

  .customer-name {
    font-weight: 500;
  }

  .amount {
    font-weight: 800;
  }

  .text-right {
    text-align: right;
  }

  .empty-state {
    padding: 3rem;
    text-align: center;
    color: #888;
    font-weight: 500;
  }
</style>
