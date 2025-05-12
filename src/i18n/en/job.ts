import { error } from 'console';
import { toast } from 'react-toastify';

export default {
  list: {
    title: 'Job',
    description: 'You can check the list of quantum circuit jobs.',
    register_button: 'Register a new job',
    search: {
      head: 'Job search',
      id: 'Job ID',
      id_placeholder: 'Enter Job ID',
      status: 'Status',
      description: 'Description',
      description_placeholder: 'Enter description',
      button: 'Search',
    },
    table: {
      id: 'Job ID',
      name: 'Job name',
      device: 'Device ID',
      status: 'Status',
      date: 'Submitted at',
      operation: 'Action',
      delete_button: 'Delete',
    },
    operation: {
      delete: 'Delete',
      cancel: 'Cancel',
    },
    modal: {
      title: 'Confirm',
      delete: 'Are you sure you want to delete this job?',
      bulk_delete: 'Are you sure you want to delete selected jobs?',
      cancel: 'Are you sure you want to cancel this job?',
    },
    nodata: 'Data does not exist.',
    delete_selected: 'Delete selected',
    delete_in_progress: 'Deleting jobs in progress...',
    cancel_selected: 'Cancel selected',
    cancel_in_progress: 'Cancelling jobs in progress...',
  },
  detail: {
    title: 'Job details',
    description:
      '*Running at, Ended at, Execution time, Transpiled Program, Result and some other fields will be reflected during job processing.',
    not_found: 'Job not found',
    reload: 'reload',
    info: {
      head: 'Basic information',
      item: 'Item',
      id: 'Job ID',
      name: 'Job name',
      description: 'Description',
      job_type: 'Job type',
      device_id: 'Device ID',
      shots: 'Number of shots',
      status: 'Status',
      submitted_at: 'Submitted at',
      ready_at: 'Ready at',
      running_at: 'Running at',
      ended_at: 'Ended at',
      execution_time: 'Execution time (sec)',
      message: 'Message',
    },
    program: {
      nodata: 'Data does not exist.',
    },
    transpiled_program: {
      nodata: 'Data does not exist.',
    },
    transpile_result: {
      nodata: 'Data does not exist.',
    },
    result: {
      nodata: 'Data does not exist.',
    },
    histogram: {
      nodata: 'Data does not exist.',
    },
    transpiler_info: {
      nodata: 'Data does not exist.',
    },
    mitigation_info: {
      nodata: 'Data does not exist.',
    },
    expectation: {
      nodata: 'Data does not exist.',
    },
    sselog: {
      head: 'SSE log',
      button: 'Download Log',
    },
    text: {
      copied: 'Copied',
      copy_tooltip: 'Copy to clipboard',
    },
  },
  form: {
    title: 'Job input form',
    description: 'Submit jobs to be executed on quantum devives.',
    name_placeholder: 'Example) ○○○',
    description_placeholder: 'Example) ○○○',
    program_placeholder:
      'Example) OPENQASM 3; include "stdgates.inc"; qubit[2] q; bit[2] c; h q[0]; cnot q[0], q[1]; c = measure q;',
    operator_pauli_placeholder: 'Enter the operator (eq: X 0 X 1)',
    operator_coeff_placeholder: 'Enter the coefficient (eg: 1.5)',
    transpiler_placeholder: 'Example) {}',
    simulator_placeholder: 'Example) {}',
    mitigation_placeholder: 'Example) {}',
    shots_placeholder: 'Example) ○○○',
    upload_file_button: 'Load file',
    button: 'Submit',
    submit_and_view_job_button: 'Submit and view job',
    operator: {
      pauli: 'Operator (Pauli string)',
      coeff: 'Coefficient',
    },
    toast: {
      success: 'Success: Job submitted successfully',
      error: 'Error: Failed to submit job',
    },
    error_message: {
      name: 'Please enter job name',
      shots: 'Please enter the positive number as shots',
      device: 'Please select a device',
      type: 'Please select a job type',
      program: 'Please enter the program',
      operator: {
        pauli: 'Enter operator in the Pauli string format',
        coeff: 'Enter the coefficient of the operator',
      },
      invalid_json: 'Please enter correct JSON',
    },
    modal: {
      overwrite_program: 'Are you sure you want to overwrite this program?',
    },
  },
};
