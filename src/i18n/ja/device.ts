export default {
  list: {
    title: 'デバイス一覧',
    description:
      '分子や原子を扱う量子力学の知見を活かした電子部品です。トポロジー情報や量子ビットごとの値などを確認できます。',
    table: {
      id: 'デバイス ID',
      name: 'デバイス名',
      status: 'ステータス',
      qubits: '量子ビット数',
      type: 'タイプ',
      pending_jobs: '保留中のジョブ',
      basis_gates: '基本量子ゲート',
      instructions: '非ゲート命令',
      description: '説明',
      available_at: '利用可能日時',
      calib_date: '最終キャリブレーション日時',
    },
  },
  detail: {
    title: 'デバイス',
    not_found: '対象のデバイスが存在しません',
    id: 'ID',
    status: 'ステータス',
    qubits: '量子ビット数',
    type: 'タイプ',
    date: '最終更新日',
    available_at: '利用可能日時',
    calibrated_at: '最終キャリブレーション日時',
    basis_gates: '基本量子ゲート',
    instructions: '非ゲート命令',
    description: '説明',
    table: {
      '1q_fidelity': '平均 1Q 忠実度',
      '2q_fidelity': '平均 2Q 忠実度',
      average_fidelity: '平均読み出し忠実度',
      time: '読み出し時間',
    },
    link_txt: '各単語の情報について',
    topology_info: {
      header: 'トポロジー情報',
      property: 'プロパティ',
      median: '中央値',
      max: '最大',
      min: '最小',
      nodata: 'データが存在しません',
      invalid_device_info: 'トポロジー情報が無効です',
    },
    qubits_info: {
      header: '量子ビットごとの値',
      search: '検索',
      table: {
        frequency: '頻度',
        anharmonicity: '非調和性',
        error: '読み出し割り当てエラー',
      },
    },
    not_found: '対象のデバイスが存在しません',
  },
  status: {
    available: '利用可',
    unavailable: '利用不可',
  },
  type: {
    simulator: 'シミュレータ',
    superconductivity: '超伝導',
  },
};
