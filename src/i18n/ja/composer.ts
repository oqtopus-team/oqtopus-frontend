export default {
  title: '量子回路コンポーザ',
  description:
    '量子回路を設計、可視化、実行できるようにするツールです。ドラッグ&ドロップで回路を作成できます。',
  tool_palette: {
    job_type: 'ジョブタイプ',
  },
  job_type: {
    sampling: 'サンプリング',
    estimation: '期待値推定',
  },
  observable: {
    title: '可観測量',
  },
  gate_viewer: {
    title: 'ゲートビューア',
    update: '更新',
    param: 'パラメータ',
    control_qubit: '制御量子ビットのインデックス',
    target_qubit: 'ターゲット量子ビットのインデックス',
  },
  control_panel: {
    exec: {
      tab_label: '実行',
      job_name: 'ジョブ名',
      name_placeholder: 'ジョブ名を入力してください',
      job_desc: '説明',
      desc_placeholder: '仕事の説明を入力してください。',
      device_id: 'デバイスID',
      shots: 'ショット数',
      shots_placeholder: 'ショット数を入力してください',
      submit: '送信',
      see_result: '結果を確認する',
      select_device: '利用可能なデバイスを選択してください',
      deviceSupport:
        'デバイス {{deviceId}} は {{qubitsCount}} 量子ビット以下の量子回路をサポートしています。',
    },
    siml: {
      tab_label: 'シミュレーション',
    },
    settings: {
      tab_label: '設定',
    },
  },
  actions: {
    duplicate: '複製',
    group: 'グループ化',
    ungroup: 'グループ化解除',
  },
  gates_multi_select_mode_popup: {
    title: '複数のゲートを選択中',
    done: '完了',
    cancel: 'キャンセル',
  },
  custom_gate_modal: {
    title: 'カスタムゲートを作成',
    gate_name_input_label: 'カスタムゲートの名前を入力:',
    create: '作成',
    cancel: 'キャンセル',
    errors: {
      invalid_gate_name_format:
        'ゲート名は文字、数字、アンダースコアのみで構成される必要があります。また、文字またはアンダースコアで始まる必要があります。',
      gate_already_defined: '指定された名前のゲートは既に定義されています。',
    },
  },
};
