export default {
  title: 'Dashboard',
  composer: {
    title: 'Composer',
    description: "Let's calculate with a quantum computer.",
    button: 'Start using',
  },
  device: {
    title: 'Device',
    button: 'View Devices',
    table: {
      name: 'Device ID',
      status: 'Status',
      qubits: 'Number of qubits',
      type: 'Type',
    },
  },
  job: {
    title: 'Job',
    button: 'View Jobs',
    table: {
      id: 'Job ID',
      name: 'Job name',
      device: 'Device ID',
      status: 'Status',
      date: 'Submitted at',
      shots: 'Shots',
    },
  },
  news: {
    title: 'News',
    button: 'View News',
  },
};
