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
}: countsProps) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onChange(newValue.toString());
  };

  return (
    <>
      {/* Tabs */}
      <Tabs
        value={parseInt(selectedKeyIndex, 10)} // radix: 10
        onChange={handleTabChange}
        className={clsx('custom-tabs')}
        variant="scrollable"
        scrollButtons={true}
      >
        {options.map((opt, index) => (
          <Tab key={opt.value} label={opt.tabLabel} value={index} className={clsx('custom-tab')} />
        ))}
      </Tabs>
    </>
  );
};
