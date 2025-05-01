import React, { useState } from 'react';
import { 
  Building, Home, TrendingUp, Scale, MapPin, Construction, 
  Lightbulb, Banknote, Users, Wrench, Laptop, ChevronDown, ChevronUp,
  LayoutTemplate, ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger, 
} from "@/components/ui/accordion";

interface QueryCategoriesProps { 
  onQuestionSelect: (question: string) => void;
  onBackClick?: () => void;
} 

const categories = [ 
  { 
    icon: Home, 
    title: "For Buyers & Renters", 
    questions: [ 
      "Where are the most affordable areas to buy a house in Nairobi?", 
      "What are the average rent prices for 2-bedroom apartments in Kilimani?", 
      "Which areas in Mombasa are best for beachfront properties under KSh 10M?", 
      "How safe is Ruiru for young families?", 
      "Can I get a mortgage as a non-Kenyan citizen in Kenya?", 
      "What are the pros and cons of buying off-plan property in Kenya?", 
      "Are there gated communities near Thika Road?", 
      "What's the typical deposit required for buying land in Kenya?" 
    ] 
  }, 
  { 
    icon: Building, 
    title: "For Sellers & Landlords", 
    questions: [ 
      "How do I price my apartment competitively in Westlands?", 
      "What are the best online platforms to list my house for sale in Kenya?", 
      "How long does it typically take to sell land in Kitengela?", 
      "What paperwork do I need to sell a house in Kenya?", 
      "Are furnished rentals more profitable in Nairobi CBD?", 
      "What's the best time of year to list my property in Kenya?" 
    ] 
  }, 
  { 
    icon: TrendingUp, 
    title: "For Investors & Developers", 
    questions: [ 
      "Which areas in Nairobi have the highest ROI for rental properties?", 
      "How is the real estate market performing in 2025 in Kenya?", 
      "What's the demand for student housing near Kenyatta University?", 
      "Which counties are showing real estate growth outside Nairobi?", 
      "What are the risks of buying land in satellite towns like Joska or Kamulu?", 
      "What are the top real estate trends in Kenya right now?", 
      "Are there tax incentives for real estate developers in Kenya?" 
    ] 
  }, 
  { 
    icon: Scale, 
    title: "Legal, Regulatory & Documentation", 
    questions: [ 
      "How can I verify a title deed in Kenya?", 
      "What is the land transfer process in Kenya?", 
      "Are there zoning regulations for residential buildings in Nairobi?", 
      "How do I check if land is freehold or leasehold?", 
      "What are the costs involved in property registration in Kenya?", 
      "What are the latest property tax rates by county?" 
    ] 
  }, 
  { 
    icon: MapPin, 
    title: "Location-Specific Searches", 
    questions: [ 
      "Compare property prices in Kileleshwa vs. Lavington.", 
      "Are there commercial spaces available in Industrial Area Nairobi?", 
      "What are the upcoming developments in Tatu City?", 
      "Where can I find agricultural land for sale in Eldoret?", 
      "Which Nairobi neighborhoods have the best infrastructure and schools?" 
    ] 
  }, 
  { 
    icon: LayoutTemplate, 
    title: "Architecture & Property Types", 
    questions: [ 
      "What are the most popular house designs in rural Kenya?", 
      "Are maisonettes more expensive to maintain than bungalows?", 
      "What's the difference between a bedsitter and a studio apartment in Kenya?", 
      "Which estates in Nairobi have modern minimalist architecture?", 
      "What building materials are most cost-effective in Kisumu?" 
    ] 
  }, 
  { 
    icon: Banknote, 
    title: "Valuation & Financing", 
    questions: [ 
      "How is property value assessed in Kenya?", 
      "What's the current mortgage interest rate from Kenyan banks?", 
      "Can I use my land title as collateral for a construction loan?", 
      "What are the hidden costs in real estate transactions in Kenya?", 
      "How do I estimate rental yield for apartments in Syokimau?" 
    ] 
  }, 
  { 
    icon: Users, 
    title: "Diaspora Buyers", 
    questions: [ 
      "How can I buy land in Kenya while living abroad?", 
      "Is it safe to invest in property in Kenya as a diaspora?", 
      "What are the trusted real estate agents for diaspora clients?", 
      "Can I give Power of Attorney to someone to buy on my behalf?", 
      "Are there diaspora-targeted real estate investment schemes?" 
    ] 
  }, 
  { 
    icon: Construction, 
    title: "Construction & Development", 
    questions: [ 
      "How much does it cost to build a 3-bedroom house in Kenya in 2025?", 
      "What are the current construction costs per square meter in Nairobi?", 
      "Do I need approvals from NEMA for residential development?", 
      "Where can I source affordable but quality building materials in Kenya?", 
      "Can I use alternative building technologies like EPS in Kenya?" 
    ] 
  }, 
  { 
    icon: Lightbulb, 
    title: "Sustainability & Smart Living", 
    questions: [ 
      "Are solar-powered homes common in Kenya?", 
      "What are green building certifications available in Kenya?", 
      "How can I make my house more energy-efficient in Kenya?", 
      "Are there real estate projects using sustainable materials?", 
      "Can I install a borehole in my residential home in Nairobi?" 
    ] 
  }, 
  { 
    icon: Wrench, 
    title: "Repairs, Renovations & Maintenance", 
    questions: [ 
      "What are typical renovation costs for old houses in Nairobi?", 
      "Are there home inspection services in Kenya?", 
      "What permits do I need to extend my house in Kenya?", 
      "How often should a rental house be repainted?", 
      "Can I install solar panels in an apartment complex?" 
    ] 
  }, 
  { 
    icon: Laptop, 
    title: "PropTech & Digital Services", 
    questions: [ 
      "Are virtual property tours common in Kenya?",
      "What property management software is popular in Kenya?",
      "How reliable are online property valuation tools for Kenyan properties?",
      "Are there apps for tracking construction progress in Kenya?",
      "What digital platforms help with land verification in Kenya?"
    ] 
  }
];

const QueryCategories: React.FC<QueryCategoriesProps> = ({ onQuestionSelect, onBackClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors">
      <div className="flex items-center justify-between p-4">
        <Button 
          onClick={onBackClick} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chat</span>
        </Button>
        
        <Button 
          onClick={toggleExpanded} 
          variant="ghost" 
          className="flex items-center gap-2"
        >
          <span>Popular Questions</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </Button>
        
        <div className="w-[100px]"></div> {/* Spacer for balance */}
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="flex items-center">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                      <span>{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 pt-2">
                      {category.questions.map((question, qIndex) => (
                        <Button 
                          key={qIndex} 
                          variant="ghost" 
                          className="justify-start text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700 p-2 transition-colors"
                          onClick={() => onQuestionSelect(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default QueryCategories;