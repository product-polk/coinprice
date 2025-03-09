import React, { useState, ReactNode } from 'react';

interface TabProps {
  label: string;
  content: ReactNode;
}

interface TabContainerProps {
  tabs: TabProps[];
  defaultActiveTab?: number;
}

const TabContainer: React.FC<TabContainerProps> = ({ 
  tabs, 
  defaultActiveTab = 0 
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-3 px-5 text-sm font-medium rounded-t-lg ${
              activeTab === index
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-gray-50 dark:bg-gray-800'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabContainer; 