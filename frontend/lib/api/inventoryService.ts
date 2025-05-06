// Inventory service for handling inventory-related API calls

/**
 * Fetches inventory batches for a specific pharmacy
 * @param pharmacyId The ID of the pharmacy to fetch inventory for
 * @returns Promise with the inventory batch data
 */
export async function getInventoryBatches(pharmacyId: string) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await fetch(`/api/inventory/batches?pharmacyId=${pharmacyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Fetches a specific inventory batch by ID
 * @param batchId The ID of the batch to fetch
 * @returns Promise with the batch data
 */
export async function getInventoryBatch(batchId: string) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await fetch(`/api/inventory/batches/${batchId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch inventory batch');
  }
  
  return response.json();
}

import axiosClient from './axiosClient'

/**
 * Creates a new inventory batch
 * @param batchData The data for the new batch
 * @returns Promise with the created batch data
 */
export async function createInventoryBatch(batchData: any) {
  try {
    const response = await axiosClient.post('/inventory/batches', batchData)
    return response.data
  } catch (error) {
    console.error('Failed to create inventory batch:', error)
    throw error
  }
}

/**
 * Updates an existing inventory batch
 * @param batchId The ID of the batch to update
 * @param batchData The updated data for the batch
 * @returns Promise with the updated batch data
 */
export async function updateInventoryBatch(batchId: string, batchData: any) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await fetch(`/api/inventory/batches/${batchId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batchData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || 'Failed to update inventory batch';
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Deletes an inventory batch
 * @param batchId The ID of the batch to delete
 * @returns Promise with the deleted batch data
 */
export async function deleteInventoryBatch(batchId: string) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await fetch(`/api/inventory/batches/${batchId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete inventory batch');
  }
  
  return response.json();
}

/**
 * Transfers inventory between branches
 * @param transferData The data for the transfer
 * @returns Promise with the transfer result
 */
export async function transferInventory(transferData: any) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const response = await fetch('/api/inventory/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transferData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to transfer inventory');
  }
  
  return response.json();
}