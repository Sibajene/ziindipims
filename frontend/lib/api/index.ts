// Import all services
import axiosClient from './axiosClient';
import * as analyticsService from './analyticsService';
import * as authService from './authService';
import * as branchService from './branchService';
import * as dashboardService from './dashboardService';
import * as insuranceService from './insurance';
import * as inventoryService from './inventoryService';
import * as notificationsService from './notificationsService';
import * as patientService from './patients';
import * as pharmacyService from './pharmacyService';
import * as prescriptionService from './prescriptionService';
import * as productService from './productService';
import * as settingsService from './settingsService';
import * as subscriptionService from './subscriptionService';
import * as supplierService from './supplierService';
import * as userService from './userService';

// Export all services
export {
  axiosClient,
  analyticsService,
  authService,
  branchService,
  dashboardService,
  insuranceService,
  inventoryService,
  notificationsService,
  patientService,
  pharmacyService,
  prescriptionService,
  productService,
  settingsService,
  subscriptionService,
  supplierService,
  userService
};

// Create a default export for components that are importing the API as default
const api = {
  analytics: analyticsService,
  auth: authService,
  branch: branchService,
  dashboard: dashboardService,
  insurance: insuranceService,
  inventory: inventoryService,
  notifications: notificationsService,
  patient: patientService,
  pharmacy: pharmacyService,
  prescription: prescriptionService,
  product: productService,
  settings: settingsService,
  subscription: subscriptionService,
  supplier: supplierService,
  user: userService
};

export default api;