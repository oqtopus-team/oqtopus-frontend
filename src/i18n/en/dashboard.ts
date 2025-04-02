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
      name: 'Name',
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
      device: 'Device Name',
      status: 'Status',
      date: 'Created',
      shots: 'Shots',
      description: 'Description',
    },
  },
  news: {
    title: 'News',
    button: 'View News',
  },
};
