export default {
  title: 'ダッシュボード',
  composer: {
    title: 'コンポーザ',
    description: '量子コンピュータで計算をしてみましょう',
    button: '利用開始',
  },
  device: {
    title: 'デバイス',
    button: '一覧へ',
    table: {
      name: 'デバイスID',
      status: 'ステータス',
      qubits: '量子ビット数',
      type: 'タイプ',
    },
  },
  job: {
    title: 'ジョブ',
    button: '一覧へ',
    table: {
      id: 'ジョブID',
      device: 'デバイスID',
      status: 'ステータス',
      date: '登録日時',
      shots: 'ショット数',
      description: '説明文',
    },
  },
  news: {
    title: 'お知らせ',
    button: '一覧へ',
  },
};
