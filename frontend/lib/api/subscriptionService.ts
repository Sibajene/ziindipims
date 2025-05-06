import axiosClient from './axiosClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  features: Record<string, any>;
  isActive: boolean;
  trialDays: number;
}

export interface Subscription {
  id: string;
  pharmacyId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  canceledAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentMethod?: string;
  autoRenew: boolean;
  paymentProvider?: string;
  paymentProviderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionError {
  status: number;
  message: string;
}

export const subscriptionService = {
  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await axiosClient.get('/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      return [];
    }
  },

  getCurrentSubscription: async (pharmacyId: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.get('/subscriptions/current', {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
        params: { pharmacyId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
      return null;
    }
  },

  getSubscriptionHistory: async (pharmacyId: string): Promise<Subscription[]> => {
    try {
      const response = await axiosClient.get('/subscriptions/history', {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
        params: { pharmacyId },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch subscription history:', error);
      return [];
    }
  },

  getAvailablePlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await axiosClient.get('/subscriptions/plans');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch available plans:', error);
      return [];
    }
  },

  changePlan: async (pharmacyId: string, planId: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/change-plan', {
        pharmacyId,
        planId,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      return null;
    }
  },

  cancelSubscription: async (pharmacyId: string, subscriptionId: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/cancel', {
        pharmacyId,
        subscriptionId,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return null;
    }
  },

  renewSubscription: async (pharmacyId: string, subscriptionId: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/renew', {
        pharmacyId,
        subscriptionId,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      return null;
    }
  },

  activateSubscription: async (pharmacyId: string, planId: string, paymentDetails?: any): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/activate', {
        pharmacyId,
        planId,
        paymentDetails
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      return null;
    }
  },

  startFreeTrial: async (pharmacyId: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/start-trial', {
        pharmacyId,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start free trial:', error);
      return null;
    }
  },

  updatePaymentMethod: async (pharmacyId: string, subscriptionId: string, paymentMethod: string): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/update-payment', {
        pharmacyId,
        subscriptionId,
        paymentMethod,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      return null;
    }
  },

  toggleAutoRenew: async (pharmacyId: string, subscriptionId: string, autoRenew: boolean): Promise<Subscription | null> => {
    try {
      const response = await axiosClient.post('/subscriptions/toggle-auto-renew', {
        pharmacyId,
        subscriptionId,
        autoRenew,
      }, {
        headers: {
          'x-pharmacy-id': pharmacyId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle auto-renew:', error);
      return null;
    }
  },

  checkSubscriptionStatus: async (pharmacyId: string): Promise<{ 
    hasActiveSubscription: boolean; 
    isInTrial: boolean; 
    daysRemaining: number | null;
    subscription: Subscription | null;
  }> => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription(pharmacyId);
      
      if (!subscription) {
        return {
          hasActiveSubscription: false,
          isInTrial: false,
          daysRemaining: null,
          subscription: null
        };
      }

      const now = new Date();
      const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
      const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
      
      const isInTrial = trialEndsAt ? trialEndsAt > now : false;
      const hasActiveSubscription = 
        subscription.status === 'active' && 
        (endDate ? endDate > now : true);
      
      let daysRemaining = null;
      if (isInTrial && trialEndsAt) {
        daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (hasActiveSubscription && endDate) {
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        hasActiveSubscription,
        isInTrial,
        daysRemaining,
        subscription
      };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return {
        hasActiveSubscription: false,
        isInTrial: false,
        daysRemaining: null,
        subscription: null
      };
    }
  }
};