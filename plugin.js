/**
 * Mascot Guide, a companion for the Hermes desktop app.
 *
 * A floating mascot (96px) in the corner of the window. Click it and an
 * "Agent Status" bubble opens with model, tokens, context, cost and activity,
 * plus switches for which readouts show. A "mascot guide" pane carries the
 * same card for people who prefer it docked.
 *
 * Install: $HERMES_HOME/desktop-plugins/mascot-guide/plugin.js
 * (folder name MUST equal the plugin id). Plain ESM, loaded uncompiled.
 *
 * Data: the desktop's own atoms where they exist, plus the `session.usage`
 * RPC/event for token + context + cost, which older builds do not expose as
 * `host.state.focusedUsage`.
 */

import { atom, host, useValue } from '@hermes/plugin-sdk'
import { Component, useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

const ID = 'mascot-guide'

/* ---------------------------------------------------------------- assets */

const MASCOT_FULL = 'data:image/webp;base64,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'
const MASCOT_THUMB = 'data:image/webp;base64,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'

/* ------------------------------------------------------------------ i18n */

const EN = {
  paneTitle: 'Mascot Guide',
  status: 'Agent Status',
  idle: 'idle',
  writing: 'writing',
  thinking: 'thinking',
  waiting: 'waiting for you',
  model: 'Model',
  tokens: 'Tokens',
  context: 'Context',
  cost: 'Cost',
  cache: 'Cache hit',
  activity: 'Activity',
  profile: 'Profile',
  cwd: 'Working dir',
  noSession: 'No active session yet',
  copy: 'Copy status',
  copied: 'Status copied to clipboard',
  clipboardUnavailable: 'Clipboard unavailable',
  widgets: 'In bubble',
  showModel: 'Active model',
  showTokens: 'Token usage',
  showContext: 'Context window',
  showCost: 'Session cost',
  showActivity: 'Agent activity',
  showProfile: 'Profile + working dir',
  showCache: 'Prompt cache hit',
  animation: 'Animation',
  breathing: 'Breathing',
  float: 'Float',
  pulse: 'Pulse while busy',
  speech: 'Speech bubble',
  size: 'Size',
  zoom: 'Zoom',
  offset: 'Offset Y',
  now: 'Now',
  sayIdle: 'Standing by, call me if needed',
  sayIdle2: 'I keep an eye on this window',
  sayIdle3: 'Click me if you are curious',
  sayBusy: 'Working… {0}',
  sayThink: 'Thinking it through…',
  sayThink2: 'Give me a moment',
  sayThink3: 'Weighing the options…',
  sayWaiting: 'Done, your turn',
  sayWaiting2: 'Finished, take a look',
  sayWaiting3: 'All set, continue?',
  sayFull: 'Context at {0}%, want me to compress?',
  compress: 'Compress',
  stop: 'Stop',
  compressed: 'Context compressed',
  compressFailed: 'Compress failed',
  stopped: 'Turn interrupted',
  stopFailed: 'Nothing to stop',
  session: 'Session',
  spend: 'Session spend',
  cycleHint: 'click to switch',
  language: 'Language',
  cards: 'Under mascot',
  tabStatus: 'Status',
  tabSettings: 'Settings',
  openSettings: 'Open settings',
  done: 'Done',
  cardSpend: 'Spend / tokens',
  cardModel: 'Model',
  cardContext: 'Context',
  cardSession: 'Session + tools',
  cardEta: 'Context ETA',
  cardDaily: 'Spend today',
  cardCache: 'Cache hit',
  cardCron: 'Cron berikutnya',
  cardCron: 'Next cron',
  focus: 'Fokus 25m',
  focusOn: 'Fokus {0}',
  focusDone: 'Sesi fokus selesai, istirahat dulu',
  speak: 'Bacakan',
  stopSpeak: 'Stop suara',
  focus: 'Focus 25m',
  focusOn: 'Focus {0}',
  focusDone: 'Focus finished, take a break',
  speak: 'Speak',
  stopSpeak: 'Stop voice',
  mascot: 'Mascot',
  upload: 'Choose image',
  cutout: 'Cut background',
  recut: 'Re-cut',
  cutoutHint: 'Plain background works best. Transparent PNG needs no cut.',
  reset: 'Default',
  tooBig: 'Image too large (700 KB, or 2.5 MB for GIF)',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4 (green screen auto-keyed).',
  tools: 'tools',
  recent: 'Recent',
  ctxWarn: 'Context almost full, consider compressing',
  close: 'Close',
  tokensShort: 'Tokens',
  colour: 'Colour',
  colourHint: 'Pick a colour, or keep it on the theme.',
  colourCards: 'Cards',
  colourBubble: 'Chat bubble',
  colourAura: 'Aura glow',
  theme: 'Theme',
  fromAvatar: 'From avatar',
  auraSize: 'Aura size',
  auraIntensity: 'Intensity',
  auraSpeed: 'Speed',
  auraAlways: 'Keep the glow on while idle',
  auraSilhouette: 'Glow follows the silhouette',
  auraVideoHint: 'Video avatars: the soft glow is steadier and cheaper per frame; green-screen edge only wins on still images.',
  noColour: 'Could not read a colour from that image',
  simple: 'Simple',
  advanced: 'Advanced',
  presets: 'Presets',
  presetStudio: 'Studio · aura on, 2 cards',
  presetCalm: 'Calm · no aura, 2 cards',
  presetMinimal: 'Minimal · no aura, no cards, no bubble',
  presetHint: 'Presets only touch layout and the aura. Your colours stay.',
  position: 'Bubble & cards',
  posHint: 'Nudge the bubble or the cards without moving the mascot.',
  bubblePos: 'Chat bubble',
  cardPos: 'Cards',
  panelPos: 'Status panel',
  hidePanelSetting: 'Hide the status panel while adjusting',
  showBubbleSetting: 'Show the chat bubble while adjusting',
  preview: 'Preview while adjusting',
  previewAura: 'Show the aura while adjusting',
  resetPos: 'Reset position',
  leftRight: 'Left / right',
  upDown: 'Up / down',
  avatarPos: 'Avatar position',
  leftSide: 'Left',
  rightSide: 'Right',
}

const IDN = {
  ...EN,
  paneTitle: 'Panduan Maskot',
  status: 'Status Agen',
  idle: 'menganggur',
  writing: 'menulis',
  thinking: 'mikir',
  waiting: 'menunggu kamu',
  tokens: 'Token',
  context: 'Konteks',
  cost: 'Biaya',
  activity: 'Aktivitas',
  profile: 'Profil',
  cwd: 'Folder kerja',
  noSession: 'Belum ada sesi aktif',
  copy: 'Salin status',
  copied: 'Status tersalin',
  clipboardUnavailable: 'Clipboard tidak tersedia',
  widgets: 'Di bubble',
  showModel: 'Model aktif',
  showTokens: 'Pemakaian token',
  showContext: 'Jendela konteks',
  showCost: 'Biaya sesi',
  showActivity: 'Aktivitas agen',
  showProfile: 'Profil + folder kerja',
  showCache: 'Cache prompt',
  animation: 'Animasi',
  breathing: 'Napas',
  float: 'Melayang',
  pulse: 'Pulse saat sibuk',
  speech: 'Balon ucapan',
  size: 'Ukuran',
  zoom: 'Zoom',
  offset: 'Geser Y',
  now: 'Sekarang',
  compress: 'Ringkas',
  stop: 'Stop',
  compressed: 'Konteks udah diringkas',
  compressFailed: 'Gagal ringkas konteks',
  stopped: 'Turn dihentikan',
  stopFailed: 'Nggak ada yang jalan',
  session: 'Sesi',
  spend: 'Biaya sesi',
  cycleHint: 'klik untuk ganti',
  language: 'Bahasa',
  cards: 'Di bawah maskot',
  tabStatus: 'Status',
  tabSettings: 'Setelan',
  openSettings: 'Buka setelan',
  done: 'Selesai',
  cardSpend: 'Biaya / token',
  cardModel: 'Model',
  cardContext: 'Konteks',
  cardSession: 'Sesi + tool',
  cardEta: 'Perkiraan konteks',
  cardDaily: 'Biaya hari ini',
  cardCache: 'Cache hit',
  cardCron: 'Cron berikutnya',
  cardCron: 'Next cron',
  focus: 'Fokus 25m',
  focusOn: 'Fokus {0}',
  focusDone: 'Sesi fokus selesai, istirahat dulu',
  speak: 'Bacakan',
  stopSpeak: 'Stop suara',
  focus: 'Focus 25m',
  focusOn: 'Focus {0}',
  focusDone: 'Focus finished, take a break',
  speak: 'Speak',
  stopSpeak: 'Stop voice',
  mascot: 'Maskot',
  upload: 'Pilih gambar',
  cutout: 'Potong background',
  recut: 'Potong ulang',
  cutoutHint: 'Background polos paling bagus. PNG transparan tak perlu dipotong.',
  reset: 'Default',
  tooBig: 'Gambar terlalu besar (700 KB, GIF maks 2,5 MB)',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4 (green screen otomatis di-key).',
  tools: 'tool',
  recent: 'Terakhir',
  ctxWarn: 'Konteks hampir penuh, sebaiknya ringkas',
  sayIdle: 'Santai dulu, panggil kalau butuh',
  sayIdle2: 'Aku jaga layar ini ya',
  sayIdle3: 'Klik aku kalau penasaran',
  sayBusy: 'Lagi kerja… {0}',
  sayThink: 'Mikir dulu ya…',
  sayThink2: 'Bentar, aku susun langkahnya',
  sayThink3: 'Lagi nimbang-nimbang…',
  sayWaiting: 'Selesai, giliran kamu',
  sayWaiting2: 'Udah kelar, cek ya',
  sayWaiting3: 'Beres, mau lanjut?',
  sayFull: 'Konteks {0}%, mau aku ringkas?',
  close: 'Tutup',
  tokensShort: 'Token',
  model: 'Model',
  cache: 'Cache',
  colour: 'Warna',
  colourHint: 'Pilih warna sendiri, atau biarkan ikut tema.',
  colourCards: 'Kartu',
  colourBubble: 'Balon chat',
  colourAura: 'Cahaya aura',
  theme: 'Tema',
  fromAvatar: 'Dari avatar',
  auraSize: 'Besar aura',
  auraIntensity: 'Intensitas',
  auraSpeed: 'Kecepatan',
  auraAlways: 'Aura tetap nyala saat menganggur',
  auraSilhouette: 'Aura ikut siluet avatar',
  auraVideoHint: 'Avatar video: aura lembut lebih stabil dan lebih ringan per frame; tepi siluet cuma bagus buat gambar diam.',
  noColour: 'Warnanya nggak kebaca dari gambar itu',
  simple: 'Sederhana',
  advanced: 'Lanjutan',
  presets: 'Preset',
  presetStudio: 'Studio · aura nyala, 2 kartu',
  presetCalm: 'Tenang · tanpa aura, 2 kartu',
  presetMinimal: 'Minimal · tanpa aura, tanpa kartu, tanpa balon',
  presetHint: 'Preset cuma ngatur tata letak dan aura. Warna pilihanmu tetap.',
  position: 'Geser balon & kartu',
  posHint: 'Geser balon atau kartu tanpa mindahin maskotnya.',
  bubblePos: 'Balon chat',
  cardPos: 'Kartu',
  panelPos: 'Panel status',
  hidePanelSetting: 'Sembunyikan panel status saat menyetel',
  showBubbleSetting: 'Tampilkan balon chat saat menyetel',
  preview: 'Pratinjau saat menyetel',
  previewAura: 'Tampilkan aura saat menyetel',
  resetPos: 'Reset posisi',
  leftRight: 'Kiri / kanan',
  upDown: 'Atas / bawah',
  avatarPos: 'Posisi avatar',
  leftSide: 'Kiri',
  rightSide: 'Kanan',
}


const ES = {
  ...EN,
  paneTitle: 'Guía del Mascota',
  status: 'Estado del agente',
  idle: 'inactivo',
  writing: 'escribiendo',
  waiting: 'esperando por ti',
  model: 'Modelo',
  tokens: 'Tokens',
  context: 'Contexto',
  cost: 'Costo',
  cache: 'Caché',
  activity: 'Actividad',
  profile: 'Perfil',
  cwd: 'Carpeta',
  noSession: 'Todavía no hay sesión activa',
  copy: 'Copiar estado',
  copied: 'Estado copiado',
  clipboardUnavailable: 'Portapapeles no disponible',
  widgets: 'In bubble',
  showModel: 'Modelo activo',
  showTokens: 'Uso de tokens',
  showContext: 'Ventana de contexto',
  showCost: 'Costo de la sesión',
  showActivity: 'Actividad',
  showProfile: 'Perfil + carpeta',
  showCache: 'Aciertos de caché',
  animation: 'Animación',
  breathing: 'Respiración',
  float: 'Flotar',
  pulse: 'Pulso al trabajar',
  speech: 'Bocadillo',
  size: 'Tamaño',
  now: 'Ahora',
  recent: 'Reciente',
  sayIdle: 'Tranquilo, llámame si hace falta',
  sayIdle2: 'Aquí cuido la pantalla',
  sayIdle3: 'Haz clic si tienes curiosidad',
  sayBusy: 'Trabajando… {0}',
  sayThink: 'Pensando…',
  sayThink2: 'Dame un momento',
  sayThink3: 'Sopesando opciones…',
  sayWaiting: 'Listo, te toca',
  sayWaiting2: 'Terminado, revisa',
  sayWaiting3: 'Hecho, ¿seguimos?',
  sayFull: 'Contexto al {0}%, ¿lo resumo?',
  compress: 'Resumir',
  stop: 'Detener',
  compressed: 'Contexto resumido',
  compressFailed: 'No se pudo resumir',
  stopped: 'Turno detenido',
  stopFailed: 'Nada en ejecución',
  session: 'Sesión',
  spend: 'Costo de la sesión',
  cycleHint: 'clic para cambiar',
  language: 'Idioma',
  cards: 'Tarjetas bajo la mascota',
  tabStatus: 'Estado',
  tabSettings: 'Ajustes',
  openSettings: 'Abrir ajustes',
  done: 'Listo',
  cardSpend: 'Costo / tokens',
  cardModel: 'Modelo',
  cardContext: 'Contexto',
  cardSession: 'Sesión + herramientas',
  mascot: 'Imagen de la mascota',
  upload: 'Elegir imagen',
  cutout: 'Recortar fondo',
  recut: 'Recortar otra vez',
  cutoutHint: 'Mejor con fondo liso; un PNG transparente no necesita recorte.',
  reset: 'Usar la de defecto',
  tooBig: 'Imagen muy grande (máx 700 KB)',
  tools: 'herr.',
  ctxWarn: 'Contexto casi lleno, conviene resumir',
  close: 'Cerrar',
  cardCache: 'Aciertos de caché',
  cardCron: 'Próximo cron',
  cardDaily: 'Gasto de hoy',
  cardEta: 'ETA de contexto',
  focus: 'Foco 25m',
  focusOn: 'Foco {0}',
  focusDone: 'Enfoque terminado, descansa',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4 (croma automático)',
  offset: 'Desfase Y',
  speak: 'Leer',
  stopSpeak: 'Parar voz',
  thinking: 'pensando',
  tokensShort: 'Tokens',
  zoom: 'Zoom',
}

const PT = {
  ...EN,
  paneTitle: 'Guia do Mascote',
  status: 'Status do agente',
  idle: 'ocioso',
  writing: 'escrevendo',
  waiting: 'esperando você',
  model: 'Modelo',
  tokens: 'Tokens',
  context: 'Contexto',
  cost: 'Custo',
  cache: 'Cache',
  activity: 'Atividade',
  profile: 'Perfil',
  cwd: 'Pasta',
  noSession: 'Nenhuma sessão ativa ainda',
  copy: 'Copiar status',
  copied: 'Status copiado',
  clipboardUnavailable: 'Área de transferência indisponível',
  widgets: 'In bubble',
  showModel: 'Modelo ativo',
  showTokens: 'Uso de tokens',
  showContext: 'Janela de contexto',
  showCost: 'Custo da sessão',
  showActivity: 'Atividade do agente',
  showProfile: 'Perfil + pasta',
  showCache: 'Acerto de cache',
  animation: 'Animação',
  breathing: 'Respiração',
  float: 'Flutuar',
  pulse: 'Pulso ao trabalhar',
  speech: 'Balão de fala',
  size: 'Tamanho',
  now: 'Agora',
  recent: 'Recente',
  sayIdle: 'Tranquilo, me chame se precisar',
  sayIdle2: 'Estou de olho na tela',
  sayIdle3: 'Clique se estiver curioso',
  sayBusy: 'Trabalhando… {0}',
  sayThink: 'Pensando…',
  sayThink2: 'Só um instante',
  sayThink3: 'Pesando as opções…',
  sayWaiting: 'Pronto, sua vez',
  sayWaiting2: 'Terminei, confere',
  sayWaiting3: 'Feito, seguimos?',
  sayFull: 'Contexto em {0}%, resumo?',
  compress: 'Resumir',
  stop: 'Parar',
  compressed: 'Contexto resumido',
  compressFailed: 'Falha ao resumir',
  stopped: 'Turno interrompido',
  stopFailed: 'Nada em execução',
  session: 'Sessão',
  spend: 'Custo da sessão',
  cycleHint: 'clique para trocar',
  language: 'Idioma',
  cards: 'Cartões sob a mascote',
  tabStatus: 'Status',
  tabSettings: 'Ajustes',
  openSettings: 'Abrir ajustes',
  done: 'Pronto',
  cardSpend: 'Custo / tokens',
  cardModel: 'Modelo',
  cardContext: 'Contexto',
  cardSession: 'Sessão + ferramentas',
  mascot: 'Imagem da mascote',
  upload: 'Escolher imagem',
  cutout: 'Recortar fundo',
  recut: 'Recortar de novo',
  cutoutHint: 'Melhor com fundo liso; PNG transparente não precisa.',
  reset: 'Usar padrão',
  tooBig: 'Imagem grande demais (máx 700 KB)',
  tools: 'ferr.',
  ctxWarn: 'Contexto quase cheio, vale resumir',
  close: 'Fechar',
  cardCache: 'Acertos de cache',
  cardCron: 'Próximo cron',
  cardDaily: 'Gasto de hoje',
  cardEta: 'ETA do contexto',
  focus: 'Foco 25m',
  focusOn: 'Foco {0}',
  focusDone: 'Foco concluído, descanse',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4 (croma automático)',
  offset: 'Deslocamento Y',
  speak: 'Falar',
  stopSpeak: 'Parar voz',
  thinking: 'pensando',
  tokensShort: 'Tokens',
  zoom: 'Zoom',
}

const JA = {
  ...EN,
  paneTitle: 'マスコットガイド',
  status: 'エージェント状態',
  idle: '待機中',
  writing: '作業中',
  waiting: 'あなたの番です',
  model: 'モデル',
  tokens: 'トークン',
  context: 'コンテキスト',
  cost: 'コスト',
  cache: 'キャッシュ',
  activity: 'アクティビティ',
  profile: 'プロファイル',
  cwd: '作業フォルダ',
  noSession: 'まだアクティブなセッションがありません',
  copy: '状態をコピー',
  copied: 'コピーしました',
  clipboardUnavailable: 'クリップボード不可',
  widgets: 'ウィジェット',
  showModel: '使用モデル',
  showTokens: 'トークン使用量',
  showContext: 'コンテキスト枠',
  showCost: 'セッションcost',
  showActivity: '動作状況',
  showProfile: 'プロファイル＋フォルダ',
  showCache: 'キャッシュ命中率',
  animation: 'アニメーション',
  breathing: '呼吸',
  float: '浮遊',
  pulse: '稼働中に脈動',
  speech: '吹き出し',
  size: 'サイズ',
  now: '現在',
  recent: '最近',
  sayIdle: 'のんびり待機中。必要なら呼んでね',
  sayIdle2: '画面を見守っています',
  sayIdle3: '気になったらクリックしてね',
  sayBusy: '作業中… {0}',
  sayThink: '考え中…',
  sayThink2: '少し待ってね',
  sayThink3: '選択肢を検討中…',
  sayWaiting: '完了, どうぞ',
  sayWaiting2: '終わりました、確認してね',
  sayWaiting3: 'できたよ, 続けますか？',
  sayFull: 'コンテキスト {0}%, 要約する？',
  compress: '要約',
  stop: '停止',
  compressed: 'コンテキストを要約しました',
  compressFailed: '要約に失敗',
  stopped: 'ターンを中断しました',
  stopFailed: '実行中の処理なし',
  session: 'セッション',
  spend: 'セッションcost',
  cycleHint: 'クリックで切替',
  language: '言語',
  cards: 'マスコット下のカード',
  tabStatus: '状態',
  tabSettings: '設定',
  openSettings: '設定を開く',
  done: '完了',
  cardSpend: 'コスト / トークン',
  cardModel: 'モデル',
  cardContext: 'コンテキスト',
  cardSession: 'セッション＋ツール',
  mascot: 'マスコット画像',
  upload: '画像を選ぶ',
  cutout: '背景を切り抜く',
  recut: '切り抜き直す',
  cutoutHint: '背景が無地だと綺麗。透過PNGなら不要です。',
  reset: '既定に戻す',
  tooBig: '画像が大きすぎます（最大700KB）',
  tools: 'ツール',
  ctxWarn: 'コンテキストがほぼ一杯, 要約を推奨',
  close: '閉じる',
  cardCache: 'キャッシュ命中',
  cardCron: '次のcron',
  cardDaily: '本日の支出',
  cardEta: '残り時間',
  focus: '集中25分',
  focusOn: '集中 {0}',
  focusDone: '集中終了, 休憩を',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4（緑背景を自動除去）',
  offset: 'Yオフセット',
  speak: '読み上げ',
  stopSpeak: '音声停止',
  thinking: '考え中',
  tokensShort: 'トークン',
  zoom: 'ズーム',
}

const ZH = {
  ...EN,
  paneTitle: '吉祥物助手',
  status: '代理状态',
  idle: '空闲',
  writing: '写作中',
  waiting: '等你回复',
  model: '模型',
  tokens: '词元',
  context: '上下文',
  cost: '花费',
  cache: '缓存',
  activity: '活动',
  profile: '配置',
  cwd: '工作目录',
  noSession: '还没有活跃会话',
  copy: '复制状态',
  copied: '已复制',
  clipboardUnavailable: '剪贴板不可用',
  widgets: '小组件',
  showModel: '当前模型',
  showTokens: '词元用量',
  showContext: '上下文窗口',
  showCost: '会话花费',
  showActivity: '代理活动',
  showProfile: '配置 + 目录',
  showCache: '缓存命中',
  animation: '动画',
  breathing: '呼吸',
  float: '漂浮',
  pulse: '工作时脉动',
  speech: '气泡',
  size: '尺寸',
  now: '当前',
  recent: '最近',
  sayIdle: '闲着，需要就叫我',
  sayIdle2: '我帮你看着屏幕',
  sayIdle3: '好奇就点我一下',
  sayBusy: '忙… {0}',
  sayThink: '想一下…',
  sayThink2: '稍等片刻',
  sayThink3: '权衡方案中…',
  sayWaiting: '好了, 轮到你了',
  sayWaiting2: '做完了，看看',
  sayWaiting3: '完工, 继续吗？',
  sayFull: '上下文 {0}%, 要压缩吗？',
  compress: '压缩',
  stop: '停止',
  compressed: '上下文已压缩',
  compressFailed: '压缩失败',
  stopped: '已中断',
  stopFailed: '没有进行中的任务',
  session: '会话',
  spend: '会话花费',
  cycleHint: '点击切换',
  language: '语言',
  cards: '吉祥物下方的卡片',
  tabStatus: '状态',
  tabSettings: '设置',
  openSettings: '打开设置',
  done: '完成',
  cardSpend: '花费 / 词元',
  cardModel: '模型',
  cardContext: '上下文',
  cardSession: '会话 + 工具',
  mascot: '吉祥物图片',
  upload: '选择图片',
  cutout: '自动抠图',
  recut: '重新抠图',
  cutoutHint: '纯色背景效果最好；透明 PNG 无需抠图。',
  reset: '恢复默认',
  tooBig: '图片太大（上限 700KB）',
  tools: '工具',
  ctxWarn: '上下文快满了, 建议压缩',
  close: '关闭',
  cardCache: '缓存命中',
  cardCron: '下一个定时',
  cardDaily: '今日花费',
  cardEta: '预计剩余',
  focus: '专注25分',
  focusOn: '专注 {0}',
  focusDone: '专注结束, 休息一下',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4（自动抠绿）',
  offset: 'Y 偏移',
  speak: '朗读',
  stopSpeak: '停止朗读',
  thinking: '思考中',
  tokensShort: '词元',
  zoom: '缩放',
}


const KO = {
  ...EN,
  paneTitle: '마스코트 가이드',
  status: '에이전트 상태',
  idle: '대기 중',
  writing: '작성 중',
  waiting: '당신 차례예요',
  model: '모델',
  tokens: '토큰',
  context: '컨텍스트',
  cost: '비용',
  cache: '캐시',
  activity: '활동',
  profile: '프로필',
  cwd: '작업 폴더',
  noSession: '아직 활성 세션이 없습니다',
  copy: '상태 복사',
  copied: '상태를 복사했습니다',
  clipboardUnavailable: '클립보드를 사용할 수 없습니다',
  widgets: '위젯',
  showModel: '사용 모델',
  showTokens: '토큰 사용량',
  showContext: '컨텍스트 창',
  showCost: '세션 비용',
  showActivity: '에이전트 활동',
  showProfile: '프로필 + 폴더',
  showCache: '프롬프트 캐시 적중',
  animation: '애니메이션',
  breathing: '호흡',
  float: '부유',
  pulse: '작업 중 맥동',
  speech: '말풍선',
  size: '크기',
  now: '지금',
  recent: '최근',
  sayIdle: '대기 중이에요, 필요하면 불러줘요',
  sayIdle2: '이 화면을 지켜보고 있어요',
  sayIdle3: '궁금하면 눌러보세요',
  sayBusy: '작업 중… {0}',
  sayThink: '생각 중…',
  sayThink2: '잠시만요',
  sayThink3: '선택지를 저울질하는 중…',
  sayWaiting: '끝났어요, 이제 당신 차례',
  sayWaiting2: '완료했어요, 확인해 주세요',
  sayWaiting3: '다 됐어요, 계속할까요?',
  sayFull: '컨텍스트 {0}%, 요약할까요?',
  compress: '요약',
  stop: '중지',
  compressed: '컨텍스트를 요약했습니다',
  compressFailed: '요약에 실패했습니다',
  stopped: '턴을 중단했습니다',
  stopFailed: '실행 중인 작업이 없습니다',
  session: '세션',
  spend: '세션 비용',
  cycleHint: '클릭해서 전환',
  language: '언어',
  cards: '마스코트 아래 카드',
  tabStatus: '상태',
  tabSettings: '설정',
  openSettings: '설정 열기',
  done: '완료',
  cardSpend: '비용 / 토큰',
  cardModel: '모델',
  cardContext: '컨텍스트',
  cardSession: '세션 + 도구',
  mascot: '마스코트 이미지',
  upload: '이미지 선택',
  cutout: '배경 자동 제거',
  recut: '다시 자르기',
  cutoutHint: '배경이 단색이면 가장 깔끔합니다. 투명 PNG는 필요 없어요.',
  reset: '기본값 사용',
  tooBig: '이미지가 너무 큽니다 (최대 700KB)',
  tools: '도구',
  ctxWarn: '컨텍스트가 거의 찼습니다, 요약을 권장합니다',
  close: '닫기',
  cardCache: '캐시 적중',
  cardCron: '다음 크론',
  cardDaily: '오늘 지출',
  cardEta: '남은 시간',
  focus: '집중 25분',
  focusOn: '집중 {0}',
  focusDone: '집중 종료, 쉬어가요',
  formatHint: 'PNG/JPG/SVG · GIF/WebM · MP4(그린 스크린 자동 제거)',
  offset: 'Y 오프셋',
  speak: '읽어주기',
  stopSpeak: '음성 중지',
  thinking: '생각 중',
  tokensShort: '토큰',
  zoom: '확대',
}

let dict = EN

const LOCALES = { en: EN, id: IDN, es: ES, pt: PT, ja: JA, zh: ZH, ko: KO }
const LANGS = [['auto', 'Auto'], ['en', 'EN'], ['id', 'ID'], ['es', 'ES'], ['pt', 'PT'], ['ja', 'JA'], ['zh', 'ZH'], ['ko', 'KO']]

function currentDict(choice) {
  if (choice && LOCALES[choice]) return LOCALES[choice]
  if (choice === 'en') return EN
  const lang = (typeof navigator !== 'undefined' && (navigator.language || '')) || 'en'
  return String(lang).toLowerCase().startsWith('id') ? IDN : EN
}

function t(key) {
  return dict[key] || EN[key] || key
}

/* ------------------------------------------------------------- constants */

const WIDGET_KEYS = [
  'showModel',
  'showTokens',
  'showContext',
  'showCost',
  'showActivity',
  'showProfile',
  'showCache'
]

const DEFAULTS = {
  open: false,
  breathing: true,
  float: true,
  pulse: true,
  size: 96,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  speech: true,
  focusUntil: 0,
  language: 'auto',
  settingsOpen: false,
  pills: { spend: true, model: true, context: false, session: false, eta: false, daily: false, cache: false, cron: false },
  moneySource: 'cost',
  image: '',
  cutout: false,
  posX: 20,
  posY: 58,
  showModel: true,
  showTokens: true,
  showContext: true,
  showCost: true,
  showActivity: true,
  showProfile: false,
  showCache: false,
  cardColor: '',
  cardText: '',
  bubbleColor: '',
  bubbleText: '',
  auraColor: '',
  auraSize: 26,
  auraAlpha: 55,
  auraSpeed: 1.6,
  auraStyle: 'soft',
  auraAlways: false,
  bubbleX: 0,
  bubbleY: 0,
  cardX: 0,
  cardY: 0,
  panelX: 0,
  panelY: 0,
  hidePanelInSettings: false,
  showBubbleInSettings: false,
  previewAura: false
}

/* Presets stay deliberately narrow: layout density and the aura only, so a
   picked colour is never thrown away by tapping one. */
const PRESETS = [
  {
    key: 'studio',
    label: 'presetStudio',
    patch: {
      size: 96,
      speech: true,
      pulse: true,
      breathing: true,
      float: false,
      auraStyle: 'soft',
      auraAlways: true,
      auraSize: 26,
      auraAlpha: 55,
      auraSpeed: 1.6,
      pills: { spend: true, model: true, context: false, session: false, eta: false, daily: false, cache: false, cron: false }
    }
  },
  {
    key: 'calm',
    label: 'presetCalm',
    patch: {
      size: 88,
      speech: true,
      pulse: false,
      auraAlways: false,
      breathing: false,
      float: false,
      pills: { spend: true, model: true, context: false, session: false, eta: false, daily: false, cache: false, cron: false }
    }
  },
  {
    key: 'minimal',
    label: 'presetMinimal',
    patch: {
      size: 72,
      speech: false,
      pulse: false,
      auraAlways: false,
      breathing: false,
      float: false,
      pills: { spend: false, model: false, context: false, session: false, eta: false, daily: false, cache: false, cron: false }
    }
  }
]

/* ------------------------------------------------------------ formatting */

function fmtTokens(n) {
  const v = Number(n) || 0
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${Math.round(v / 1e3)}K`
  return String(v)
}

function fmtCost(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return '-'
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`
}

function shortModel(model) {
  if (!model) return '-'
  const raw = typeof model === 'string' ? model : model.id || model.name || model.model || ''
  if (!raw) return '-'
  const tail = String(raw).split('/').pop() || String(raw)
  /* The pill wraps instead of cutting the name; only absurd ids get clipped. */
  return tail.length > 48 ? `${tail.slice(0, 47)}…` : tail
}

function providerLabel(model) {
  const raw = typeof model === 'string' ? model : (model && model.id) || ''
  const head = String(raw).split('/')[0].toLowerCase()
  if (head.includes('openrouter')) return 'OpenRouter'
  if (head.includes('nous')) return 'Nous'
  if (head.includes('anthropic')) return 'Anthropic'
  if (head.includes('openai')) return 'OpenAI'
  if (head.includes('google')) return 'Google'
  if (head.includes('deepseek')) return 'DeepSeek'
  if (head.includes('meituan')) return 'Meituan'
  return head ? head.charAt(0).toUpperCase() + head.slice(1) : '-'
}

function baseName(p) {
  if (!p) return ''
  const parts = String(p).split(/[\\/]/).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : String(p)
}

function ctxPercent(u) {
  const v = Number(u && u.context_percent)
  if (Number.isFinite(v) && v > 0) return v
  const used = Number(u && u.context_used)
  const max = Number(u && u.context_max)
  if (Number.isFinite(used) && Number.isFinite(max) && max > 0) return (used / max) * 100
  return 0
}

/* --------------------------------------------------------------- colours */

function hexToRgb(hex) {
  const h = String(hex || '').trim().replace('#', '')
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (!/^[0-9a-f]{6}$/i.test(s)) return null
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) }
}

