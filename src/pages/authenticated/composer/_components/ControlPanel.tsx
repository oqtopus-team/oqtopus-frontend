import {
  JobsS3OperatorItem,
  JobsS3SubmitJobInfo,
  JobsJobType,
  JobsSubmitJobRequest,
} from '@/api/generated';
import { Device } from '@/domain/types/Device';
import { JobTypeType } from '@/domain/types/Job';
import clsx from 'clsx';
import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JobForm } from '@/pages/authenticated/jobs/_components/JobForm';
import { LocalSimulationTabContent } from './LocalSimulationTabContent';
import { RealComposerGate } from '../composer';
import { isParametrizedGate } from '../gates';
import { circuitContext } from '../circuit';

export type TabPanelItem = { id: string; label: string; disabled: boolean };

interface TabPanelsProps {
  tabItems: TabPanelItem[];
  tabContent: (item: TabPanelItem) => ReactNode;
}

export const TabPanels = (props: TabPanelsProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(props.tabItems[0]?.id);
  const handleTabItemClick = (tabId: string) => () => {
    setActiveTab(tabId);
  };
  const renderContent: () => ReactNode = (() => {
    const h = props.tabItems.find((item) => item.id == activeTab);
    if (h === undefined) {
      return () => <></>;
    }
    return () => props.tabContent(h);
  })();
  return (
    <div>
      <div className={clsx([['flex', 'items-center', 'justify-start']])}>
        {props.tabItems.map((tabItem, i) => {
          return (
            <div
              className={clsx([
                ['border', 'border-neutral-content', 'rounded-sm'],
                tabItem.id == activeTab ? ['border-b-base-card'] : ['border-b-neutral-content'],
                ['text-sm'],
                ['px-5', 'h-10'],
                ['flex', 'items-end', 'justify-center'],
                tabItem.disabled
                  ? ['bg-disable-bg', 'text-disable-content']
                  : tabItem.id === activeTab
                    ? ['bg-base-card', 'text-primary']
                    : ['bg-gray-bg'],
              ])}
              onClick={tabItem.disabled ? () => {} : handleTabItemClick(tabItem.id)}
              key={`tab-${i}`}
            >
              <div
                className={clsx([
                  ['flex', 'justify-center', 'items-center'],
                  ['h-full', 'w-full'],

                  tabItem.disabled ? ['cursor-not-allowed'] : ['cursor-pointer'],
                ])}
              >
                <span>{tabItem.label}</span>
              </div>
            </div>
          );
        })}
        <div
          className={clsx([
            'flex-grow',
            'border',
            'h-10',
            'border-b-neutral-content',
            'border-t-0',
            'border-x-0',
          ])}
        ></div>
      </div>
      <div
        className={clsx([
          ['w-full, p-5', 'rounded', 'rounded-t-none'],
          ['border', 'border-t-0', 'border-b-neutral-content', 'border-x-neutral-content'],
        ])}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export interface ControlPanelProps {
  jobType: JobTypeType;
  devices: Device[];
  busy: boolean;
  jobId: null | string;
  mkProgram: { program: string; qubitNumber: number };
  mkOperator: JobsS3OperatorItem[];
  onSubmit: (req: JobsSubmitJobRequest, jobS3Info: JobsS3SubmitJobInfo) => Promise<void>;
}

export default (props: ControlPanelProps) => {
  const { t } = useTranslation();
  const tabItems = ['siml', 'exec'].map((id) => ({
    id,
    label: t(`composer.control_panel.${id}.tab_label`),
    disabled: false,
  }));
  const composerCircuitService = useContext(circuitContext);
  const [selectedGates, setSelectedGates] = useState<RealComposerGate[]>([]);

  useEffect(() => {
    return composerCircuitService.onSelectedGatesChange((gs) => {
      setSelectedGates(gs);
    });
  }, [composerCircuitService]);

  const selectedParametricGatePosition = useMemo(() => {
    if (selectedGates.length == 1) {
      const selectedGate = selectedGates[0];
      if (isParametrizedGate(selectedGate)) {
        return {
          step: selectedGate.column,
          index: selectedGate.row,
        };
      }
    }
    return undefined;
  }, [selectedGates]);

  return (
    <>
      <TabPanels
        tabItems={tabItems}
        tabContent={(item) => {
          switch (item.id) {
            case 'siml':
              return (
                <LocalSimulationTabContent
                  jobType={props.jobType}
                  qubitNumber={props.mkProgram.qubitNumber}
                  program={props.mkProgram.program}
                  observable={props.jobType == 'estimation' ? props.mkOperator : undefined}
                  selectedParametricGatePosition={selectedParametricGatePosition}
                />
              );

            case 'exec':
              return (
                <JobForm
                  mkProgram={props.mkProgram}
                  mkOperator={props.mkOperator}
                  isAdvancedSettingsOpen={false}
                  jobType={props.jobType}
                  displayFields={{
                    program: false,
                    type: false,
                    operator: false,
                    fileUpload: false,
                  }}
                />
              );
            default:
              return null;
          }
        }}
      />
    </>
  );
};
