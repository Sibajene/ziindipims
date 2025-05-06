'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from '../../../components/ui/skeleton'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../../components/ui/tabs'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import { 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  Calendar 
} from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'
import { subscriptionService, Subscription, SubscriptionPlan } from '../../../lib/api/subscriptionService'
import { useToast } from '../../../components/ui/use-toast'
import { useAuthStore } from '../../../lib/stores/authStore'

// Utility function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const SubscriptionsPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { token, user } = useAuthStore.getState();
        if (!token || !user?.pharmacyId) {
          router.push('/login');
          return;
        }
        const pharmacyId = user.pharmacyId;

        // Fetch current subscription
        try {
          let currentSubscription = await subscriptionService.getCurrentSubscription(pharmacyId);
          if (!currentSubscription) {
            // No subscription found, try to start free trial
            currentSubscription = await subscriptionService.startFreeTrial(pharmacyId);
          }
          setSubscription(currentSubscription);
        } catch (error: any) {
          if (error.response?.status === 403) {
            setError('Access denied: You do not have an active subscription or permission to access this resource.');
          } else {
            console.log('No active subscription found or error fetching subscription');
          }
          // This might not be an error if the user doesn't have a subscription yet
        }

        // Fetch subscription history
        try {
          const history = await subscriptionService.getSubscriptionHistory(pharmacyId);
          setSubscriptionHistory(history);
        } catch (error: any) {
          if (error.response?.status === 403) {
            setError('Access denied: Unable to fetch subscription history due to permission issues.');
          } else {
            console.error('Error fetching subscription history:', error);
          }
        }

        // Fetch available plans
        try {
          const plans = await subscriptionService.getAvailablePlans(pharmacyId);
          setAvailablePlans(plans);
        } catch (error: any) {
          if (error.response?.status === 403) {
            setError('Access denied: Unable to fetch available plans due to permission issues.');
          } else {
            console.error('Error fetching available plans:', error);
          }
        }

      } catch (error) {
        console.error('Failed to fetch subscription data', error);
        setError('Failed to load subscription information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [router]);

  const handleUpgrade = async (planId: string) => {
    try {
      setIsProcessing(true);

      const { token, user } = useAuthStore.getState();
      if (!token || !user?.pharmacyId) {
        router.push('/login');
        return;
      }
      const pharmacyId = user.pharmacyId;

      await subscriptionService.changePlan(pharmacyId, planId);

      toast({
        title: "Plan changed successfully",
        description: "Your subscription has been updated.",
        variant: "default",
      });

      // Refresh subscription data
      const updatedSubscription = await subscriptionService.getCurrentSubscription(pharmacyId);
      setSubscription(updatedSubscription);

      // Switch to current tab
      setActiveTab('current');

    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to change the plan.",
          variant: "destructive",
        });
      } else {
        console.error('Error changing plan:', error);
        toast({
          title: "Failed to change plan",
          description: "There was an error updating your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setIsProcessing(true);

      const { token, user } = useAuthStore.getState();
      if (!token || !user?.pharmacyId) {
        router.push('/login');
        return;
      }
      const pharmacyId = user.pharmacyId;

      await subscriptionService.cancelSubscription(pharmacyId, subscription.id);

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You'll have access until the end of your billing period.",
        variant: "default",
      });

      // Refresh subscription data
      const updatedSubscription = await subscriptionService.getCurrentSubscription(pharmacyId);
      setSubscription(updatedSubscription);

      // Close dialog
      setShowCancelDialog(false);

    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to cancel the subscription.",
          variant: "destructive",
        });
      } else {
        console.error('Error canceling subscription:', error);
        toast({
          title: "Failed to cancel subscription",
          description: "There was an error canceling your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!subscription) return;

    try {
      setIsProcessing(true);

      const { token, user } = useAuthStore.getState();
      if (!token || !user?.pharmacyId) {
        router.push('/login');
        return;
      }
      const pharmacyId = user.pharmacyId;

      await subscriptionService.renewSubscription(pharmacyId, subscription.id);

      toast({
        title: "Subscription renewed",
        description: "Your subscription has been renewed successfully.",
        variant: "default",
      });

      // Refresh subscription data
      const updatedSubscription = await subscriptionService.getCurrentSubscription(pharmacyId);
      setSubscription(updatedSubscription);

    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to renew the subscription.",
          variant: "destructive",
        });
      } else {
        console.error('Error renewing subscription:', error);
        toast({
          title: "Failed to renew subscription",
          description: "There was an error renewing your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleUpdatePayment = (subscriptionId: string) => {
    // Navigate to payment update page
    router.push(`/subscriptions/payment?id=${subscriptionId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          {!subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You don't have an active subscription. Choose a plan to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-center text-slate-500 mb-4">
                    Select a subscription plan to access all features of ZiindiPro Pharmacy Management System.
                  </p>
                  <Button onClick={() => setActiveTab('plans')}>
                    View Available Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subscription.plan.name}</CardTitle>
                    <CardDescription>
                      {subscription.plan.description || 'Your current subscription plan'}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`
                      ${subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                      ${subscription.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' : ''}
                      ${subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : ''}
                      ${subscription.status === 'CANCELED' ? 'bg-orange-100 text-orange-800' : ''}
                      ${subscription.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(subscription.plan.price)}</span>
                  <span className="text-sm text-slate-500">/{subscription.plan.billingCycle.toLowerCase()}</span>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Subscription Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <span className="font-medium">{subscription.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Billing Cycle:</span>
                        <span className="font-medium">{subscription.plan.billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Auto Renew:</span>
                        <span className="font-medium">{subscription.autoRenew ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Start Date:</span>
                        <span className="font-medium">{formatDate(new Date(subscription.startDate))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">End Date:</span>
                        <span className="font-medium">{formatDate(new Date(subscription.endDate))}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Payment Method:</span>
                        <span className="font-medium">{subscription.paymentMethod || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Payment:</span>
                        <span className="font-medium">
                          {'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Payment:</span>
                        <span className="font-medium">
                          {'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Current Period:</span>
                        <span className="font-medium">
                          {formatDate(new Date(subscription.currentPeriodStart))} - {formatDate(new Date(subscription.currentPeriodEnd))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Plan Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(subscription.plan.features).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <p className="text-xs text-gray-500">{value.toString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50 border-t px-6 py-4">
                <div className="flex flex-wrap gap-3 w-full justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdatePayment(subscription.id)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Update Payment
                  </Button>
                  
                  {subscription.status === 'ACTIVE' && (
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  
                  {subscription.status === 'EXPIRED' && (
                    <Button 
                      onClick={() => handleRenewSubscription()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Renew Subscription'}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => setActiveTab('plans')}
                  >
                    Change Plan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {/* Subscription History Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                View your past subscription transactions and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionHistory.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-500">No subscription history available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionHistory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-md hover:bg-slate-50">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                        <div>
                          <p className="font-medium">{formatDate(new Date(item.date))}</p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="font-medium">{formatCurrency(item.amount)}</p>
                          <Badge variant="outline" className={item.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                            {item.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/subscriptions/invoice/${item.id}`)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className={`overflow-hidden ${
                subscription && subscription.planId === plan.id && subscription.status === 'ACTIVE' 
                ? 'border-2 border-primary' 
                : ''
            }`}>
              <CardHeader className="bg-slate-50 border-b">
                {subscription && subscription.planId === plan.id && subscription.status === 'ACTIVE' && (
                  <Badge className="mb-2 bg-primary">Current Plan</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-slate-500">/{plan.billingCycle.toLowerCase()}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Features</h3>
                  <ul className="space-y-3">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {typeof value === 'boolean' ? '' : `: ${value}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t px-6 py-4">
                {subscription && subscription.planId === plan.id && subscription.status === 'ACTIVE' ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <Clock className="animate-spin mr-2 h-4 w-4" />
                        Processing...
                      </span>
                    ) : (
                      subscription ? 'Switch to this Plan' : 'Select Plan'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Need a Custom Plan?</CardTitle>
            <CardDescription>
              Contact our sales team for enterprise solutions and custom pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              If you need specific features or have unique requirements for your pharmacy, 
              our team can create a tailored solution for your business.
            </p>
            <Button variant="outline" onClick={() => router.push('/contact')}>
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    
    {/* Cancel Subscription Dialog */}
    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period ({subscription ? formatDate(new Date(subscription.currentPeriodEnd)) : ''}).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancelSubscription}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Cancel Subscription'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
};

export default SubscriptionsPage;