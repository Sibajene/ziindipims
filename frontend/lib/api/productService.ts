import api from './apiClient';

export const productService = {
  // Get all products
  getProducts: async (token: string, params = {}) => {
    try {
      const response = await api.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  // Get a single product by ID
  getProduct: async (token: string, id: string) => {
    try {
      const response = await api.get(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  // Create a new product
  createProduct: async (token: string, productData: any) => {
    try {
      const response = await api.post('/products', productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error);
      throw error;
    }
  },
  // Update an existing product
  updateProduct: async (token: string, id: string, productData: any) => {
    try {
      const response = await api.put(`/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  // Delete a product
  deleteProduct: async (token: string, id: string) => {
    try {
      const response = await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
  // Upload product image
  uploadProductImage: async (token: string, id: string, formData: FormData) => {
    try {
      const response = await api.post(`/products/${id}/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }
};
