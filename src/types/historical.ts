export interface HistoricalMilestone {
  year: number;
  dateStr?: string;
  title: string;
  category: 'FACT' | 'CRYONEX_ASSUMPTION' | 'SIMULATION_OUTPUT';
  description: string;
  engineeringDetails: string;
  verifiedSource?: string;
  associatedAssetCondition: {
    corrosionLevel: number;
    crackSeverity: number;
    estimatedHealthScore: number;
    criticalComponent: string;
  };
}

export interface HistoricalCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  designer: string;
  designType: string;
  constructionYears: string;
  collapseDate: string;
  casualtiesCount: number;
  milestones: HistoricalMilestone[];
  disclaimer: string;
  sources: {
    title: string;
    authors: string;
    year: number;
    publisher: string;
    doiOrUrl?: string;
  }[];
}
