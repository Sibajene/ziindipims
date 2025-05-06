import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  InsuranceProvider, 
  InsurancePlan, 
  PlanCoverageItem, 
  InsuranceClaim, 
  Prisma, 
  ClaimStatus 
} from '@prisma/client';
import { AddCoverageItemDto } from './dto/insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  // Insurance Provider methods
  async findAllProviders(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InsuranceProviderWhereInput;
    orderBy?: Prisma.InsuranceProviderOrderByWithRelationInput;
  }): Promise<InsuranceProvider[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.insuranceProvider.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: {
          select: {
            coveragePlans: true,
            claims: true,
          },
        },
      },
    });
  }

  async findProviderById(id: string): Promise<InsuranceProvider | null> {
    const provider = await this.prisma.insuranceProvider.findUnique({
      where: { id },
      include: {
        coveragePlans: true,
        _count: {
          select: {
            claims: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Insurance provider with ID ${id} not found`);
    }

    return provider;
  }

  async createProvider(data: Prisma.InsuranceProviderCreateInput): Promise<InsuranceProvider> {
    // Check if code is unique
    const existingProvider = await this.prisma.insuranceProvider.findUnique({
      where: { code: data.code },
    });

    if (existingProvider) {
      throw new BadRequestException(`Provider with code ${data.code} already exists`);
    }

    return this.prisma.insuranceProvider.create({
      data,
    });
  }

  async updateProvider(id: string, data: Prisma.InsuranceProviderUpdateInput): Promise<InsuranceProvider> {
    // Check if provider exists
    const provider = await this.prisma.insuranceProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Insurance provider with ID ${id} not found`);
    }

    // If code is being updated, check if it's unique
    if (data.code && data.code !== provider.code) {
      const existingProvider = await this.prisma.insuranceProvider.findUnique({
        where: { code: data.code as string },
      });

      if (existingProvider) {
        throw new BadRequestException(`Provider with code ${data.code} already exists`);
      }
    }

    return this.prisma.insuranceProvider.update({
      where: { id },
      data,
    });
  }

  // Insurance Plan methods
  async findAllPlans(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InsurancePlanWhereInput;
    orderBy?: Prisma.InsurancePlanOrderByWithRelationInput;
  }): Promise<InsurancePlan[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.insurancePlan.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        provider: true,
        _count: {
          select: {
            coverageItems: true,
            patients: true,
          },
        },
      },
    });
  }

  async findPlanById(id: string): Promise<InsurancePlan | null> {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
      include: {
        provider: true,
        coverageItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Insurance plan with ID ${id} not found`);
    }

    return plan;
  }

  async createPlan(data: {
    name: string;
    code: string;
    providerId: string;
    coveragePercentage: number;
    annualLimit?: number;
    requiresApproval?: boolean;
    patientCopay?: number;
    active?: boolean;
    createdBy?: string;
  }): Promise<InsurancePlan> {
    const { providerId, ...rest } = data;

    // Check if provider exists
    const provider = await this.prisma.insuranceProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Insurance provider with ID ${providerId} not found`);
    }

    // Check if plan code is unique for this provider
    const existingPlan = await this.prisma.insurancePlan.findFirst({
      where: {
        providerId,
        code: rest.code,
      },
    });

    if (existingPlan) {
      throw new BadRequestException(`Plan with code ${rest.code} already exists for this provider`);
    }

    return this.prisma.insurancePlan.create({
      data: {
        ...rest,
        provider: {
          connect: { id: providerId }
        }
      },
      include: {
        provider: true,
      },
    });
  }

  async updatePlan(id: string, data: Prisma.InsurancePlanUpdateInput): Promise<InsurancePlan> {
    // Check if plan exists
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Insurance plan with ID ${id} not found`);
    }

    // If code is being updated, check if it's unique for this provider
    if (data.code && data.code !== plan.code) {
      const existingPlan = await this.prisma.insurancePlan.findFirst({
        where: {
          providerId: plan.providerId,
          code: data.code as string,
          id: { not: id },
        },
      });

      if (existingPlan) {
        throw new BadRequestException(`Plan with code ${data.code} already exists for this provider`);
      }
    }

    return this.prisma.insurancePlan.update({
      where: { id },
      data,
      include: {
        provider: true,
      },
    });
  }
  
    // Coverage Item methods
    async addCoverageItem(planId: string, dto: AddCoverageItemDto): Promise<PlanCoverageItem> {
      // Check if plan exists
      const plan = await this.prisma.insurancePlan.findUnique({
        where: { id: planId },
      });
  
      if (!plan) {
        throw new NotFoundException(`Insurance plan with ID ${planId} not found`);
      }
  
      // Create the Prisma input data from the DTO
      const data: Prisma.PlanCoverageItemCreateInput = {
        coveragePercentage: dto.coveragePercentage,
        maxQuantity: dto.maxQuantity,
        requiresApproval: dto.requiresApproval,
        // Remove itemType if it's not in your Prisma schema
        // If you have a category field in your schema, use that instead
        // category: dto.category || 'PRODUCT',
        plan: {
          connect: { id: planId }
        }
      };
  
      // If productId is provided, check if it exists and add it to the data
      if (dto.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: dto.productId },
        });
  
        if (!product) {
          throw new NotFoundException(`Product with ID ${dto.productId} not found`);
        }
  
        data.product = {
          connect: { id: dto.productId }
        };
      }
  
      // Create coverage item
      return this.prisma.planCoverageItem.create({
        data,
        include: {
          product: true,
        },
      });
    }
  
    async updateCoverageItem(id: string, data: Prisma.PlanCoverageItemUpdateInput): Promise<PlanCoverageItem> {
      // Check if coverage item exists
      const coverageItem = await this.prisma.planCoverageItem.findUnique({
        where: { id },
      });
  
      if (!coverageItem) {
        throw new NotFoundException(`Coverage item with ID ${id} not found`);
      }
  
      return this.prisma.planCoverageItem.update({
        where: { id },
        data,
        include: {
          product: true,
        },
      });
    }
  
    async removeCoverageItem(id: string): Promise<PlanCoverageItem> {
      // Check if coverage item exists
      const coverageItem = await this.prisma.planCoverageItem.findUnique({
        where: { id },
      });
  
      if (!coverageItem) {
        throw new NotFoundException(`Coverage item with ID ${id} not found`);
      }
  
      return this.prisma.planCoverageItem.delete({
        where: { id },
      });
    }
  
    // Insurance Claim methods
    async findAllClaims(params: {
      skip?: number;
      take?: number;
      where?: Prisma.InsuranceClaimWhereInput;
      orderBy?: Prisma.InsuranceClaimOrderByWithRelationInput;
    }): Promise<InsuranceClaim[]> {
      const { skip, take, where, orderBy } = params;
      return this.prisma.insuranceClaim.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          provider: true,
          patientInsurance: {
            include: {
              patient: true,
            },
          },
          sale: true,
          claimItems: {
            include: {
              saleItem: true,
            },
          },
        },
      });
    }
  
    async findClaimById(id: string): Promise<InsuranceClaim | null> {
      const claim = await this.prisma.insuranceClaim.findUnique({
        where: { id },
        include: {
          provider: true,
          patientInsurance: {
            include: {
              patient: true,
              plan: true,
            },
          },
          sale: {
            include: {
              saleItems: true,
            },
          },
          claimItems: {
            include: {
              saleItem: {
                include: {
                  batch: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!claim) {
        throw new NotFoundException(`Insurance claim with ID ${id} not found`);
      }
  
      return claim;
    }
  
    async updateClaimStatus(id: string, data: {
      status: ClaimStatus;
      approvedBy?: string;
      rejectionReason?: string;
      paymentDate?: Date;
      paymentReference?: string;
      notes?: string;
      updatedBy?: string;
    }): Promise<InsuranceClaim> {
      // Check if claim exists
      const claim = await this.prisma.insuranceClaim.findUnique({
        where: { id },
      });
  
      if (!claim) {
        throw new NotFoundException(`Insurance claim with ID ${id} not found`);
      }
  
      // Validate status transition
      this.validateClaimStatusTransition(claim.status, data.status);
  
      return this.prisma.insuranceClaim.update({
        where: { id },
        data,
        include: {
          provider: true,
          patientInsurance: {
            include: {
              patient: true,
            },
          },
        },
      });
    }
  
    async updateClaimItems(id: string, items: {
      id: string;
      approvedQuantity: number;
      approvedAmount?: number;
      rejectionReason?: string;
    }[]): Promise<InsuranceClaim> {
      // Check if claim exists
      const claim = await this.prisma.insuranceClaim.findUnique({
        where: { id },
        include: {
          claimItems: true,
        },
      });
  
      if (!claim) {
        throw new NotFoundException(`Insurance claim with ID ${id} not found`);
      }
  
      // Validate claim status
      if (claim.status === 'PAID' || claim.status === 'CANCELLED') {
        throw new BadRequestException(`Cannot update items for a claim with status ${claim.status}`);
      }
  
      // Validate all items belong to this claim
      for (const item of items) {
        const claimItem = claim.claimItems.find(ci => ci.id === item.id);
        if (!claimItem) {
          throw new BadRequestException(`Claim item with ID ${item.id} does not belong to this claim`);
        }
      }
  
      // Update each claim item
      for (const item of items) {
        await this.prisma.insuranceClaimItem.update({
          where: { id: item.id },
          data: {
            approvedQuantity: item.approvedQuantity,
            approvedAmount: item.approvedAmount,
            rejectionReason: item.rejectionReason,
          },
        });
      }
  
      // Calculate total approved amount
      const updatedClaim = await this.prisma.insuranceClaim.findUnique({
        where: { id },
        include: {
          claimItems: true,
        },
      });
  
      const totalApproved = updatedClaim.claimItems.reduce((sum, item) => {
        return sum + (item.approvedAmount || item.claimedAmount);
      }, 0);
  
      // Determine if partially approved
      const isPartiallyApproved = totalApproved < updatedClaim.coveredAmount;
      const newStatus = isPartiallyApproved ? 'PARTIALLY_APPROVED' : 'APPROVED';
  
      // Update claim with new approved amount
      return this.prisma.insuranceClaim.update({
        where: { id },
        data: {
          coveredAmount: totalApproved,
          status: newStatus,
          approvalDate: new Date(),
        },
        include: {
          provider: true,
          patientInsurance: {
            include: {
              patient: true,
              plan: true,
            },
          },
          sale: true,
          claimItems: {
            include: {
              saleItem: {
                include: {
                  batch: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  
    // Add the missing getClaimStatistics method
    async getClaimStatistics(
      providerId?: string,
      startDate?: Date,
      endDate?: Date,
    ): Promise<any> {
      const where: Prisma.InsuranceClaimWhereInput = {};
      
      if (providerId) {
        where.providerId = providerId;
      }
      
      if (startDate || endDate) {
        where.submissionDate = {};
        
        if (startDate) {
          where.submissionDate.gte = startDate;
        }
        
        if (endDate) {
          where.submissionDate.lte = endDate;
        }
      }
      
      // Get all claims based on filters
      const claims = await this.prisma.insuranceClaim.findMany({
        where,
        include: {
          provider: true,
          claimItems: true,
        }
      });
      
      // Calculate statistics
      const totalClaims = claims.length;
      const pendingClaims = claims.filter(claim => claim.status === ClaimStatus.SUBMITTED).length;
      const approvedClaims = claims.filter(claim => claim.status === ClaimStatus.APPROVED).length;
      const partiallyApprovedClaims = claims.filter(claim => claim.status === ClaimStatus.PARTIALLY_APPROVED).length;
      const rejectedClaims = claims.filter(claim => claim.status === ClaimStatus.REJECTED).length;
      const paidClaims = claims.filter(claim => claim.status === ClaimStatus.PAID).length;
      const cancelledClaims = claims.filter(claim => claim.status === ClaimStatus.CANCELLED).length;
      
      const totalClaimedAmount = claims.reduce((sum, claim) => {
        return sum + claim.claimItems.reduce((itemSum, item) => itemSum + item.claimedAmount, 0);
      }, 0);
      const totalCoveredAmount = claims.reduce((sum, claim) => sum + claim.coveredAmount, 0);
      
      // Group by provider if no specific provider is selected
      let providerStats = [];
      if (!providerId) {
        const providerMap = new Map();
        
        for (const claim of claims) {
          const providerId = claim.providerId;
          const providerName = claim.provider.name;
          
          if (!providerMap.has(providerId)) {
            providerMap.set(providerId, {
              providerId,
              providerName,
              totalClaims: 0,
              pendingClaims: 0,
              approvedClaims: 0,
              partiallyApprovedClaims: 0,
              rejectedClaims: 0,
              paidClaims: 0,
              cancelledClaims: 0,
              totalClaimedAmount: 0,
              totalCoveredAmount: 0,
            });
          }
          
          const stats = providerMap.get(providerId);
          stats.totalClaims++;
          
          if (claim.status === ClaimStatus.SUBMITTED) stats.pendingClaims++;
          if (claim.status === ClaimStatus.APPROVED) stats.approvedClaims++;
          if (claim.status === ClaimStatus.PARTIALLY_APPROVED) stats.partiallyApprovedClaims++;
          if (claim.status === ClaimStatus.REJECTED) stats.rejectedClaims++;
          if (claim.status === ClaimStatus.PAID) stats.paidClaims++;
          if (claim.status === ClaimStatus.CANCELLED) stats.cancelledClaims++;
          
          stats.totalClaimedAmount += claim.claimItems.reduce((itemSum, item) => itemSum + item.claimedAmount, 0);
          stats.totalCoveredAmount += claim.coveredAmount;
        }
        
        providerStats = Array.from(providerMap.values());
      }
      
      // Return the statistics
      return {
        summary: {
          totalClaims,
          pendingClaims,
          approvedClaims,
          partiallyApprovedClaims,
          rejectedClaims,
          paidClaims,
          cancelledClaims,
          totalClaimedAmount,
          totalCoveredAmount,
          approvalRate: totalClaims > 0 ? (approvedClaims + partiallyApprovedClaims) / totalClaims : 0,
          coverageRate: totalClaimedAmount > 0 ? totalCoveredAmount / totalClaimedAmount : 0,
        },
        providerStats: providerStats.length > 0 ? providerStats : undefined,
      };
    }  
    private validateClaimStatusTransition(currentStatus: ClaimStatus, newStatus: ClaimStatus) {
      if (currentStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
        throw new BadRequestException('Cannot change status of a cancelled claim');
      }
  
      if (currentStatus === 'PAID' && newStatus !== 'PAID' && newStatus !== 'CANCELLED') {
        throw new BadRequestException('Paid claims can only be cancelled');
      }
    }
  }
  
