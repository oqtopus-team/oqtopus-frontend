import React from 'react';
import clsx from 'clsx';
import { Tabs, Tab } from '@mui/material';

interface countsProps {
  combinedCircuitKey: string;
  programs: string[];
  selectedKeyIndex: string;
  options: { value: string; tabLabel: string; heading: string }[];
  onChange: (value: string) => void;
}

export const JobDetailMultiManualTabs: React.FC<countsProps> = ({
  selectedKeyIndex,
  options,
  onChange,
  combinedCircuitKey,
}: countsProps) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <>
      {/* Tabs */}
      <Tabs
        value={selectedKeyIndex}
        onChange={handleTabChange}
        className={clsx('custom-tabs')}
        variant="scrollable"
        scrollButtons={true}
      >
        <Tab label={combinedCircuitKey} value={combinedCircuitKey} className={clsx('custom-tab')} />

        {options.map((opt, index) => (
          <Tab
            key={opt.value}
            label={opt.tabLabel}
            value={opt.value}
            className={clsx('custom-tab')}
          />
        ))}
      </Tabs>
    </>
  );
};
