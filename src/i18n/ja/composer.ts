export default {
  title: '量子回路コンポーザ',
  description:
    '量子回路を設計、可視化、実行できるようにするツールです。ドラッグ&ドロップで回路を作成できます。',
  tool_palette: {
    job_type: "ジョブタイプ"
  },
  job_type: {
    sampling: "サンプリング",
    estimation: "期待値推定"
  },
  observable: {
    title: "可観測量"
  },
  gate_viewer: {
    title: "ゲートビューア",
    update: "更新",
  },
  control_panel: {
    exec: {
      tab_label: "実行",
      job_name: "ジョブ名",
      name_placeholder: "ジョブ名を入力してください",
      job_desc: "説明",
      device_id: "デバイスID",
      shots: "ショット数",
      shots_placeholder: "ショット数を入力してください",
      submit: "送信",
      see_result: "結果を確認する",
    },
    siml: {
      tab_label: "シミュレーション"
    },
    settings: {
      tab_label: "設定",
    }
  }
};
