/**
 * 日本語辞書。これが翻訳のソースオブトゥルース。
 * ここに存在するキーの集合が MessageKey となり、他言語(en.ts)は同じキーを必ず持つ。
 *
 * キー命名: フラットキー + ドット区切り名前空間 (例: nav.stores / screen.products.title)。
 * 値の {name} などは t() 実行時に params で置換される単純プレースホルダ。
 *
 * 今回(ブロックA)は基礎文言のみ。既存コンポーネントの全文言移設は次ブロック以降で行う。
 */
export const ja = {
  // 下部ナビゲーション
  'nav.stores': '店舗',
  'nav.products': '商品比較',
  'nav.shoppingList': '買い物リスト',

  // 共通操作
  'common.save': '保存',
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.confirmDelete': '削除する',
  'common.addAction': '追加する',
  'common.changeAction': '変更する',
  'common.close': '閉じる',
  'common.unitPrice': '単価',
  'common.next': '次へ',
  'common.back': '戻る',
  'common.skip': 'スキップ',
  'common.start': 'はじめる',

  // 画面の基本見出し
  'screen.stores.title': '店舗管理',
  'screen.stores.addStore': '+ 店舗を追加',
  'screen.products.title': '商品比較',
  'screen.products.addProduct': '+ 商品を追加',
  'screen.shoppingList.title': '買い物リスト',
  'screen.shoppingList.addItem': '+ 商品を追加',

  // 店舗管理 (B1)
  'store.emptyList': '店舗がまだ登録されていません。',
  'store.moveUp': '表示順を上へ',
  'store.moveDown': '表示順を下へ',
  'store.addTitle': '店舗を追加',
  'store.editTitle': '店舗名を編集',
  'store.deleteAria': '店舗を削除',
  'store.deleteConfirmTitle': '店舗を削除しますか?',
  'store.deleteConfirmMessage': 'この店舗に登録された価格データもすべて削除されます。',
  'store.nameLabel': '店舗名',
  'store.namePlaceholder': '例: Aスーパー',

  // 表示設定 (言語選択)
  'settings.display': '表示設定',
  'settings.language': '言語',

  // このアプリについて (B1)
  'about.title': 'このアプリについて',
  'about.privacyPolicy': 'プライバシーポリシー',

  // バックアップ・復元 (B1)
  'backup.title': 'データのバックアップ・復元',
  'backup.hint': '店舗・商品・価格などのデータをJSONファイルに書き出し/読み込みできます。',
  'backup.export': 'JSONを書き出す',
  'backup.import': 'JSONから復元する',
  'backup.restoreConfirmTitle': 'データを復元しますか?',
  'backup.restoreConfirmMessage': '現在保存されているデータは上書きされます。「{name}」から復元してよろしいですか?',
  'backup.restoreConfirmAction': '復元する',
  'backup.restoreFailed': '復元に失敗しました。',

  // 商品比較 (B2)
  'product.addTitle': '商品を追加',
  'product.editTitle': '商品を編集',
  'product.tapHint': '商品内の店舗価格をタップすると買い物リストへ追加できます。',
  'product.noMatch': '該当する商品がありません。',
  'product.backToTop': 'トップ画面に戻る',
  'product.searchPlaceholder': '商品名で検索',
  'product.savedBadge': '✅ 保存しました',
  'product.addedBadge': '✅ 登録しました',
  'product.updatedOn': '・更新日',
  'product.moveHint': '{store}から購入する店舗を変更する場合は、他の店舗をタップしてください。',
  'product.editAria': '{name}を編集',
  'product.deleteAria': '{name}を削除',
  'product.registerStoreFirst': '先に店舗を登録してください。',
  'product.priceUnset': '価格未設定',
  'product.deleteConfirmTitle': '商品を削除しますか?',
  'product.addToListConfirmTitle': '買い物リストへ追加しますか?',
  'product.addToListConfirmMessage': '「{name}」を{store}の買い物リストへ追加しますか?',
  'product.alreadyInList': 'すでに登録されています。',
  'product.changeStoreConfirmTitle': '購入店舗を変更しますか?',
  'product.changeStoreConfirmMessage': '「{name}」の購入店舗を\n{from}から{to}へ変更しますか?',
  'product.alreadyInListNamed': 'この商品は、すでに{store}の買い物リストへ登録されています。',
  'product.movedNotice': '{name}を{store}の買い物リストへ移動しました。',
  'product.addedToListNotice': '{name}を{store}の買い物リストへ追加しました。',
  'product.nameLabel': '商品名',
  'product.namePlaceholder': '例: いちご',
  'product.pricesLabel': '各店舗の価格',
  'product.priceInputPlaceholder': '未入力',
  'product.priceError': '価格は0以上の数字で入力してください',
  'product.quantityLabel': '内容量',
  'product.quantityPlaceholder': '未入力の場合は価格そのもので比較',
  'product.unitLabel': '単位',
  'product.customUnitLabel': '単位(自由入力)',
  'product.customUnitPlaceholder': '例: 本・枚・袋・箱など',
  'product.commentLabel': 'コメント(任意)',
  'product.commentPlaceholder': '例: 夕方に値引き\n冷凍食品コーナー\nいつも売り切れ',
  'product.purchaseStoreLabel': '購入店舗',

  // 買い物リスト (B3)
  'shoppingList.total': '合計',
  'shoppingList.filterAll': 'すべて',
  'shoppingList.resetAll': 'すべてリセット',
  'shoppingList.reset': 'リセット',
  'shoppingList.deleteAllAction': 'すべて削除する',
  'shoppingList.emptyAll':
    '買い物リストに商品がありません。「+ 商品を追加」または商品比較画面で店舗の価格をタップして追加してください。',
  'shoppingList.emptyStore': 'この店舗の買い物リストには商品がありません。',
  'shoppingList.unnamed': '(名称未設定)',
  'shoppingList.buyElsewhere': '他店購入',
  'shoppingList.resetAllConfirmTitle': '買い物リストをすべてリセットしますか?',
  'shoppingList.resetAllConfirmMessage': 'すべての店舗の買い物リストをすべて削除しますか?',
  'shoppingList.deleteItemConfirmTitle': '買い物リストから削除しますか?',
  'shoppingList.deleteItemConfirmMessage': '「{name}」を買い物リストから削除しますか?',
  'shoppingList.resetStoreConfirmTitle': '買い物リストをリセットしますか?',
  'shoppingList.resetStoreConfirmMessage': '{store}の買い物リストをすべて削除しますか?',
  'shoppingList.addModalTitle': '買い物リストへ商品を追加',
  'shoppingList.searchPlaceholder': '例: 牛乳',
  'shoppingList.suggestHint': 'もしかしてこちらですか?',
  'shoppingList.noPriceYet': '価格未登録',
  'shoppingList.noneOfThese': 'この中にない',
  'shoppingList.noStoreWithPrice': '価格が登録されている店舗がありません。',
  'shoppingList.notFoundPrompt': 'この商品をどのように登録しますか?',
  'shoppingList.addToComparison': '商品比較リストに追加する',
  'shoppingList.addTodayOnly': '今回だけ買い物リストに追加する',
  'shoppingList.pickStoreTitle': '追加先の店舗を選択',
  'shoppingList.addTodayConfirmTitle': '今回だけ追加しますか?',
  'shoppingList.addTodayConfirmMessage': '「{name}」を今回だけ、\n{store}の買い物リストへ追加しますか?',
  'shoppingList.addedToStoreNotice': '{store}の買い物リストへ追加しました。',

  // 単位の表示ラベル。保存値(types/index.ts の UNIT_OPTIONS / Product.unit)は不変で、表示のみ翻訳。
  'unit.piece': '個',
  'unit.g': 'g',
  'unit.kg': 'kg',
  'unit.ml': 'ml',
  'unit.l': 'L',
  'unit.bag': '袋',
  'unit.other': 'その他',

  // オンボーディング (B4)。ステップ順は src/onboarding/steps.ts の ONBOARDING_STEP_IDS で保持。
  'onboarding.stores.title': 'まず店舗を登録',
  'onboarding.stores.body': 'よく利用するお店を登録します。\n登録した店舗ごとに商品の価格を比較できます。',
  'onboarding.compare.title': '商品の価格を比較',
  'onboarding.compare.body': '商品を登録して、店舗ごとの価格を入力します。\n一番安い店舗がわかりやすく表示されます。',
  'onboarding.list.title': '買い物リストを作成',
  'onboarding.list.body': '商品比較画面の店舗価格をタップすると、\nその商品を買い物リストに追加できます。',
  'onboarding.replay': '使い方をもう一度見る',

  // ダイアログ(プレースホルダ補間の例。ProductCard の商品削除確認で使用)
  'dialog.deleteProduct': '「{name}」の価格データもすべて削除されます。',
} as const;
