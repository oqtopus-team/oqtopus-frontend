export default {
  title: 'Quantum Circuit Composer',
  description:
    'A tool that allows you to design, visualize, and run quantum circuits. You can create circuits by dragging and dropping.',
  tool_palette: {
    job_type: "Job Type"
  },
  job_type: {
    sampling: "Sampling",
    estimation: "Estimation"
  },
  observable: {
    title: "Observable"
  },

  gate_viewer: {
    title: "Gate Viewer",
    update: "Update",
    param: "Param",
    control_qubit: "Control qubit index",
    target_qubit: "Target qubit index"
  },
  control_panel: {
    exec: {
      tab_label: "Execution" ,
      job_name: "Job Name",
      name_placeholder: "Enter job name.",
      job_desc: "Job Description",
      desc_placeholder: "Enter job description.",
      device_id: "Device ID",
      shots: "Shots",
      shots_placeholder: "Enter shots.",
      submit: "Submit",
      see_result: "See result",
    },
    siml: {
      tab_label: "Simulation"
    },
    settings: {
      tab_label: "Settings",
    }
  },
  actions: {
    duplicate: "Duplicate",
    group: "Group",
    ungroup: "Ungroup"
  },
  custom_gate_modal: {
    title: "Create custom gate",
    gate_name_input_label: "Provide name for custom gate:",
    create: "Create",
    cancel: "Cancel",
    errors: {
      invalid_gate_name_format: "A gate name must start with a letter or an underscore. It must consist only of letters, numbers, and underscores.",
      gate_already_defined: "Gate with provided name is already defined."
    }
  }
};