function rgbToHex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/* Text that stays readable on top of a user-picked background. */
function readableOn(hex) {
  const c = hexToRgb(hex)
  if (!c) return ''
  const lum = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255
  return lum > 0.55 ? '#0b0f16' : '#eef2f8'
}

/* Nudge a colour toward white, for borders on a hand-picked surface. */
function tint(hex, pct) {
  const c = hexToRgb(hex)
  if (!c) return ''
  return rgbToHex(c.r + (255 - c.r) * pct, c.g + (255 - c.g) * pct, c.b + (255 - c.b) * pct)
}

/* Average of the colourful pixels: skip white/black/grey so a photo's
   background does not win over skin/hair/outfit. */
function colourFromPixels(d) {
  let r = 0
  let gg = 0
  let b = 0
  let n = 0
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 48) continue
    const R = d[i]
    const G = d[i + 1]
    const B = d[i + 2]
    const mx = Math.max(R, G, B)
    const mn = Math.min(R, G, B)
    if (mx > 236 && mn > 236) continue
    if (mx < 28) continue
    if (mx - mn < 16) continue
    r += R
    gg += G
    b += B
    n += 1
  }
  return n ? rgbToHex(r / n, gg / n, b / n) : ''
}

function dominantColor(src) {
  return new Promise(resolve => {
    try {
      const img = new Image()
      img.onload = () => {
        try {
          const w = 32
          const h = 32
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const g = canvas.getContext('2d')
          g.drawImage(img, 0, 0, w, h)
          resolve(colourFromPixels(g.getImageData(0, 0, w, h).data))
        } catch (e) {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = src
    } catch (e) {
      resolve('')
    }
  })
}

/* A video avatar has no <img> to sample: read the hidden <video> frame that
   VideoArt already renders; blank pixels are skipped like in a photo. */
function dominantColorFromVideo() {
  return new Promise(resolve => {
    try {
      const v = document.querySelector('.mg-vid-src')
      if (!v || !v.videoWidth) return resolve('')
      const w = 32
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = w
      const g = canvas.getContext('2d')
      g.drawImage(v, 0, 0, w, w)
      resolve(colourFromPixels(g.getImageData(0, 0, w, w).data))
    } catch (e) {
      resolve('')
    }
  })
}

/* CSS custom properties applied on the float root; every surface reads them
   with a theme fallback so an empty value means "follow the theme". */
function skinVars(prefs) {
  const v = {}
  if (prefs.cardColor) {
    v['--mg-card-bg'] = prefs.cardColor
    v['--mg-card-bd'] = tint(prefs.cardColor, 0.32)
  }
  if (prefs.cardText) v['--mg-card-fg'] = prefs.cardText
  if (prefs.bubbleColor) {
    v['--mg-bubble-bg'] = prefs.bubbleColor
    v['--mg-bubble-bd'] = tint(prefs.bubbleColor, 0.34)
  }
  if (prefs.bubbleText) v['--mg-bubble-fg'] = prefs.bubbleText
  if (prefs.auraColor) v['--mg-aura-c'] = prefs.auraColor
  const size = Number(prefs.auraSize)
  v['--mg-aura-r'] = `${Number.isFinite(size) ? Math.max(0, Math.min(120, size)) : 26}px`
  const alpha = Number(prefs.auraAlpha)
  const pct = Number.isFinite(alpha) ? Math.max(0, Math.min(100, alpha)) : 55
  v['--mg-aura-a'] = `${pct}%`
  v['--mg-aura-o'] = String(pct / 100)
  const speed = Number(prefs.auraSpeed)
  v['--mg-aura-t'] = `${Number.isFinite(speed) && speed > 0.2 ? speed : 1.6}s`
  return v
}

/* ------------------------------------------------------------------- css */

const CSS = `
.mg-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;max-width:268px}
.mg-pill{cursor:pointer;transition:border-color .15s,transform .12s;display:flex;flex-direction:column;gap:1px;padding:4px 8px;border-radius:8px;border:1px solid var(--mg-card-bd,var(--ui-stroke-secondary));background:var(--mg-card-bg,var(--ui-bg-primary,#0f1116));box-shadow:0 6px 16px rgb(0 0 0 / .3);max-width:112px}
.mg-pill:hover{border-color:var(--ui-accent);transform:translateY(-1px)}
.mg-pill[data-wide=true]{max-width:100%;flex:0 1 auto}
.mg-pill[data-wide=true] .mg-pill-v{white-space:normal;overflow-wrap:anywhere;line-height:1.3}
.mg-pill-k{font-size:8px;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--mg-card-fg,var(--ui-text-quaternary)) 62%,transparent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg-pill-v{font-size:11px;font-weight:700;color:var(--mg-card-fg,var(--ui-text-primary));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mg-stack{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.mg-under{display:flex;align-items:flex-end;gap:6px}
.mg-gear{width:24px;height:24px;border-radius:7px;border:1px solid var(--ui-stroke-secondary);background:var(--ui-bg-primary,#0f1116);color:var(--ui-text-tertiary);font-size:12px;cursor:pointer;line-height:1}
.mg-gear:hover{color:var(--ui-text-primary);border-color:var(--ui-accent)}
.mg-modal[data-side=right]{left:auto;right:calc(100% + 12px)}
.mg-modal{position:absolute;left:0;bottom:0;left:calc(100% + 12px);width:380px;max-height:64vh;overflow:auto;border:1px solid color-mix(in srgb,var(--ui-accent) 25%,var(--ui-stroke-secondary));border-radius:14px;background:#0f1520;box-shadow:0 22px 54px rgb(0 0 0 / .55);padding:12px;z-index:2147483100}
.mg-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.mg-modal-actions{display:flex;align-items:center;gap:6px}
.mg-modal-close{flex:none;padding:3px 12px;color:#e6e9ef;border-color:#2b3446;background:#151b26}
.mg-x{width:24px;height:24px;flex:none;border-radius:6px;border:1px solid #2b3446;background:#151b26;color:#e6e9ef;font-size:12px;line-height:1;cursor:pointer}
.mg-x:hover{color:#fff;border-color:var(--ui-accent);background:#1c2431}
.mg-modal-grid{display:grid;grid-template-columns:1fr;gap:8px}
.mg-modal-grid>div:first-child{grid-column:1 / -1}
.mg-single{grid-template-columns:1fr}
.mg-tabs{display:flex;gap:4px;margin:2px 0 4px}
.mg-tab{flex:1;font-size:11px;padding:5px 8px;border-radius:7px;border:1px solid var(--ui-stroke-secondary);background:transparent;color:var(--ui-text-secondary);cursor:pointer}
.mg-tab[data-on=true]{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.mg-grid{display:flex;flex-direction:column;gap:8px}
.mg-sec-card{border:1px solid var(--ui-stroke-secondary);border-radius:10px;padding:8px 9px}
.mg-sec-card .mg-card-h{margin-bottom:4px}
.mg-slider{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:11px;color:var(--ui-text-tertiary)}
.mg-slider>span{width:88px;flex:none}
.mg-slider input[type=range]{flex:1;min-width:0;accent-color:var(--ui-accent)}
.mg-slider>b{width:38px;text-align:right;color:var(--ui-text-primary)}
.mg-keyrow{display:flex;gap:6px;margin-top:4px;align-items:center}
.mg-file{flex:1;min-width:0;font-size:10px;color:var(--ui-text-tertiary)}
.mg-file::file-selector-button{font-size:10px;padding:3px 7px;margin-right:6px;border-radius:6px;border:1px solid var(--ui-stroke-secondary);background:transparent;color:var(--ui-text-secondary);cursor:pointer}
.mg-colour{width:32px;height:24px;flex:none;padding:0;border:1px solid var(--ui-stroke-secondary);border-radius:6px;background:transparent;cursor:pointer}
.mg-colour::-webkit-color-swatch-wrapper{padding:0}
.mg-colour::-webkit-color-swatch{border:none;border-radius:5px}
.mg-colour-row{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:11px;color:var(--ui-text-tertiary)}
.mg-colour-row>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mg-swatches{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 6px}
.mg-swatch{width:16px;height:16px;padding:0;border-radius:5px;border:1px solid var(--ui-stroke-secondary);cursor:pointer}
.mg-swatch:hover{border-color:var(--ui-accent);transform:scale(1.08)}
.mg-trail{display:flex;gap:4px;margin-top:6px}
.mg-trail-dot{width:6px;height:6px;border-radius:50%;background:var(--ui-stroke-secondary)}
.mg-trail-dot[data-kind=terminal]{background:#22c55e}
.mg-trail-dot[data-kind=web]{background:#38bdf8}
.mg-trail-dot[data-kind=file]{background:#f59e0b}
.mg-trail-dot[data-kind=media]{background:#c084fc}
.mg-trail-dot[data-recent=true]{box-shadow:0 0 0 2px color-mix(in srgb,var(--ui-accent) 55%,transparent)}
.mg-say{position:relative;max-width:320px;min-width:215px;padding:8px 12px;border-radius:19px;border:1px solid var(--mg-bubble-bd,color-mix(in srgb,var(--ui-accent) 22%,var(--ui-stroke-secondary)));background:var(--mg-bubble-bg,color-mix(in srgb,var(--ui-bg-primary,#0b0f16) 84%,transparent));color:var(--mg-bubble-fg,var(--ui-text-secondary));font-size:11px;line-height:1.4;z-index:1;box-shadow:0 10px 24px rgb(0 0 0 / .35)}
.mg-say[data-state=busy]{color:var(--mg-bubble-fg,var(--ui-text-primary))}
.mg-say-wrap{position:relative;display:inline-flex;flex-direction:column;align-items:flex-start;gap:6px;margin-bottom:-3px}
.mg-d1{width:13px;height:13px;margin-left:6px}
.mg-d2{width:10px;height:10px;margin-left:14px}
.mg-d3{width:13px;height:13px;margin-left:6px}
.mg-d4{width:7px;height:7px;margin-left:14px}
.mg-say-dot{display:block;border-radius:50%;background:var(--mg-bubble-bg,var(--ui-bg-primary,#0b0f16));border:1.5px solid var(--mg-bubble-bd,color-mix(in srgb,var(--ui-accent) 22%,var(--ui-stroke-secondary)))}

  background:color-mix(in srgb,var(--ui-bg-primary,#0b0f16) 82%,transparent);
  border:1px solid color-mix(in srgb,var(--ui-accent) 22%,var(--ui-stroke-secondary))}
.mg-float[data-reaction=hop] .mg-mascot-btn{animation:mg-hop .6s cubic-bezier(.28,.84,.42,1)}
.mg-float[data-reaction=shake] .mg-mascot-btn{animation:mg-shake .5s ease-in-out}
@keyframes mg-hop{0%{transform:translateY(0)}35%{transform:translateY(-14px) scale(1.04)}70%{transform:translateY(2px)}100%{transform:translateY(0)}}
@keyframes mg-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.mg-float[data-state=busy] .mg-say{border-color:color-mix(in srgb,var(--ui-accent) 55%,var(--ui-stroke-secondary))}
@media (max-width:900px){.mg-mascot-btn{opacity:.5}.mg-mascot-btn:hover{opacity:1}}
.mg-float,.mg-float *{-webkit-app-region:no-drag;app-region:no-drag}
.mg-float{position:fixed;left:20px;bottom:58px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-start;gap:8px;pointer-events:none}
.mg-float>*{pointer-events:auto}
.mg-mascot-btn{position:relative;width:var(--mg-size,96px);height:var(--mg-size,96px);padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 6px 16px rgb(0 0 0 / .45));transition:transform .12s}
.mg-mascot-btn:hover{transform:scale(1.04)}
.mg-stage{position:relative;width:100%;height:100%}
.mg-mascot-btn[data-state=idle] .mg-aura,.mg-mascot-btn[data-state=waiting] .mg-aura{opacity:calc(var(--mg-aura-o,.55) * .5)}
.mg-aura{position:absolute;left:50%;top:50%;z-index:0;pointer-events:none;border-radius:50%;
  width:calc(100% + var(--mg-aura-r,26px) * 2.2);height:calc(100% + var(--mg-aura-r,26px) * 2.2);
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,var(--mg-aura-c,var(--ui-accent)) 0%,var(--mg-aura-c,var(--ui-accent)) 38%,transparent 72%);
  opacity:var(--mg-aura-o,.55);filter:blur(calc(var(--mg-aura-r,26px) * .28));
  -webkit-mask-image:radial-gradient(circle,#000 55%,transparent 78%);mask-image:radial-gradient(circle,#000 55%,transparent 78%);
  animation:mg-aura-breathe var(--mg-aura-t,1.6s) ease-in-out infinite}
@keyframes mg-aura-breathe{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.09)}}
.mg-mascot-btn[data-aura-style=silhouette][data-aura=true][data-state=busy] .mg-art,.mg-mascot-btn[data-aura-style=silhouette][data-aura=true][data-state=thinking] .mg-art{filter:drop-shadow(0 0 calc(var(--mg-aura-r,26px) * .45) var(--mg-aura-c,var(--ui-accent))) drop-shadow(0 0 var(--mg-aura-r,26px) color-mix(in srgb,var(--mg-aura-c,var(--ui-accent)) var(--mg-aura-a,55%),transparent))}
.mg-mascot-btn[data-aura-style=silhouette] .mg-aura{display:none}
.mg-mascot-btn[data-preview=true][data-aura=true][data-aura-style=silhouette] .mg-art{filter:drop-shadow(0 0 calc(var(--mg-aura-r,26px) * .45) var(--mg-aura-c,var(--ui-accent))) drop-shadow(0 0 var(--mg-aura-r,26px) color-mix(in srgb,var(--mg-aura-c,var(--ui-accent)) var(--mg-aura-a,55%),transparent))}
.mg-vidwrap{position:absolute;inset:0;overflow:hidden}
.mg-vid-src{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;pointer-events:none}
.mg-vid-canvas{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}
.mg-art{position:relative;width:100%;height:100%;display:block;overflow:hidden}
.mg-art>img,.mg-art>video,.mg-art>div{width:100%;height:100%;object-fit:contain}
.mg-mascot-btn img{width:100%;height:100%;object-fit:contain;display:block}
.mg-mascot-btn[data-breath=true][data-state=busy] img{animation:mg-breath 3.6s ease-in-out infinite}
.mg-mascot-btn[data-breath=true][data-float=true][data-state=busy] img{animation:mg-breath 3.6s ease-in-out infinite,mg-float 5.2s ease-in-out infinite}
.mg-mascot-btn[data-state=busy][data-pulse=true] img{animation:mg-pulse var(--mg-aura-t,1.6s) ease-in-out infinite}
@keyframes mg-breath{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes mg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes mg-pulse{0%,100%{opacity:1}50%{opacity:.78}}
.mg-dot{width:8px;height:8px;border-radius:50%;background:var(--ui-text-quaternary);display:inline-block}
.mg-dot[data-state=busy]{background:var(--ui-accent)}
.mg-dot[data-state=waiting]{background:var(--ui-accent);opacity:.6}
.mg-bubble{width:300px;max-height:70vh;overflow:auto;border:1px solid var(--mg-card-bd,var(--ui-stroke-secondary));border-radius:12px;background:var(--mg-card-bg,var(--ui-bg-primary,#0f1116));box-shadow:0 18px 40px rgb(0 0 0 / .5);padding:10px;font-size:12px;color:var(--mg-card-fg,var(--ui-text-secondary));box-sizing:border-box}
.mg-bubble .mg-card-h{color:var(--mg-card-fg,var(--ui-text-primary))}
.mg-bubble .mg-row>span:first-child{color:color-mix(in srgb,var(--mg-card-fg,var(--ui-text-tertiary)) 70%,transparent)}
.mg-bubble .mg-row>b{color:var(--mg-card-fg,var(--ui-text-primary))}
.mg-bubble .mg-muted{color:color-mix(in srgb,var(--mg-card-fg,var(--ui-text-quaternary)) 78%,transparent)}
.mg-card-h{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:600;color:var(--ui-text-primary);font-size:11px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:7px}
.mg-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:2px 0;min-width:0}
.mg-row>span:first-child{color:var(--ui-text-tertiary);flex:none}
.mg-row>b{font-weight:600;color:var(--ui-text-primary);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.mg-muted{color:var(--ui-text-quaternary);font-size:11px}
.mg-actions{display:flex;gap:6px;margin-top:8px}
.mg-btn{flex:1;font-size:11px;padding:5px 8px;border-radius:7px;border:1px solid var(--ui-stroke-secondary);background:transparent;color:var(--ui-text-secondary);cursor:pointer}
.mg-btn:hover{background:var(--chrome-action-hover);color:var(--ui-text-primary)}
.mg-sizes{display:grid;grid-template-columns:repeat(auto-fit,minmax(36px,1fr));gap:6px;margin-top:2px}
.mg-size{min-width:0;font-size:11px;padding:4px 0;border-radius:6px;border:1px solid var(--ui-stroke-secondary);background:transparent;color:var(--ui-text-secondary);cursor:pointer}
.mg-size[data-on=true]{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.mg-alert{display:flex;gap:6px;align-items:flex-start;margin-top:8px;padding:6px 8px;border-radius:8px;border:1px solid #ef4444;color:#fca5a5;font-size:11px;line-height:1.35}
.mg-recent b{font-weight:500;color:var(--ui-text-tertiary)}
.mg-recent>span:first-child{opacity:.7}
.mg-sec{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--ui-text-quaternary);margin:9px 0 2px}
.mg-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:3px 0;cursor:pointer;color:var(--ui-text-secondary)}
.mg-toggle>span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mg-switch{width:30px;height:17px;border-radius:9px;background:var(--ui-stroke-secondary);position:relative;flex:none;transition:background .15s}
.mg-switch[data-on=true]{background:var(--ui-accent)}
.mg-switch>i{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;transition:left .15s}
.mg-switch[data-on=true]>i{left:15px}
.mg-pane{display:flex;flex-direction:column;gap:10px;height:100%;padding:10px;overflow:auto;font-size:12px;color:var(--ui-text-secondary);box-sizing:border-box}
.mg-pane .mg-mascot-art{display:flex;justify-content:center}
.mg-pane .mg-mascot-art img{width:112px;height:112px;object-fit:contain}

/* ---- premium pass: glass, motion, gauges ---- */
.mg-bubble,.mg-modal,.mg-say,.mg-pill,.mg-sec-card{
  -webkit-backdrop-filter:blur(16px) saturate(1.25);
  backdrop-filter:blur(16px) saturate(1.25);
  box-shadow:0 18px 44px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .05);
}
/* A hand-picked surface colour wins over the theme glass; nothing set means
   the exact glass look the widget shipped with. */
.mg-pill,.mg-bubble{
  background:var(--mg-card-bg,color-mix(in srgb, var(--ui-bg-primary,#0b0f16) 78%, transparent));
  border:1px solid var(--mg-card-bd,color-mix(in srgb, var(--ui-accent) 22%, var(--ui-stroke-secondary)));
}
.mg-say{
  background:var(--mg-bubble-bg,color-mix(in srgb, var(--ui-bg-primary,#0b0f16) 78%, transparent));
  border:1px solid var(--mg-bubble-bd,color-mix(in srgb, var(--ui-accent) 22%, var(--ui-stroke-secondary)));
}
.mg-modal,.mg-sec-card{
  background:color-mix(in srgb, var(--ui-bg-primary,#0b0f16) 78%, transparent);
  border:1px solid color-mix(in srgb, var(--ui-accent) 22%, var(--ui-stroke-secondary));
}
.mg-bubble,.mg-modal{animation:mg-in .22s cubic-bezier(.2,.8,.2,1)}
@keyframes mg-in{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}
.mg-card-h{letter-spacing:.08em}
.mg-row,.mg-toggle{animation:mg-row-in .3s ease both}
.mg-row:nth-child(2){animation-delay:.02s}.mg-row:nth-child(3){animation-delay:.04s}
.mg-row:nth-child(4){animation-delay:.06s}.mg-row:nth-child(5){animation-delay:.08s}
@keyframes mg-row-in{from{opacity:0;transform:translateX(-3px)}to{opacity:1;transform:none}}
.mg-ring{display:block}
.mg-spark{display:block;overflow:visible;opacity:.9}
.mg-mascot-btn{border-radius:50%;isolation:isolate;margin-top:3px}
.mg-mascot-btn[data-state=busy] img{filter:drop-shadow(0 0 18px color-mix(in srgb,var(--ui-accent) 70%,transparent)) drop-shadow(0 0 42px color-mix(in srgb,var(--ui-accent) 45%,transparent))}
.mg-mascot-btn[data-state=thinking] img{filter:drop-shadow(0 0 18px color-mix(in srgb,var(--ui-accent) 70%,transparent)) drop-shadow(0 0 42px color-mix(in srgb,var(--ui-accent) 45%,transparent))}
.mg-mascot-btn[data-state=waiting] img{filter:drop-shadow(0 0 14px color-mix(in srgb,var(--ui-accent) 55%,transparent))}
.mg-pill{border-radius:10px}
.mg-pill-v{font-variant-numeric:tabular-nums;letter-spacing:.01em}
.mg-btn{border-radius:8px;font-weight:600;letter-spacing:.01em;transition:background .15s,color .15s,transform .12s}
.mg-modal-head .mg-btn,.mg-modal-head .mg-modal-close,.mg-modal-close.mg-btn{background:#151b26;color:#e6e9ef;border:1px solid #2b3446;opacity:1}
.mg-modal-head .mg-x{background:#151b26;color:#e6e9ef;border:1px solid #2b3446;opacity:1}
.mg-btn:active{transform:scale(.97)}
.mg-sec-card .mg-card-h{color:var(--ui-text-primary)}
.mg-modal-head{border-bottom:1px solid color-mix(in srgb,var(--ui-accent) 18%,var(--ui-stroke-secondary));padding-bottom:8px}
`

/* --------------------------------------------------------------- helpers */

function liveState() {
  const live = liveAtom.get() || {}
  if (live.busy) return live.phase === 'working' ? 'busy' : 'thinking'
  const done = lastDoneAtom.get()
  if (done && Date.now() - done < 60000) return 'waiting'
  return 'idle'
}

function stateOf(snap) {
  const live = liveState()
  if (live !== 'idle' && live !== 'waiting') return live
  if (snap.busy && snap.awaiting) return 'thinking'
  if (snap.busy) return 'busy'
  return live
}

function activityLabel(snap) {
  const live = liveState()
  if (live === 'thinking') return t('thinking')
  if (live === 'busy') return t('writing')
  if (live === 'waiting') return t('waiting')
  if (snap.busy && snap.awaiting) return t('thinking')
  if (snap.busy) return t('writing')
  return t('idle')
}

function atomOf(name) {
  return (host.state && host.state[name]) || null
}

function readAtom(name, fallback) {
  const a = atomOf(name)
  if (!a || typeof a.get !== 'function') return fallback
  try {
    const v = a.get()
    return v === undefined ? fallback : v
  } catch (e) {
    return fallback
  }
}

function useAtom(name, fallback) {
  const a = atomOf(name)
  if (!a) return fallback
  const v = useValue(a)
  return v === undefined ? fallback : v
}

const sessionAtom = atom('')

function activeSessionId() {
  return (
    sessionAtom.get() ||
    readAtom('activeSessionId', '') ||
    readAtom('focusedSessionId', '') ||
    readAtom('focusedStoredSessionId', '') ||
    ''
  )
}

/* ------------------------------------------------------------------ data */

// Usage arrives from the gateway: once on mount via the RPC, then live through
// the `session.usage` event. Kept in a plugin-local atom so every component
// (bubble, pane, palette) reads one source.
const usageAtom = atom(null)
const activityAtom = atom({ current: '', items: [] })
const statsAtom = atom({ startedAt: 0, tools: 0 })
const posAtom = atom(null)
const historyAtom = atom([])
const dailyAtom = atom(0)
const reactionAtom = atom({ kind: '', at: 0 })
const focusTickAtom = atom(0)
const cronAtom = atom(null)
const panelAtom = atom(false)
const lastDoneAtom = atom(0)
const liveAtom = atom({ busy: false, phase: 'idle', at: 0 })

async function refreshCron() {
  if (!host.request) return
  try {
    const res = await host.request('cron.list', {})
    const jobs = (res && (res.jobs || res.items)) || []
    const times = jobs
      .map(j => Number(j.next_run_at_ms || (j.next_run_at ? Date.parse(j.next_run_at) : 0)) || 0)
      .filter(Boolean)
      .sort((a, b) => a - b)
    cronAtom.set(times.length ? times[0] : null)
  } catch (e) {
    cronAtom.set(null)
  }
}

function fmtWhen(ms) {
  if (!ms) return ''
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
const COST_KEY = 'cost.day'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let lastCostSeen = 0

function trackDailyCost(cost) {
  if (!cost) return
  const delta = cost - lastCostSeen
  lastCostSeen = cost
  if (delta <= 0) return
  try {
    const stored = storageRef.current.get(COST_KEY, null) || {}
    const day = todayKey()
    const bucket = stored.day === day ? stored.usd || 0 : 0
    const next = { day, usd: bucket + delta }
    storageRef.current.set(COST_KEY, next)
    dailyAtom.set(next.usd)
  } catch (e) {}
}

function useDaily() {
  const v = useValue(dailyAtom)
  if (v) return v
  try {
    const stored = storageRef.current.get(COST_KEY, null)
    if (stored && stored.day === todayKey()) return stored.usd || 0
  } catch (e) {}
  return 0
}

const storageRef = { current: { get: () => null, set: () => {} } }

/* Entries keep a KEY (or a raw tool name), never a translated string: the
   bubble must re-translate when the user switches language mid-session. */
function pushActivity(entry, countTool) {
  if (!entry) return
  const prev = activityAtom.get() || { current: null, items: [] }
  const item = { ...entry, at: Date.now() }
  const items = [item, ...(prev.items || [])].slice(0, 4)
  activityAtom.set({ current: item, items })
  if (countTool) {
    const stats = statsAtom.get() || { startedAt: Date.now(), tools: 0 }
    const startedAt = stats.startedAt || Date.now()
    statsAtom.set({ startedAt, tools: (stats.tools || 0) + 1 })
  }
}

function toolName(payload) {
  const d = (payload && payload.data) || payload || {}
  return String(d.tool || d.name || d.tool_name || d.toolName || '')
}

function prettyTool(name) {
  if (!name) return ''
  const pretty = String(name).replace(/[_-]/g, ' ')
  return pretty.length > 22 ? `${pretty.slice(0, 21)}…` : pretty
}

function activityText(entry) {
  if (!entry) return ''
  if (typeof entry === 'string') return entry
  if (entry.key) return t(entry.key)
  if (entry.tool) return prettyTool(entry.tool)
  return ''
}

function applyUsage(payload) {
  if (!payload || typeof payload !== 'object') return
  if (payload.type === 'session.usage' && payload.data) payload = payload.data
  const sessionId = payload.session_id
  if (sessionId && activeSessionId() && sessionId !== activeSessionId()) return
  const merged = { ...(usageAtom.get() || {}), ...payload }
  usageAtom.set(merged)
  if (Number(merged.total) > 0) {
    const hist = (historyAtom.get() || []).slice(-23)
    hist.push({ t: Date.now(), total: Number(merged.total), cost: Number(merged.cost_usd) || 0 })
    historyAtom.set(hist)
    trackDailyCost(Number(merged.cost_usd) || 0)
  }
}

async function refreshUsage() {
  const sessionId = activeSessionId()
  if (!sessionId || !host.request) return
  try {
    const usage = await host.request('session.usage', { session_id: sessionId })
    if (usage && typeof usage === 'object') usageAtom.set({ ...usage })
  } catch (e) {
    /* gateway without usage for this session, leave the previous snapshot */
  }
}

function useUsage() {
  const live = useValue(usageAtom)
  useEffect(() => {
    let alive = true
    refreshUsage()
    const timer = setInterval(() => {
      if (alive && activeSessionId()) refreshUsage()
    }, 15000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])
  return live || {}
}

function useSnapshot() {
  const usage = useUsage()
  return {
    usage,
    model: useAtom('model', ''),
    busy: Boolean(useAtom('busy', false)),
    awaiting: Boolean(useAtom('awaitingResponse', false)),
    profile: useAtom('focusedSessionProfile', '') || useAtom('profile', ''),
    cwd: useAtom('cwd', ''),
    sessionId: activeSessionId()
  }
}

function readSnapshot() {
  return {
    usage: usageAtom.get() || {},
    model: readAtom('model', ''),
    busy: Boolean(readAtom('busy', false)),
    awaiting: Boolean(readAtom('awaitingResponse', false)),
    profile: readAtom('focusedSessionProfile', '') || readAtom('profile', ''),
    cwd: readAtom('cwd', ''),
    sessionId: activeSessionId()
  }
}

function snapshotText(snap) {
  const u = snap.usage || {}
  return [
    `${t('status')} · ${activityLabel(snap)}`,
    `${t('model')}: ${shortModel(snap.model)}`,
    `${t('tokens')}: ${u.total ? fmtTokens(u.total) : '-'}`,
    `${t('context')}: ${ctxPercent(u) ? `${Math.round(ctxPercent(u))}%` : '-'}`,
    `${t('cost')}: ${fmtCost(u.cost_usd)}`,
    `${t('profile')}: ${snap.profile || '-'}`
  ].join('\n')
}

/* ------------------------------------------------------------ components */

function userImage() {
  try {
    return (prefsRef && prefsRef.get && prefsRef.get().image) || ''
  } catch (e) {
    return ''
  }
}

const prefsRef = { current: null, get: () => (prefsRef.current ? prefsRef.current.get() : {}) }

// A render error inside the float used to make the whole mascot vanish.
// This keeps a visible stub + the error in the console instead.
class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  componentDidCatch(err) {
    try {
      console.error('[mascot-guide]', err)
    } catch (e) {}
  }

  render() {
    if (this.state.err) {
      return jsx('div', {
        className: 'mg-say',
        children: '⚠ mascot-guide error, see devtools'
      })
    }
    return this.props.children
  }
}

function Ring({ pct, size = 46 }) {
  const r = 18
  const c = 2 * Math.PI * r
  const fill = Math.max(0, Math.min(100, pct)) / 100
  const tone = pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : 'var(--ui-accent)'
  return jsxs('svg', {
    className: 'mg-ring',
    width: size,
    height: size,
    viewBox: '0 0 44 44',
    children: [
      jsx('circle', { cx: 22, cy: 22, r, fill: 'none', stroke: 'var(--ui-stroke-secondary)', strokeWidth: 4 }),
      jsx('circle', {
        cx: 22,
        cy: 22,
        r,
        fill: 'none',
        stroke: tone,
        strokeWidth: 4,
        strokeLinecap: 'round',
        strokeDasharray: `${c * fill} ${c}`,
        transform: 'rotate(-90 22 22)'
      }),
      jsx('text', {
        x: 22,
        y: 25,
        textAnchor: 'middle',
        fontSize: 11,
        fontWeight: 700,
        fill: 'var(--ui-text-primary)',
        children: pct ? `${Math.round(pct)}` : '0'
      })
    ]
  })
}

function predictEta(u) {
  const hist = historyAtom.get() || []
  if (hist.length < 3) return null
  const first = hist[0]
  const last = hist[hist.length - 1]
  const mins = (last.t - first.t) / 60000
  if (!(mins > 0.2)) return null
  const rate = (last.total - first.total) / mins
  const max = Number(u.context_max) || 0
  const used = Number(u.context_used) || 0
  if (!(rate > 0) || max <= 0) return null
  const left = Math.max(0, max - used)
  const etaMin = left / rate
  if (!Number.isFinite(etaMin)) return null
  return etaMin
}

function fmtEta(min) {
  if (min == null) return '-'
  if (min >= 90) return `${Math.round(min / 60)}h`
  if (min >= 1) return `${Math.round(min)}m`
  return '<1m'
}

function Spark({ points }) {
  const data = (points || []).slice(-24).map(p => (typeof p === 'number' ? p : Number(p.total) || 0))
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const step = 92 / (data.length - 1)
  const path = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${(26 - ((v - min) / span) * 22).toFixed(1)}`)
    .join(' ')
  return jsx('svg', {
    className: 'mg-spark',
    viewBox: '0 0 92 28',
    width: '92',
    height: '28',
    children: jsx('path', {
      d: path,
      fill: 'none',
      stroke: 'var(--ui-accent)',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    })
  })
}

function VideoArt({ src }) {
  const vidRef = useRef(null)
  const canRef = useRef(null)

  useEffect(() => {
    const v = vidRef.current
    const c = canRef.current
    if (!v || !c) return

    const size = 256
    c.width = size
    c.height = size
    const ctx = c.getContext('2d', { willReadFrequently: true })
    let raf = 0

    const loop = () => {
      if (v.readyState >= 2) {
        try {
          const vw = v.videoWidth || size
          const vh = v.videoHeight || size
          const scale = Math.min(size / vw, size / vh)
          const dw = vw * scale
          const dh = vh * scale
          ctx.clearRect(0, 0, size, size)
          ctx.drawImage(v, (size - dw) / 2, (size - dh) / 2, dw, dh)
          const img = ctx.getImageData(0, 0, size, size)
          const d = img.data
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i]
            const g = d[i + 1]
            const b = d[i + 2]
            // green-screen key: strong green, low red/blue
            if (g > 70 && g > r * 1.32 && g > b * 1.32) {
              d[i + 3] = 0
            } else if (g > 60 && g > r * 1.15 && g > b * 1.15) {
              // soft edge: fade the fringe instead of a hard cut
              d[i + 3] = Math.round(d[i + 3] * 0.35)
              d[i] = Math.min(255, r + 18)
              d[i + 1] = Math.max(0, g - 28)
            }
          }
          ctx.putImageData(img, 0, 0)
        } catch (e) {}
      }
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      v.play().catch(() => {})
      raf = requestAnimationFrame(loop)
    }
    if (v.readyState >= 2) start()
    else v.addEventListener('loadeddata', start, { once: true })

    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('loadeddata', start)
    }
  }, [src])

  return jsxs('div', {
    className: 'mg-vidwrap',
    children: [
      jsx('video', {
        ref: vidRef,
        className: 'mg-vid-src',
        src,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true
      }),
      jsx('canvas', { ref: canRef, className: 'mg-vid-canvas' })
    ]
  })
}

function artTransform(p) {
  const zoom = Number(p.zoom) || 1
  const offsetX = Number(p.offsetX) || 0
  const offsetY = Number(p.offsetY) || 0
  if (zoom === 1 && offsetX === 0 && offsetY === 0) return undefined
  return { transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom})`, transformOrigin: 'center' }
}

function MascotArt({ size, bare }) {
  const p = (prefsRef.current && prefsRef.current.get && prefsRef.current.get()) || {}
  return jsx('div', { className: 'mg-art', style: bare ? undefined : artTransform(p), children: RawArt({ size }) })
}

function RawArt({ size }) {
  const src = userImage() || (size === 'full' ? MASCOT_FULL : MASCOT_THUMB)
  if (/^data:video\//.test(src)) {
    return jsx(VideoArt, { src })
  }
  return jsx('img', { alt: '', draggable: false, src })
}

function StatusCard({ prefs, snap }) {
  const u = snap.usage || {}
  const contextPct = ctxPercent(u)
  const pills = prefs.pills || {}
  const hideModel = Boolean(pills.model)
  const hideContext = Boolean(pills.context)
  const rows = []

  if (prefs.showModel && !hideModel) rows.push(['model', shortModel(snap.model)])
  if (prefs.showTokens && !pills.spend) rows.push(['tokens', u.total ? fmtTokens(u.total) : '-'])
  if (prefs.showContext && !hideContext) {
    const max = Number(u.context_max) || 0
    rows.push([
      'context',
      contextPct
        ? `${Math.round(contextPct)}%${max ? ` · ${fmtTokens(u.context_used)}/${fmtTokens(max)}` : ''}`
        : '-'
    ])
  }
  if (prefs.showCost && !(pills.spend && (prefs.moneySource || 'cost') === 'cost')) rows.push(['cost', fmtCost(u.cost_usd)])
  if (prefs.showActivity) rows.push(['activity', activityLabel(snap)])
  if (prefs.showCache) {
    const hit = Number(u.cache_hit_pct)
    rows.push(['cache', Number.isFinite(hit) && hit > 0 ? `${Math.round(hit)}%` : '-'])
  }
  if (prefs.showProfile) {
    rows.push(['profile', snap.profile || '-'])
    rows.push(['cwd', baseName(snap.cwd) || '-'])
  }

  return jsxs('div', {
    children: [
      jsxs('div', {
        className: 'mg-card-h',
        children: [
          jsxs('div', {
            style: { display: 'flex', alignItems: 'center', gap: '6px' },
            children: [
              jsx('span', { className: 'mg-dot', 'data-state': stateOf(snap) }),
              jsx('span', { children: t('status') })
            ]
          }),
          prefs.showContext && contextPct ? jsx(Ring, { pct: contextPct, size: 38 }) : null
        ]
      }),
      !snap.sessionId && !u.total ? jsx('div', { className: 'mg-muted', children: t('noSession') }) : null,
      ...rows.map(([key, value], i) =>
        jsxs(
          'div',
          { className: 'mg-row', children: [jsx('span', { children: t(key) }), jsx('b', { children: value })] },
          `${key}-${i}`
        )
      ),

    ]
  })
}

function Toggle({ label, on, onChange }) {
  return jsxs('div', {
    className: 'mg-toggle',
    onClick: () => onChange(!on),
    children: [
      jsx('span', { children: label }),
      jsxs('span', { className: 'mg-switch', 'data-on': String(Boolean(on)), children: [jsx('i', {})] })
    ]
  })
}

function pick(list) {
  const i = Math.floor(Date.now() / 9000) % list.length
  return list[i]
}

function focusRemaining(prefs) {
  const until = Number(prefs.focusUntil) || 0
  if (!until) return 0
  return Math.max(0, until - Date.now())
}

function fmtClock(ms) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function speechLine(snap, prefs) {
  const pct = Math.round(ctxPercent(snap.usage))
  const feed = activityAtom.get() || { current: null }
  const now = activityText(feed.current)
  if (pct >= 80) return t('sayFull').replace('{0}', String(pct))
  const live = liveState()
  if (live === 'thinking') return pick([t('sayThink'), t('sayThink2'), t('sayThink3')])
  if (live === 'busy') return now ? t('sayBusy').replace('{0}', now) : pick([t('sayThink'), t('sayThink2'), t('sayThink3')])
  if (live === 'waiting') return pick([t('sayWaiting'), t('sayWaiting2'), t('sayWaiting3')])
  if (snap.busy && snap.awaiting) return pick([t('sayThink'), t('sayThink2'), t('sayThink3')])
  if (snap.busy) return now ? t('sayBusy').replace('{0}', now) : pick([t('sayThink'), t('sayThink2'), t('sayThink3')])
  const done = lastDoneAtom.get()
  if (done && Date.now() - done < 60000) return pick([t('sayWaiting'), t('sayWaiting2'), t('sayWaiting3')])
  return pick([t('sayIdle'), t('sayIdle2'), t('sayIdle3')])
}

function InfoChips({ snap, prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  const stats = useValue(statsAtom) || { startedAt: 0, tools: 0 }
  const daily = useDaily()
  const cronNext = useValue(cronAtom)
  const u = snap.usage || {}
  const cost = Number(u.cost_usd) || 0
  const source = prefs.moneySource || 'cost'
  const show = prefs.pills || {}
  const contextPct = Math.round(ctxPercent(u))
  const mins = stats.startedAt ? Math.max(1, Math.round((Date.now() - stats.startedAt) / 60000)) : 0

  const items = []

  if (show.spend) {
    const value = source === 'tokens' ? (u.total ? fmtTokens(u.total) : '-') : cost > 0 ? fmtCost(cost) : u.total ? fmtTokens(u.total) : '-'
    const label = source === 'tokens' ? t('tokensShort') : cost > 0 ? providerLabel(snap.model) : t('tokensShort')
    items.push({ key: 'spend', label, value, onClick: () => update({ moneySource: source === 'cost' ? 'tokens' : 'cost' }) })
  }
  if (show.model) items.push({ key: 'model', label: t('model'), value: shortModel(snap.model), wide: true })
  if (show.context) items.push({ key: 'context', label: t('context'), value: contextPct ? `${contextPct}%` : '-' })
  if (show.session && mins) {
    items.push({ key: 'session', label: t('session'), value: `${mins}m · ${stats.tools || 0}` })
  }
  if (show.eta) {
    items.push({ key: 'eta', label: 'ETA', value: fmtEta(predictEta(u)) })
  }
  if (show.daily) {
    items.push({ key: 'daily', label: t('cardDaily'), value: daily ? fmtCost(daily) : '-' })
  }
  if (show.cron) {
    items.push({ key: 'cron', label: t('cardCron'), value: cronNext ? fmtWhen(cronNext) : '-' })
  }
  if (show.cache) {
    const hit = Number(u.cache_hit_pct)
    items.push({ key: 'cache', label: t('cardCache'), value: Number.isFinite(hit) && hit > 0 ? `${Math.round(hit)}%` : '-' })
  }

  if (!items.length) return null

  return jsx('div', {
    className: 'mg-chips',
    children: items.map(item =>
      jsxs(
        'div',
        {
          className: 'mg-pill',
          'data-wide': item.wide ? 'true' : undefined,
          role: item.onClick ? 'button' : undefined,
          onClick: item.onClick,
          title: `${item.label} ${item.value}`,
          children: [
            jsx('span', { className: 'mg-pill-k', children: item.label }),
            jsx('span', { className: 'mg-pill-v', children: item.value })
          ]
        },
        item.key
      )
    )
  })
}

function PresetRow({ prefs: prefsAtom, update }) {
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-muted', children: t('presetHint') }),
      PRESETS.map(p =>
        jsx(
          'button',
          {
            className: 'mg-btn',
            type: 'button',
            style: { width: '100%', textAlign: 'left', marginTop: '5px' },
            onClick: () => update(p.patch),
            children: t(p.label)
          },
          p.key
        )
      )
    ]
  })
}

function PositionRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  const slider = (label, key) =>
    jsxs('div', {
      className: 'mg-slider',
      children: [
        jsx('span', { children: label }),
        jsx('input', {
          type: 'range',
          min: '-120',
          max: '120',
          step: '2',
          value: String(Number(prefs[key]) || 0),
          onChange: e => update({ [key]: Number(e.target.value) })
        }),
        jsx('b', { children: `${Number(prefs[key]) || 0}px` })
      ]
    })
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-muted', children: t('posHint') }),
      jsx('div', { className: 'mg-muted', children: t('bubblePos') }),
      slider(t('leftRight'), 'bubbleX'),
      slider(t('upDown'), 'bubbleY'),
      jsx('div', { className: 'mg-muted', children: t('cardPos') }),
      slider(t('leftRight'), 'cardX'),
      slider(t('upDown'), 'cardY'),
      jsx('div', {
        className: 'mg-actions',
        children: jsx('button', {
          className: 'mg-btn',
          type: 'button',
          onClick: () => update({ bubbleX: 0, bubbleY: 0, cardX: 0, cardY: 0, panelX: 0, panelY: 0 }),
          children: t('resetPos')
        })
      })
    ]
  })
}

const PALETTE = ['#4c8dff', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#64748b', '#e5e7eb']

function PreviewRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-muted', children: t('posHint') }),
      jsx(Toggle, {
        label: t('hidePanelSetting'),
        on: Boolean(prefs.hidePanelInSettings),
        onChange: on => update({ hidePanelInSettings: on })
      }),
      jsx(Toggle, {
        label: t('showBubbleSetting'),
        on: Boolean(prefs.showBubbleInSettings),
        onChange: on => update({ showBubbleInSettings: on })
      }),
      jsx(Toggle, {
        label: t('previewAura'),
        on: Boolean(prefs.previewAura),
        onChange: on => update({ previewAura: on })
      })
    ]
  })
}

function PanelPosRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  const slider = (label, key) =>
    jsxs('div', {
      className: 'mg-slider',
      children: [
        jsx('span', { children: label }),
        jsx('input', {
          type: 'range',
          min: '-120',
          max: '120',
          step: '2',
          value: String(Number(prefs[key]) || 0),
          onChange: e => update({ [key]: Number(e.target.value) })
        }),
        jsx('b', { children: `${Number(prefs[key]) || 0}px` })
      ]
    })
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-muted', children: t('posHint') }),
      slider(t('leftRight'), 'panelX'),
      slider(t('upDown'), 'panelY'),
      jsx('div', {
        className: 'mg-actions',
        children: jsx('button', {
          className: 'mg-btn',
          type: 'button',
          onClick: () => update({ panelX: 0, panelY: 0 }),
          children: t('resetPos')
        })
      })
    ]
  })
}

function Swatch({ value, fallback, onChange }) {
  return jsxs('div', {
    children: [
      jsxs('div', {
        className: 'mg-colour-row',
        children: [
          jsx('input', {
            className: 'mg-colour',
            type: 'color',
            value: value || fallback || '#4c8dff',
            onChange: e => onChange(e.target.value)
          }),
          jsx('span', { children: value ? String(value).toUpperCase() : t('theme') }),
          jsx('button', {
            className: 'mg-btn',
            type: 'button',
            style: { flex: 'none', padding: '3px 8px' },
            onClick: () => onChange(''),
            children: t('theme')
          })
        ]
      }),
      jsx('div', {
        className: 'mg-swatches',
        children: PALETTE.map(hex =>
          jsx(
            'button',
            {
              className: 'mg-swatch',
              type: 'button',
              title: hex,
              'data-on': String((value || '').toLowerCase() === hex),
              style: { background: hex, outline: (value || '').toLowerCase() === hex ? '2px solid var(--ui-accent)' : 'none' },
              onClick: () => onChange(hex)
            },
            hex
          )
        )
      })
    ]
  })
}

function ColourRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  /* A video avatar is re-keyed every frame; a silhouette drop-shadow would be
     recomputed per frame and collapses to a box on non-green-screen footage. */
  const isVideo = /^data:video\//.test(String(prefs.image || ''))

  const setSurface = (key, value) => {
    const patch = { [key]: value }
    if (value) patch[key === 'bubbleColor' ? 'bubbleText' : 'cardText'] = readableOn(value)
    else patch[key === 'bubbleColor' ? 'bubbleText' : 'cardText'] = ''
    update(patch)
  }

  const slider = (label, key, min, max, step, fmt) =>
    jsxs('div', {
      className: 'mg-slider',
      children: [
        jsx('span', { children: label }),
        jsx('input', {
          type: 'range',
          min: String(min),
          max: String(max),
          step: String(step),
          value: String(prefs[key]),
          onChange: e => update({ [key]: Number(e.target.value) })
        }),
        jsx('b', { children: fmt(Number(prefs[key])) })
      ]
    })

  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-muted', children: t('colourHint') }),
      jsx('div', { className: 'mg-muted', children: t('colourCards') }),
      jsx(Swatch, { value: prefs.cardColor, fallback: '#0f1116', onChange: v => setSurface('cardColor', v) }),
      jsx('div', { className: 'mg-muted', children: t('colourBubble') }),
      jsx(Swatch, { value: prefs.bubbleColor, fallback: '#131a24', onChange: v => setSurface('bubbleColor', v) }),
      jsx('div', { className: 'mg-muted', children: t('colourAura') }),
      jsx(Swatch, { value: prefs.auraColor, fallback: '#4c8dff', onChange: v => update({ auraColor: v }) }),
      jsx('div', {
        className: 'mg-actions',
        children: jsx('button', {
          className: 'mg-btn',
          type: 'button',
          onClick: async () => {
            const src = userImage()
            const c = /^data:video\//.test(src) ? await dominantColorFromVideo() : await dominantColor(src)
            if (c) update({ auraColor: c })
            else host.notify({ kind: 'info', message: t('noColour') })
          },
          children: t('fromAvatar')
        })
      }),
      jsx(Toggle, {
        label: t('auraAlways'),
        on: Boolean(prefs.auraAlways),
        onChange: on => update({ auraAlways: on })
      }),
      jsx(Toggle, {
        label: t('auraSilhouette'),
        on: prefs.auraStyle === 'silhouette',
        onChange: on => update({ auraStyle: on ? 'silhouette' : 'soft' })
      }),
      isVideo ? jsx('div', { className: 'mg-muted', children: t('auraVideoHint') }) : null,
      slider(t('auraSize'), 'auraSize', 0, 80, 1, v => `${v}px`),
      slider(t('auraIntensity'), 'auraAlpha', 0, 100, 5, v => `${v}%`),
      slider(t('auraSpeed'), 'auraSpeed', 0.6, 4, 0.1, v => `${v.toFixed(1)}s`)
    ]
  })
}

function CardRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  const pills = prefs.pills || {}
  const set = (key, on) => update({ pills: { ...pills, [key]: on } })

  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-sec', children: t('cards') }),
      jsx('div', {
        children: [
          jsx(Toggle, { label: t('cardSpend'), on: Boolean(pills.spend), onChange: on => set('spend', on) }, 'c1'),
          jsx(Toggle, { label: t('cardModel'), on: Boolean(pills.model), onChange: on => set('model', on) }, 'c2'),
          jsx(Toggle, { label: t('cardContext'), on: Boolean(pills.context), onChange: on => set('context', on) }, 'c3'),
          jsx(Toggle, { label: t('cardSession'), on: Boolean(pills.session), onChange: on => set('session', on) }, 'c4'),
          jsx(Toggle, { label: t('cardEta'), on: Boolean(pills.eta), onChange: on => set('eta', on) }, 'c5'),
          jsx(Toggle, { label: t('cardDaily'), on: Boolean(pills.daily), onChange: on => set('daily', on) }, 'c6'),
          jsx(Toggle, { label: t('cardCache'), on: Boolean(pills.cache), onChange: on => set('cache', on) }, 'c7'),
          jsx(Toggle, { label: t('cardCron'), on: Boolean(pills.cron), onChange: on => set('cron', on) }, 'c8')
        ]
      })
    ]
  })
}

function LanguageRow({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  const options = LANGS
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-sec', children: t('language') }),
      jsx('div', {
        className: 'mg-sizes',
        children: options.map(([id, label]) =>
          jsx(
            'button',
            {
              className: 'mg-size',
              type: 'button',
              'data-on': String((prefs.language || 'auto') === id),
              onClick: () => {
                update({ language: id })
                dict = currentDict(id)
              },
              children: label
            },
            id
          )
        )
      })
    ]
  })
}

