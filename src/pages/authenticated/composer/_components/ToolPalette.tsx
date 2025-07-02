import { JOB_TYPES, JobTypeType } from "@/domain/types/Job"
import { Select } from "@/pages/_components/Select";
import clsx from "clsx";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";

export interface ToolPaletteProps {
  jobType: JobTypeType;
}

export default (props: ToolPaletteProps) => {
  const { t } = useTranslation()

  const jobTypeOptions = [
    { label: t("composer.job_type.sampling"), value: "sampling" },
    { label: t("composer.job_type.estimation"), value: "estimation" },
  ]

  return (
    <div
      className={clsx([
        ['w-full']
      ])}
    >
      <Select
        labelLeft={t("composer.tool_palette.job_type")}
        defaultValue={"sampling"}
      >
        {jobTypeOptions.map((opt) => (
          <option 
            label={opt.label}
            value={opt.value}
            key={opt.value}
          />
        ))
        }
      </Select>
    </div>
  )
}