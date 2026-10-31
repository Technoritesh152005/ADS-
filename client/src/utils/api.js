// API Helper module for ExpiTrack Client

const BASE_URL = '/api';

export const api = {
  // User endpoints
  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Item endpoints
  async getItems(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${BASE_URL}/items?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch inventory items');
    return res.json();
  },

  async createItem(itemData) {
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create item');
    return data;
  },

  async updateItem(id, itemData) {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update item');
    return data;
  },

  async deleteItem(id) {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete item');
    return data;
  },

  async quickRestock(id, amount = 10) {
    const res = await fetch(`${BASE_URL}/items/${id}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to restock');
    return data;
  },

  // Advanced Aggregation & Analytics endpoints
  async getLiveAlerts(userId) {
    const url = userId ? `${BASE_URL}/analytics/alerts/${userId}` : `${BASE_URL}/analytics/alerts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch live alerts aggregation');
    return res.json();
  },

  async getMetrics(userId) {
    const url = userId ? `${BASE_URL}/analytics/metrics?userId=${userId}` : `${BASE_URL}/analytics/metrics`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  // Academic Benchmark & Seeder
  async runExplainBenchmark() {
    const res = await fetch(`${BASE_URL}/analytics/explain-benchmark`);
    if (!res.ok) throw new Error('Failed to run explain benchmark');
    return res.json();
  },

  async seedData(count = 50, clearExisting = true) {
    const res = await fetch(`${BASE_URL}/analytics/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, clearExisting }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to seed data');
    return data;
  },
};
