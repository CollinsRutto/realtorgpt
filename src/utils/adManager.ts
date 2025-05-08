// Types for ad management
export interface Ad {
  id: number;
  src: string;
  alt: string;
  link: string;
  impressions?: number;
  clicks?: number;
}

// In-memory store for ads (in production, this would be in a database)
let ads: Ad[] = [
  {
    id: 1,
    src: '/ads/Saruni-Apartments-Riverside-drive.jpg',
    alt: 'Modern Two-Story House For Sale - Prince Capital',
    link: 'https://www.princecapital.co.ke/project/saruni-apartments-riverside-drive/',
    impressions: 0,
    clicks: 0
  },
  {
    id: 2,
    src: '/ads/six-bedroom-vila.jpg',
    alt: 'Luxury Mansion With Stone Accents For Sale - Prince Capital',
    link: 'https://www.princecapital.co.ke/project/tera-bella-estate/',
    impressions: 0,
    clicks: 0
  },
  {
    id: 3,
    src: '/ads/Dodi-Karen.jpg',
    alt: 'Elegant Villa With Pool For Rent - Prince Capital',
    link: 'https://www.princecapital.co.ke/project/dodi-business-park/',
    impressions: 0,
    clicks: 0
  },
  {
    id: 4,
    src: '/ads/amazing-house.jpg',
    alt: 'Modern High-Rise Apartment Building For Sale - Prince Capital',
    link: 'https://www.princecapital.co.ke/project/saruni-apartments-riverside-drive/',
    impressions: 0,
    clicks: 0
  },
  {
    id: 5,
    src: '/ads/Runda-home.jpg',
    alt: 'Contemporary Townhouses Development For Sale - Prince Capital',
    link: 'https://www.princecapital.co.ke/project/tera-bella-estate/',
    impressions: 0,
    clicks: 0
  }
];

// Get all ads
export const getAllAds = (): Ad[] => {
  return [...ads];
};

// Get random ads (for rotation)
export const getRandomAds = (count: number = 4): Ad[] => {
  // Shuffle array
  const shuffled = [...ads].sort(() => 0.5 - Math.random());
  // Get first n elements
  return shuffled.slice(0, count);
};

// Track impression
export const trackImpression = (adId: number): void => {
  const adIndex = ads.findIndex(ad => ad.id === adId);
  if (adIndex !== -1) {
    ads[adIndex] = {
      ...ads[adIndex],
      impressions: (ads[adIndex].impressions || 0) + 1
    };
    
    // In production, you would send this to your analytics service
    console.log(`Ad impression: ${adId}`);
  }
};

// Track click
export const trackClick = (adId: number): void => {
  const adIndex = ads.findIndex(ad => ad.id === adId);
  if (adIndex !== -1) {
    ads[adIndex] = {
      ...ads[adIndex],
      clicks: (ads[adIndex].clicks || 0) + 1
    };
    
    // In production, you would send this to your analytics service
    console.log(`Ad click: ${adId}`);
  }
};

// Get ad performance metrics
export const getAdMetrics = (): { 
  totalImpressions: number; 
  totalClicks: number; 
  clickThroughRate: number;
  adPerformance: Array<{
    id: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
} => {
  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  
  return {
    totalImpressions,
    totalClicks,
    clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    adPerformance: ads.map(ad => ({
      id: ad.id,
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0,
      ctr: ad.impressions && ad.impressions > 0 
        ? ((ad.clicks || 0) / ad.impressions) * 100 
        : 0
    }))
  };
};