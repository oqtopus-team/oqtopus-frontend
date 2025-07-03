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
      submit: "Submit"
    },
    siml: {
      tab_label: "Simulation"
    },
    settings: {
      tab_label: "Settings",
    }
  }
};