// Edge flood-fill: clears the pixels reachable from the border whose colour
// sits within `tol` of the sampled corner colour. No ML, no network, it just
// handles the common case (a portrait on a plain background).
function cutBackground(dataUrl, tol = 34) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const g = canvas.getContext('2d')
        g.drawImage(img, 0, 0)
        const data = g.getImageData(0, 0, w, h)
        const px = data.data

        const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4]
        const transparent = corners.every(i => px[i + 3] < 12)
        if (transparent) {
          resolve(dataUrl)
          return
        }

        const ref = [px[0], px[1], px[2]]
        const match = i =>
          Math.abs(px[i] - ref[0]) <= tol && Math.abs(px[i + 1] - ref[1]) <= tol && Math.abs(px[i + 2] - ref[2]) <= tol

        const seen = new Uint8Array(w * h)
        const queue = []
        for (let x = 0; x < w; x++) {
          queue.push(x, (h - 1) * w + x)
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w, y * w + w - 1)
        }

        while (queue.length) {
          const idx = queue.pop()
          if (seen[idx]) continue
          seen[idx] = 1
          const i = idx * 4
          if (!match(i)) continue
          px[i + 3] = 0
          const x = idx % w
          const y = (idx - x) / w
          if (x > 0) queue.push(idx - 1)
          if (x < w - 1) queue.push(idx + 1)
          if (y > 0) queue.push(idx - w)
          if (y < h - 1) queue.push(idx + w)
        }

        g.putImageData(data, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function ImageSetup({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)

  const readFile = file => {
    if (!file) return
    try { console.log('[mascot-guide] picked', file.type, file.size) } catch (e) {}
    const animated = /gif|apng/.test(file.type)
    const video = /video/.test(file.type)
    const cap = animated || video ? 3.5 * 1024 * 1024 : 700 * 1024
    if (file.size > cap) {
      host.notify({ kind: 'error', message: t('tooBig') })
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const url = String(reader.result || '')
      if (!/^data:(image|video)\//.test(url)) return
      const finalUrl = prefs.cutout && !/gif|apng|video/.test(file.type) ? await cutBackground(url) : url
      update(video ? { image: finalUrl, auraStyle: 'soft' } : { image: finalUrl })
    }
    reader.readAsDataURL(file)
  }

  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-sec', children: t('mascot') }),
      jsxs('div', {
        className: 'mg-keyrow',
        children: [
          jsx('input', {
            className: 'mg-file',
            type: 'file',
            accept: 'image/png,image/webp,image/jpeg,image/svg+xml,image/gif,image/apng,video/webm,video/mp4',
            onChange: e => readFile(e.target.files && e.target.files[0])
          }),
          jsx('button', {
            className: 'mg-btn',
            type: 'button',
            onClick: () => update({ image: '' }),
            children: t('reset')
          })
        ]
      }),
      jsx(Toggle, {
        label: t('cutout'),
        on: Boolean(prefs.cutout),
        onChange: on => update({ cutout: on })
      }, 'cut'),
      prefs.image
        ? jsx('button', {
            className: 'mg-btn',
            type: 'button',
            onClick: async () => {
              const next = await cutBackground(prefs.image)
              update({ image: next })
            },
            children: t('recut')
          })
        : null,
      jsxs('div', {
        className: 'mg-slider',
        children: [
          jsx('span', { children: t('zoom') }),
          jsx('input', {
            type: 'range', min: '0.6', max: '1.8', step: '0.02',
            value: String(prefs.zoom || 1),
            onChange: e => update({ zoom: Number(e.target.value) })
          }),
          jsx('b', { children: `${Math.round((Number(prefs.zoom) || 1) * 100)}%` })
        ]
      }),
      jsxs('div', {
        className: 'mg-slider',
        children: [
          jsx('span', { children: t('leftRight') }),
          jsx('input', {
            type: 'range', min: '-40', max: '40', step: '1',
            value: String(prefs.offsetX || 0),
            onChange: e => update({ offsetX: Number(e.target.value) })
          }),
          jsx('b', { children: `${Number(prefs.offsetX) || 0}%` })
        ]
      }),
      jsxs('div', {
        className: 'mg-slider',
        children: [
          jsx('span', { children: t('upDown') }),
          jsx('input', {
            type: 'range', min: '-40', max: '40', step: '1',
            value: String(prefs.offsetY || 0),
            onChange: e => update({ offsetY: Number(e.target.value) })
          }),
          jsx('b', { children: `${Number(prefs.offsetY) || 0}%` })
        ]
      }),
      jsx('div', { className: 'mg-muted', children: t('cutoutHint') }),
      jsx('div', { className: 'mg-muted', children: t('formatHint') })
    ]
  })
}

function Speech({ snap, prefs }) {
  useValue(focusTickAtom)
  if (!prefs.speech) return null
  const focusLeft = focusRemaining(prefs)
  const dx = Number(prefs.bubbleX) || 0
  const dy = Number(prefs.bubbleY) || 0
  return jsxs('div', {
    className: 'mg-say-wrap',
    style: dx || dy ? { transform: `translate(${dx}px, ${dy}px)` } : undefined,
    children: [
      jsx('div', {
        className: 'mg-say',
        'data-state': stateOf(snap),
        children: focusLeft ? t('focusOn').replace('{0}', fmtClock(focusLeft)) : speechLine(snap, prefs)
      }),
      jsx('span', { className: 'mg-say-dot mg-d1' }),
      jsx('span', { className: 'mg-say-dot mg-d2' }),
      jsx('span', { className: 'mg-say-dot mg-d3' }),
      jsx('span', { className: 'mg-say-dot mg-d4' })
    ]
  })
}

function statsLine() {
  const stats = statsAtom.get() || { startedAt: 0, tools: 0 }
  if (!stats.startedAt) return ''
  const mins = Math.max(1, Math.round((Date.now() - stats.startedAt) / 60000))
  const parts = [`${mins}m`, `${stats.tools || 0} ${t('tools')}`]
  return parts.join(' · ')
}

function Actions({ snap, ctx, prefs: prefsAtom, update }) {
  useValue(focusTickAtom)
  const prefs = useValue(prefsAtom)
  const focusLeft = focusRemaining(prefs)

  const toggleFocus = () => {
    if (focusLeft) {
      update({ focusUntil: 0 })
      return
    }
    update({ focusUntil: Date.now() + 25 * 60 * 1000 })
    host.notify({ kind: 'info', message: t('focus') })
  }

  const busy = Boolean(snap.busy)
  const sessionId = activeSessionId()

  const run = async (method, okKey, failKey) => {
    try {
      if (!sessionId || !host.request) throw new Error('no session')
      await host.request(method, { session_id: sessionId })
      host.notify({ kind: 'info', message: t(okKey) })
      refreshUsage()
    } catch (e) {
      host.notify({ kind: 'error', message: t(failKey) })
    }
  }

  return jsxs('div', {
    className: 'mg-actions',
    children: [
      jsx('button', {
        className: 'mg-btn',
        type: 'button',
        onClick: toggleFocus,
        children: focusLeft ? fmtClock(focusLeft) : t('focus')
      }),
      jsx('button', {
        className: 'mg-btn',
        type: 'button',
        onClick: () => run('session.compress', 'compressed', 'compressFailed'),
        children: t('compress')
      }),
      busy
        ? jsx('button', {
            className: 'mg-btn',
            type: 'button',
            onClick: () => run('session.interrupt', 'stopped', 'stopFailed'),
            children: t('stop')
          })
        : null
    ]
  })
}

function toolKind(label) {
  const v = String(label || '').toLowerCase()
  if (/term|shell|bash|cmd/.test(v)) return 'terminal'
  if (/web|search|fetch|browse|http/.test(v)) return 'web'
  if (/file|read|write|edit|patch|grep/.test(v)) return 'file'
  if (/image|video|audio|media/.test(v)) return 'media'
  return 'other'
}

function ToolTrail({ snap }) {
  const feed = useValue(activityAtom) || { items: [] }
  const items = (feed.items || []).slice(0, 6)
  if (!items.length) return null
  return jsx('div', {
    className: 'mg-trail',
    children: items.map((item, i) =>
      jsx('span', { className: 'mg-trail-dot', title: activityText(item), 'data-kind': toolKind(item.tool || activityText(item)), 'data-recent': String(i === 0) }, `${item.at}-${i}`)
    )
  })
}

function ActivityBlock({ snap }) {
  const feed = useValue(activityAtom) || { current: null, items: [] }
  const stats = useValue(statsAtom) || { startedAt: 0, tools: 0 }
  const mins = stats.startedAt ? Math.max(1, Math.round((Date.now() - stats.startedAt) / 60000)) : 0
  const statsText = mins ? `${mins}m · ${stats.tools || 0} ${t('tools')}` : ''
  const live = snap.busy ? activityText(feed.current) : ''
  if (!live && !(feed.items || []).length) return null

  return jsxs('div', {
    children: [
      live
        ? jsxs('div', {
            className: 'mg-row',
            children: [
              jsx('span', { children: t('now') }),
              jsxs('b', {
                children: [
                  jsx('span', { className: 'mg-dot', 'data-state': 'busy', style: { marginRight: '6px' } }),
                  live
                ]
              })
            ]
          })
        : null,
      statsText
        ? jsxs('div', {
            className: 'mg-row',
            children: [jsx('span', { children: t('session') }), jsx('b', { children: statsText })]
          })
        : null,
      (feed.items || []).slice(0, 3).map((item, i) =>
        jsxs(
          'div',
          { className: 'mg-row mg-recent', children: [jsx('span', { children: i === 0 ? t('recent') : '' }), jsx('b', { children: activityText(item) })] },
          `${item.at}-${i}`
        )
      )
    ]
  })
}

function ContextAlert({ snap }) {
  const pct = ctxPercent(snap.usage)
  if (pct < 80) return null
  return jsxs('div', {
    className: 'mg-alert',
    children: [jsx('span', { children: '⚠' }), jsx('span', { children: t('ctxWarn') })]
  })
}

function SizeRow({ prefs, update }) {
  const options = [[72, 'S'], [96, 'M'], [128, 'L'], [160, 'XL']]
  const size = Number(prefs.size) || 96
  const viewport = typeof window !== 'undefined' ? Number(window.innerWidth) || 1280 : 1280
  const onRight = (Number(prefs.posX) || 20) > viewport / 2 - 40
  /* Setting the atom as well as the pref, so the float moves without a restart. */
  const place = x => {
    const next = Math.max(12, Math.round(x))
    posAtom.set({ x: next, y: Number(prefs.posY) || 58 })
    update({ posX: next })
  }
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-sec', children: t('size') }),
      jsx('div', {
        className: 'mg-sizes',
        children: options.map(([px, label]) =>
          jsx(
            'button',
            {
              className: 'mg-size',
              type: 'button',
              'data-on': String(Number(prefs.size) === px),
              onClick: () => update({ size: px }),
              children: label
            },
            String(px)
          )
        )
      }),
      jsx('div', { className: 'mg-sec', children: t('avatarPos') }),
      jsx('div', {
        className: 'mg-sizes',
        children: [
          jsx(
            'button',
            {
              className: 'mg-size',
              type: 'button',
              'data-on': String(!onRight),
              onClick: () => place(20),
              children: t('leftSide')
            },
            'left'
          ),
          jsx(
            'button',
            {
              className: 'mg-size',
              type: 'button',
              'data-on': String(onRight),
              onClick: () => place(viewport - size - 28),
              children: t('rightSide')
            },
            'right'
          )
        ]
      })
    ]
  })
}

function Toggles({ prefs, update }) {
  return jsxs('div', {
    children: [
      jsx('div', { className: 'mg-sec', children: t('widgets') }),
      jsx('div', {
        children: WIDGET_KEYS.map(key =>
          jsx(Toggle, { label: t(key), on: Boolean(prefs[key]), onChange: on => update({ [key]: on }) }, key)
        )
      }),
      jsx('div', { className: 'mg-sec', children: t('animation') }),
      jsx(Toggle, { label: t('speech'), on: Boolean(prefs.speech), onChange: on => update({ speech: on }) }, 'sp'),
      jsxs('div', {
        children: [
          jsx(Toggle, { label: t('breathing'), on: Boolean(prefs.breathing), onChange: on => update({ breathing: on }) }, 'br'),
          jsx(Toggle, { label: t('float'), on: Boolean(prefs.float), onChange: on => update({ float: on }) }, 'fl'),
          jsx(Toggle, { label: t('pulse'), on: Boolean(prefs.pulse), onChange: on => update({ pulse: on }) }, 'pu')
        ]
      })
    ]
  })
}

function CopyButton({ snap, ctx }) {
  return jsx('button', {
    className: 'mg-btn',
    type: 'button',
    onClick: async () => {
      const text = snapshotText(snap)
      const ok = ctx.os && ctx.os.writeClipboard ? await ctx.os.writeClipboard(text) : false
      host.notify({ kind: ok ? 'info' : 'error', message: ok ? t('copied') : t('clipboardUnavailable') })
    },
    children: t('copy')
  })
}

/**
 * The floating mascot + bubble. Rendered from a title-bar slot because that
 * slot stays mounted across navigation; the element itself is position:fixed,
 * so it floats over the window rather than living in the title bar.
 */
