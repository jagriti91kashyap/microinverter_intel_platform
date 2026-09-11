'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sliders, 
  Zap,
  Globe,
  Award,
  Shield,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface FilterState {
  query: string;
  manufacturers: string[];
  countries: string[];
  powerRange: [number, number];
  mpptRange: [number, number];
  warrantyRange: [number, number];
  certifications: string[];
  status: string[];
}

interface AdvancedFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const manufacturerOptions = [
  'Enphase Energy',
  'SolarEdge Technologies',
  'SMA Solar Technology',
  'Huawei',
  'Fronius',
  'Growatt',
  'GoodWe',
  'Sungrow'
];

const countryOptions = [
  'United States',
  'China',
  'Germany',
  'Japan',
  'South Korea',
  'Taiwan',
  'India',
  'Australia'
];

const certificationOptions = [
  'UL 1741',
  'IEC 62109',
  'CE',
  'VDE',
  'TÜV',
  'MCS',
  'NEMA',
  'IP67'
];

const statusOptions = [
  'ACTIVE',
  'DISCONTINUED',
  'UPCOMING',
  'LIMITED'
];

export function AdvancedFilterPanel({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
}: AdvancedFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    technical: true,
    certification: false,
    status: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addFilter = (type: keyof FilterState, value: string) => {
    if (type === 'query') return;
    
    const currentArray = filters[type] as string[];
    if (!currentArray.includes(value)) {
      onFiltersChange({
        ...filters,
        [type]: [...currentArray, value]
      });
    }
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    if (type === 'query') return;
    
    const currentArray = filters[type] as string[];
    onFiltersChange({
      ...filters,
      [type]: currentArray.filter(item => item !== value)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      manufacturers: [],
      countries: [],
      powerRange: [0, 10000],
      mpptRange: [0, 20],
      warrantyRange: [0, 30],
      certifications: [],
      status: []
    });
  };

  const getActiveFiltersCount = () => {
    return filters.manufacturers.length +
           filters.countries.length +
           filters.certifications.length +
           filters.status.length +
           (filters.powerRange[0] > 0 || filters.powerRange[1] < 10000 ? 1 : 0) +
           (filters.mpptRange[0] > 0 || filters.mpptRange[1] < 20 ? 1 : 0) +
           (filters.warrantyRange[0] > 0 || filters.warrantyRange[1] < 30 ? 1 : 0);
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        onClick={onToggle}
        className="glass-card border-border/20 hover:border-border/40 transition-all duration-200"
      >
        <Filter className="w-4 h-4 mr-2" />
        Advanced Filters
        {getActiveFiltersCount() > 0 && (
          <Badge className="ml-2 bg-accent text-accent-foreground">
            {getActiveFiltersCount()}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </Button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 z-50 mt-2 glass-card border-border/20 shadow-vercel-xl"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Advanced Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Query
                </label>
                <Input
                  placeholder="Search products, manufacturers..."
                  value={filters.query}
                  onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
                  className="glass-card border-border/50"
                />
              </div>

              {/* Basic Filters */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('basic')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Basic Filters
                  </h4>
                  {expandedSections.basic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {expandedSections.basic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Manufacturers */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Manufacturers</label>
                        <div className="flex flex-wrap gap-2">
                          {manufacturerOptions.map((manufacturer) => (
                            <Badge
                              key={manufacturer}
                              variant={filters.manufacturers.includes(manufacturer) ? "default" : "outline"}
                              className={`cursor-pointer transition-all duration-200 ${
                                filters.manufacturers.includes(manufacturer)
                                  ? 'vercel-gradient text-white border-transparent'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => 
                                filters.manufacturers.includes(manufacturer)
                                  ? removeFilter('manufacturers', manufacturer)
                                  : addFilter('manufacturers', manufacturer)
                              }
                            >
                              {manufacturer}
                              {filters.manufacturers.includes(manufacturer) && (
                                <X className="w-3 h-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Countries */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Countries
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {countryOptions.map((country) => (
                            <Badge
                              key={country}
                              variant={filters.countries.includes(country) ? "default" : "outline"}
                              className={`cursor-pointer transition-all duration-200 ${
                                filters.countries.includes(country)
                                  ? 'vercel-gradient text-white border-transparent'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => 
                                filters.countries.includes(country)
                                  ? removeFilter('countries', country)
                                  : addFilter('countries', country)
                              }
                            >
                              {country}
                              {filters.countries.includes(country) && (
                                <X className="w-3 h-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Technical Filters */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('technical')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium">Technical Specifications</h4>
                  {expandedSections.technical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {expandedSections.technical && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Power Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          AC Power Range: {filters.powerRange[0]}W - {filters.powerRange[1]}W
                        </label>
                        <Slider
                          value={filters.powerRange}
                          onValueChange={(value) => onFiltersChange({ ...filters, powerRange: value as [number, number] })}
                          max={10000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                      </div>

                      {/* MPPT Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          No. of MPPTs: {filters.mpptRange[0]} - {filters.mpptRange[1]}
                        </label>
                        <Slider
                          value={filters.mpptRange}
                          onValueChange={(value) => onFiltersChange({ ...filters, mpptRange: value as [number, number] })}
                          max={20}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Warranty Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Warranty: {filters.warrantyRange[0]} years - {filters.warrantyRange[1]} years
                        </label>
                        <Slider
                          value={filters.warrantyRange}
                          onValueChange={(value) => onFiltersChange({ ...filters, warrantyRange: value as [number, number] })}
                          max={30}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Certification Filters */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('certification')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certifications
                  </h4>
                  {expandedSections.certification ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {expandedSections.certification && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex flex-wrap gap-2">
                        {certificationOptions.map((certification) => (
                          <Badge
                            key={certification}
                            variant={filters.certifications.includes(certification) ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 ${
                              filters.certifications.includes(certification)
                                ? 'vercel-gradient text-white border-transparent'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => 
                              filters.certifications.includes(certification)
                                ? removeFilter('certifications', certification)
                                : addFilter('certifications', certification)
                            }
                          >
                            {certification}
                            {filters.certifications.includes(certification) && (
                              <X className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Filters */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('status')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Status
                  </h4>
                  {expandedSections.status ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {expandedSections.status && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <Badge
                            key={status}
                            variant={filters.status.includes(status) ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 ${
                              filters.status.includes(status)
                                ? 'vercel-gradient text-white border-transparent'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => 
                              filters.status.includes(status)
                                ? removeFilter('status', status)
                                : addFilter('status', status)
                            }
                          >
                            {status}
                            {filters.status.includes(status) && (
                              <X className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
