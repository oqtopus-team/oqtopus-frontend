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
    param: "Param",
    control_qubit: "Control qubit index",
    target_qubit: "Target qubit index"
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
