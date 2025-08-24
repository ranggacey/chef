import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Check, X, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export type FilterOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

export type FilterCategory = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
};

type FilterPanelProps = {
  categories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (categoryId: string, optionId: string) => void;
  onClearFilters: () => void;
  translations: {
    filters: string;
    clearAll: string;
    apply: string;
    selected: string;
  };
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  translations,
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );

  // Get active filter count
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (count, filters) => count + filters.length,
    0
  );

  // Get selected filters for a category
  const getSelectedFilters = (categoryId: string) => {
    return selectedFilters[categoryId] || [];
  };

  // Check if a filter option is selected
  const isFilterSelected = (categoryId: string, optionId: string) => {
    return getSelectedFilters(categoryId).includes(optionId);
  };

  // Remove a specific filter
  const removeFilter = (categoryId: string, optionId: string) => {
    onFilterChange(categoryId, optionId);
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Filter Button */}
        <Button
          variant={activeFilterCount > 0 ? "primary" : "outline"}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="md:w-auto w-full justify-center"
        >
          {translations.filters}
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-medium text-neutral-900">{translations.filters}</h3>
              <button
                onClick={onClearFilters}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                {translations.clearAll}
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Filter Categories */}
              <div className="md:w-1/3 border-r border-neutral-100">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between ${
                      activeCategory === category.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      <span>{category.label}</span>
                    </div>
                    {getSelectedFilters(category.id).length > 0 && (
                      <Badge variant="primary" size="sm">
                        {getSelectedFilters(category.id).length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Filter Options */}
              <div className="md:w-2/3 p-4">
                {categories.map(
                  (category) =>
                    activeCategory === category.id && (
                      <div key={category.id} className="space-y-2">
                        <h4 className="text-sm font-medium text-neutral-500 mb-3">
                          {getSelectedFilters(category.id).length} {translations.selected}
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                          {category.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => onFilterChange(category.id, option.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                                isFilterSelected(category.id, option.id)
                                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                                  : 'bg-neutral-50 text-neutral-700 border border-neutral-100 hover:bg-neutral-100'
                              }`}
                            >
                              {isFilterSelected(category.id, option.id) && (
                                <Check className="w-3 h-3" />
                              )}
                              {option.icon && <span>{option.icon}</span>}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFilterPanel(false)}
              >
                {translations.apply}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map((category) =>
            getSelectedFilters(category.id).map((optionId) => {
              const option = category.options.find((opt) => opt.id === optionId);
              if (!option) return null;
              
              return (
                <Badge
                  key={`${category.id}-${optionId}`}
                  variant="primary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  {option.icon && <span className="mr-1">{option.icon}</span>}
                  {option.label}
                  <button
                    onClick={() => removeFilter(category.id, optionId)}
                    className="ml-1 p-1 hover:bg-primary-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })
          )}

          <button
            onClick={onClearFilters}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            {translations.clearAll}
          </button>
        </div>
      )}
    </div>
  );
};

// Dropdown filter component for simpler filtering needs
type DropdownFilterProps = {
  label: string;
  options: FilterOption[];
  selectedOption: string | null;
  onChange: (optionId: string) => void;
  icon?: React.ReactNode;
};

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  label,
  options,
  selectedOption,
  onChange,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLabel = selectedOption 
    ? options.find(opt => opt.id === selectedOption)?.label || label
    : label;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-colors text-sm font-medium text-neutral-700 w-full md:w-auto"
      >
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-10 mt-1 w-full min-w-[180px] bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden"
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                    selectedOption === option.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {selectedOption === option.id && <Check className="w-4 h-4" />}
                  {option.icon && <span>{option.icon}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 