function SettingsPanel({ prefs: prefsAtom, update, onClose }) {
  const prefs = useValue(prefsAtom)
  const [mode, setMode] = useState('simple')
  const viewport = typeof window !== 'undefined' ? Number(window.innerWidth) || 1280 : 1280
  const onRight = (Number(prefs.posX) || 20) > viewport / 2 - 40
  const simple = mode !== 'advanced'
  const sections = simple
    ? [
        jsx(Section, { title: t('presets'), children: jsx(PresetRow, { prefs: prefsAtom, update }) }, 'p'),
        jsx(Section, { title: t('mascot'), children: jsx(ImageSetup, { prefs: prefsAtom, update }) }, 'm'),
        jsx(Section, { title: t('size'), children: jsx(SizeRow, { prefs: prefsAtom, update }) }, 's'),
        jsx(Section, { title: t('language'), children: jsx(LanguageRow, { prefs: prefsAtom, update }) }, 'l')
      ]
    : [
        jsx(Section, { title: t('mascot'), children: jsx(ImageSetup, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('cards'), children: jsx(CardRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('colour'), children: jsx(ColourRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('preview'), children: jsx(PreviewRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('position'), children: jsx(PositionRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('panelPos'), children: jsx(PanelPosRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('size'), children: jsx(SizeRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('language'), children: jsx(LanguageRow, { prefs: prefsAtom, update }) }),
        jsx(Section, { title: t('widgets'), children: jsx(Toggles, { prefs, update }) })
      ]
  return jsxs('div', {
    className: 'mg-modal',
    'data-side': onRight ? 'right' : 'left',
    children: [
      jsxs('div', {
        className: 'mg-modal-head',
        children: [
          jsx('span', { className: 'mg-title', children: t('tabSettings') }),
          jsxs('div', {
            className: 'mg-modal-actions',
            children: [
              jsx('button', {
                className: 'mg-btn mg-modal-close',
                type: 'button',
                onClick: () => onClose && onClose(),
                children: t('done')
              }),
              jsx('button', {
                className: 'mg-x',
                type: 'button',
                title: t('close'),
                onClick: () => onClose && onClose(),
                children: '✕'
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'mg-tabs',
        children: [
          jsx('button', {
            className: 'mg-tab',
            type: 'button',
            'data-on': String(simple),
            onClick: () => setMode('simple'),
            children: t('simple')
          }),
          jsx('button', {
            className: 'mg-tab',
            type: 'button',
            'data-on': String(!simple),
            onClick: () => setMode('advanced'),
            children: t('advanced')
          })
        ]
      }),
      jsx('div', { className: simple ? 'mg-modal-grid' : 'mg-modal-grid mg-single', children: sections })
    ]
  })
}

function SettingsPane({ prefs: prefsAtom, update }) {
  const prefs = useValue(prefsAtom)
  return jsxs('div', {
    className: 'mg-pane',
    children: [
      jsx(Section, { title: t('mascot'), children: jsx(ImageSetup, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('cards'), children: jsx(CardRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('colour'), children: jsx(ColourRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('size'), children: jsx(SizeRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('language'), children: jsx(LanguageRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('widgets'), children: jsx(Toggles, { prefs, update }) })
    ]
  })
}

function useReaction() {
  const r = useValue(reactionAtom)
  if (!r || !r.kind) return ''
  return Date.now() - r.at < 700 ? r.kind : ''
}

function MascotFloat({ prefs: prefsAtom, update, ctx }) {
  const prefs = useValue(prefsAtom)
  const snap = useSnapshot()
  const state = stateOf(snap)
  const contextPct = ctxPercent(snap.usage)
  const open = Boolean(prefs.open)

  const pos = useValue(posAtom) || { x: Number(prefs.posX) || 20, y: Number(prefs.posY) || 58 }
  const dragRef = useRef({ active: false, moved: false, offX: 0, offY: 0, h: 0 })
  const drag = dragRef.current

  const onPointerDown = e => {
    const box = e.currentTarget.getBoundingClientRect()
    drag.active = true
    drag.moved = false
    drag.offX = e.clientX - box.left
    drag.offY = e.clientY - box.top
    drag.h = box.height
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }

  const onPointerMove = e => {
    if (!drag.active) return
    if (!drag.moved && Math.abs(e.movementX) + Math.abs(e.movementY) > 2) drag.moved = true
    if (!drag.moved) return
    const left = Math.max(4, Math.min(window.innerWidth - 60, e.clientX - drag.offX))
    const top = Math.max(4, Math.min(window.innerHeight - 60, e.clientY - drag.offY))
    const bottom = Math.max(4, window.innerHeight - top - drag.h)
    posAtom.set({ x: Math.round(left), y: Math.round(bottom) })
  }

  const onPointerUp = e => {
    if (!drag.active) return
    drag.active = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    const latest = posAtom.get()
    if (latest && drag.moved) {
      const w = window.innerWidth
      const snapLeft = latest.x + 60 < w / 2 ? 16 : Math.max(16, w - 120)
      const snapped = { x: snapLeft, y: latest.y }
      posAtom.set(snapped)
      update({ posX: snapped.x, posY: snapped.y })
    }
  }

  const settingsOpen = useValue(panelAtom)
  const setSettingsOpen = panelAtom.set
  const reaction = useReaction()
  /* While the settings panel is open the agent is usually idle, so the glow
     would never render; this previews it at the chosen intensity instead. */
  const auraPreview = Boolean(settingsOpen) && Boolean(prefs.previewAura)

  return jsxs('div', {
    className: 'mg-float',
    'data-state': stateOf(snap),
    'data-reaction': reaction || undefined,
    style: { left: `${pos.x}px`, bottom: `${pos.y}px`, ...skinVars(prefs) },
    children: [
      jsx(Boundary, {
        children: jsxs('div', {
          className: 'mg-stack',
          children: [
      open && !(settingsOpen && prefs.hidePanelInSettings)
        ? jsxs('div', {
            className: 'mg-bubble',
            style:
              Number(prefs.panelX) || Number(prefs.panelY)
                ? { transform: `translate(${Number(prefs.panelX) || 0}px, ${Number(prefs.panelY) || 0}px)` }
                : undefined,
            children: [
              jsx(StatusCard, { prefs, snap }),
              jsx(ActivityBlock, { snap }),
              jsx(ToolTrail, { snap }),
              jsx(ContextAlert, { snap }),
              jsxs('div', {
                className: 'mg-actions',
                children: [
                  jsx(CopyButton, { snap, ctx }),
                  jsx('button', {
                    className: 'mg-btn',
                    type: 'button',
                    title: t('openSettings'),
                    onClick: () => setSettingsOpen(!panelAtom.get()),
                    children: t('tabSettings')
                  })
                ]
              }),
              jsx('div', {
                className: 'mg-actions',
                children: jsx(Actions, { snap, ctx, prefs: prefsAtom, update })
              }),
            ]
          })
        : null,
      /* Speech sits right above the mascot, under the status panel: the bubble
         reads as coming from the avatar instead of floating above the panel. */
      open && !settingsOpen
        ? null
        : settingsOpen && !prefs.showBubbleInSettings
          ? null
          : jsx(Speech, { snap, prefs }),
      jsxs('button', {
        className: 'mg-mascot-btn',
        type: 'button',
        style: { '--mg-size': `${Number(prefs.size) || 96}px` },
        title: `${t('status')} · ${activityLabel(snap)}`,
        'data-breath': String(prefs.breathing),
        'data-float': String(prefs.float),
        'data-state': state,
        'data-pulse': String(prefs.pulse),
        'data-aura': String(prefs.pulse || auraPreview),
        'data-aura-style': prefs.auraStyle || 'soft',
        'data-preview': String(auraPreview),
        onClick: () => {
          if (drag.moved) {
            drag.moved = false
            return
          }
          update({ open: !prefs.open })
        },
        onPointerDown,
        onPointerMove,
        onPointerUp,
        children: jsx('div', {
          className: 'mg-stage',
          style: artTransform(prefs),
          children: [
            auraPreview || (prefs.pulse && (prefs.auraAlways || state === 'busy' || state === 'thinking'))
              ? jsx('span', {
                  className: 'mg-aura',
                  style: auraPreview && state !== 'busy' && state !== 'thinking'
                    ? { opacity: (Number(prefs.auraAlpha) || 55) / 100 }
                    : undefined
                })
              : null,
            jsx(MascotArt, { size: 'full', bare: true })
          ]
        })
      }),
      jsx('div', {
        className: 'mg-under',
        style:
          Number(prefs.cardX) || Number(prefs.cardY)
            ? { transform: `translate(${Number(prefs.cardX) || 0}px, ${Number(prefs.cardY) || 0}px)` }
            : undefined,
        children: jsx(InfoChips, { snap, prefs: prefsAtom, update })
      }),
      settingsOpen ? jsx(SettingsPanel, { prefs: prefsAtom, update, onClose: () => setSettingsOpen(false) }) : null
          ]
        })
      })
    ]
  })
}

function Section({ title, children }) {
  return jsxs('div', {
    className: 'mg-sec-card',
    children: [jsx('div', { className: 'mg-card-h', children: jsx('span', { children: title }) }), children]
  })
}

function MascotPane({ prefs: prefsAtom, update, ctx }) {
  const prefs = useValue(prefsAtom)
  const snap = useSnapshot()
  const [tab, setTab] = useState('status')

  const tabs = null

  const unusedTabs = jsxs('div', {
    className: 'mg-tabs',
    children: [
      jsx('button', {
        className: 'mg-tab',
        type: 'button',
        'data-on': String(tab === 'status'),
        onClick: () => setTab('status'),
        children: t('tabStatus')
      }),
      jsx('button', {
        className: 'mg-tab',
        type: 'button',
        'data-on': String(tab === 'settings'),
        onClick: () => setTab('settings'),
        children: t('tabSettings')
      })
    ]
  })

  const header = jsxs('div', {
    className: 'mg-head',
    children: [
      jsx('div', { className: 'mg-avatar', children: jsx(MascotArt, { size: 'thumb' }) }),
      jsxs('div', {
        children: [
          jsx('div', { className: 'mg-title', children: t('paneTitle') }),
          jsx('div', { className: 'mg-sub', children: activityLabel(snap) })
        ]
      })
    ]
  })

  const statusTab = jsxs('div', {
    className: 'mg-grid',
    children: [
      jsx('div', {
        className: 'mg-mascot-art',
        'data-state': stateOf(snap),
        children: jsx(MascotArt, { size: 'full' })
      }),
      jsx(Section, { title: t('status'), children: jsx(StatusCard, { prefs, snap }) }),
      jsx(Section, {
        title: t('activity'),
        children: jsxs('div', { children: [jsx(ActivityBlock, { snap }), jsx(ToolTrail, { snap }), jsx(ContextAlert, { snap })] })
      }),
      jsx(Section, { title: t('copy'), children: jsx('div', { className: 'mg-actions', children: jsx(CopyButton, { snap, ctx }) }) })
    ]
  })

  const settingsTab = jsxs('div', {
    className: 'mg-grid',
    children: [
      jsx(Section, { title: t('mascot'), children: jsx(ImageSetup, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('cards'), children: jsx(CardRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('colour'), children: jsx(ColourRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('size'), children: jsx(SizeRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('language'), children: jsx(LanguageRow, { prefs: prefsAtom, update }) }),
      jsx(Section, { title: t('widgets'), children: jsx(Toggles, { prefs, update }) })
    ]
  })

  return jsxs('div', {
    className: 'mg-pane',
    children: [header, statusTab]
  })
}

/* -------------------------------------------------------------- register */

export default {
  id: ID,
  name: 'Mascot Guide',
  register(ctx) {
    const style = document.createElement('style')
    style.textContent = CSS
    document.head.append(style)
    if (typeof ctx.onDispose === 'function') ctx.onDispose(() => style.remove())

    const prefs = atom({ ...DEFAULTS, ...ctx.storage.get('prefs.v4', {}), open: false, settingsOpen: false })
    prefsRef.current = prefs
    storageRef.current = ctx.storage
    dict = currentDict(prefs.get().language)
    const persisted = p => {
      const { open, settingsOpen, ...rest } = p
      return rest
    }

    const update = patch => {
      prefs.set({ ...prefs.get(), ...patch })
      try {
        ctx.storage.set('prefs.v4', persisted(prefs.get()))
      } catch (e) {
        try { console.warn('[mascot-guide] storage write failed', e) } catch (_) {}
        host.notify({ kind: 'error', message: 'Too big to save, pick a smaller file' })
      }
    }

    // Live usage: keep one subscription for the life of the plugin.
    if (host.onEvent) {
      try {
        const dispose = host.onEvent('session.usage', payload => applyUsage(payload))
        if (typeof dispose === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(dispose)
      } catch (e) {
        /* older gateway: RPC polling still fills the card */
      }
    }
    try {
      const onTool = host.onEvent('tool.start', payload => {
        liveAtom.set({ busy: true, phase: 'working', at: Date.now() })
        pushActivity({ tool: toolName(payload) }, true)
      })
      if (typeof onTool === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onTool)
      const onStart = host.onEvent('message.start', () => liveAtom.set({ busy: true, phase: 'thinking', at: Date.now() }))
      if (typeof onStart === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onStart)
      const onStop = host.onEvent('session.interrupt', () => liveAtom.set({ busy: false, phase: 'idle', at: Date.now() }))
      if (typeof onStop === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onStop)

      const onComplete = host.onEvent('message.complete', () => {
        liveAtom.set({ busy: false, phase: 'idle', at: Date.now() })
        lastDoneAtom.set(Date.now())
        reactionAtom.set({ kind: 'hop', at: Date.now() })
      })
      if (typeof onComplete === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onComplete)
      const onErr = host.onEvent('error', () => reactionAtom.set({ kind: 'shake', at: Date.now() }))
      if (typeof onErr === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onErr)

      const onMsgStart = host.onEvent('message.start', () => pushActivity({ key: 'writing' }))
      if (typeof onMsgStart === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onMsgStart)

      const onActivate = host.onEvent('session.activate', payload => {
        const id = (payload && (payload.session_id || (payload.data && payload.data.session_id))) || ''
        if (id) {
          sessionAtom.set(id)
          statsAtom.set({ startedAt: Date.now(), tools: 0 })
          try {
      refreshCron()
      const cronTick = setInterval(refreshCron, 300000)
      if (typeof ctx.onDispose === 'function') ctx.onDispose(() => clearInterval(cronTick))
    } catch (e) {}
    refreshUsage()
        }
      })
      if (typeof onActivate === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onActivate)

      let lastRefresh = 0
      const onTurn = host.onEvent('message.complete', () => {
        const now = Date.now()
        if (now - lastRefresh < 3000) return
        lastRefresh = now
        refreshUsage()
      })
      if (typeof onTurn === 'function' && typeof ctx.onDispose === 'function') ctx.onDispose(onTurn)
    } catch (e) {
      /* older gateway: the 15s poll still fills the card */
    }
    refreshUsage()

    // Keep the focus countdown (and the speech line) ticking.
    try {
      const tick = setInterval(() => {
        const until = Number(prefs.get().focusUntil) || 0
        if (!until) return
        if (until <= Date.now()) {
          prefs.set({ ...prefs.get(), focusUntil: 0 })
          host.notify({ kind: 'info', message: t('focusDone') })
        }
        focusTickAtom.set(Date.now())
      }, 1000)
      if (typeof ctx.onDispose === 'function') ctx.onDispose(() => clearInterval(tick))
    } catch (e) {}

    // The floating mascot renders from a title-bar slot (always mounted).
    ctx.register({
      id: 'float',
      area: 'titleBar.right',
      render: () => jsx(MascotFloat, { prefs, update, ctx })
    })

    // `::mascot{note="..."}`, the agent can make the mascot speak in chat
    // (newer hosts only; older ones ignore an unknown area).
    try {
      ctx.register({
        id: 'directive',
        area: 'transcript.directives',
        data: {
          name: 'mascot',
          render: ({ attrs }) => {
            const note = (attrs && attrs.note) || ''
            return jsx('div', {
              className: 'mg-say',
              style: { margin: '6px 0', maxWidth: '320px' },
              children: String(note).slice(0, 160)
            })
          }
        }
      })
    } catch (e) {}

    // Command palette: copy a snapshot without opening the bubble.
    ctx.register({
      id: 'copy-status',
      area: 'palette',
      data: {
        id: 'mascot-guide.copy-status',
        label: 'Mascot Guide: copy agent status',
        keywords: ['mascot', 'status', 'tokens', 'context', 'cost'],
        run: () => {
          refreshUsage()
          if (ctx.os && ctx.os.writeClipboard) ctx.os.writeClipboard(snapshotText(readSnapshot()))
        }
      }
    })
  }
}
