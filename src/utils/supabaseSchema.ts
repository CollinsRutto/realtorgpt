export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  county: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: 'sale' | 'rent';
  created_at: string;
  updated_at: string;
  images: string[];
  features: string[];
  contact_info: string;
}

export interface RealEstateRegulation {
  id: string;
  title: string;
  description: string;
  category: string;
  source_url: string;
  published_date: string;
  is_active: boolean;
}

export interface MarketTrend {
  id: string;
  region: string;
  property_type: string;
  average_price: number;
  price_change_percent: number;
  time_period: string;
  data_source: string;
  created_at: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  session_id: string;
  created_at: string;
  response: string;
  sources: string[];
}

// Database types
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>;
      };
      real_estate_regulations: {
        Row: RealEstateRegulation;
        Insert: Omit<RealEstateRegulation, 'id'>;
        Update: Partial<Omit<RealEstateRegulation, 'id'>>;
      };
      market_trends: {
        Row: MarketTrend;
        Insert: Omit<MarketTrend, 'id' | 'created_at'>;
        Update: Partial<Omit<MarketTrend, 'id' | 'created_at'>>;
      };
      search_queries: {
        Row: SearchQuery;
        Insert: Omit<SearchQuery, 'id' | 'created_at'>;
        Update: Partial<Omit<SearchQuery, 'id' | 'created_at'>>;
      };
    };
  };
};