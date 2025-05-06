"use client"

import { 
  BarChart, Calendar, DollarSign, Package, 
  ShoppingCart, Users, TrendingUp, AlertTriangle, 
  Clock, Activity, Pill, FileText, CreditCard,
  RefreshCw, TrendingDown, ArrowRight, User, Building,
  ChevronRight, PieChart, LineChart, Layers
} from 'lucide-react'
import axiosClient from '../../../lib/api/axiosClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { formatCurrency } from '../../../lib/utils'
import { Skeleton } from '../../../components/ui/skeleton'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../lib/stores/authStore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
    pendingPrescriptions: 0,
    pendingInsuranceClaims: 0,
    pendingTransfers: 0,
    activePatients: 0,
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [salesTrend, setSalesTrend] = useState([])
  
  const [branchPerformance, setBranchPerformance] = useState([])

  const [recentSales, setRecentSales] = useState([])
  const [recentPrescriptions, setRecentPrescriptions] = useState([])
  const [recentInsuranceClaims, setRecentInsuranceClaims] = useState([])
  const [inventoryAlerts, setInventoryAlerts] = useState([])

  const user = useAuthStore(state => state.user);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.pharmacyId) {
          console.error('No pharmacyId found for user');
          setIsLoading(false);
          return;
        }
        const response = await axiosClient.get('/dashboard/stats', {
          params: { pharmacyId: user.pharmacyId }
        });
        setStats({
          totalSales: response.data.totalSales || 12500,
          todaySales: response.data.todaySales || 1250,
          totalProducts: response.data.totalProducts || 345,
          lowStockProducts: response.data.lowStockProducts || 12,
          expiringProducts: response.data.expiringProducts || 8,
          pendingPrescriptions: response.data.pendingPrescriptions || 15,
          pendingInsuranceClaims: response.data.pendingInsuranceClaims || 7,
          pendingTransfers: response.data.pendingTransfers || 3,
          activePatients: response.data.activePatients || 128,
        });
        
        // If the API returns branch data, use it
        if (response.data.branchPerformance) {
          setBranchPerformance(response.data.branchPerformance);
        }
        
        // If the API returns sales trend data, use it
        if (response.data.salesTrend) {
          setSalesTrend(response.data.salesTrend);
        }

        // Fetch recent data
        const [recentSalesRes, recentPrescriptionsRes, recentInsuranceClaimsRes, inventoryAlertsRes] = await Promise.all([
          axiosClient.get('/dashboard/recent-sales', { params: { pharmacyId: user.pharmacyId } }),
          axiosClient.get('/dashboard/recent-prescriptions', { params: { pharmacyId: user.pharmacyId } }),
          axiosClient.get('/dashboard/recent-insurance-claims', { params: { pharmacyId: user.pharmacyId } }),
          axiosClient.get('/dashboard/inventory-alerts', { params: { pharmacyId: user.pharmacyId } }),
        ]);
        setRecentSales(recentSalesRes.data);
        setRecentPrescriptions(recentPrescriptionsRes.data);
        setRecentInsuranceClaims(recentInsuranceClaimsRes.data);
        setInventoryAlerts(inventoryAlertsRes.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.pharmacyId]);
  
  // Function to render skeleton loaders for cards
  const renderSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
  
  return (
    <div className="space-y-6">
      {/* Header with time filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome to your pharmacy management dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Clock className="mr-2 h-4 w-4 text-slate-500" />
            Today
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Calendar className="mr-2 h-4 w-4 text-slate-500" />
            This Week
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Activity className="mr-2 h-4 w-4 text-slate-500" />
            This Month
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100">
            <LineChart className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-blue-700">Total Sales</CardTitle>
              <div className="p-2 bg-blue-200/50 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : (
              <>
                <div className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.totalSales)}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+12% from last month</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-green-700">Today's Sales</CardTitle>
              <div className="p-2 bg-green-200/50 rounded-full">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : (
              <>
                <div className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.todaySales)}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+5% from yesterday</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-purple-700">Total Products</CardTitle>
              <div className="p-2 bg-purple-200/50 rounded-full">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : (
              <>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.totalProducts}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+3 new this week</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-amber-700">Active Patients</CardTitle>
              <div className="p-2 bg-amber-200/50 rounded-full">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : (
              <>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.activePatients}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+8 new this month</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            Customize
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/sales/new">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 cursor-pointer border border-blue-100 hover:border-blue-200 hover:shadow-sm">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">New Sale</span>
            </div>
          </Link>
          
          <Link href="/prescriptions/new">
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 cursor-pointer border border-green-100 hover:border-green-200 hover:shadow-sm">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">New Prescription</span>
            </div>
          </Link>
          
          <Link href="/inventory/add">
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200 cursor-pointer border border-purple-100 hover:border-purple-200 hover:shadow-sm">
              <div className="p-3 bg-purple-100 rounded-full mb-3">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">Add Inventory</span>
            </div>
          </Link>
          
          <Link href="/patients/new">
            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all duration-200 cursor-pointer border border-amber-100 hover:border-amber-200 hover:shadow-sm">
              <div className="p-3 bg-amber-100 rounded-full mb-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">New Patient</span>
            </div>
          </Link>
          
          <Link href="/insurance/claims/new">
            <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200 cursor-pointer border border-indigo-100 hover:border-indigo-200 hover:shadow-sm">
              <div className="p-3 bg-indigo-100 rounded-full mb-3">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">New Claim</span>
            </div>
          </Link>
          
          <Link href="/transfers/new">
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer border border-red-100 hover:border-red-200 hover:shadow-sm">
              <div className="p-3 bg-red-100 rounded-full mb-3">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-center text-slate-700">New Transfer</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Middle Section - Sales Analytics and Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="bg-white border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">Sales Analytics</CardTitle>
                <CardDescription>Weekly sales performance</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-white">
                  <BarChart className="h-3.5 w-3.5 mr-1" />
                  Bar
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-white">
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  Line
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-white">
                  <PieChart className="h-3.5 w-3.5 mr-1" />
                  Pie
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 flex items-end justify-between space-x-2 px-2">
                {salesTrend.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="rounded-t-md w-12" 
                      style={{ 
                        height: `${(day.amount / 2100) * 180}px`,
                        backgroundColor: index === 4 ? '#3b82f6' : '#93c5fd'
                      }}
                    ></div>
                    <span className="text-xs mt-2 font-medium text-slate-600">{day.day}</span>
                    <span className="text-xs text-slate-500">${day.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 py-3 border-t">
            <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View Detailed Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="bg-white border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">Inventory Alerts</CardTitle>
                <CardDescription>Products requiring attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 bg-white">
                <Layers className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y">
              {inventoryAlerts.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No inventory alerts</div>
              ) : (
                inventoryAlerts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        item.status === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        <Pill className={`h-5 w-5 ${
                          item.status === 'critical' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                        item.status === 'critical' 
                          ? 'text-red-700 bg-red-50 border border-red-200' 
                          : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}>
                        {item.type === 'Low Stock' 
                          ? `${item.count} remaining` 
                          : `Expires in ${item.count} days`}
                      </p>
                    </div>
                  </div>
                ))
              )}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 py-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All Alerts
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Branch Performance Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="bg-white border-b pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">Branch Performance</CardTitle>
              <CardDescription>Overview of sales across different branches</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 bg-white">
              <Building className="h-4 w-4 mr-1" />
              All Branches
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {branchPerformance.map((branch, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                    i === 0 ? 'bg-blue-100' : i === 1 ? 'bg-green-100' : 'bg-purple-100'
                                  }`}>
                                    <Building className={`h-6 w-6 ${
                                      i === 0 ? 'text-blue-600' : i === 1 ? 'text-green-600' : 'text-purple-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{branch.name}</p>
                                    <p className="text-sm text-slate-500">{branch.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-slate-800">
                                    {formatCurrency(branch.sales)}
                                  </p>
                                  <div className="flex items-center justify-end mt-1">
                                    {branch.trend > 0 ? (
                                      <>
                                        <TrendingUp className="h-3.5 w-3.5 text-green-500 mr-1" />
                                        <p className="text-sm text-green-600 font-medium">
                                          +{branch.trend}%
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <TrendingDown className="h-3.5 w-3.5 text-red-500 mr-1" />
                                        <p className="text-sm text-red-600 font-medium">{branch.trend}%</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="bg-slate-50 py-3 border-t">
                        <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          View All Branches
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Bottom Section - Recent Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <CardHeader className="bg-white border-b pb-3">
                          <CardTitle className="text-lg font-semibold text-slate-800">Recent Sales</CardTitle>
                          <CardDescription>Latest transactions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {isLoading ? (
                            <div className="p-4 space-y-4">
                              {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                              ))}
                            </div>
                          ) : (
                            <div className="divide-y">
                              {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                  <div>
                                    <p className="font-medium text-slate-800">Sale #{sale.id}</p>
                                    <p className="text-sm text-slate-500">
                                      {new Date(sale.createdAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-slate-800">{formatCurrency(sale.total)}</p>
                                    <p className="text-sm text-slate-500">
                                      {sale.itemsCount} items
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 py-3 border-t">
                          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View All Sales
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <CardHeader className="bg-white border-b pb-3">
                          <CardTitle className="text-lg font-semibold text-slate-800">Recent Prescriptions</CardTitle>
                          <CardDescription>Latest prescriptions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {isLoading ? (
                            <div className="p-4 space-y-4">
                              {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                              ))}
                            </div>
                          ) : (
                            <div className="divide-y">
                              {recentPrescriptions.map((prescription) => (
                                <div key={prescription.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                  <div>
                                    <p className="font-medium text-slate-800">Prescription #{prescription.id}</p>
                                    <p className="text-sm text-slate-500">
                                      Patient: {prescription.patientName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                      prescription.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                      prescription.status === 'PARTIALLY_FULFILLED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                                      'bg-green-50 text-green-700 border border-green-200'
                                    }`}>
                                      {prescription.status.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                      {new Date(prescription.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 py-3 border-t">
                          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View All Prescriptions
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <CardHeader className="bg-white border-b pb-3">
                          <CardTitle className="text-lg font-semibold text-slate-800">Insurance Claims</CardTitle>
                          <CardDescription>Latest insurance claims</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {isLoading ? (
                            <div className="p-4 space-y-4">
                              {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                              ))}
                            </div>
                          ) : (
                            <div className="divide-y">
                              {recentInsuranceClaims.map((claim) => (
                                <div key={claim.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                  <div>
                                    <p className="font-medium text-slate-800">Claim #{claim.id}</p>
                                    <p className="text-sm text-slate-500">
                                      Provider: {claim.providerName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                      claim.status === 'SUBMITTED' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 
                                      claim.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                                      'bg-green-50 text-green-700 border border-green-200'
                                    }`}>
                                      {claim.status.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                      {formatCurrency(claim.amount)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 py-3 border-t">
                          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View All Claims
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                )
              }
