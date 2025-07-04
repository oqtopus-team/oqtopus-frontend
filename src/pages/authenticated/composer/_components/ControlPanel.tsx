import { JobsOperatorItem, JobsSubmitJobInfo, JobsSubmitJobRequest } from "@/api/generated";
import { Device } from "@/domain/types/Device";
import { JobTypeType } from "@/domain/types/Job";
import { Accordion } from "@/pages/_components/Accordion";
import { Button } from "@/pages/_components/Button";
import { Input } from "@/pages/_components/Input";
import { Select } from "@/pages/_components/Select";
import { Spacer } from "@/pages/_components/Spacer";
import { Checkbox } from "@mui/material";
import clsx from "clsx"
import { ReactNode, useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"

export type TabPanelItem = { id: string; label: string; disabled: boolean; };
interface TabPanelsProps {
  tabItems: TabPanelItem[];
  tabContent: (item: TabPanelItem) => ReactNode;
}

export const TabPanels = (props: TabPanelsProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(props.tabItems[0]?.id)
  const handleTabItemClick = (tabId: string) => () => {
    setActiveTab(tabId)
  }
  const renderContent: () => ReactNode = (() => {
    const h = props.tabItems.find(item => item.id == activeTab);
    if (h === undefined) {
      return () => <></>
    }
    return () => props.tabContent(h);
  })();
  return (
    <div>
      <div
        className={clsx([
          ['flex', 'items-center', 'justify-start'],
        ])}
      >
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
                    ? ['bg-base-card', 'text-primary',]
                    : ['bg-gray-bg'],
              ])}
              onClick={tabItem.disabled ? () => { } : handleTabItemClick(tabItem.id)}
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
          )
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
        >

        </div>
      </div>
      <div
        className={clsx([

          ['w-full, p-5', 'rounded', 'rounded-t-none'],
          ['border', 'border-t-0', 'border-b-neutral-content', 'border-x-neutral-content']
        ])}
      >
        {renderContent()}
      </div>
    </div>
  )
}

export interface ControlPanelProps {
  jobType: JobTypeType;
  devices: Device[];
  busy: boolean;
  mkProgram: () => { program: string, qubitNumber: number };
  mkOperator: () => JobsOperatorItem[];
  onSubmit: (req: JobsSubmitJobRequest) => Promise<void>;
}

export default (props: ControlPanelProps) => {
  const { t } = useTranslation();

  const tabItems = ["exec", "siml"]
    .map(id => ({
      id,
      label: t(`composer.control_panel.${id}.tab_label`),
      disabled: id == "siml"
    }));
  return (
    <>
      <TabPanels
        tabItems={tabItems}
        tabContent={(item) => {
          switch (item.id) {
            case "exec":
              return (
                <ControlPanelExecution
                  jobType={props.jobType}
                  busy={props.busy}
                  mkProgram={props.mkProgram}
                  mkOperator={props.mkOperator}
                  devices={props.devices}
                  onSubmit={props.onSubmit}
                  key="control-panel-exec"
                />
              )
            case "siml":
              return <></>
            default:
              return null;
          }
        }}
      />
    </>
  );
}

interface ExecutionFormInput {
  name: string;
  description: string;
  device_id: string;
  shots: number;
}

interface ControlPanelExecutionProps {
  devices: Device[];
  jobType: JobTypeType;
  busy: boolean;
  mkProgram: () => { program: string, qubitNumber: number };
  mkOperator: () => JobsOperatorItem[];
  onSubmit: (req: JobsSubmitJobRequest) => Promise<void>;
}

export const ControlPanelExecution = (props: ControlPanelExecutionProps) => {
  const { t } = useTranslation()
  const {
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    register,
    trigger,
  } = useForm<ExecutionFormInput>({
    defaultValues: {
      name: "",
      description: "",
      device_id: "",
      shots: 1000,
    },
  });

  useEffect(() => {
    const availableDevice = props.devices.find((device) => device.status === "available");

    if (availableDevice) {
      setValue("device_id", availableDevice.id ?? undefined);
    }
  }, [props.devices]);

  const handleClickSubmit = async (form: ExecutionFormInput) => {
    const mkJobInfo = (): [JobsSubmitJobInfo, number] => {
      const { program, qubitNumber } = props.mkProgram();
      switch (props.jobType) {
        case "sampling":
          return [
            {
              program: [program],
            },
            qubitNumber
          ];
        case "estimation":
          return [
            {
              program: [program],
              operator: props.mkOperator(),
            },
            qubitNumber
          ];
      }
    };
    const [submitJobInfo, qubitNumber] = mkJobInfo();

    const selectedDevice = props.devices.find(d => d.id === form.device_id);
    if (!selectedDevice) {
      alert("Select an available device!");
      return;
    }

    if (qubitNumber > selectedDevice.nQubits) {
      alert(`The device ${selectedDevice.id} supports quantum circuits of ${selectedDevice.nQubits} qubits or fewer.`)
    }

    if (Object.values(errors).every(e => e === undefined)) {


      const req: JobsSubmitJobRequest = {
        name: form.name,
        description: form.description,
        device_id: form.device_id,
        job_info: submitJobInfo,
        job_type: props.jobType,
        shots: form.shots,
      };

      props.onSubmit(req);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="w-1/2">
          <Input
            autoFocus
            placeholder={t('composer.control_panel.exec.name_placeholder')}
            label={t("composer.control_panel.exec.job_name")}
            {...register('name')}
          />

        </div>

        <div className="w-1/2">
          <Input
            autoFocus
            placeholder={t('composer.control_panel.exec.desc_placeholder')}
            label={t("composer.control_panel.exec.job_desc")}
            {...register('description')}
          />
        </div>

        <div className="flex gap-12 w-1/2">
          <div className="w-1/2">

            <Input
              autoFocus
              placeholder={t('composer.control_panel.exec.shots_placeholder')}
              label={t("composer.control_panel.exec.shots")}
              {...register('shots')}

            />
          </div>

          <div className="w-1/2">
            <Select
              label={t("composer.control_panel.exec.device_id")}
              {...register("device_id")}
              value={undefined}
              errorMessage={errors.device_id?.message}
            >
              {props.devices.map((device) =>
                <>
                  <option
                    disabled={device.status === 'unavailable'}
                    key={device.id}
                  >
                    {device.id}
                  </option>
                </>
              )}
            </Select>
          </div>


        </div>
      </div>

      <Spacer className="h-8" />
      <div>
        <div className="flex">
          <Button
            loading={isSubmitting}
            onClick={handleSubmit(handleClickSubmit)}
            color="secondary"
            disabled={props.busy}
          >
            {t('composer.control_panel.exec.submit')}
          </Button>
        </div>
      </div>
    </>
  );
}