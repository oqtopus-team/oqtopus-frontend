export default {
  title: 'Quantum Circuit Composer',
  description:
    'A tool that allows you to design, visualize, and run quantum circuits. You can create circuits by dragging and dropping.',
  advanced_options: 'Advanced Options',
  tool_palette: {
    job_type: 'Job Type',
  },
  job_type: {
    sampling: 'Sampling',
    estimation: 'Estimation',
  },
  observable: {
    title: 'Observable',
  },
  gate_viewer: {
    title: 'Gate Viewer',
    update: 'Update',
    param: 'Param',
    control_qubit: 'Control qubit index',
    target_qubit: 'Target qubit index',
  },
  control_panel: {
    exec: {
      tab_label: 'Backend Execution',
      job_name: 'Job Name',
      name_placeholder: 'Enter job name.',
      job_desc: 'Job Description',
      desc_placeholder: 'Enter job description.',
      device_id: 'Device ID',
      shots: 'Shots',
      shots_placeholder: 'Enter shots.',
      submit: 'Submit',
      see_result: 'See result',
      select_device: 'Select an available device',
      deviceSupport:
        'The device {{deviceId}} supports quantum circuits of {{qubitsCount}} qubits or fewer.',
    },
    siml: {
      tab_label: 'Local Simulation',
      circuit_evaluation: 'Quantum Circuit Evaluation',
      state_vector: 'State Vector (Probability Amplitude)',
      observable_evaluation: 'Observable Evaluation',
      sampling: 'Sampling Execution',
      sampling_shots: 'Shots',
      sampling_result: 'Sampling Result',
      expectation_value_estimation: 'Expectation Value Estimation',
      expectation_value: 'Expectation Value',
      observable: 'Observable',
      parameter_sweep: 'Sweep by circuit parameter',
      argument_color_map: 'Argument color map',
    },
    settings: {
      tab_label: 'Settings',
    },
  },
  actions: {
    duplicate: 'Duplicate',
    group: 'Group',
    ungroup: 'Ungroup',
  },
  gates_multi_select_mode_popup: {
    title: 'Selecting multiple gates',
    done: 'Done',
    cancel: 'Cancel',
  },
  custom_gate_modal: {
    title: 'Create custom gate',
    gate_name_input_label: 'Provide name for custom gate:',
    create: 'Create',
    cancel: 'Cancel',
    errors: {
      invalid_gate_name_format:
        'A gate name must start with a letter or an underscore. It must consist only of letters, numbers, and underscores.',
      gate_already_defined: 'Gate with provided name is already defined.',
    },
  },
  code_editor: {
    theme: 'theme',
  },
};
